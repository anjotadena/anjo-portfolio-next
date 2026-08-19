import type { ChatStreamEvent } from "@/types/chat";

/**
 * Splits off every complete (`\n`-terminated) line from `buffer`, parsing
 * and yielding each as a `ChatStreamEvent`, then returns whatever partial
 * line is left over (to be prefixed onto the next chunk).
 */
function* drainCompleteLines(buffer: string): Generator<ChatStreamEvent, string> {
  let remaining = buffer;
  let newlineIndex = remaining.indexOf("\n");
  while (newlineIndex !== -1) {
    const line = remaining.slice(0, newlineIndex).trim();
    remaining = remaining.slice(newlineIndex + 1);
    if (line.length > 0) {
      yield JSON.parse(line) as ChatStreamEvent;
    }
    newlineIndex = remaining.indexOf("\n");
  }
  return remaining;
}

/**
 * Incrementally parses an `application/x-ndjson` response body into
 * `ChatStreamEvent`s, per the fixed wire protocol in `src/types/chat.ts`
 * (one JSON object per line: `meta`, many `delta`s, then `done`, or an
 * in-band `error`).
 *
 * A single `ReadableStream` chunk is NOT assumed to equal one line: a chunk
 * may contain zero, one, or many complete lines, and a line may be split
 * across multiple chunks. This buffers decoded text across reads and only
 * ever parses text up to (and including) a `\n`, carrying the remainder
 * forward. On stream end, any trailing text without a final newline is
 * flushed as one last event.
 */
export async function* readNdjsonStream(
  body: ReadableStream<Uint8Array>,
): AsyncGenerator<ChatStreamEvent> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (value) {
        buffer += decoder.decode(value, { stream: true });
        buffer = yield* drainCompleteLines(buffer);
      }
      if (done) {
        buffer += decoder.decode();
        const remainder = buffer.trim();
        if (remainder.length > 0) {
          yield JSON.parse(remainder) as ChatStreamEvent;
        }
        return;
      }
    }
  } finally {
    reader.releaseLock();
  }
}
