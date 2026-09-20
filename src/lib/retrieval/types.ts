import type { ContentChunk, ContentType } from "@/types/content";

/**
 * The retrieval contract the rest of the app depends on. Chat, search,
 * and evals only ever see `KnowledgeRetriever`; swapping pgvector for
 * another vector database means implementing `VectorStore` — nothing
 * above this interface changes.
 */

export interface SearchOptions {
  /** Maximum results (post-fusion). */
  limit?: number;
  /** Restrict to these document types. */
  types?: ContentType[];
  /** Restrict to these document slugs. */
  slugs?: string[];
  /** Minimum fused score in [0, 1]; results below are dropped. */
  minScore?: number;
}

export type MatchSource = "vector" | "lexical" | "hybrid";

export interface KnowledgeResult {
  chunk: ContentChunk;
  /** Normalized relevance in (0, 1]. Comparable within one retriever only. */
  score: number;
  matchedBy: MatchSource;
}

export interface KnowledgeRetriever {
  readonly name: string;
  search(query: string, options?: SearchOptions): Promise<KnowledgeResult[]>;
  /** Cheap liveness check used by /api/health. Never throws. */
  healthCheck(): Promise<{ ok: boolean; detail?: string }>;
}

export interface EmbeddingProvider {
  readonly name: string;
  readonly model: string;
  readonly dimensions: number;
  embed(texts: readonly string[]): Promise<number[][]>;
}

export interface VectorRecord {
  chunkId: string;
  documentSlug: string;
  title: string;
  section: string | null;
  type: ContentType;
  tags: string[];
  visibility: "public" | "private";
  content: string;
  contentHash: string;
  embedding: number[];
  metadata: Record<string, unknown>;
}

export interface VectorMatch {
  chunkId: string;
  /** Cosine similarity in [-1, 1]. */
  similarity: number;
}

export interface VectorSearchOptions {
  limit: number;
  types?: ContentType[];
}

export interface VectorStore {
  readonly name: string;
  /** chunkId -> contentHash for everything currently stored. */
  listHashes(): Promise<Map<string, string>>;
  upsert(records: readonly VectorRecord[]): Promise<void>;
  delete(chunkIds: readonly string[]): Promise<void>;
  search(embedding: readonly number[], options: VectorSearchOptions): Promise<VectorMatch[]>;
  healthCheck(): Promise<{ ok: boolean; detail?: string }>;
  close(): Promise<void>;
}
