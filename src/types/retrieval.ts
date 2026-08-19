import type { ContentChunk } from "./content";

export interface ScoredChunk { chunk: ContentChunk; score: number; }
export interface RetrievalResult {
  chunks: ScoredChunk[];
  grounded: boolean;
  topScore: number;
  reason: "ok" | "empty-query" | "no-match" | "below-threshold" | "greeting";
}
export interface RetrievalOptions { limit?: number; minScore?: number; minTermCoverage?: number; }
