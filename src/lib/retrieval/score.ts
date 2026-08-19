import type { ContentChunk } from "@/types/content";
import { tokenize } from "./tokenize";

// Standard BM25 constants.
const K1 = 1.5;
const B = 0.75;

export interface ScoredEntry {
  chunk: ContentChunk;
  rawScore: number;
  matchedTerms: ReadonlySet<string>;
}

/**
 * BM25-lite lexical scoring of `chunks` against a pre-tokenized,
 * de-duplicated set of query `terms` (stopwords already removed).
 *
 * Uses the BM25+ idf variant (`ln(1 + (N - n + 0.5) / (n + 0.5))`), which
 * is always >= 0 (plain BM25's idf can go slightly negative for terms
 * that appear in almost every document), so raw scores never go negative
 * and a "score > 0" check is a reliable "matched something" signal.
 */
export function scoreChunks(terms: readonly string[], chunks: readonly ContentChunk[]): ScoredEntry[] {
  const documentCount = chunks.length;
  if (documentCount === 0 || terms.length === 0) {
    return chunks.map((chunk) => ({ chunk, rawScore: 0, matchedTerms: new Set<string>() }));
  }

  // Include the source document's title in the scored text: a query
  // that mentions a document's own title (e.g. "backend skills" against
  // the "Skills" document) should be able to match its chunks even if
  // that exact word never appears in the chunk's own heading/body.
  const tokenizedChunks = chunks.map((chunk) =>
    tokenize(`${chunk.documentTitle} ${chunk.heading ?? ""} ${chunk.text}`),
  );
  const lengths = tokenizedChunks.map((tokens) => tokens.length);
  const totalLength = lengths.reduce((sum, len) => sum + len, 0);
  const avgLength = totalLength > 0 ? totalLength / documentCount : 1;

  const documentFrequency = new Map<string, number>();
  for (const term of terms) {
    let count = 0;
    for (const tokens of tokenizedChunks) {
      if (tokens.includes(term)) count += 1;
    }
    documentFrequency.set(term, count);
  }

  const idf = new Map<string, number>();
  for (const term of terms) {
    const n = documentFrequency.get(term) ?? 0;
    idf.set(term, Math.log(1 + (documentCount - n + 0.5) / (n + 0.5)));
  }

  return chunks.map((chunk, index) => {
    const tokens = tokenizedChunks[index] ?? [];
    const length = lengths[index] ?? 0;
    const lengthNorm = 1 - B + B * (length / (avgLength || 1));

    let rawScore = 0;
    const matchedTerms = new Set<string>();
    for (const term of terms) {
      const tf = countOccurrences(tokens, term);
      if (tf === 0) continue;
      matchedTerms.add(term);
      const termIdf = idf.get(term) ?? 0;
      rawScore += (termIdf * (tf * (K1 + 1))) / (tf + K1 * lengthNorm);
    }

    return { chunk, rawScore, matchedTerms };
  });
}

function countOccurrences(tokens: readonly string[], term: string): number {
  let count = 0;
  for (const token of tokens) {
    if (token === term) count += 1;
  }
  return count;
}

/**
 * Bounds a raw (unbounded) BM25 score into (0, 1) via `x / (1 + x)`. This
 * transform is monotonic (it never changes relative ranking) and doesn't
 * depend on the corpus's current maximum score, so it stays stable as
 * content files are added rather than silently drifting.
 */
export function normalizeScore(rawScore: number): number {
  if (rawScore <= 0) return 0;
  return rawScore / (1 + rawScore);
}
