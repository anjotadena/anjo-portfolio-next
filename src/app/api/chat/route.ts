import { NextResponse } from "next/server";
import type { ChatMode, ChatStreamEvent, ChatStreamMeta } from "@/types/chat";
import { getAllDocuments, getVerifiedChunks } from "@/lib/content";
import { retrieve } from "@/lib/retrieval";
import { getChatProvider } from "@/lib/ai/provider";
import { buildMessages } from "@/lib/ai/prompt";
import { UNGROUNDED_FALLBACK } from "@/lib/ai/fallback";
import {
  capStream,
  DEFAULT_IDLE_TIMEOUT_MS,
  DEFAULT_MAX_STREAM_CHARS,
  DEFAULT_TOTAL_TIMEOUT_MS,
} from "@/lib/ai/stream-limits";
import { buildFollowUps, buildRelatedProjects, buildSources } from "@/lib/chat/meta";
import { chatRequestSchema, toFieldErrors } from "@/lib/validation/chat";
import { readBodyWithLimit, RequestTooLargeError } from "@/lib/security/read-body";
import { TokenBucketRateLimiter } from "@/lib/security/rate-limit";
import { deriveClientKey } from "@/lib/security/client-key";
import { logEvent } from "@/lib/security/log";

export const runtime = "nodejs";

// ~10 messages/minute per bucket key: enough for a real back-and-forth
// conversation, tight enough to blunt a naive scripted request storm
// against the (potentially metered) LLM backend. See
// `src/lib/security/rate-limit.ts` for the honest limits of this.
const chatRateLimiter = new TokenBucketRateLimiter({ capacity: 10, refillPerSecond: 10 / 60 });

const encoder = new TextEncoder();

function encodeEvent(event: ChatStreamEvent): Uint8Array {
  return encoder.encode(`${JSON.stringify(event)}\n`);
}

function ndjsonHeaders(mode: ChatMode): HeadersInit {
  return {
    "Content-Type": "application/x-ndjson",
    "Cache-Control": "no-store, no-transform",
    "X-Accel-Buffering": "no",
    "X-Chat-Mode": mode,
  };
}

export async function POST(request: Request): Promise<Response> {
  let rawBody: string;
  try {
    rawBody = await readBodyWithLimit(request);
  } catch (error) {
    if (error instanceof RequestTooLargeError) {
      return NextResponse.json({ code: "REQUEST_TOO_LARGE" }, { status: 413 });
    }
    throw error;
  }

  let parsedBody: unknown;
  try {
    parsedBody = rawBody.length > 0 ? JSON.parse(rawBody) : {};
  } catch {
    return NextResponse.json({ code: "INVALID_JSON" }, { status: 400 });
  }

  const validation = chatRequestSchema.safeParse(parsedBody);
  if (!validation.success) {
    return NextResponse.json(
      { code: "VALIDATION_ERROR", fields: toFieldErrors(validation.error) },
      { status: 400 },
    );
  }
  const { message, history } = validation.data;

  const clientKey = deriveClientKey(request.headers);
  const rateLimitResult = chatRateLimiter.consume(clientKey);
  if (!rateLimitResult.allowed) {
    logEvent("warn", { route: "chat", event: "rate_limited" });
    return NextResponse.json(
      { code: "RATE_LIMITED" },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimitResult.retryAfterSeconds),
          "X-RateLimit-Remaining": String(rateLimitResult.remaining),
        },
      },
    );
  }

  const verifiedChunks = getVerifiedChunks();
  const allDocuments = getAllDocuments();
  const retrieval = retrieve(message, verifiedChunks);
  const provider = getChatProvider();

  // If retrieval is ungrounded, the provider is NEVER invoked -- zero
  // hallucination risk on this path, and it costs nothing.
  if (!retrieval.grounded) {
    const meta: ChatStreamMeta = {
      mode: "ungrounded",
      sources: [],
      followUps: [],
      relatedProjects: [],
      grounded: false,
      providerConfigured: provider.isConfigured,
    };
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(encodeEvent({ type: "meta", meta }));
        controller.enqueue(encodeEvent({ type: "delta", text: UNGROUNDED_FALLBACK }));
        controller.enqueue(encodeEvent({ type: "done" }));
        controller.close();
      },
    });
    return new Response(stream, { status: 200, headers: ndjsonHeaders("ungrounded") });
  }

  const mode: ChatMode = provider.isConfigured ? "live" : "unconfigured";
  const meta: ChatStreamMeta = {
    mode,
    sources: buildSources(retrieval.chunks),
    followUps: buildFollowUps(retrieval.chunks, allDocuments),
    relatedProjects: buildRelatedProjects(retrieval.chunks, allDocuments),
    grounded: true,
    providerConfigured: provider.isConfigured,
  };

  const built = buildMessages({
    retrievedChunks: retrieval.chunks.map((entry) => entry.chunk),
    history,
    userMessage: message,
  });
  const systemMessage = built[0];
  if (!systemMessage) {
    // buildMessages always produces a system message at index 0.
    // Unreachable in practice; keeps this honest under strict typing.
    throw new Error("buildMessages did not produce a system message");
  }
  const providerMessages = built
    .slice(1)
    .filter(
      (entry): entry is { role: "user" | "assistant"; content: string } =>
        entry.role === "user" || entry.role === "assistant",
    );

  const capped = capStream(
    provider.streamCompletion({
      system: systemMessage.content,
      messages: providerMessages,
      signal: request.signal,
    }),
    {
      maxChars: DEFAULT_MAX_STREAM_CHARS,
      idleTimeoutMs: DEFAULT_IDLE_TIMEOUT_MS,
      totalTimeoutMs: DEFAULT_TOTAL_TIMEOUT_MS,
    },
  );
  const iterator = capped[Symbol.asyncIterator]();

  // Peek the first chunk BEFORE the HTTP response starts: a provider
  // failure here means no bytes have been sent yet, so we can still
  // return a clean 502 instead of starting a stream that has to recover
  // mid-flight.
  let first: IteratorResult<string>;
  try {
    first = await iterator.next();
  } catch {
    logEvent("error", { route: "chat", event: "provider_error_before_first_byte" });
    return NextResponse.json({ code: "PROVIDER_ERROR" }, { status: 502 });
  }

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      controller.enqueue(encodeEvent({ type: "meta", meta }));
      try {
        let current = first;
        for (;;) {
          if (!current.done && current.value.length > 0) {
            controller.enqueue(encodeEvent({ type: "delta", text: current.value }));
          }
          if (current.done) break;
          current = await iterator.next();
        }
        controller.enqueue(encodeEvent({ type: "done" }));
      } catch {
        // Failure AFTER the first byte: emit an in-band error frame and
        // close cleanly, rather than tearing down the HTTP response.
        logEvent("error", { route: "chat", event: "provider_error_after_first_byte" });
        controller.enqueue(
          encodeEvent({ type: "error", message: "The assistant stopped responding unexpectedly." }),
        );
      } finally {
        controller.close();
      }
    },
    async cancel() {
      // Client aborted: stop pulling from the underlying provider/stream.
      await iterator.return?.();
    },
  });

  return new Response(stream, { status: 200, headers: ndjsonHeaders(mode) });
}
