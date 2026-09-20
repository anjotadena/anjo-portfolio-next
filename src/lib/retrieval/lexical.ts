import type { ContentChunk } from "@/types/content";
import { isGreetingQuery } from "./greeting";
import { normalizeScore, scoreChunks, type WeightedTerm } from "./score";
import { STOPWORDS } from "./stopwords";
import { stem, tokenize } from "./tokenize";
import type { KnowledgeResult, KnowledgeRetriever, SearchOptions } from "./types";

export const DEFAULT_LEXICAL_LIMIT = 6;
export const DEFAULT_LEXICAL_MIN_SCORE = 0.2;

/**
 * Words that carry no topical signal in a question ("show me", "tell me
 * about", "does he know"). Removed from queries only — they stay in
 * documents — so they never count toward term coverage.
 */
const QUERY_STOPWORDS: ReadonlySet<string> = new Set(
  [
    "show", "tell", "give", "list", "describe", "explain", "know", "want", "like", "please", "let", "see",
    "anjo", "anjos", "he", "his", "him", "tadena", "you", "your", "me", "us", "portfolio",
    "does", "do", "did", "has", "have", "had", "is", "are", "was", "were", "can", "could", "would", "should",
    "what", "which", "who", "whom", "how", "when", "where", "why", "much", "many", "kind", "sort", "type",
    "any", "some", "something", "anything", "thing", "things", "get", "got", "use", "used", "using", "work", "worked", "working",
    // "experience with X" / "familiar with X": the topic is X, not the framing word.
    "experience", "experienced", "familiar", "familiarity", "background", "knowledge", "level", "comfortable", "exposure",
    // Temporal framing: "currently", "right now", "these days".
    "currently", "current", "now", "today", "still", "recently", "recent", "days",
  ].map(stem),
);

/**
 * Domain synonyms. Expansions are added to the query at reduced weight so
 * "cloud" also credits "aws"/"azure" and ".NET" credits "asp.net"/"c#",
 * without letting an expansion alone make a chunk look relevant.
 */
const SYNONYMS: Record<string, string[]> = {
  net: ["asp.net", "dotnet", "c#", "csharp"],
  dotnet: ["net", "asp.net", "c#", "csharp"],
  "c#": ["csharp", "net", "asp.net"],
  csharp: ["c#", "net"],
  cloud: ["aws", "azure", "vercel"],
  aws: ["cloud", "amazon"],
  azure: ["cloud", "microsoft"],
  technology: ["skill", "stack", "tool", "framework", "language"],
  tech: ["technology", "skill", "stack"],
  stack: ["technology", "skill"],
  skill: ["technology", "capability", "stack"],
  strongest: ["skill", "expertise"],
  ai: ["llm", "agentic", "rag", "machine"],
  llm: ["ai", "model", "openai"],
  agent: ["agentic", "ai", "asterweave"],
  agentic: ["agent", "ai", "asterweave"],
  contact: ["email", "reach", "linkedin", "github"],
  reach: ["contact", "email"],
  hire: ["contact", "opportunity", "available"],
  email: ["contact"],
  resume: ["résumé", "cv", "download"],
  cv: ["resume", "résumé"],
  job: ["experience", "role", "company"],
  career: ["experience", "role"],
  build: ["built", "project", "create", "made"],
  built: ["build", "project", "create"],
  made: ["build", "project"],
  create: ["build", "project"],
  frontend: ["angular", "react", "next.js", "ui"],
  backend: ["api", "server", "asp.net", "node.js"],
  database: ["postgresql", "sql", "mongodb", "redis", "data"],
  db: ["database", "postgresql"],
  devop: ["ci", "cd", "docker", "pipeline", "deploy"],
  pipeline: ["ci", "cd", "devops", "github"],
  deploy: ["deployment", "vercel", "docker", "cloud"],
  architecture: ["pattern", "design", "clean", "ddd", "cqrs", "architect"],
  architect: ["architecture", "design", "structure"],
  learn: ["lesson", "learning", "takeaway"],
  lesson: ["learn", "takeaway"],
  decision: ["trade-off", "tradeoff", "choice", "decide"],
  tradeoff: ["decision", "trade-off"],
  result: ["outcome", "impact"],
  outcome: ["result", "impact"],
  pattern: ["architecture", "design"],
  certification: ["certified", "credential", "certificate"],
  certified: ["certification"],
  cert: ["certification"],
  degree: ["education", "university"],
  education: ["degree", "university", "school"],
  study: ["education", "degree"],
  location: ["based", "cebu", "philippine"],
  live: ["based", "location", "cebu"],
  where: ["based", "location"],
  approach: ["philosophy", "principle"],
  philosophy: ["approach", "principle", "value"],
  principle: ["philosophy", "approach"],
  test: ["testing", "vitest", "playwright"],
  testing: ["test", "automated"],
  security: ["secure", "validation", "injection"],
};

