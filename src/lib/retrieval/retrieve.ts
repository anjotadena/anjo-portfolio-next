import type { ContentChunk } from "@/types/content";
import type { RetrievalOptions, RetrievalResult, ScoredChunk } from "@/types/retrieval";
import { isGreetingQuery } from "./greeting";
import { normalizeScore, scoreChunks } from "./score";
import { STOPWORDS } from "./stopwords";
import { tokenize } from "./tokenize";

/** Default number of chunks returned. */
export const DEFAULT_LIMIT = 3;

/**
 * Minimum normalized score (see `normalizeScore`) a top chunk must clear
 * to count as "grounded". Calibrated against this corpus's real BM25+
 * scores: a genuinely relevant single-term match (idf for a term that
 * appears in only a couple of ~25 chunks) normalizes to roughly 0.6-0.8,
 * while a term that appears in nearly every chunk (idf approx 0, e.g. the
 * word "Anjo") normalizes to well under 0.02. This floor is intentionally
 * low rather than "strict" — the real discriminating gate is term
 * coverage below, which doesn't drift as the corpus grows the way a bare
 * idf-based threshold would.
 */
export const DEFAULT_MIN_SCORE = 0.02;

/**
 * How many distinct non-stopword query terms must be present in a chunk
 * for it to count as grounded, capped at the number of substantive terms
 * actually in the query (so a single-word query like "Anjo" only ever
 * requires 1, never an unreachable fixed K).
 */
export const DEFAULT_MIN_TERM_COVERAGE = 2;

function extractChunkIndex(chunkId: string): number {
  const hashIndex = chunkId.lastIndexOf("#");
  const suffix = hashIndex === -1 ? chunkId : chunkId.slice(hashIndex + 1);
  const parsed = Number(suffix);
  return Number.isFinite(parsed) ? parsed : 0;
}

function compareChunks(a: ScoredChunk, b: ScoredChunk): number {
  if (b.score !== a.score) return b.score - a.score;
  if (a.chunk.documentSlug !== b.chunk.documentSlug) {
    return a.chunk.documentSlug < b.chunk.documentSlug ? -1 : 1;
  }
  return extractChunkIndex(a.chunk.id) - extractChunkIndex(b.chunk.id);
}

/**
 * Selects a small, deterministic set of chunks to ground a greeting reply
 * on. Prefers "profile" category chunks (a natural self-introduction) but
 * falls back to the corpus's own order so this stays correct for any
 * injected test corpus that doesn't have a "profile" category at all.
 */
function selectGreetingChunks(chunks: readonly ContentChunk[], limit: number): ScoredChunk[] {
  const profileChunks = chunks.filter((chunk) => chunk.category === "profile");
  const rest = chunks.filter((chunk) => chunk.category !== "profile");
  return [...profileChunks, ...rest].slice(0, limit).map((chunk) => ({ chunk, score: 1 }));
}

/**
 * Pure BM25-lite lexical retrieval over an injected corpus of chunks.
 * See `RetrievalResult["reason"]` for the exhaustive set of outcomes.
 *
 * Degenerate-input handling note: the `RetrievalResult.reason` union is a
 * fixed contract with 5 values, so the three degenerate input cases in
 * the spec collapse onto it as follows:
 *  - a literally empty/whitespace-only query -> "empty-query"
 *  - a query that tokenizes to zero tokens (e.g. only punctuation/symbols)
 *    -> "no-match" (there was input, but nothing to search with)
 *  - a query made entirely of stopwords -> "no-match" (same reasoning:
 *    zero substantive terms means zero possible matches, by definition)
 */
export function retrieve(
  query: string,
  chunks: readonly ContentChunk[],
  options: RetrievalOptions = {},
): RetrievalResult {
  const limit = options.limit ?? DEFAULT_LIMIT;
  const minScore = options.minScore ?? DEFAULT_MIN_SCORE;
  const minTermCoverage = options.minTermCoverage ?? DEFAULT_MIN_TERM_COVERAGE;

  if (query.trim().length === 0) {
    return { chunks: [], grounded: false, topScore: 0, reason: "empty-query" };
  }

  // Greeting/small-talk short-circuits BEFORE any scoring.
  if (isGreetingQuery(query)) {
    const greetingChunks = selectGreetingChunks(chunks, limit);
    return {
      chunks: greetingChunks,
      grounded: true,
      topScore: greetingChunks.length > 0 ? 1 : 0,
      reason: "greeting",
    };
  }

  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) {
    return { chunks: [], grounded: false, topScore: 0, reason: "no-match" };
  }

  const substantiveTerms = Array.from(new Set(queryTokens.filter((token) => !STOPWORDS.has(token))));
  if (substantiveTerms.length === 0) {
    return { chunks: [], grounded: false, topScore: 0, reason: "no-match" };
  }

  const scored = scoreChunks(substantiveTerms, chunks);
  const ranked = scored
    .map((entry) => ({
      chunk: entry.chunk,
      score: normalizeScore(entry.rawScore),
      rawScore: entry.rawScore,
      coverage: entry.matchedTerms.size,
    }))
    .sort((a, b) => compareChunks(a, b));

  const top = ranked[0];
  if (!top || top.rawScore <= 0) {
    return { chunks: [], grounded: false, topScore: 0, reason: "no-match" };
  }

  const requiredCoverage = Math.min(minTermCoverage, substantiveTerms.length);
  const grounded = top.score > minScore && top.coverage >= requiredCoverage;

  // Chunks are returned as a stable top-N regardless of `grounded`, so a
  // query that matches every chunk near-equally (e.g. an ubiquitous term
  // like "Anjo") still yields a sensible, deterministic top-3 even when
  // it doesn't clear the confidence gates.
  const resultChunks: ScoredChunk[] = ranked.slice(0, limit).map((entry) => ({
    chunk: entry.chunk,
    score: entry.score,
  }));

  return {
    chunks: resultChunks,
    grounded,
    topScore: top.score,
    reason: grounded ? "ok" : "below-threshold",
  };
}
