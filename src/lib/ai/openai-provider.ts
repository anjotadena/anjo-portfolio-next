import type { ChatProvider, StreamCompletionInput } from "./types";

export interface OpenAiCompatibleProviderOptions {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
}

const DEFAULT_BASE_URL = "https://api.openai.com/v1";
const DEFAULT_MODEL = "gpt-4o-mini";

/**
 * A provider for OpenAI's Chat Completions API, or any API-compatible
 * endpoint (reachable via `OPENAI_BASE_URL`). Fully wired but inert
 * without an API key — `isConfigured` is false and `getChatProvider()`
 * (see `provider.ts`) will not select it. Dropping `OPENAI_API_KEY` into
 * the environment is the only change needed to go live; no code changes
 * are required.
 */
export class OpenAiCompatibleProvider implements ChatProvider {
  readonly name = "openai-compatible";

  private readonly apiKey: string | undefined;
  private readonly baseUrl: string;
  private readonly model: string;

  constructor(options: OpenAiCompatibleProviderOptions = {}) {
    this.apiKey = options.apiKey ?? process.env.OPENAI_API_KEY;
    this.baseUrl = options.baseUrl ?? process.env.OPENAI_BASE_URL ?? DEFAULT_BASE_URL;
    this.model = options.model ?? process.env.OPENAI_MODEL ?? DEFAULT_MODEL;
  }

  get isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  async *streamCompletion(input: StreamCompletionInput): AsyncIterable<string> {
    if (!this.apiKey) {
      throw new Error("OpenAiCompatibleProvider is not configured with an API key");
    }

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        stream: true,
        messages: [
          { role: "system", content: input.system },
          ...input.messages.map((message) => ({ role: message.role, content: message.content })),
        ],
      }),
      signal: input.signal,
    });

    if (!response.ok || !response.body) {
      throw new Error(`OpenAI-compatible provider request failed with status ${response.status}`);
    }

    yield* parseSseStream(response.body);
  }
}

async function* parseSseStream(body: ReadableStream<Uint8Array>): AsyncIterable<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (value) {
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          const text = parseSseLine(line);
          if (text === "done") return;
          if (text) yield text;
        }
      }
      if (done) return;
    }
  } finally {
    reader.releaseLock();
  }
}

function parseSseLine(line: string): string | null | "done" {
  const trimmed = line.trim();
  if (!trimmed.startsWith("data:")) return null;
  const payload = trimmed.slice("data:".length).trim();
  if (payload === "[DONE]") return "done";
  return extractDeltaText(payload);
}

function extractDeltaText(payload: string): string | null {
  try {
    const parsed: unknown = JSON.parse(payload);
    if (typeof parsed !== "object" || parsed === null || !("choices" in parsed)) return null;

    const choices = (parsed as { choices: unknown }).choices;
    if (!Array.isArray(choices)) return null;

    const first: unknown = choices[0];
    if (typeof first !== "object" || first === null || !("delta" in first)) return null;

    const delta = (first as { delta: unknown }).delta;
    if (typeof delta !== "object" || delta === null || !("content" in delta)) return null;

    const content = (delta as { content: unknown }).content;
    return typeof content === "string" ? content : null;
  } catch {
    return null;
  }
}
