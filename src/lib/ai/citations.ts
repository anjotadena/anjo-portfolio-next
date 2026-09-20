import type { ChatSource } from "@/types/chat";
import type { ContentType } from "@/types/content";
import type { KnowledgeResult } from "@/lib/retrieval/types";

const EXCERPT_LENGTH = 280;

/** Site page for a document, by type. `null` when a type has no page. */
export function hrefForDocument(type: ContentType, slug: string): string | null {
  switch (type) {
    case "project":
      return `/projects/${slug}`;
    case "profile":
      return "/about";
    case "skills":
      return "/skills";
    case "experience":
      return "/experience";
    case "contact":
      return "/contact";
    case "philosophy":
    case "architecture":
    case "ai-engineering":
    case "cloud":
    case "devops":
    case "certifications":
    case "education":
      return `/topics/${slug}`;
    default:
      return null;
  }
}

/** Flattens Markdown to plain text without damaging terms like "C#" or "ASP.NET". */
export function toExcerpt(text: string, length = EXCERPT_LENGTH): string {
  const flat = text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/^\s*>\s?/gm, "")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/(\*\*|__)(.*?)\1/g, "$2")
    .replace(/(^|\s)[*_](\S[^*_]*\S)[*_](?=\s|$|[.,;:])/g, "$1$2")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
  if (flat.length <= length) return flat;
  const cut = flat.slice(0, length);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 120 ? lastSpace : length).trimEnd()}…`;
}

/**
 * One `ChatSource` per retrieved chunk, in retrieval order, with 1-based
 * indices matching the `[n]` markers the model is asked to emit. Chunk
 * ids and scores are deliberately not exposed to the client.
 */
export function buildSources(results: readonly KnowledgeResult[]): ChatSource[] {
  return results.map((result, i) => ({
    index: i + 1,
    documentSlug: result.chunk.documentSlug,
    title: result.chunk.documentTitle,
    section: result.chunk.section,
    type: result.chunk.type,
    href: hrefForDocument(result.chunk.type, result.chunk.documentSlug),
    excerpt: toExcerpt(result.chunk.text),
  }));
}

const CITATION_PATTERN = /\[(\d{1,2})\]/g;

/** Distinct citation indices that appear in an answer, in first-seen order. */
export function extractCitedIndices(answer: string): number[] {
  const seen = new Set<number>();
  for (const match of answer.matchAll(CITATION_PATTERN)) {
    seen.add(Number(match[1]));
  }
  return Array.from(seen);
}

/**
 * Rewrites citation markers whose index does not correspond to a provided
 * source (the model hallucinated a number) into plain text without the
 * brackets, so the UI never renders a dead citation chip.
 */
export function sanitizeCitations(answer: string, sourceCount: number): string {
  return answer.replace(CITATION_PATTERN, (whole, digits: string) => {
    const index = Number(digits);
    return index >= 1 && index <= sourceCount ? whole : "";
  });
}
