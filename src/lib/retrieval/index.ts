import "server-only";
import { getEnv } from "@/lib/config/env";
import { OpenAIEmbeddingProvider } from "@/lib/knowledge/embeddings";
import { getPublicChunks } from "@/lib/knowledge/repository";
import { logEvent } from "@/lib/observability/log";
import { HybridRetriever } from "./hybrid";
import { LexicalRetriever } from "./lexical";
import { FileVectorStore } from "./stores/file";
import { PgVectorStore } from "./stores/pgvector";
import type { KnowledgeRetriever, VectorStore } from "./types";

export type { KnowledgeResult, KnowledgeRetriever, SearchOptions } from "./types";

let retriever: KnowledgeRetriever | null = null;

/**
 * The single place that decides which `KnowledgeRetriever` the app uses.
 * Resolved once per process from the validated environment and logged, so
 * an accidental lexical-only production deploy is visible in the logs
 * rather than silent.
 *
 *   pgvector -> HybridRetriever over PostgreSQL (DATABASE_URL)
 *   file     -> HybridRetriever over data/knowledge-index.json (no database)
 *   lexical  -> BM25 only (no API key)
 */
export function getRetriever(): KnowledgeRetriever {
  if (retriever) return retriever;
  const env = getEnv();

  let store: VectorStore | null = null;
  if (env.retrieval.backend === "pgvector") {
    store = new PgVectorStore({
      connectionString: env.retrieval.databaseUrl!,
      dimensions: env.embeddings.dimensions,
      embeddingModel: env.embeddings.model,
    });
  } else if (env.retrieval.backend === "file") {
    if (FileVectorStore.exists(env.retrieval.indexPath)) {
      store = new FileVectorStore({
        filePath: env.retrieval.indexPath,
        dimensions: env.embeddings.dimensions,
        embeddingModel: env.embeddings.model,
      });
    } else if (env.retrieval.forced) {
      throw new Error(`RETRIEVAL_BACKEND=file but ${env.retrieval.indexPath} does not exist. Run \`npm run content:index\`.`);
    } else {
      logEvent("warn", { route: "startup", event: "knowledge_index_missing", indexPath: env.retrieval.indexPath });
    }
  }

  if (store) {
    const embeddings = new OpenAIEmbeddingProvider({
      apiKey: env.ai.apiKey!,
      baseUrl: env.ai.baseUrl,
      model: env.embeddings.model,
      dimensions: env.embeddings.dimensions,
    });
    retriever = new HybridRetriever({
      store,
      embeddings,
      getChunks: getPublicChunks,
      minVectorSimilarity: env.retrieval.minSimilarity,
      onVectorError: (error) =>
        logEvent("warn", {
          route: "retrieval",
          event: "vector_leg_failed",
          errorName: error instanceof Error ? error.name : "unknown",
        }),
    });
  } else {
    retriever = new LexicalRetriever(getPublicChunks);
  }

  logEvent("info", { route: "startup", event: "retriever_resolved", retriever: retriever.name, store: store?.name ?? "none", aiMode: env.ai.mode });
  return retriever;
}

/** Test hook. */
export function resetRetriever(): void {
  retriever = null;
}
