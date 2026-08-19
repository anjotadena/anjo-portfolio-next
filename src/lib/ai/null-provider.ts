import { UNCONFIGURED_FALLBACK } from "./fallback";
import type { ChatProvider, StreamCompletionInput } from "./types";

export interface NullProviderOptions {
  /**
   * Delay between streamed chunks, in milliseconds. Defaults to a small,
   * human-perceptible delay so the UI shows a natural streaming effect.
   * Tests should pass 0 so they run instantly and deterministically.
   */
  chunkDelayMs?: number;
  /** Minimum number of chunks to split the fallback text into. */
  minChunks?: number;
}

const DEFAULT_CHUNK_DELAY_MS = 40;
const DEFAULT_MIN_CHUNKS = 3;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Splits `text` into `minChunks`-ish word groups such that concatenating
 * every returned chunk (in order, with no separator) reconstructs `text`
 * exactly — each chunk after the first carries its leading space, since
 * naive consumers append delta chunks with plain string concatenation.
 */
function splitIntoChunks(text: string, minChunks: number): string[] {
  const words = text.split(" ");
  if (words.length <= 1) return [text];

  const chunkCount = Math.min(words.length, Math.max(minChunks, 1));
  const wordsPerChunk = Math.max(1, Math.ceil(words.length / chunkCount));
  const chunks: string[] = [];
  for (let i = 0; i < words.length; i += wordsPerChunk) {
    const slice = words.slice(i, i + wordsPerChunk).join(" ");
    chunks.push(i === 0 ? slice : ` ${slice}`);
  }
  return chunks;
}

/**
 * The default `ChatProvider` when no real model is configured
 * (`isConfigured === false`). Rather than returning the fallback text as
 * one blob, it streams it in several chunks with a small delay between
 * them so the exact same client-side streaming/rendering path used for a
 * real LLM response is exercised end-to-end, even with no model wired up.
 */
export class NullProvider implements ChatProvider {
  readonly name = "null";
  readonly isConfigured = false;

  private readonly chunkDelayMs: number;
  private readonly minChunks: number;

  constructor(options: NullProviderOptions = {}) {
    this.chunkDelayMs = options.chunkDelayMs ?? DEFAULT_CHUNK_DELAY_MS;
    this.minChunks = options.minChunks ?? DEFAULT_MIN_CHUNKS;
  }

  async *streamCompletion(input: StreamCompletionInput): AsyncIterable<string> {
    const chunks = splitIntoChunks(UNCONFIGURED_FALLBACK, this.minChunks);
    for (const chunk of chunks) {
      if (input.signal?.aborted) return;
      if (this.chunkDelayMs > 0) {
        await delay(this.chunkDelayMs);
      }
      yield chunk;
    }
  }
}
