import { NextResponse } from "next/server";
import { safeHandler } from "@/lib/security/handler";
import type { ApiErrorBody, ChatMode, ChatStreamEvent, ChatStreamMeta, ChatUsage } from "@/types/chat";
import { getEnv } from "@/lib/config/env";
import { getAllDocumentsIncludingPrivate } from "@/lib/knowledge/repository";
import { getRetriever } from "@/lib/retrieval";
import { getChatProvider } from "@/lib/ai/client";
import { prepareTurn } from "@/lib/ai/rag";
import { sanitizeCitations } from "@/lib/ai/citations";
import { UNGROUNDED_FALLBACK } from "@/lib/ai/fallback";
import { capStream, DEFAULT_IDLE_TIMEOUT_MS, DEFAULT_MAX_STREAM_CHARS } from "@/lib/ai/stream-limits";
import { chatRequestSchema, toFieldErrors } from "@/lib/validation/chat";
import { readBodyWithLimit, RequestTooLargeError } from "@/lib/security/read-body";
import { MultiWindowRateLimiter } from "@/lib/security/rate-limit";
import { deriveClientKey } from "@/lib/security/client-key";
import { RequestMetrics, estimateCost } from "@/lib/observability/metrics";
import { logEvent } from "@/lib/observability/log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Streamed answers can outlive Vercel's 10s default function limit.
export const maxDuration = 60;

const MAX_CHAT_BODY_BYTES = 32 * 1024;

let limiter: MultiWindowRateLimiter | null = null;
function getLimiter(): MultiWindowRateLimiter {
  const env = getEnv();
  limiter ??= new MultiWindowRateLimiter({ perMinute: env.rateLimit.perMinute, perHour: env.rateLimit.perHour });
  return limiter;
}

const encoder = new TextEncoder();
function encodeEvent(event: ChatStreamEvent): Uint8Array {
  return encoder.encode(`${JSON.stringify(event)}\n`);
}

function errorResponse(status: number, body: ApiErrorBody, headers?: HeadersInit): Response {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });
}

function streamHeaders(mode: ChatMode, requestId: string): HeadersInit {
  return {
    "Content-Type": "application/x-ndjson; charset=utf-8",
    "Cache-Control": "no-store, no-transform",
    "X-Accel-Buffering": "no",
    "X-Chat-Mode": mode,
    "X-Request-Id": requestId,
  };
}

/** Same-origin check: browsers always send Origin on cross-site POSTs; a mismatch is rejected. */
function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true; // non-browser clients / same-origin GET-like fetches
  try {
    const requestHost = request.headers.get("host");
    return new URL(origin).host === requestHost;
  } catch {
    return false;
  }
}

