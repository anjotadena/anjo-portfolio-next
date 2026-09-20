import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { chunkDocument } from "@/lib/knowledge/chunker";
import { HashEmbeddingProvider } from "@/lib/knowledge/embeddings";
import { indexContent } from "@/lib/knowledge/indexer";
import { HybridRetriever } from "@/lib/retrieval/hybrid";
import { PgVectorStore, toVectorLiteral } from "@/lib/retrieval/stores/pgvector";
import { fixtureCorpus } from "../fixtures/docs";

/**
 * Real PostgreSQL + pgvector round trip. Runs only when TEST_DATABASE_URL
 * points at a pgvector-enabled database (e.g. `docker compose up -d` then
 * TEST_DATABASE_URL=postgres://portfolio:portfolio@localhost:5432/portfolio).
 * Uses a dedicated table and the hash embedding provider so no API key is
 * needed and the production index is never touched.
 */
const databaseUrl = process.env.TEST_DATABASE_URL;
const describeDb = databaseUrl ? describe : describe.skip;

describeDb("PgVectorStore (integration)", () => {
  const dimensions = 64;
  const embeddings = new HashEmbeddingProvider(dimensions);
  const chunks = fixtureCorpus().flatMap((doc) => chunkDocument(doc));
  let store: PgVectorStore;

  beforeAll(async () => {
    store = new PgVectorStore({ connectionString: databaseUrl!, dimensions, embeddingModel: "hash-bow", tableName: "knowledge_chunks_test" });
    await store.reset();
  });

  afterAll(async () => {
    await store.close();
  });

  it("creates the schema and indexes chunks incrementally", async () => {
    const first = await indexContent({ store, embeddings, chunks });
    expect(first.inserted).toBeGreaterThan(0);
    const second = await indexContent({ store, embeddings, chunks });
    expect(second.unchanged).toBe(first.total);
    expect(second.embeddedTexts).toBe(0);
    const health = await store.healthCheck();
    expect(health.ok).toBe(true);
  });

  it("searches by cosine similarity and hydrates through the hybrid retriever", async () => {
    const retriever = new HybridRetriever({ store, embeddings, getChunks: () => chunks });
    const results = await retriever.search("Starweave delivery graph agents");
    expect(results[0]?.chunk.documentSlug).toBe("starweave");
    expect(results.some((r) => r.matchedBy === "hybrid" || r.matchedBy === "vector")).toBe(true);
  });

  it("filters by type in SQL", async () => {
    const [embedding] = await embeddings.embed(["C# ASP.NET Core service"]);
    const matches = await store.search(embedding!, { limit: 5, types: ["skills"] });
    expect(matches.length).toBeGreaterThan(0);
    for (const match of matches) expect(match.chunkId.startsWith("skills::")).toBe(true);
  });

  it("deletes removed chunks", async () => {
    const subset = chunks.filter((chunk) => chunk.documentSlug !== "ledger-api");
    const stats = await indexContent({ store, embeddings, chunks: subset });
    expect(stats.deleted).toBe(chunks.filter((c) => c.documentSlug === "ledger-api" && c.visibility === "public").length);
    const hashes = await store.listHashes();
    expect(Array.from(hashes.keys()).some((id) => id.startsWith("ledger-api::"))).toBe(false);
  });

  it("refuses a mismatched embedding configuration", async () => {
    const wrong = new PgVectorStore({ connectionString: databaseUrl!, dimensions: 64, embeddingModel: "different-model", tableName: "knowledge_chunks_test" });
    await expect(wrong.ensureSchema()).rejects.toThrow(/knowledge_meta/);
    await wrong.close();
  });
});

describe("toVectorLiteral", () => {
  it("formats vectors for pgvector and neutralizes non-finite values", () => {
    expect(toVectorLiteral([0.5, -1, Number.NaN])).toBe("[0.5,-1,0]");
  });
});
