import type { ContentCategory, ContentChunk, ContentDocument, ContentStatus } from "@/types/content";
import { documents } from "./loader";
import { chunkDocument } from "./chunk";

interface ChunkWithStatus {
  chunk: ContentChunk;
  status: ContentStatus;
}

// Computed once at module scope from the cached `documents` singleton.
const chunksWithStatus: ChunkWithStatus[] = documents.flatMap((doc) =>
  chunkDocument(doc).map((chunk) => ({ chunk, status: doc.status })),
);

export function getAllDocuments(): ContentDocument[] {
  return documents;
}

export function getDocumentBySlug(slug: string): ContentDocument | null {
  return documents.find((doc) => doc.slug === slug) ?? null;
}

export function getDocumentsByCategory(category: ContentCategory): ContentDocument[] {
  return documents.filter((doc) => doc.category === category);
}

/**
 * Chunks belonging only to `status: "verified"` documents. This is the
 * guarantee behind the "Answers based on Anjo's verified portfolio" badge
 * — draft content is loaded (and validated) but never surfaced to
 * retrieval or the chat assistant.
 */
export function getVerifiedChunks(): ContentChunk[] {
  return chunksWithStatus.filter((entry) => entry.status === "verified").map((entry) => entry.chunk);
}

export function getChunksByDocumentSlug(slug: string): ContentChunk[] {
  return chunksWithStatus
    .filter((entry) => entry.chunk.documentSlug === slug)
    .map((entry) => entry.chunk);
}
