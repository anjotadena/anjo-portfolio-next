import type { ContentChunk } from "@/types/content";
import { tokenize } from "./tokenize";

// Standard BM25 constants.
const K1 = 1.5;
const B = 0.75;

export interface WeightedTerm {
  term: string;
  /** 1 for terms the visitor typed; < 1 for synonym expansions. */
  weight: number;
}

export interface ScoredEntry {
  chunk: ContentChunk;
  rawScore: number;
  /** Primary query terms (weight 1) present in the chunk's prose. */
  matchedTerms: ReadonlySet<string>;
}

/** Prose fields: title, heading breadcrumb, body. */
export function bodyText(chunk: ContentChunk): string {
  return [chunk.documentTitle, chunk.headingPath.join(" "), chunk.text].join("\n");
}

/** Metadata fields: type, tags, technologies — document-level, so weighted lower (BM25F-style). */
export function metaText(chunk: ContentChunk): string {
  return [chunk.type, chunk.tags.join(" "), chunk.technologies.join(" ")].join("\n");
}

/** How much a metadata occurrence counts relative to a prose occurrence. */
const META_FIELD_WEIGHT = 0.3;

/**
 * BM25 scoring of `chunks` against weighted, de-duplicated query `terms`.
 *
 * Two fields per chunk: prose (title + headings + body) at full weight and
 * document metadata (type, tags, technologies) at `META_FIELD_WEIGHT`, so
 * "AI projects" credits every project tagged `ai` without letting a
 * document-level technology list make every chunk of that document look
 * like a strong match.
 *
 * Uses the BM25+ idf variant (`ln(1 + (N - n + 0.5) / (n + 0.5))`), which
 * is always >= 0, so "score > 0" is a reliable "matched something" signal.
 *
 * A title boost is applied on top: when the query's own terms appear in
 * the document title (e.g. "Asterweave"), that document's chunks rank
 * above documents that merely mention the term, and its first chunk
 * (usually "Overview") gets a small extra nudge.
 */
export function scoreChunks(terms: readonly WeightedTerm[], chunks: readonly ContentChunk[]): ScoredEntry[] {
  const documentCount = chunks.length;
  if (documentCount === 0 || terms.length === 0) {
    return chunks.map((chunk) => ({ chunk, rawScore: 0, matchedTerms: new Set<string>() }));
  }

  const bodyTokens = chunks.map((chunk) => tokenize(bodyText(chunk)));
  const metaTokens = chunks.map((chunk) => tokenize(metaText(chunk)));
  const titleTokens = chunks.map((chunk) => new Set(tokenize(chunk.documentTitle)));
  const lengths = bodyTokens.map((tokens, i) => tokens.length + META_FIELD_WEIGHT * (metaTokens[i]?.length ?? 0));
  const avgLength = lengths.reduce((sum, len) => sum + len, 0) / documentCount || 1;

  // idf from prose presence only: a technology listed in a document's
  // frontmatter should not make that term look common across the corpus.
  const idf = new Map<string, number>();
  for (const { term } of terms) {
    let n = 0;
    for (const tokens of bodyTokens) if (tokens.includes(term)) n += 1;
    idf.set(term, Math.log(1 + (documentCount - n + 0.5) / (n + 0.5)));
  }

  const primaryTerms = terms.filter((entry) => entry.weight >= 1).map((entry) => entry.term);

  return chunks.map((chunk, index) => {
    const length = lengths[index] ?? 0;
    const lengthNorm = 1 - B + B * (length / avgLength);

    let rawScore = 0;
    const matchedTerms = new Set<string>();
    for (const { term, weight } of terms) {
      const bodyTf = countOccurrences(bodyTokens[index]!, term);
      const tf = bodyTf + META_FIELD_WEIGHT * countOccurrences(metaTokens[index]!, term);
      if (tf === 0) continue;
      // Coverage (used to decide whether a chunk is a real match) counts
      // prose hits only; a metadata-only hit adds score but not evidence.
      if (weight >= 1 && bodyTf > 0) matchedTerms.add(term);
      rawScore += weight * ((idf.get(term) ?? 0) * (tf * (K1 + 1))) / (tf + K1 * lengthNorm);
    }

    if (rawScore > 0 && primaryTerms.length > 0) {
      const title = titleTokens[index]!;
      const titleHits = primaryTerms.filter((term) => title.has(term)).length;
      if (titleHits > 0) {
        rawScore *= 1 + 0.6 * (titleHits / primaryTerms.length);
        if (chunk.chunkIndex === 0) rawScore *= 1.15;
      }
    }

    return { chunk, rawScore, matchedTerms };
  });
}

function countOccurrences(tokens: readonly string[], term: string): number {
  let count = 0;
  for (const token of tokens) if (token === term) count += 1;
  return count;
}

/**
 * Bounds a raw (unbounded) BM25 score into (0, 1) via `x / (1 + x)`. The
 * transform is monotonic (never changes relative ranking) and independent
 * of the corpus maximum, so it stays stable as content grows.
 */
export function normalizeScore(rawScore: number): number {
  if (rawScore <= 0) return 0;
  return rawScore / (1 + rawScore);
}
