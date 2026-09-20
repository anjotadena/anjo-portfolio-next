import type { VectorMatch, VectorRecord, VectorSearchOptions, VectorStore } from "../types";

export function cosineSimilarity(a: readonly number[], b: readonly number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  const length = Math.min(a.length, b.length);
  for (let i = 0; i < length; i += 1) {
    const x = a[i] ?? 0;
    const y = b[i] ?? 0;
    dot += x * y;
    normA += x * x;
    normB += y * y;
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * In-memory `VectorStore`. Used by integration tests and evals (with the
 * hash embedding provider) so the full index -> retrieve -> answer path is
 * exercised without a database. Brute-force cosine search is fine at
 * portfolio scale (tens to hundreds of chunks).
 */
export class InMemoryVectorStore implements VectorStore {
  readonly name = "memory";
  private readonly records = new Map<string, VectorRecord>();

  async listHashes(): Promise<Map<string, string>> {
    return new Map(Array.from(this.records.values(), (record) => [record.chunkId, record.contentHash]));
  }

  async upsert(records: readonly VectorRecord[]): Promise<void> {
    for (const record of records) this.records.set(record.chunkId, record);
  }

  async delete(chunkIds: readonly string[]): Promise<void> {
    for (const id of chunkIds) this.records.delete(id);
  }

  async search(embedding: readonly number[], options: VectorSearchOptions): Promise<VectorMatch[]> {
    const matches: VectorMatch[] = [];
    for (const record of this.records.values()) {
      if (record.visibility !== "public") continue;
      if (options.types && !options.types.includes(record.type)) continue;
      matches.push({ chunkId: record.chunkId, similarity: cosineSimilarity(embedding, record.embedding) });
    }
    return matches.sort((a, b) => b.similarity - a.similarity || a.chunkId.localeCompare(b.chunkId)).slice(0, options.limit);
  }

  async healthCheck(): Promise<{ ok: boolean; detail?: string }> {
    return { ok: true, detail: `${this.records.size} vectors in memory` };
  }

  async close(): Promise<void> {}

  /** Test helper. */
  size(): number {
    return this.records.size;
  }
}
