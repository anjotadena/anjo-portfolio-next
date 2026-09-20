import type { ChatStreamEvent } from "@/types/chat";

function parseLine(line: string): ChatStreamEvent | null {
  try {
    const parsed = JSON.parse(line) as ChatStreamEvent;
    return typeof parsed === "object" && parsed !== null && "type" in parsed ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * Incrementally parses an `application/x-ndjson` body into `ChatStreamEvent`s
 * (one JSON object per line: `meta`, many `delta`s, then `done`, or an in-band
 * `error`). A chunk may hold zero, one, or many lines, and a line may span
 * chunks, so text is buffered and only parsed up to each `\n`.
 */
export async function* readNdjsonStream(body: ReadableStream<Uint8Array>): AsyncGenerator<ChatStreamEvent> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (value) buffer += decoder.decode(value, { stream: true });
      let newline = buffer.indexOf("\n");
      while (newline !== -1) {
        const line = buffer.slice(0, newline).trim();
        buffer = buffer.slice(newline + 1);
        if (line.length > 0) {
          const event = parseLine(line);
          if (event) yield event;
        }
        newline = buffer.indexOf("\n");
      }
      if (done) {
        buffer += decoder.decode();
        const tail = buffer.trim();
        if (tail.length > 0) {
          const event = parseLine(tail);
          if (event) yield event;
        }
        return;
      }
    }
  } finally {
    reader.releaseLock();
  }
}
