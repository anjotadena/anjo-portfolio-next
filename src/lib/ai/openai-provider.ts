import type { ChatProvider, ProviderEvent, StreamCompletionInput } from "./types";

export interface OpenAIProviderOptions {
  apiKey: string;
  model: string;
  baseUrl?: string;
  /** Wall-clock timeout for the whole request, including streaming. */
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
}

/**
 * OpenAI Responses API (`POST /v1/responses`, `stream: true`) through
 * plain `fetch` + SSE parsing. Chosen over the SDK because we use exactly
 * one endpoint, want zero extra dependencies in the serverless bundle,
 * and need full control over timeouts and abort propagation.
 *
 * Emits `text` deltas as they arrive, then `usage` and `finish` from the
 * terminal `response.completed` event. Never surfaces upstream error
 * bodies (they can echo prompt content) — only the HTTP status.
 */
export class OpenAIResponsesProvider implements ChatProvider {
  readonly name = "openai-responses";
  readonly isModelBacked = true;
  private readonly apiKey: string;
  private readonly model: string;
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly fetchImpl: typeof fetch;

  constructor(options: OpenAIProviderOptions) {
    this.apiKey = options.apiKey;
    this.model = options.model;
    this.baseUrl = (options.baseUrl ?? "https://api.openai.com/v1").replace(/\/+$/, "");
    this.timeoutMs = options.timeoutMs ?? 30_000;
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  async *stream(input: StreamCompletionInput): AsyncIterable<ProviderEvent> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    const onAbort = () => controller.abort();
    input.signal?.addEventListener("abort", onAbort, { once: true });

    try {
      const response = await this.fetchImpl(`${this.baseUrl}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${this.apiKey}` },
        body: JSON.stringify({
          model: this.model,
          stream: true,
          store: false,
          max_output_tokens: input.maxOutputTokens,
          instructions: input.system,
          input: input.messages.map((message) => ({ role: message.role, content: message.content })),
        }),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error(`OpenAI request failed with status ${response.status}`);
      }

      let finished = false;
      for await (const event of parseSse(response.body)) {
        const parsed = parseResponsesEvent(event);
        if (!parsed) continue;
        if (parsed.type === "text") yield parsed;
        else if (parsed.type === "completed") {
          finished = true;
          if (parsed.usage) yield { type: "usage", usage: parsed.usage };
          yield { type: "finish", reason: parsed.incomplete ? "length" : "stop" };
          return;
        } else if (parsed.type === "failed") {
          throw new Error("OpenAI response failed");
        }
      }
      if (!finished) yield { type: "finish", reason: "stop" };
    } finally {
      clearTimeout(timer);
      input.signal?.removeEventListener("abort", onAbort);
    }
  }
}

interface SseEvent {
  event: string | null;
  data: string;
}

/** Minimal SSE parser: yields one `{event, data}` per blank-line-terminated block. */
export async function* parseSse(body: ReadableStream<Uint8Array>): AsyncIterable<SseEvent> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (value) buffer += decoder.decode(value, { stream: true });
      // Normalize CRLF; a lone trailing "\r" waits for the next chunk's "\n".
      buffer = buffer.replace(/\r\n/g, "\n");
      let boundary = buffer.indexOf("\n\n");
      while (boundary !== -1) {
        const block = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary + 2);
        const parsed = parseSseBlock(block);
        if (parsed) yield parsed;
        boundary = buffer.indexOf("\n\n");
      }
      if (done) {
        const tail = parseSseBlock(buffer);
        if (tail) yield tail;
        return;
      }
    }
  } finally {
    reader.releaseLock();
  }
}

function parseSseBlock(block: string): SseEvent | null {
  let event: string | null = null;
  const data: string[] = [];
  for (const rawLine of block.split("\n")) {
    const line = rawLine.replace(/\r$/, "");
    if (line.startsWith("event:")) event = line.slice(6).trim();
    else if (line.startsWith("data:")) data.push(line.slice(5).trimStart());
  }
  if (data.length === 0) return null;
  return { event, data: data.join("\n") };
}

type ParsedResponsesEvent =
  | { type: "text"; text: string }
  | { type: "completed"; usage: { inputTokens: number; outputTokens: number } | null; incomplete: boolean }
  | { type: "failed" };

function parseResponsesEvent(event: SseEvent): ParsedResponsesEvent | null {
  if (event.data === "[DONE]") return null;
  let payload: unknown;
  try {
    payload = JSON.parse(event.data);
  } catch {
    return null;
  }
  if (typeof payload !== "object" || payload === null) return null;
  const record = payload as Record<string, unknown>;
  const type = typeof record.type === "string" ? record.type : event.event;

  if (type === "response.output_text.delta" && typeof record.delta === "string") {
    return { type: "text", text: record.delta };
  }
  if (type === "response.completed" || type === "response.incomplete") {
    const response = (record.response ?? {}) as Record<string, unknown>;
    const usage = (response.usage ?? null) as { input_tokens?: number; output_tokens?: number } | null;
    return {
      type: "completed",
      usage: usage ? { inputTokens: Number(usage.input_tokens ?? 0), outputTokens: Number(usage.output_tokens ?? 0) } : null,
      incomplete: type === "response.incomplete",
    };
  }
  if (type === "response.failed" || type === "error") return { type: "failed" };
  return null;
}
