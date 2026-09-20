import type { ContentChunk } from "@/types/content";
import { isGreetingQuery } from "./greeting";
import { rankLexically, requiredCoverage, substantiveTerms } from "./lexical";
import type {
  EmbeddingProvider,
  KnowledgeResult,
  KnowledgeRetriever,
  MatchSource,
  SearchOptions,
  VectorStore,
} from "./types";

export const DEFAULT_HYBRID_LIMIT = 6;
export const DEFAULT_HYBRID_MIN_SCORE = 0.2;
/** How many candidates each leg contributes before fusion. */
const CANDIDATES_PER_LEG = 12;
/** Standard RRF constant; keeps the top ranks from dominating. */
const RRF_K = 60;
/**
 * Vector matches below this cosine similarity are noise. A nearest-neighbour
 * search always returns *something*, so this floor is what stops an
 * off-topic question from looking grounded. 0.3 is conservative for
 * text-embedding-3-small; tune via RETRIEVAL_MIN_SIMILARITY.
 */
export const DEFAULT_MIN_VECTOR_SIMILARITY = 0.3;

export interface HybridRetrieverOptions {
  store: VectorStore;
  embeddings: EmbeddingProvider;
  /** The public chunk corpus, used for the lexical leg and to hydrate vector hits. */
  getChunks: () => readonly ContentChunk[];
  /** Called when the vector leg fails; the retriever then degrades to lexical-only. */
  onVectorError?: (error: unknown) => void;
  minVectorSimilarity?: number;
}

/**
 * Hybrid retrieval = vector similarity (pgvector) ⊕ BM25 lexical ranking,
 * fused with reciprocal rank fusion (RRF). On a small, terminology-heavy
 * corpus this beats either leg alone: embeddings catch paraphrases
 * ("what does he use in the cloud" -> AWS/Azure), while BM25 nails exact
 * tokens (".NET", "pgvector", "Angular") that embeddings blur together.
 *
 * If the vector store is unreachable the retriever degrades to the
 * lexical leg and reports it — answers stay grounded in the same corpus
 * rather than the chat going down with the database.
 */
export class HybridRetriever implements KnowledgeRetriever {
  readonly name = "hybrid";

  constructor(private readonly options: HybridRetrieverOptions) {}

  async search(query: string, options: SearchOptions = {}): Promise<KnowledgeResult[]> {
    const limit = options.limit ?? DEFAULT_HYBRID_LIMIT;
    const minScore = options.minScore ?? DEFAULT_HYBRID_MIN_SCORE;
    const trimmed = query.trim();
    if (trimmed.length === 0) return [];

    const corpus = this.options
      .getChunks()
      .filter(
        (chunk) =>
          chunk.visibility === "public" &&
          (!options.types || options.types.includes(chunk.type)) &&
          (!options.slugs || options.slugs.includes(chunk.documentSlug)),
      );
    const byId = new Map(corpus.map((chunk) => [chunk.id, chunk]));

    if (isGreetingQuery(trimmed)) {
      return corpus
        .filter((chunk) => chunk.type === "profile")
        .slice(0, limit)
        .map((chunk) => ({ chunk, score: 1, matchedBy: "lexical" as const }));
    }

    const lexical = rankLexically(trimmed, corpus).slice(0, CANDIDATES_PER_LEG);
    const needed = requiredCoverage(substantiveTerms(trimmed));

    let vectorHits: Array<{ chunkId: string; similarity: number }> = [];
    try {
      const [embedding] = await this.options.embeddings.embed([trimmed]);
      if (embedding) {
        const raw = await this.options.store.search(embedding, {
          limit: CANDIDATES_PER_LEG,
          types: options.types,
        });
        const floor = this.options.minVectorSimilarity ?? DEFAULT_MIN_VECTOR_SIMILARITY;
        vectorHits = raw.filter((hit) => hit.similarity >= floor && byId.has(hit.chunkId));
      }
    } catch (error) {
      this.options.onVectorError?.(error);
    }

    // Reciprocal rank fusion.
    const fused = new Map<string, { score: number; sources: Set<MatchSource> }>();
    const add = (id: string, rank: number, source: MatchSource, weight: number) => {
      const entry = fused.get(id) ?? { score: 0, sources: new Set<MatchSource>() };
      entry.score += weight / (RRF_K + rank);
      entry.sources.add(source);
      fused.set(id, entry);
    };
    vectorHits.forEach((hit, index) => add(hit.chunkId, index + 1, "vector", 1));
    lexical.forEach((entry, index) => {
      // A lexical hit that only matched one incidental term of a multi-term
      // query is weak evidence; keep it but down-weight it.
      const weight = entry.coverage >= needed ? 1 : 0.35;
      add(entry.chunk.id, index + 1, "lexical", weight);
    });

    // Normalize so the best possible fused score (rank 1 in both legs) is 1.
    const maxPossible = 2 / (RRF_K + 1);
    const results: KnowledgeResult[] = [];
    for (const [id, entry] of fused) {
      const chunk = byId.get(id);
      if (!chunk) continue;
      const score = Math.min(1, entry.score / maxPossible);
      const matchedBy: MatchSource = entry.sources.size > 1 ? "hybrid" : (entry.sources.values().next().value ?? "lexical");
      results.push({ chunk, score, matchedBy });
    }

    return results
      .sort((a, b) => b.score - a.score || a.chunk.documentSlug.localeCompare(b.chunk.documentSlug) || a.chunk.chunkIndex - b.chunk.chunkIndex)
      .filter((result) => result.score >= minScore)
      .slice(0, limit);
  }

  async healthCheck(): Promise<{ ok: boolean; detail?: string }> {
    return this.options.store.healthCheck();
  }
}
