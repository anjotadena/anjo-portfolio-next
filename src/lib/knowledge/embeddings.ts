import { createHash } from "node:crypto";
import type { EmbeddingProvider } from "@/lib/retrieval/types";
import { STOPWORDS } from "@/lib/retrieval/stopwords";
import { tokenize } from "@/lib/retrieval/tokenize";

export const DEFAULT_EMBEDDING_MODEL = "text-embedding-3-small";
export const DEFAULT_EMBEDDING_DIMENSIONS = 1536;
const MAX_BATCH = 64;

export interface OpenAIEmbeddingOptions {
  apiKey: string;
  model?: string;
  dimensions?: number;
  baseUrl?: string;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
}

/**
 * OpenAI `/v1/embeddings` via plain `fetch` — no SDK dependency for a
 * single JSON endpoint. Batches requests and enforces a timeout so a hung
 * upstream can never stall indexing or a chat request indefinitely.
 */
export class OpenAIEmbeddingProvider implements EmbeddingProvider {
  readonly name = "openai";
  readonly model: string;
  readonly dimensions: number;
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly fetchImpl: typeof fetch;

  constructor(options: OpenAIEmbeddingOptions) {
    this.apiKey = options.apiKey;
    this.model = options.model ?? DEFAULT_EMBEDDING_MODEL;
    this.dimensions = options.dimensions ?? DEFAULT_EMBEDDING_DIMENSIONS;
    this.baseUrl = (options.baseUrl ?? "https://api.openai.com/v1").replace(/\/+$/, "");
    this.timeoutMs = options.timeoutMs ?? 20_000;
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  async embed(texts: readonly string[]): Promise<number[][]> {
    const out: number[][] = [];
    for (let i = 0; i < texts.length; i += MAX_BATCH) {
      out.push(...(await this.embedBatch(texts.slice(i, i + MAX_BATCH))));
    }
    return out;
  }

  private async embedBatch(texts: readonly string[]): Promise<number[][]> {
    if (texts.length === 0) return [];
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const response = await this.fetchImpl(`${this.baseUrl}/embeddings`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${this.apiKey}` },
        body: JSON.stringify({ model: this.model, input: texts, dimensions: this.dimensions }),
        signal: controller.signal,
      });
      if (!response.ok) {
        // Never surface the response body: it can echo request content.
        throw new Error(`Embedding request failed with status ${response.status}`);
      }
      const payload = (await response.json()) as { data?: Array<{ index: number; embedding: number[] }> };
      const rows = payload.data ?? [];
      if (rows.length !== texts.length) throw new Error("Embedding response did not match input length");
      return rows.sort((a, b) => a.index - b.index).map((row) => row.embedding);
    } finally {
      clearTimeout(timer);
    }
  }
}

/**
 * Deterministic, dependency-free embedding used by tests, evals, and local
 * development without an API key. Hashes each token into a fixed-size
 * bag-of-words vector, so semantically identical text always yields the
 * same vector and lexical overlap produces cosine similarity — enough to
 * exercise the whole indexing/retrieval pipeline end to end. Not a
 * substitute for a real model in production.
 */
export class HashEmbeddingProvider implements EmbeddingProvider {
  readonly name = "hash";
  readonly model = "hash-bow";
  readonly dimensions: number;

  constructor(dimensions = 256) {
    this.dimensions = dimensions;
  }

  async embed(texts: readonly string[]): Promise<number[][]> {
    return texts.map((text) => this.embedOne(text));
  }

  private embedOne(text: string): number[] {
    const vector = new Array<number>(this.dimensions).fill(0);
    for (const token of tokenize(text)) {
      if (STOPWORDS.has(token)) continue;
      const digest = createHash("sha1").update(token).digest();
      const index = digest.readUInt32BE(0) % this.dimensions;
      const sign = digest[4]! & 1 ? 1 : -1;
      vector[index]! += sign;
    }
    const norm = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0)) || 1;
    return vector.map((value) => value / norm);
  }
}
