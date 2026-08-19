import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { ContentDocument } from "@/types/content";
import type { ProjectCategory, SkillGroup } from "@/types/portfolio";
import { frontmatterSchema } from "./schema";
import { normalizeRawContent } from "./sanitize";

const CONTENT_ROOT = path.join(process.cwd(), "src", "content");

/**
 * A parsed content document, extended with the category-specific
 * structured frontmatter fields that don't belong on the shared
 * `ContentDocument` contract (see `schema.ts`). `RawDocument` is a
 * superset of `ContentDocument`, so it can be used anywhere a
 * `ContentDocument` is expected.
 */
export interface RawDocument extends ContentDocument {
  categories?: ProjectCategory[];
  technologies?: string[];
  name?: string;
  headline?: string;
  location?: string;
  email?: string;
  githubUrl?: string;
  linkedInUrl?: string;
  resumeHref?: string;
  groups?: SkillGroup[];
}

function listMarkdownFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listMarkdownFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(fullPath);
    }
  }
  return files;
}

/**
 * Relative, POSIX-style, extension-less path -- used ONLY to sort files
 * deterministically (never as the slug itself; readdir order differs
 * across OSes/filesystems, so this keeps chunk ordering and retrieval
 * tie-breaks stable regardless of where this runs).
 */
function toSortKey(filePath: string): string {
  return path.relative(CONTENT_ROOT, filePath).split(path.sep).join("/");
}

/**
 * The document slug is just the filename (no directory segment, no
 * extension), e.g. `src/content/projects/translation-platform.md` ->
 * `translation-platform`. Content files are organized into
 * subdirectories for authoring convenience, but slugs stay flat so they
 * compose cleanly into route hrefs like `/projects/${slug}` without a
 * duplicated `projects/projects/...` segment. Filenames are unique
 * across the whole corpus.
 */
function toSlug(filePath: string): string {
  return path.basename(filePath, path.extname(filePath));
}

function toSourcePath(filePath: string): string {
  return path.relative(process.cwd(), filePath).split(path.sep).join("/");
}

function parseFile(filePath: string, slug: string): RawDocument {
  const raw = fs.readFileSync(filePath, "utf8");
  const normalized = normalizeRawContent(raw);
  const parsed = matter(normalized);

  let frontmatter;
  try {
    frontmatter = frontmatterSchema.parse(parsed.data);
  } catch (error) {
    throw new Error(
      `Invalid frontmatter in content file "${toSourcePath(filePath)}": ${
        error instanceof Error ? error.message : String(error)
      }`,
      { cause: error },
    );
  }

  return {
    slug,
    title: frontmatter.title,
    category: frontmatter.category,
    status: frontmatter.status,
    summary: frontmatter.summary,
    tags: frontmatter.tags,
    related: frontmatter.related,
    body: parsed.content.trim(),
    sourcePath: toSourcePath(filePath),
    categories: frontmatter.categories,
    technologies: frontmatter.technologies,
    name: frontmatter.name,
    headline: frontmatter.headline,
    location: frontmatter.location,
    email: frontmatter.email,
    githubUrl: frontmatter.githubUrl,
    linkedInUrl: frontmatter.linkedInUrl,
    resumeHref: frontmatter.resumeHref,
    groups: frontmatter.groups,
  };
}

function loadAllDocuments(): RawDocument[] {
  const files = listMarkdownFiles(CONTENT_ROOT);
  // Sort by relative POSIX path (not readdir order, which differs across
  // OSes/filesystems) so chunk ordering and retrieval tie-breaks are
  // deterministic regardless of where this runs.
  const sortedPaths = files
    .map((filePath) => ({ filePath, sortKey: toSortKey(filePath) }))
    .sort((a, b) => (a.sortKey < b.sortKey ? -1 : a.sortKey > b.sortKey ? 1 : 0));

  return sortedPaths.map(({ filePath }) => parseFile(filePath, toSlug(filePath)));
}

// Route handlers that use this module run in the Node runtime, so `fs` is
// available at import time. Loading (and validating) every content file
// at module scope means a malformed content file throws immediately on
// first import — fail fast rather than silently skipping bad content —
// and the parsed corpus is cached for the lifetime of the module (a
// module-level singleton), avoiding repeated disk I/O per request.
export const documents: RawDocument[] = loadAllDocuments();
