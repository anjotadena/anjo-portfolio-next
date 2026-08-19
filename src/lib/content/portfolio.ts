import type {
  CaseStudy,
  CaseStudySection,
  ExperienceEntry,
  ProfileFacts,
  ProjectSummary,
  SkillGroup,
} from "@/types/portfolio";
import { documents, type RawDocument } from "./loader";
import { getChunksByDocumentSlug } from "./index";

/**
 * Structured accessors over the content corpus, returning the shapes
 * defined in `src/types/portfolio.ts`. These read the same underlying
 * markdown files as the retrieval corpus, but via each document's
 * structured frontmatter (for facts) or its own chunked body (for case
 * study sections) rather than free-text parsing — so results are exact
 * and don't depend on prose wording.
 */

const CASE_STUDY_SECTION_TITLES = [
  "Overview",
  "Problem",
  "My Role",
  "Architecture",
  "Technology Stack",
  "Key Decisions",
  "Challenges",
  "Solution",
  "Security Considerations",
  "Performance & Scalability",
  "Outcome",
  "Lessons Learned",
] as const;

function slugifySectionTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getProfileFacts(): ProfileFacts {
  const profile = documents.find((doc) => doc.category === "profile");
  if (
    !profile ||
    !profile.name ||
    !profile.headline ||
    !profile.location ||
    !profile.email ||
    !profile.githubUrl ||
    !profile.linkedInUrl ||
    !profile.resumeHref
  ) {
    throw new Error("profile.md is missing one or more required structured facts");
  }

  return {
    name: profile.name,
    headline: profile.headline,
    location: profile.location,
    email: profile.email,
    githubUrl: profile.githubUrl,
    linkedInUrl: profile.linkedInUrl,
    resumeHref: profile.resumeHref,
  };
}

export function getSkillGroups(): SkillGroup[] {
  const skillsDoc = documents.find((doc) => doc.category === "skills");
  if (!skillsDoc || !skillsDoc.groups || skillsDoc.groups.length === 0) {
    throw new Error("skills.md is missing structured skill groups");
  }
  return skillsDoc.groups;
}

function toProjectSummary(doc: RawDocument): ProjectSummary {
  if (!doc.categories || doc.categories.length === 0 || !doc.technologies || doc.technologies.length === 0) {
    throw new Error(`project "${doc.slug}" is missing categories/technologies frontmatter`);
  }

  return {
    slug: doc.slug,
    name: doc.title,
    // No problem statement, role, or impact has been verified for any
    // project yet — these stay null rather than being invented.
    problem: null,
    role: null,
    technologies: doc.technologies,
    impact: null,
    categories: doc.categories,
    status: doc.status,
  };
}

export function getProjectSummaries(): ProjectSummary[] {
  return documents.filter((doc) => doc.category === "projects").map(toProjectSummary);
}

export function getProjectBySlug(slug: string): ProjectSummary | null {
  const doc = documents.find((d) => d.slug === slug && d.category === "projects");
  return doc ? toProjectSummary(doc) : null;
}

/**
 * Builds the full 12-section case study for a project. Sections are
 * matched against the project document's own markdown headings (e.g. an
 * `## Overview` heading fills the "Overview" section); any section whose
 * heading isn't present in the source file is returned with `body: null`
 * rather than invented content.
 */
export function getCaseStudy(slug: string): CaseStudy | null {
  const project = getProjectBySlug(slug);
  if (!project) return null;

  const chunks = getChunksByDocumentSlug(slug);
  const headingToText = new Map<string, string>();
  for (const chunk of chunks) {
    if (chunk.heading) {
      headingToText.set(chunk.heading.trim().toLowerCase(), chunk.text);
    }
  }

  const sections: CaseStudySection[] = CASE_STUDY_SECTION_TITLES.map((title) => ({
    id: slugifySectionTitle(title),
    title,
    body: headingToText.get(title.toLowerCase()) ?? null,
  }));

  return { project, sections };
}

/**
 * No employment history has been verified yet. Returning an empty array
 * (rather than fabricating entries) is intentional — the UI renders an
 * empty state instead of invented job history.
 */
export function getExperienceEntries(): ExperienceEntry[] {
  return [];
}
