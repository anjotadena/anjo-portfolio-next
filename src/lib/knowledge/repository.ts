import "server-only";
import fs from "node:fs";
import path from "node:path";
import type { ContentChunk, ContentDocument, ContentType } from "@/types/content";
import { chunkDocument } from "./chunker";
import { ContentValidationError, parseMarkdownDocument } from "./markdown";

/**
 * The Markdown knowledge base, loaded from `/content` once per server
 * process and validated on first import (fail fast on bad content).
 *
 * VISIBILITY BOUNDARY: every exported accessor below returns only
 * `visibility: "public"` documents unless it is explicitly named
 * `...IncludingPrivate`. Pages, the retrieval index, search, and chat
 * all go through the public accessors, so private Markdown can never
 * reach the browser or the model. The `IncludingPrivate` variants exist
 * solely for the CLI validator.
 */

export const CONTENT_ROOT = path.join(process.cwd(), "content");

function listMarkdownFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const files: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...listMarkdownFiles(fullPath));
    else if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) files.push(fullPath);
  }
  return files;
}

function toSourcePath(filePath: string): string {
  return path.relative(process.cwd(), filePath).split(path.sep).join("/");
}

export interface LoadResult {
  documents: ContentDocument[];
  errors: ContentValidationError[];
}

/**
 * Loads and validates every content file. Collects all errors instead of
 * stopping at the first one so `content:validate` can report everything
 * in one run. Sorted by source path (not readdir order) so chunk ordering
 * is deterministic across operating systems.
 */
export function loadAllDocuments(root: string = CONTENT_ROOT): LoadResult {
  const files = listMarkdownFiles(root)
    .map((filePath) => ({ filePath, sourcePath: toSourcePath(filePath) }))
    .sort((a, b) => (a.sourcePath < b.sourcePath ? -1 : a.sourcePath > b.sourcePath ? 1 : 0));

  const documents: ContentDocument[] = [];
  const errors: ContentValidationError[] = [];
  const seenSlugs = new Map<string, string>();

  for (const { filePath, sourcePath } of files) {
    try {
      const doc = parseMarkdownDocument(fs.readFileSync(filePath, "utf8"), sourcePath);
      const existing = seenSlugs.get(doc.slug);
      if (existing) {
        errors.push(new ContentValidationError(sourcePath, `  - slug: "${doc.slug}" is already used by ${existing}`));
        continue;
      }
      seenSlugs.set(doc.slug, sourcePath);
      documents.push(doc);
    } catch (error) {
      if (error instanceof ContentValidationError) errors.push(error);
      else throw error;
    }
  }

  // Cross-document checks: `related` must point at real slugs.
  const slugs = new Set(documents.map((doc) => doc.slug));
  for (const doc of documents) {
    const missing = doc.related.filter((slug) => !slugs.has(slug));
    if (missing.length > 0) {
      errors.push(new ContentValidationError(doc.sourcePath, `  - related: unknown slug(s) ${missing.join(", ")}`));
    }
  }

  return { documents, errors };
}

let cache: { documents: ContentDocument[]; chunks: ContentChunk[] } | null = null;

function corpus(): { documents: ContentDocument[]; chunks: ContentChunk[] } {
  if (cache) return cache;
  const { documents, errors } = loadAllDocuments();
  if (errors.length > 0) {
    throw new Error(`Content validation failed:\n${errors.map((error) => error.message).join("\n")}`);
  }
  const chunks = documents.flatMap((doc) => chunkDocument(doc));
  cache = { documents, chunks };
  return cache;
}

/** Test hook: clears the module cache so a different `content/` fixture can be loaded. */
export function resetKnowledgeCache(): void {
  cache = null;
}

export function getAllDocumentsIncludingPrivate(): ContentDocument[] {
  return corpus().documents;
}

export function getPublicDocuments(): ContentDocument[] {
  return corpus().documents.filter((doc) => doc.visibility === "public");
}

export function getPublicDocumentsByType(type: ContentType): ContentDocument[] {
  return getPublicDocuments().filter((doc) => doc.type === type);
}

export function getPublicDocumentBySlug(slug: string): ContentDocument | null {
  return getPublicDocuments().find((doc) => doc.slug === slug) ?? null;
}

/** Only public chunks — the retrieval index and search must never see private content. */
export function getPublicChunks(): ContentChunk[] {
  return corpus().chunks.filter((chunk) => chunk.visibility === "public");
}

export function getPublicChunksByDocument(slug: string): ContentChunk[] {
  return getPublicChunks().filter((chunk) => chunk.documentSlug === slug);
}

export function getPublicChunkById(id: string): ContentChunk | null {
  return getPublicChunks().find((chunk) => chunk.id === id) ?? null;
}

export function getProfile(): ContentDocument & { profile: NonNullable<ContentDocument["profile"]> } {
  const doc = getPublicDocumentsByType("profile")[0];
  if (!doc || !doc.profile) throw new Error("content/profile.md must exist, be public, and declare a `profile` block");
  return { ...doc, profile: doc.profile };
}

export function getProjects(): ContentDocument[] {
  return getPublicDocumentsByType("project").sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    return (b.date ?? "").localeCompare(a.date ?? "") || a.title.localeCompare(b.title);
  });
}

export function getFeaturedProjects(limit = 4): ContentDocument[] {
  return getProjects().filter((doc) => doc.featured).slice(0, limit);
}
