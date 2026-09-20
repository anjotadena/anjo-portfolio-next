import { describe, expect, it, vi } from "vitest";
import { chunkDocument } from "@/lib/knowledge/chunker";
import { HashEmbeddingProvider } from "@/lib/knowledge/embeddings";
import { indexContent } from "@/lib/knowledge/indexer";
import { HybridRetriever } from "@/lib/retrieval/hybrid";
import { InMemoryVectorStore, cosineSimilarity } from "@/lib/retrieval/stores/memory";
import type { VectorStore } from "@/lib/retrieval/types";
import { fixtureCorpus } from "../../fixtures/docs";

const chunks = fixtureCorpus().flatMap((doc) => chunkDocument(doc));

async function buildRetriever() {
  const store = new InMemoryVectorStore();
  const embeddings = new HashEmbeddingProvider(128);
  await indexContent({ store, embeddings, chunks });
  return { store, embeddings, retriever: new HybridRetriever({ store, embeddings, getChunks: () => chunks }) };
}

describe("HybridRetriever", () => {
  it("fuses vector and lexical results and reports hybrid matches", async () => {
    const { retriever } = await buildRetriever();
    const results = await retriever.search("Starweave delivery graph agents");
    expect(results[0]?.chunk.documentSlug).toBe("starweave");
    expect(results.some((r) => r.matchedBy === "hybrid")).toBe(true);
    for (const r of results) expect(r.score).toBeLessThanOrEqual(1);
  });

  it("never surfaces private chunks", async () => {
    const { retriever } = await buildRetriever();
    const results = await retriever.search("Acme Secret Corp Kubernetes");
    expect(results.every((r) => r.chunk.visibility === "public")).toBe(true);
  });

  it("degrades to lexical-only when the vector store fails, and reports it", async () => {
    const embeddings = new HashEmbeddingProvider(128);
    const failing: VectorStore = {
      name: "failing",
      listHashes: async () => new Map(),
      upsert: async () => {},
      delete: async () => {},
      search: async () => {
        throw new Error("connection refused");
      },
      healthCheck: async () => ({ ok: false }),
      close: async () => {},
    };
    const onVectorError = vi.fn();
    const retriever = new HybridRetriever({ store: failing, embeddings, getChunks: () => chunks, onVectorError });
    const results = await retriever.search("Starweave");
    expect(onVectorError).toHaveBeenCalledTimes(1);
    expect(results[0]?.chunk.documentSlug).toBe("starweave");
    expect(results.every((r) => r.matchedBy === "lexical")).toBe(true);
  });

  it("applies type filters to both legs", async () => {
    const { retriever } = await buildRetriever();
    const results = await retriever.search("ASP.NET C#", { types: ["skills"] });
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((r) => r.chunk.type === "skills")).toBe(true);
  });

  it("returns an empty list for an empty query", async () => {
    const { retriever } = await buildRetriever();
    expect(await retriever.search("   ")).toEqual([]);
  });
});

describe("cosineSimilarity", () => {
  it("is 1 for identical vectors and 0 for orthogonal ones", () => {
    expect(cosineSimilarity([1, 0], [1, 0])).toBeCloseTo(1);
    expect(cosineSimilarity([1, 0], [0, 1])).toBeCloseTo(0);
    expect(cosineSimilarity([0, 0], [1, 1])).toBe(0);
  });
});