export const POST = safeHandler("chat", async (request: Request): Promise<Response> => {
  const metrics = new RequestMetrics("chat");

  if (!isSameOrigin(request)) {
    return errorResponse(403, { code: "VALIDATION_ERROR", message: "Cross-origin requests are not allowed." });
  }

  let rawBody: string;
  try {
    rawBody = await readBodyWithLimit(request, MAX_CHAT_BODY_BYTES);
  } catch (error) {
    if (error instanceof RequestTooLargeError) {
      return errorResponse(413, { code: "REQUEST_TOO_LARGE", message: "Request body is too large." });
    }
    throw error;
  }

  let parsedBody: unknown;
  try {
    parsedBody = rawBody.length > 0 ? JSON.parse(rawBody) : {};
  } catch {
    return errorResponse(400, { code: "INVALID_JSON", message: "Request body must be valid JSON." });
  }

  const validation = chatRequestSchema.safeParse(parsedBody);
  if (!validation.success) {
    return errorResponse(400, {
      code: "VALIDATION_ERROR",
      message: "The request did not pass validation.",
      fields: toFieldErrors(validation.error),
    });
  }
  const { message, history, contextSlug } = validation.data;
  metrics.mark("validated");

  const clientKey = deriveClientKey(request.headers);
  const limit = getLimiter().consume(clientKey);
  if (!limit.allowed) {
    logEvent("warn", { route: "chat", event: "rate_limited", requestId: metrics.requestId, retryAfterSeconds: limit.retryAfterSeconds });
    return errorResponse(
      429,
      { code: "RATE_LIMITED", message: "Too many requests. Please wait a moment and try again." },
      { "Retry-After": String(limit.retryAfterSeconds), "X-RateLimit-Remaining": "0" },
    );
  }

  const env = getEnv();
  let turn;
  try {
    turn = await metrics.time("retrieval", () =>
      prepareTurn(
        { message, history, contextSlug },
        { retriever: getRetriever(), documents: getAllDocumentsIncludingPrivate(), maxChunks: env.retrieval.maxChunks },
      ),
    );
  } catch (error) {
    metrics.set("errorName", error instanceof Error ? error.name : "unknown");
    metrics.flush("retrieval_failed", "error");
    return errorResponse(503, { code: "RETRIEVAL_ERROR", message: "The knowledge base is temporarily unavailable. Please try again." });
  }
  metrics.set("intent", turn.intent);
  metrics.set("retrievedChunks", turn.results.length);
  metrics.set("grounded", turn.grounded);
  metrics.set("historyTurns", history.length);

  const provider = getChatProvider();
  const mode: ChatMode = !turn.grounded ? "ungrounded" : provider.isModelBacked ? "live" : "extractive";
  const meta: ChatStreamMeta = {
    requestId: metrics.requestId,
    mode,
    grounded: turn.grounded,
    sources: turn.sources,
    cards: turn.cards,
    followUps: turn.followUps,
  };

  // Ungrounded: the provider is never invoked — zero hallucination risk, zero cost.
  if (!turn.grounded || !turn.prompt) {
    metrics.set("mode", mode);
    metrics.flush("chat_completed");
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(encodeEvent({ type: "meta", meta }));
        controller.enqueue(encodeEvent({ type: "delta", text: UNGROUNDED_FALLBACK }));
        controller.enqueue(encodeEvent({ type: "done", finishReason: "stop" }));
        controller.close();
      },
    });
    return new Response(stream, { status: 200, headers: streamHeaders(mode, metrics.requestId) });
  }

  const prompt = turn.prompt;
  const sourceCount = turn.sources.length;
  let usage: ChatUsage | undefined;
  let finishReason: "stop" | "length" | "timeout" = "stop";

  const textOnly = (async function* () {
    for await (const event of provider.stream({
      system: prompt.system,
      messages: prompt.messages,
      context: prompt.context,
      maxOutputTokens: env.ai.maxOutputTokens,
      signal: request.signal,
    })) {
      if (event.type === "text") yield event.text;
      else if (event.type === "usage") usage = event.usage;
      else if (event.type === "finish") finishReason = event.reason;
    }
  })();

  const capped = capStream(textOnly, {
    maxChars: DEFAULT_MAX_STREAM_CHARS,
    idleTimeoutMs: DEFAULT_IDLE_TIMEOUT_MS,
    totalTimeoutMs: env.ai.requestTimeoutMs + 5_000,
    onLimit: (reason) => {
      finishReason = reason === "maxChars" ? "length" : "timeout";
    },
  });
  const iterator = capped[Symbol.asyncIterator]();

  // Peek the first chunk BEFORE the HTTP response starts so a provider
  // failure becomes a clean 502 instead of a broken stream.
  let first: IteratorResult<string>;
  try {
    first = await metrics.time("firstToken", () => iterator.next());
  } catch (error) {
    metrics.set("errorName", error instanceof Error ? error.name : "unknown");
    metrics.flush("provider_error_before_first_byte", "error");
    return errorResponse(502, { code: "PROVIDER_ERROR", message: "The AI service is unavailable right now. Please try again shortly." });
  }

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      controller.enqueue(encodeEvent({ type: "meta", meta }));
      let answer = "";
      let emitted = 0;
      try {
        let current = first;
        for (;;) {
          if (!current.done && current.value.length > 0) {
            answer += current.value;
            // Hold back a trailing partial citation marker like "[1" until it completes.
            const safeEnd = answer.lastIndexOf("[");
            const boundary = safeEnd > answer.length - 4 && !answer.slice(safeEnd).includes("]") ? safeEnd : answer.length;
            const ready = sanitizeCitations(answer.slice(emitted, boundary), sourceCount);
            if (ready.length > 0) {
              controller.enqueue(encodeEvent({ type: "delta", text: ready }));
              emitted = boundary;
            }
          }
          if (current.done) break;
          current = await iterator.next();
        }
        const tail = sanitizeCitations(answer.slice(emitted), sourceCount);
        if (tail.length > 0) controller.enqueue(encodeEvent({ type: "delta", text: tail }));
        controller.enqueue(encodeEvent({ type: "done", usage, finishReason }));

        metrics.set("mode", mode);
        metrics.set("provider", provider.name);
        metrics.set("answerChars", answer.length);
        metrics.set("finishReason", finishReason);
        if (usage) {
          metrics.set("inputTokens", usage.inputTokens);
          metrics.set("outputTokens", usage.outputTokens);
          metrics.set("estimatedCostUsd", estimateCost(usage, { inputCostPer1M: env.ai.inputCostPer1M, outputCostPer1M: env.ai.outputCostPer1M }));
        }
        metrics.flush("chat_completed");
      } catch (error) {
        metrics.set("errorName", error instanceof Error ? error.name : "unknown");
        metrics.flush("provider_error_after_first_byte", "error");
        controller.enqueue(encodeEvent({ type: "error", message: "The assistant stopped responding unexpectedly. You can retry." }));
      } finally {
        controller.close();
      }
    },
    async cancel() {
      await iterator.return?.();
      metrics.flush("chat_cancelled");
    },
  });

  return new Response(stream, { status: 200, headers: streamHeaders(mode, metrics.requestId) });
});
