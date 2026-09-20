import { describe, expect, it, vi } from "vitest";
import { chunkDocument } from "@/lib/knowledge/chunker";
import { HashEmbeddingProvider } from "@/lib/knowledge/embeddings";
import { indexContent } from "@/lib/knowledge/indexer";
import { InMemoryVectorStore } from "@/lib/retrieval/stores/memory";
import { fixtureCorpus } from "../../fixtures/docs";

function publicChunks(bodyOverride?: { slug: string; body: string }) {
  return fixtureCorpus()
    .map((doc) => (bodyOverride && doc.slug === bodyOverride.slug ? { ...doc, body: bodyOverride.body } : doc))
    .flatMap((doc) => chunkDocument(doc));
}

describe("indexContent (incremental)", () => {
  it("inserts everything on first run and skips everything on the second", async () => {
    const store = new InMemoryVectorStore();
    const embeddings = new HashEmbeddingProvider(64);
    const spy = vi.spyOn(embeddings, "embed");

    const first = await indexContent({ store, embeddings, chunks: publicChunks() });
    expect(first.inserted).toBeGreaterThan(0);
    expect(first.updated).toBe(0);
    expect(first.deleted).toBe(0);
    expect(store.size()).toBe(first.total);

    const second = await indexContent({ store, embeddings, chunks: publicChunks() });
    expect(second.unchanged).toBe(first.total);
    expect(second.embeddedTexts).toBe(0);
    expect(spy).toHaveBeenCalledTimes(Math.ceil(first.total / 32));
  });

  it("re-embeds only changed chunks and deletes removed ones", async () => {
    const store = new InMemoryVectorStore();
    const embeddings = new HashEmbeddingProvider(64);
    await indexContent({ store, embeddings, chunks: publicChunks() });

    const edited = publicChunks({ slug: "starweave", body: "## Overview\n\nStarweave now has a completely different overview paragraph for the test." });
    const stats = await indexContent({ store, embeddings, chunks: edited });
    // Overview changed; Architecture + Results sections were removed.
    expect(stats.updated).toBe(1);
    expect(stats.deleted).toBe(2);
    expect(stats.inserted).toBe(0);
    expect(stats.embeddedTexts).toBe(1);
    expect(store.size()).toBe(edited.filter((c) => c.visibility === "public").length);
  });

  it("never writes private chunks even if they are passed in", async () => {
    const store = new InMemoryVectorStore();
    const chunks = publicChunks();
    expect(chunks.some((chunk) => chunk.visibility === "private")).toBe(true);
    await indexContent({ store, embeddings: new HashEmbeddingProvider(64), chunks });
    const hashes = await store.listHashes();
    for (const id of hashes.keys()) expect(id.startsWith("secret-plans")).toBe(false);
  });
});

describe("HashEmbeddingProvider", () => {
  it("is deterministic and unit-normalized", async () => {
    const provider = new HashEmbeddingProvider(32);
    const [a, b] = await provider.embed(["hello world", "hello world"]);
    expect(a).toEqual(b);
    const norm = Math.sqrt(a!.reduce((sum, v) => sum + v * v, 0));
    expect(norm).toBeCloseTo(1, 5);
  });
});
