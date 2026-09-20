/**
 * `npm run db:migrate`
 *
 * Creates the pgvector extension, the `knowledge_chunks` table, indexes,
 * and the `knowledge_meta` guard row set if they do not exist. Idempotent.
 * The reference DDL lives in `db/migrations/001_knowledge_chunks.sql`;
 * `PgVectorStore.ensureSchema()` applies the equivalent statements so the
 * table always matches the configured embedding dimensions.
 */
import { loadEnvFiles } from "./lib/load-env";
loadEnvFiles();

import { getEnv } from "@/lib/config/env";
import { PgVectorStore } from "@/lib/retrieval/stores/pgvector";

async function main(): Promise<void> {
  const env = getEnv();
  if (!env.retrieval.databaseUrl) {
    console.error("✖ DATABASE_URL is not set.");
    process.exit(1);
  }
  const store = new PgVectorStore({
    connectionString: env.retrieval.databaseUrl,
    dimensions: env.embeddings.dimensions,
    embeddingModel: env.embeddings.model,
  });
  try {
    await store.ensureSchema();
    const health = await store.healthCheck();
    console.log(`✔ Schema ready (${env.embeddings.model}, ${env.embeddings.dimensions} dims) — ${health.detail}`);
  } finally {
    await store.close();
  }
}

main().catch((error: unknown) => {
  console.error(`✖ Migration failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
