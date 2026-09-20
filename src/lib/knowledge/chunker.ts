import { createHash } from "node:crypto";
import type { ContentChunk, ContentDocument } from "@/types/content";
import { slugifyHeading } from "@/lib/utils/slug";

export interface ChunkOptions {
  /** Sections shorter than this are merged into the preceding chunk. */
  minChars?: number;
  /** Sections longer than this are split at paragraph boundaries. */
  maxChars?: number;
}

export const DEFAULT_MIN_CHUNK_CHARS = 120;
export const DEFAULT_MAX_CHUNK_CHARS = 1600;

// ATX heading: 1-6 `#` then whitespace then text.
const HEADING_PATTERN = /^(#{1,6})\s+(.+?)\s*#*\s*$/;
const FENCE_PATTERN = /^\s*(```|~~~)/;

interface Section {
  headingPath: string[];
  lines: string[];
}

export { slugifyHeading };

/** SHA-256 over the parts that matter for embedding; any change re-embeds the chunk. */
export function hashChunkPayload(documentTitle: string, headingPath: readonly string[], text: string): string {
  return createHash("sha256").update(`${documentTitle}\n${headingPath.join(" > ")}\n${text}`, "utf8").digest("hex");
}

/**
 * Splits a document body into heading-aware sections. H1-H3 headings
 * define the breadcrumb path; deeper headings stay inside their parent's
 * text (they are usually sub-lists, not standalone topics). Headings that
 * appear inside fenced code blocks are ignored.
 */
function splitIntoSections(body: string): Section[] {
  const sections: Section[] = [];
  let current: Section = { headingPath: [], lines: [] };
  let path: string[] = [];
  let inFence = false;

  for (const line of body.split("\n")) {
    if (FENCE_PATTERN.test(line)) inFence = !inFence;
    const match = inFence ? null : HEADING_PATTERN.exec(line);
    if (match && match[1] && match[2]) {
      const level = match[1].length;
      const heading = match[2].trim();
      if (level <= 3) {
        sections.push(current);
        // H1 -> depth 0, H2 -> depth 0 (H1 is the document title in practice), H3 -> depth 1.
        const depth = level <= 2 ? 0 : 1;
        path = [...path.slice(0, depth), heading];
        current = { headingPath: path, lines: [] };
        continue;
      }
      // Deeper heading: keep it as emphasised text inside the current section.
      current.lines.push(`**${heading}**`);
      continue;
    }
    current.lines.push(line);
  }
  sections.push(current);
  return sections.filter((section) => section.lines.join("\n").trim().length > 0);
}

/** Splits an oversized section at paragraph boundaries (then sentences) without exceeding `maxChars`. */
function splitLongText(text: string, maxChars: number): string[] {
  if (text.length <= maxChars) return [text];
  const paragraphs = text.split(/\n{2,}/);
  const pieces: string[] = [];
  let buffer = "";

  const flush = () => {
    if (buffer.trim().length > 0) pieces.push(buffer.trim());
    buffer = "";
  };

  for (const paragraph of paragraphs) {
    const candidates = paragraph.length > maxChars ? splitSentences(paragraph, maxChars) : [paragraph];
    for (const candidate of candidates) {
      if (buffer.length + candidate.length + 2 > maxChars && buffer.length > 0) flush();
      buffer = buffer.length > 0 ? `${buffer}\n\n${candidate}` : candidate;
    }
  }
  flush();
  return pieces;
}

function splitSentences(paragraph: string, maxChars: number): string[] {
  const sentences = paragraph.match(/[^.!?]+[.!?]+[\s"')\]]*|[^.!?]+$/g) ?? [paragraph];
  const pieces: string[] = [];
  let buffer = "";
  for (const sentence of sentences) {
    if (buffer.length + sentence.length > maxChars && buffer.length > 0) {
      pieces.push(buffer.trim());
      buffer = "";
    }
    buffer += sentence;
  }
  if (buffer.trim().length > 0) pieces.push(buffer.trim());
  return pieces;
}

/**
 * Heading-aware chunking with deterministic ids.
 *
 * - One chunk per H2/H3 section by default (semantic units, never
 *   arbitrary character windows).
 * - Tiny sections are merged into the preceding chunk so
 *   we never embed meaningless fragments.
 * - Oversized sections are split at paragraph boundaries.
 * - Chunk ids are `${slug}::${sectionSlug}::${ordinal}` so re-indexing
 *   updates existing rows instead of creating duplicates, and the
 *   `contentHash` lets the indexer skip unchanged chunks.
 */
export function chunkDocument(doc: ContentDocument, options: ChunkOptions = {}): ContentChunk[] {
  const minChars = options.minChars ?? DEFAULT_MIN_CHUNK_CHARS;
  const maxChars = options.maxChars ?? DEFAULT_MAX_CHUNK_CHARS;

  interface Draft {
    headingPath: string[];
    text: string;
  }
  const drafts: Draft[] = [];

  for (const section of splitIntoSections(doc.body)) {
    const text = section.lines.join("\n").trim();
    const previous = drafts[drafts.length - 1];

    // Short sections (e.g. "## Technologies" followed by "Python, Docker.")
    // are not meaningful on their own; fold them into the preceding chunk
    // with their heading kept inline so the context survives.
    if (text.length < minChars && previous && previous.text.length + text.length + 8 <= maxChars) {
      const label = section.headingPath[section.headingPath.length - 1];
      previous.text = label ? `${previous.text}\n\n**${label}**\n${text}` : `${previous.text}\n\n${text}`;
      continue;
    }

    for (const piece of splitLongText(text, maxChars)) {
      drafts.push({ headingPath: section.headingPath, text: piece });
    }
  }

  const ordinals = new Map<string, number>();
  return drafts.map((draft, chunkIndex) => {
    const sectionSlug = draft.headingPath.length > 0 ? slugifyHeading(draft.headingPath.join(" / ")) : "intro";
    const ordinal = ordinals.get(sectionSlug) ?? 0;
    ordinals.set(sectionSlug, ordinal + 1);
    return {
      id: `${doc.slug}::${sectionSlug}::${ordinal}`,
      documentSlug: doc.slug,
      documentTitle: doc.title,
      type: doc.type,
      headingPath: draft.headingPath,
      section: draft.headingPath[draft.headingPath.length - 1] ?? null,
      text: draft.text,
      contentHash: hashChunkPayload(doc.title, draft.headingPath, draft.text),
      chunkIndex,
      tags: doc.tags,
      technologies: doc.technologies,
      related: doc.related,
      featured: doc.featured,
      visibility: doc.visibility,
    };
  });
}

/** The text actually embedded: title + breadcrumb + body, so section context travels with the vector. */
export function chunkEmbeddingText(chunk: ContentChunk): string {
  const crumb = [chunk.documentTitle, ...chunk.headingPath].join(" > ");
  return `${crumb}\n\n${chunk.text}`;
}
