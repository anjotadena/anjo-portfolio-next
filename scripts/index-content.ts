/**
 * `npm run content:index [-- --reset] [-- --dry-run]`
 *
 * Incrementally indexes public Markdown chunks into the configured vector
 * store: unchanged chunks are skipped, changed ones re-embedded, new ones
 * inserted, and removed ones deleted (by content hash / deterministic id).
 *
 * Store selection follows RETRIEVAL_BACKEND: `pgvector` when DATABASE_URL is
 * configured, otherwise the JSON file index (data/knowledge-index.json),
 * which is meant to be committed next to the Markdown so deployments need no
 * database.
 *
 *   --reset    truncate the store first (required after changing the
 *              embedding model or dimensions)
 *   --dry-run  compute the diff without calling the embedding API
 *   --check    exit 1 if the committed file index is stale relative to the
 *              Markdown (no API key needed); used by CI
 */
import { loadEnvFiles } from "./lib/load-env";
loadEnvFiles();

import { getEnv } from "@/lib/config/env";
import { chunkDocument } from "@/lib/knowledge/chunker";
import { OpenAIEmbeddingProvider } from "@/lib/knowledge/embeddings";
import { indexContent } from "@/lib/knowledge/indexer";
import { loadAllDocuments } from "@/lib/knowledge/repository";
import { FileVectorStore } from "@/lib/retrieval/stores/file";
import { PgVectorStore } from "@/lib/retrieval/stores/pgvector";
import type { VectorStore } from "@/lib/retrieval/types";

async function main(): Promise<void> {
  const args = new Set(process.argv.slice(2));
  const env = getEnv();

  const checkOnly = args.has("--check") || args.has("--dry-run");
  if (!env.ai.apiKey && !checkOnly) {
    console.error("✖ OPENAI_API_KEY is not set; embeddings cannot be generated.");
    process.exit(1);
  }

  const { documents, errors } = loadAllDocuments();
  if (errors.length > 0) {
    console.error(`✖ Content is invalid; run \`npm run content:validate\` for details.`);
    process.exit(1);
  }
  const chunks = documents.filter((doc) => doc.visibility === "public").flatMap((doc) => chunkDocument(doc));

  let store: VectorStore & { reset(): Promise<void> | void };
  if (env.retrieval.backend === "pgvector") {
    store = new PgVectorStore({
      connectionString: env.retrieval.databaseUrl!,
      dimensions: env.embeddings.dimensions,
      embeddingModel: env.embeddings.model,
    });
    console.log("Target: PostgreSQL + pgvector");
  } else {
    store = new FileVectorStore({
      filePath: env.retrieval.indexPath,
      dimensions: env.embeddings.dimensions,
      embeddingModel: env.embeddings.model,
    });
    console.log(`Target: ${env.retrieval.indexPath} (no database)`);
  }

  try {
    if (args.has("--reset")) {
      console.log("Resetting vector store…");
      await store.reset();
    } else if (store instanceof PgVectorStore) {
      await store.ensureSchema();
    }

    if (args.has("--check")) {
      if (store instanceof FileVectorStore && !FileVectorStore.exists(env.retrieval.indexPath)) {
        console.warn(`⚠ ${env.retrieval.indexPath} does not exist; semantic search will fall back to lexical until \`npm run content:index\` is run and the file committed.`);
        return;
      }
      const existing = await store.listHashes();
      const ids = new Set(chunks.map((chunk) => chunk.id));
      const stale = chunks.filter((chunk) => existing.get(chunk.id) !== chunk.contentHash).length + Array.from(existing.keys()).filter((id) => !ids.has(id)).length;
      if (stale > 0) {
        console.error(`✖ Knowledge index is stale (${stale} chunk(s) differ from the Markdown). Run \`npm run content:index\` and commit ${env.retrieval.indexPath}.`);
        process.exit(1);
      }
      console.log(`✔ Knowledge index is up to date (${chunks.length} chunks).`);
      return;
    }

    if (args.has("--dry-run")) {
      const existing = await store.listHashes();
      const ids = new Set(chunks.map((chunk) => chunk.id));
      const unchanged = chunks.filter((chunk) => existing.get(chunk.id) === chunk.contentHash).length;
      const changed = chunks.filter((chunk) => existing.has(chunk.id) && existing.get(chunk.id) !== chunk.contentHash).length;
      const added = chunks.filter((chunk) => !existing.has(chunk.id)).length;
      const removed = Array.from(existing.keys()).filter((id) => !ids.has(id)).length;
      console.log(`Dry run: ${unchanged} unchanged, ${changed} changed, ${added} new, ${removed} to delete (${chunks.length} public chunks).`);
      return;
    }

    const embeddings = new OpenAIEmbeddingProvider({
      apiKey: env.ai.apiKey!,
      baseUrl: env.ai.baseUrl,
      model: env.embeddings.model,
      dimensions: env.embeddings.dimensions,
    });
    const stats = await indexContent({ store, embeddings, chunks, log: (message) => console.log(`  ${message}`) });
    console.log(
      `✔ Indexed ${stats.total} chunks in ${stats.durationMs}ms — ` +
        `${stats.unchanged} unchanged, ${stats.inserted} inserted, ${stats.updated} updated, ${stats.deleted} deleted ` +
        `(${stats.embeddedTexts} embedding calls).`,
    );
  } finally {
    await store.close();
  }
}

main().catch((error: unknown) => {
  console.error(`✖ Indexing failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
