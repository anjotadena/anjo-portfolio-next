import type { ContentDocument } from "@/types/content";
import type { RelatedProject, RetrievedSource } from "@/types/chat";
import type { ScoredChunk } from "@/types/retrieval";
import { hrefForCategory } from "./href";

const MAX_FOLLOW_UPS = 3;
const MAX_RELATED_PROJECTS = 3;

/**
 * Builds the `meta.sources` list from grounded chunks: one entry per
 * distinct source document, in ranked order.
 */
export function buildSources(scoredChunks: readonly ScoredChunk[]): RetrievedSource[] {
  const seen = new Set<string>();
  const sources: RetrievedSource[] = [];
  for (const { chunk, score } of scoredChunks) {
    if (seen.has(chunk.documentSlug)) continue;
    seen.add(chunk.documentSlug);
    sources.push({
      slug: chunk.documentSlug,
      title: chunk.documentTitle,
      category: chunk.category,
      href: hrefForCategory(chunk.category, chunk.documentSlug),
      score,
    });
  }
  return sources;
}

/**
 * Derives suggested follow-up questions purely from each grounded
 * chunk's `related` document slugs -- never invented text about topics
 * that weren't actually linked in the content itself.
 */
export function buildFollowUps(
  scoredChunks: readonly ScoredChunk[],
  allDocuments: readonly ContentDocument[],
): string[] {
  const followUps: string[] = [];
  const seenSlugs = new Set<string>(scoredChunks.map((entry) => entry.chunk.documentSlug));

  for (const { chunk } of scoredChunks) {
    for (const relatedSlug of chunk.related) {
      if (followUps.length >= MAX_FOLLOW_UPS) return followUps;
      if (seenSlugs.has(relatedSlug)) continue;
      const relatedDoc = allDocuments.find((doc) => doc.slug === relatedSlug);
      if (!relatedDoc) continue;
      seenSlugs.add(relatedSlug);
      followUps.push(`Tell me about ${relatedDoc.title}`);
    }
  }
  return followUps;
}

/**
 * Derives related-project links from the grounded chunks themselves (if
 * they belong to a project document) and from their `related` slugs that
 * point at a project document. Never fabricates a project that isn't
 * actually present in the corpus.
 */
export function buildRelatedProjects(
  scoredChunks: readonly ScoredChunk[],
  allDocuments: readonly ContentDocument[],
): RelatedProject[] {
  const projects: RelatedProject[] = [];
  const seenSlugs = new Set<string>();

  function addIfProject(slug: string): void {
    if (seenSlugs.has(slug) || projects.length >= MAX_RELATED_PROJECTS) return;
    const doc = allDocuments.find((candidate) => candidate.slug === slug && candidate.category === "projects");
    if (!doc) return;
    seenSlugs.add(slug);
    projects.push({ slug: doc.slug, title: doc.title, href: `/projects/${doc.slug}` });
  }

  for (const { chunk } of scoredChunks) {
    addIfProject(chunk.documentSlug);
    for (const relatedSlug of chunk.related) {
      addIfProject(relatedSlug);
    }
  }

  return projects;
}
