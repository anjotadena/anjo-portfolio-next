import type { ChatCard, ProjectCardData } from "@/types/chat";
import type { ContentDocument } from "@/types/content";
import type { KnowledgeResult } from "@/lib/retrieval/types";
import type { QueryIntent } from "./query";

const MAX_PROJECT_CARDS = 3;

export function toProjectCard(doc: ContentDocument): ProjectCardData {
  return {
    kind: "project",
    slug: doc.slug,
    title: doc.title,
    summary: doc.summary,
    technologies: doc.technologies.slice(0, 6),
    tags: doc.tags.slice(0, 4),
    category: doc.project?.category ?? null,
    status: doc.project?.status ?? null,
    href: `/projects/${doc.slug}`,
    repoUrl: doc.project?.repoUrl ?? null,
    demoUrl: doc.project?.demoUrl ?? doc.project?.docsUrl ?? null,
    featured: doc.featured,
  };
}

/**
 * Rich answer cards are derived ON THE SERVER from retrieval metadata and
 * frontmatter — never from model output. The model produces prose and
 * citations only; the typed card payload is what the UI renders, so the
 * model can never emit HTML, links, or facts that aren't in the Markdown.
 *
 * Rules:
 *  - contact intent (or a retrieved contact document)  -> ContactCard
 *  - retrieved project documents (up to 3)             -> ProjectCards
 *  - skills intent or a skills document ranked first   -> SkillCard
 *  - experience / certifications intent with public data -> those cards
 */
export function buildCards(input: {
  intent: QueryIntent;
  results: readonly KnowledgeResult[];
  documents: readonly ContentDocument[];
}): ChatCard[] {
  const cards: ChatCard[] = [];
  const bySlug = new Map(input.documents.filter((doc) => doc.visibility === "public").map((doc) => [doc.slug, doc]));
  const retrievedSlugs = Array.from(new Set(input.results.map((result) => result.chunk.documentSlug)));
  const retrievedTypes = new Set(input.results.map((result) => result.chunk.type));

  const profileDoc = input.documents.find((doc) => doc.type === "profile" && doc.visibility === "public");
  if ((input.intent === "contact" || retrievedTypes.has("contact")) && profileDoc?.profile) {
    const p = profileDoc.profile;
    cards.push({
      kind: "contact",
      name: p.name,
      headline: p.headline,
      location: p.location,
      availability: p.availability,
      email: p.email,
      linkedInUrl: p.linkedInUrl,
      githubUrl: p.githubUrl,
      resumeHref: p.resumeHref,
    });
  }

  // Project cards only when the visitor asked about projects or the best
  // match IS a project — not merely because a project mentioned a term.
  const topIsProject = input.results[0]?.chunk.type === "project";
  const projectDocs =
    input.intent === "projects" || topIsProject
      ? retrievedSlugs
          .map((slug) => bySlug.get(slug))
          .filter((doc): doc is ContentDocument => doc !== undefined && doc.type === "project")
          .slice(0, MAX_PROJECT_CARDS)
      : [];
  if (input.intent === "projects" && projectDocs.length === 0) {
    // "Show me his projects" — offer the featured ones even if retrieval landed elsewhere.
    projectDocs.push(...input.documents.filter((doc) => doc.type === "project" && doc.featured && doc.visibility === "public").slice(0, MAX_PROJECT_CARDS));
  }
  for (const doc of projectDocs) cards.push(toProjectCard(doc));

  const skillsDoc = input.documents.find((doc) => doc.type === "skills" && doc.visibility === "public");
  const topType = input.results[0]?.chunk.type;
  if ((input.intent === "skills" || topType === "skills") && skillsDoc?.skillGroups) {
    cards.push({ kind: "skills", groups: skillsDoc.skillGroups, href: "/skills" });
  }

  const experienceDoc = input.documents.find((doc) => doc.type === "experience" && doc.visibility === "public");
  if ((input.intent === "experience" || retrievedTypes.has("experience")) && experienceDoc?.experience?.length) {
    cards.push({ kind: "experience", entries: experienceDoc.experience.slice(0, 3), href: "/experience" });
  }

  const certDoc = input.documents.find((doc) => doc.type === "certifications" && doc.visibility === "public");
  if ((input.intent === "certifications" || retrievedTypes.has("certifications")) && certDoc?.certifications?.length) {
    cards.push({ kind: "certifications", entries: certDoc.certifications, href: `/topics/${certDoc.slug}` });
  }

  return cards;
}
