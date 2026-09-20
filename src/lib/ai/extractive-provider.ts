import type { ChatProvider, ProviderContextBlock, ProviderEvent, StreamCompletionInput } from "./types";

export interface ExtractiveProviderOptions {
  /** Delay between streamed pieces (ms). Tests pass 0. */
  chunkDelayMs?: number;
  /** How many context blocks to quote. */
  maxBlocks?: number;
  /** Max characters quoted per block. */
  maxCharsPerBlock?: number;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** First paragraph(s) of a block up to `maxChars`, cut at a sentence boundary. */
export function excerptForAnswer(text: string, maxChars: number): string {
  const flat = text
    .replace(/```[\s\S]*?```/g, "")
    .replace(/^\s*[-*]\s+/gm, "• ")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .trim();
  if (flat.length <= maxChars) return flat;
  const cut = flat.slice(0, maxChars);
  const boundary = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf(".\n"), cut.lastIndexOf("\n"));
  return `${cut.slice(0, boundary > maxChars * 0.5 ? boundary + 1 : maxChars).trimEnd()}…`;
}

export function composeExtractiveAnswer(blocks: readonly ProviderContextBlock[], maxBlocks: number, maxChars: number): string {
  const chosen = blocks.slice(0, maxBlocks);
  if (chosen.length === 0) return "";
  const parts = chosen.map((block) => {
    const label = block.section ? `**${block.title} — ${block.section}**` : `**${block.title}**`;
    return `${label}\n\n${excerptForAnswer(block.text, maxChars)} [${block.index}]`;
  });
  return `Here's what Anjo's portfolio says about that:\n\n${parts.join("\n\n")}`;
}

/**
 * Grounded fallback when no language model is configured. It quotes the
 * top retrieved sections verbatim with citations, streamed through the
 * exact same wire protocol as a real model, so the site is useful — and
 * every code path is exercised — with zero API keys.
 */
export class ExtractiveProvider implements ChatProvider {
  readonly name = "extractive";
  readonly isModelBacked = false;
  private readonly chunkDelayMs: number;
  private readonly maxBlocks: number;
  private readonly maxCharsPerBlock: number;

  constructor(options: ExtractiveProviderOptions = {}) {
    this.chunkDelayMs = options.chunkDelayMs ?? 12;
    this.maxBlocks = options.maxBlocks ?? 2;
    this.maxCharsPerBlock = options.maxCharsPerBlock ?? 600;
  }

  async *stream(input: StreamCompletionInput): AsyncIterable<ProviderEvent> {
    const answer = composeExtractiveAnswer(input.context, this.maxBlocks, this.maxCharsPerBlock);
    // Stream in word groups so the UI's streaming path is exercised for real.
    const pieces = answer.match(/\S+\s*/g) ?? [answer];
    let buffer = "";
    for (const piece of pieces) {
      if (input.signal?.aborted) return;
      buffer += piece;
      if (buffer.length >= 24) {
        yield { type: "text", text: buffer };
        buffer = "";
        if (this.chunkDelayMs > 0) await delay(this.chunkDelayMs);
      }
    }
    if (buffer.length > 0) yield { type: "text", text: buffer };
    yield { type: "usage", usage: { inputTokens: 0, outputTokens: 0 } };
    yield { type: "finish", reason: "stop" };
  }
}
