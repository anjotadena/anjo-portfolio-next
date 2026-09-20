import type { ContentDocument } from "@/types/content";
import type { KnowledgeResult } from "@/lib/retrieval/types";

const MAX_FOLLOW_UPS = 3;

/** Question templates per document type; only ever instantiated with real document titles. */
function questionFor(doc: ContentDocument): string {
  switch (doc.type) {
    case "project":
      return `Tell me more about ${doc.title}`;
    case "skills":
      return "What are his strongest technical skills?";
    case "ai-engineering":
      return "What is his experience with agentic AI?";
    case "architecture":
      return "What architecture patterns does he use?";
    case "cloud":
      return "What cloud platforms does he use?";
    case "devops":
      return "What is his DevOps experience?";
    case "philosophy":
      return "How does he approach software engineering?";
    case "contact":
      return "How can I contact him?";
    case "profile":
      return "Tell me about Anjo";
    case "experience":
      return "What is his professional experience?";
    case "certifications":
      return "What certifications does he have?";
    case "education":
      return "What is his educational background?";
    default:
      return `Tell me about ${doc.title}`;
  }
}

/**
 * Related questions derived from content links, never invented: the
 * `related` slugs of the retrieved documents first, then other sections
 * of the same documents. Documents already used to answer are skipped.
 */
export function buildFollowUps(
  results: readonly KnowledgeResult[],
  documents: readonly ContentDocument[],
  currentQuestion: string,
): string[] {
  const publicDocs = new Map(documents.filter((doc) => doc.visibility === "public").map((doc) => [doc.slug, doc]));
  const usedSlugs = new Set(results.map((result) => result.chunk.documentSlug));
  const suggestions: string[] = [];
  const seen = new Set<string>([currentQuestion.trim().toLowerCase()]);

  const push = (doc: ContentDocument | undefined) => {
    if (!doc || suggestions.length >= MAX_FOLLOW_UPS) return;
    const question = questionFor(doc);
    if (seen.has(question.toLowerCase())) return;
    seen.add(question.toLowerCase());
    suggestions.push(question);
  };

  for (const result of results) {
    for (const relatedSlug of result.chunk.related) {
      if (usedSlugs.has(relatedSlug)) continue;
      push(publicDocs.get(relatedSlug));
    }
  }

  // Sections of the cited documents the visitor hasn't seen yet.
  for (const result of results) {
    if (suggestions.length >= MAX_FOLLOW_UPS) break;
    const doc = publicDocs.get(result.chunk.documentSlug);
    if (!doc || doc.type !== "project") continue;
    const sectionsSeen = new Set(results.filter((r) => r.chunk.documentSlug === doc.slug).map((r) => r.chunk.section));
    for (const heading of doc.body.match(/^##\s+(.+)$/gm)?.map((line) => line.replace(/^##\s+/, "").trim()) ?? []) {
      if (sectionsSeen.has(heading)) continue;
      const question = `What were the ${heading.toLowerCase()} of ${doc.title}?`;
      if (/challenge|result|architecture|problem|solution/i.test(heading) && !seen.has(question.toLowerCase())) {
        seen.add(question.toLowerCase());
        suggestions.push(question);
        break;
      }
    }
  }

  if (suggestions.length < MAX_FOLLOW_UPS) {
    for (const doc of publicDocs.values()) {
      if (usedSlugs.has(doc.slug) || doc.type === "project") continue;
      push(doc);
      if (suggestions.length >= MAX_FOLLOW_UPS) break;
    }
  }

  return suggestions.slice(0, MAX_FOLLOW_UPS);
}

/**
 * Suggested prompts for the landing state, generated from the public
 * documents that actually exist (so a suggestion never leads to an
 * "I don't have that" answer). Order: profile, featured projects, then
 * one per topic type.
 */
export function buildSuggestedPrompts(documents: readonly ContentDocument[], limit = 8): string[] {
  const publicDocs = documents.filter((doc) => doc.visibility === "public");
  const prompts: string[] = [];
  const seen = new Set<string>();
  const add = (question: string) => {
    if (seen.has(question) || prompts.length >= limit) return;
    seen.add(question);
    prompts.push(question);
  };

  const profile = publicDocs.find((doc) => doc.type === "profile");
  if (profile) add("Tell me about Anjo");
  for (const doc of publicDocs.filter((doc) => doc.type === "project" && doc.featured).slice(0, 2)) add(`What is ${doc.title}?`);
  for (const type of ["skills", "ai-engineering", "cloud", "architecture", "contact", "devops"] as const) {
    const doc = publicDocs.find((entry) => entry.type === type);
    if (doc) add(questionFor(doc));
  }
  if (publicDocs.some((doc) => doc.technologies.includes("ASP.NET Core"))) add("What is his .NET experience?");
  if (publicDocs.some((doc) => doc.type === "project" && doc.technologies.includes("Angular"))) add("Show me projects using Angular");
  return prompts.slice(0, limit);
}
