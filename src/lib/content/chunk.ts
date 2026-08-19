import type { ContentCategory, ContentChunk } from "@/types/content";

export interface ChunkableDocument {
  slug: string;
  title: string;
  category: ContentCategory;
  tags: string[];
  related: string[];
  body: string;
}

// ATX heading, e.g. "## Overview" (1-6 leading `#` characters).
const HEADING_PATTERN = /^#{1,6}\s+(.+)$/;

interface RawSection {
  heading: string | null;
  lines: string[];
}

/**
 * Splits a document's normalized body into one chunk per markdown heading
 * (plus a leading chunk for any content before the first heading, if
 * non-empty). Each chunk carries a stable `id` of the form
 * `${documentSlug}#${chunkIndex}`, where `chunkIndex` is the chunk's
 * position within this document's own chunk list.
 */
export function chunkDocument(doc: ChunkableDocument): ContentChunk[] {
  const lines = doc.body.split("\n");
  const rawSections: RawSection[] = [];
  let current: RawSection = { heading: null, lines: [] };

  for (const line of lines) {
    const match = HEADING_PATTERN.exec(line);
    if (match) {
      rawSections.push(current);
      current = { heading: (match[1] ?? "").trim(), lines: [] };
    } else {
      current.lines.push(line);
    }
  }
  rawSections.push(current);

  const chunks: ContentChunk[] = [];
  for (const section of rawSections) {
    const text = section.lines.join("\n").trim();
    if (text.length === 0) continue;
    chunks.push({
      id: `${doc.slug}#${chunks.length}`,
      documentSlug: doc.slug,
      documentTitle: doc.title,
      category: doc.category,
      heading: section.heading,
      text,
      tags: doc.tags,
      related: doc.related,
    });
  }
  return chunks;
}
