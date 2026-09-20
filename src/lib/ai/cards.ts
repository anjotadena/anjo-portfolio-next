import type { CaseStudyCardData, ChatCard, PostCardData, ProjectCardData } from "@/types/chat";
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

export function toCaseStudyCard(doc: ContentDocument): CaseStudyCardData | null {
  if (!doc.caseStudy) return null;
  return {
    kind: "case-study",
    slug: doc.slug,
    title: doc.title,
    outcome: doc.caseStudy.outcome,
    role: doc.caseStudy.role,
    period: doc.caseStudy.period,
    highlights: doc.caseStudy.highlights.slice(0, 3),
    readingMinutes: doc.caseStudy.readingMinutes,
    href: `/case-studies/${doc.slug}`,
    projectHref: doc.caseStudy.projectSlug ? `/projects/${doc.caseStudy.projectSlug}` : null,
  };
}

export function toPostCard(doc: ContentDocument): PostCardData | null {
  if (!doc.post || !doc.date) return null;
  return {
    kind: "post",
    slug: doc.slug,
    title: doc.title,
    summary: doc.summary,
    date: doc.date,
    readingMinutes: doc.post.readingMinutes,
    tags: doc.tags.slice(0, 4),
    href: `/blog/${doc.slug}`,
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

  // A case study card when one was retrieved near the top, or when the
  // question is about projects/case studies and a case study covers a
  // retrieved project.
  const topIsCaseStudy = input.results[0]?.chunk.type === "case-study";
  const caseStudyDocs = retrievedSlugs
    .map((slug) => bySlug.get(slug))
    .filter((doc): doc is ContentDocument => doc !== undefined && doc.type === "case-study");
  const linkedCaseStudies = input.documents.filter(
    (doc) => doc.type === "case-study" && doc.visibility === "public" && doc.caseStudy?.projectSlug && projectDocs.some((project) => project.slug === doc.caseStudy?.projectSlug),
  );
  const chosen = topIsCaseStudy || input.intent === "projects" ? [...caseStudyDocs, ...linkedCaseStudies] : caseStudyDocs.slice(0, topIsCaseStudy ? 1 : 0);
  const seenCaseStudies = new Set<string>();
  for (const doc of chosen) {
    if (seenCaseStudies.has(doc.slug) || seenCaseStudies.size >= 2) continue;
    const card = toCaseStudyCard(doc);
    if (card) {
      seenCaseStudies.add(doc.slug);
      cards.push(card);
    }
  }

  // A blog post card when a post is the best match or the visitor asked about writing.
  const topIsPost = input.results[0]?.chunk.type === "post";
  if (topIsPost || input.intent === "blog") {
    const postDocs = retrievedSlugs
      .map((slug) => bySlug.get(slug))
      .filter((doc): doc is ContentDocument => doc !== undefined && doc.type === "post")
      .slice(0, 2);
    for (const doc of postDocs) {
      const card = toPostCard(doc);
      if (card) cards.push(card);
    }
  }

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