export interface LexicalRankedChunk {
  chunk: ContentChunk;
  score: number;
  /** Number of distinct primary query terms present in the chunk. */
  coverage: number;
}

function compareRanked(a: LexicalRankedChunk, b: LexicalRankedChunk): number {
  if (b.score !== a.score) return b.score - a.score;
  if (a.chunk.documentSlug !== b.chunk.documentSlug) return a.chunk.documentSlug < b.chunk.documentSlug ? -1 : 1;
  return a.chunk.chunkIndex - b.chunk.chunkIndex;
}

/** Non-stopword, non-generic, de-duplicated query terms (stemmed). */
export function substantiveTerms(query: string): string[] {
  return Array.from(new Set(tokenize(query).filter((token) => !STOPWORDS.has(token) && !QUERY_STOPWORDS.has(token))));
}

/** Primary terms at weight 1 plus synonym expansions at weight 0.4. */
export function expandTerms(terms: readonly string[]): WeightedTerm[] {
  const weighted = new Map<string, number>();
  for (const term of terms) weighted.set(term, 1);
  for (const term of terms) {
    for (const synonym of SYNONYMS[term] ?? []) {
      const stemmed = stem(synonym);
      if (!weighted.has(stemmed)) weighted.set(stemmed, 0.4);
    }
  }
  return Array.from(weighted, ([term, weight]) => ({ term, weight }));
}

/** Coverage a chunk needs before it counts as a real match for `terms`. */
export function requiredCoverage(terms: readonly string[]): number {
  return terms.length >= 3 ? 2 : 1;
}

/**
 * BM25 ranking of `chunks` for `query`. Pure and synchronous so it can be
 * reused by the hybrid retriever (as the lexical leg) and by tests.
 */
export function rankLexically(query: string, chunks: readonly ContentChunk[]): LexicalRankedChunk[] {
  const terms = substantiveTerms(query);
  if (terms.length === 0) return [];
  return scoreChunks(expandTerms(terms), chunks)
    .filter((entry) => entry.rawScore > 0)
    .map((entry) => ({ chunk: entry.chunk, score: normalizeScore(entry.rawScore), coverage: entry.matchedTerms.size }))
    .sort(compareRanked);
}

function applyFilters(chunks: readonly ContentChunk[], options: SearchOptions): ContentChunk[] {
  return chunks.filter(
    (chunk) =>
      chunk.visibility === "public" &&
      (!options.types || options.types.includes(chunk.type)) &&
      (!options.slugs || options.slugs.includes(chunk.documentSlug)),
  );
}

/**
 * In-process lexical retriever over the public chunk corpus. Zero
 * infrastructure: this is what runs in tests, CI, and any deployment
 * without `DATABASE_URL`. It is also the lexical leg of the hybrid
 * retriever, so exact technology terms ("Angular", ".NET", "pgvector")
 * always get credit even when an embedding model would blur them.
 */
export class LexicalRetriever implements KnowledgeRetriever {
  readonly name = "lexical";

  constructor(private readonly getChunks: () => readonly ContentChunk[]) {}

  async search(query: string, options: SearchOptions = {}): Promise<KnowledgeResult[]> {
    const limit = options.limit ?? DEFAULT_LEXICAL_LIMIT;
    const minScore = options.minScore ?? DEFAULT_LEXICAL_MIN_SCORE;
    const chunks = applyFilters(this.getChunks(), options);
    if (query.trim().length === 0) return [];

    if (isGreetingQuery(query)) {
      return chunks
        .filter((chunk) => chunk.type === "profile")
        .slice(0, limit)
        .map((chunk) => ({ chunk, score: 1, matchedBy: "lexical" as const }));
    }

    const terms = substantiveTerms(query);
    const needed = requiredCoverage(terms);
    return rankLexically(query, chunks)
      .filter((entry) => entry.score >= minScore && entry.coverage >= needed)
      .slice(0, limit)
      .map((entry) => ({ chunk: entry.chunk, score: entry.score, matchedBy: "lexical" as const }));
  }

  async healthCheck(): Promise<{ ok: boolean; detail?: string }> {
    return { ok: true, detail: `${this.getChunks().length} chunks in memory` };
  }
}
