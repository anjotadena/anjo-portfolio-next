import { describe, expect, it } from "vitest";
import { ExtractiveProvider, composeExtractiveAnswer } from "@/lib/ai/extractive-provider";
import { OpenAIResponsesProvider, parseSse } from "@/lib/ai/openai-provider";
import { capStream } from "@/lib/ai/stream-limits";
import type { ProviderEvent } from "@/lib/ai/types";

async function collect(iterable: AsyncIterable<ProviderEvent>) {
  const events: ProviderEvent[] = [];
  for await (const event of iterable) events.push(event);
  return events;
}

function sseResponse(lines: string[]): Response {
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      const encoder = new TextEncoder();
      // Deliberately split across chunk boundaries mid-line.
      const text = lines.join("\n\n") + "\n\n";
      for (let i = 0; i < text.length; i += 7) controller.enqueue(encoder.encode(text.slice(i, i + 7)));
      controller.close();
    },
  });
  return new Response(body, { status: 200, headers: { "Content-Type": "text/event-stream" } });
}

describe("OpenAIResponsesProvider", () => {
  it("streams text deltas, usage, and finish from Responses API SSE", async () => {
    const provider = new OpenAIResponsesProvider({
      apiKey: "test",
      model: "m",
      fetchImpl: async () =>
        sseResponse([
          'event: response.created\ndata: {"type":"response.created"}',
          'event: response.output_text.delta\ndata: {"type":"response.output_text.delta","delta":"Hello"}',
          'event: response.output_text.delta\ndata: {"type":"response.output_text.delta","delta":" world [1]"}',
          'event: response.completed\ndata: {"type":"response.completed","response":{"usage":{"input_tokens":12,"output_tokens":5}}}',
        ]),
    });
    const events = await collect(provider.stream({ system: "s", messages: [{ role: "user", content: "q" }], context: [], maxOutputTokens: 50 }));
    expect(events).toEqual([
      { type: "text", text: "Hello" },
      { type: "text", text: " world [1]" },
      { type: "usage", usage: { inputTokens: 12, outputTokens: 5 } },
      { type: "finish", reason: "stop" },
    ]);
  });

  it("sends the system prompt as instructions and never leaks the key in errors", async () => {
    let captured: RequestInit | undefined;
    const provider = new OpenAIResponsesProvider({
      apiKey: "sk-secret",
      model: "m",
      fetchImpl: async (_url, init) => {
        captured = init;
        return new Response("upstream says: sk-secret", { status: 500 });
      },
    });
    await expect(collect(provider.stream({ system: "SYS", messages: [{ role: "user", content: "q" }], context: [], maxOutputTokens: 10 }))).rejects.toThrow(
      /status 500/,
    );
    const body = JSON.parse(String(captured?.body)) as Record<string, unknown>;
    expect(body.instructions).toBe("SYS");
    expect(body.stream).toBe(true);
    expect(body.max_output_tokens).toBe(10);
    expect(body.store).toBe(false);
  });

  it("reports length when the response is incomplete", async () => {
    const provider = new OpenAIResponsesProvider({
      apiKey: "t",
      model: "m",
      fetchImpl: async () => sseResponse(['data: {"type":"response.incomplete","response":{"usage":{"input_tokens":1,"output_tokens":2}}}']),
    });
    const events = await collect(provider.stream({ system: "s", messages: [], context: [], maxOutputTokens: 1 }));
    expect(events.at(-1)).toEqual({ type: "finish", reason: "length" });
  });
});

describe("parseSse", () => {
  it("handles CRLF and multi-line data", async () => {
    const stream = new Response("event: a\r\ndata: 1\r\ndata: 2\r\n\r\ndata: [DONE]\r\n\r\n").body!;
    const events = [];
    for await (const event of parseSse(stream)) events.push(event);
    expect(events).toEqual([
      { event: "a", data: "1\n2" },
      { event: null, data: "[DONE]" },
    ]);
  });
});

describe("ExtractiveProvider", () => {
  it("quotes retrieved blocks verbatim with citations and streams in pieces", async () => {
    const provider = new ExtractiveProvider({ chunkDelayMs: 0 });
    const events = await collect(
      provider.stream({
        system: "",
        messages: [],
        context: [
          { index: 1, title: "Skills", section: "Backend", text: "C# and ASP.NET Core." },
          { index: 2, title: "Skills", section: "Cloud", text: "AWS and Azure." },
        ],
        maxOutputTokens: 100,
      }),
    );
    const text = events.filter((e) => e.type === "text").map((e) => (e.type === "text" ? e.text : "")).join("");
    expect(text).toContain("C# and ASP.NET Core. [1]");
    expect(text).toContain("AWS and Azure. [2]");
    expect(events.filter((e) => e.type === "text").length).toBeGreaterThan(1);
    expect(events.at(-1)).toEqual({ type: "finish", reason: "stop" });
  });

  it("composes an empty answer for empty context", () => {
    expect(composeExtractiveAnswer([], 2, 100)).toBe("");
  });
});

describe("capStream", () => {
  async function* source(parts: string[]) {
    for (const part of parts) yield part;
  }

  it("caps total characters and reports the limit", async () => {
    const reasons: string[] = [];
    const out: string[] = [];
    for await (const piece of capStream(source(["abc", "def", "ghi"]), { maxChars: 5, idleTimeoutMs: 1000, onLimit: (r) => reasons.push(r) })) out.push(piece);
    expect(out.join("")).toBe("abcde");
    expect(reasons).toEqual(["maxChars"]);
  });

  it("ends cleanly on idle timeout", async () => {
    async function* slow() {
      yield "a";
      await new Promise((resolve) => setTimeout(resolve, 60));
      yield "b";
    }
    const reasons: string[] = [];
    const out: string[] = [];
    for await (const piece of capStream(slow(), { maxChars: 100, idleTimeoutMs: 10, onLimit: (r) => reasons.push(r) })) out.push(piece);
    expect(out).toEqual(["a"]);
    expect(reasons).toEqual(["idleTimeout"]);
  });
});
