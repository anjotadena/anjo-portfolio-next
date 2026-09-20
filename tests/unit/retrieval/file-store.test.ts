import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { chunkDocument } from "@/lib/knowledge/chunker";
import { HashEmbeddingProvider } from "@/lib/knowledge/embeddings";
import { indexContent } from "@/lib/knowledge/indexer";
import { HybridRetriever } from "@/lib/retrieval/hybrid";
import { FileVectorStore } from "@/lib/retrieval/stores/file";
import { parseEnv } from "@/lib/config/env";
import { fixtureCorpus } from "../../fixtures/docs";

const chunks = fixtureCorpus().flatMap((doc) => chunkDocument(doc));
const embeddings = new HashEmbeddingProvider(48);

describe("FileVectorStore (no database)", () => {
  let dir: string;
  let filePath: string;

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), "knowledge-index-"));
    filePath = path.join(dir, "knowledge-index.json");
  });

  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  function store() {
    return new FileVectorStore({ filePath, dimensions: 48, embeddingModel: "hash-bow" });
  }

  it("indexes to a JSON file, then loads it in a fresh process and searches it", async () => {
    const writer = store();
    const stats = await indexContent({ store: writer, embeddings, chunks });
    await writer.close();
    expect(fs.existsSync(filePath)).toBe(true);
    expect(stats.inserted).toBe(chunks.filter((c) => c.visibility === "public").length);

    const file = JSON.parse(fs.readFileSync(filePath, "utf8")) as { records: Array<{ chunkId: string; embedding: number[] }> };
    expect(file.records.some((r) => r.chunkId.startsWith("secret-plans"))).toBe(false);
    // Text is never stored in the index; chunks are hydrated from Markdown.
    expect(JSON.stringify(file)).not.toContain("agentic software delivery");

    const reader = store();
    const retriever = new HybridRetriever({ store: reader, embeddings, getChunks: () => chunks });
    const results = await retriever.search("Starweave delivery graph");
    expect(results[0]?.chunk.documentSlug).toBe("starweave");
    expect((await reader.healthCheck()).ok).toBe(true);
  });

  it("is incremental across runs (unchanged chunks are not re-embedded)", async () => {
    const first = store();
    await indexContent({ store: first, embeddings, chunks });
    await first.close();
    const second = store();
    const stats = await indexContent({ store: second, embeddings, chunks });
    expect(stats.embeddedTexts).toBe(0);
    expect(stats.unchanged).toBe(stats.total);
  });

  it("refuses an index built with a different embedding configuration", async () => {
    const writer = store();
    await indexContent({ store: writer, embeddings, chunks });
    await writer.close();
    const mismatched = new FileVectorStore({ filePath, dimensions: 48, embeddingModel: "text-embedding-3-small" });
    await expect(mismatched.listHashes()).rejects.toThrow(/Re-run/);
  });

  it("reports missing files as unhealthy and supports reset", async () => {
    expect(FileVectorStore.exists(filePath)).toBe(false);
    const s = store();
    expect((await s.healthCheck()).ok).toBe(false);
    await indexContent({ store: s, embeddings, chunks });
    s.reset();
    await s.close();
    expect(store().size()).toBe(0);
  });
});

describe("retrieval backend resolution", () => {
  it("prefers pgvector, then the file index, then lexical", () => {
    expect(parseEnv({ NODE_ENV: "test", OPENAI_API_KEY: "k", DATABASE_URL: "postgres://x" }).retrieval.backend).toBe("pgvector");
    expect(parseEnv({ NODE_ENV: "test", OPENAI_API_KEY: "k" }).retrieval.backend).toBe("file");
    expect(parseEnv({ NODE_ENV: "test" }).retrieval.backend).toBe("lexical");
  });

  it("forcing the file backend requires the API key and marks the choice as forced", () => {
    expect(() => parseEnv({ NODE_ENV: "test", RETRIEVAL_BACKEND: "file" })).toThrow(/OPENAI_API_KEY/);
    const env = parseEnv({ NODE_ENV: "test", RETRIEVAL_BACKEND: "file", OPENAI_API_KEY: "k", KNOWLEDGE_INDEX_PATH: "custom/index.json" });
    expect(env.retrieval.forced).toBe(true);
    expect(env.retrieval.indexPath).toBe("custom/index.json");
  });
});
