/**
 * Canonical shapes for the Markdown knowledge base. Every page, the
 * retrieval index, and the chat assistant consume these — there is no
 * second copy of portfolio information anywhere in the codebase.
 */

export const CONTENT_TYPES = [
  "profile",
  "experience",
  "skills",
  "education",
  "certifications",
  "architecture",
  "ai-engineering",
  "cloud",
  "devops",
  "philosophy",
  "contact",
  "project",
] as const;

export type ContentType = (typeof CONTENT_TYPES)[number];

export type Visibility = "public" | "private";

export interface ProfileFacts {
  name: string;
  headline: string;
  tagline: string | null;
  location: string;
  email: string;
  githubUrl: string;
  linkedInUrl: string;
  resumeHref: string | null;
  availability: string | null;
}

export interface SkillGroup {
  id: string;
  title: string;
  skills: string[];
}

export type ProjectStatus = "active" | "maintained" | "in-progress" | "archived";

export interface ProjectFacts {
  role: string | null;
  period: string | null;
  status: ProjectStatus | null;
  category: string | null;
  repoUrl: string | null;
  docsUrl: string | null;
  demoUrl: string | null;
  license: string | null;
}

export interface ExperienceEntry {
  id: string;
  title: string;
  company: string | null;
  location: string | null;
  period: string;
  summary: string | null;
  responsibilities: string[];
  achievements: string[];
  technologies: string[];
}

export type CertificationStatus = "earned" | "pursuing";

export interface CertificationEntry {
  id: string;
  name: string;
  issuer: string;
  status: CertificationStatus;
  date: string | null;
  url: string | null;
}

export interface EducationEntry {
  id: string;
  degree: string;
  institution: string;
  location: string | null;
  period: string | null;
}

export interface ContentDocument {
  slug: string;
  title: string;
  type: ContentType;
  summary: string;
  tags: string[];
  technologies: string[];
  related: string[];
  /** ISO date (YYYY-MM-DD) or null. */
  date: string | null;
  updated: string | null;
  featured: boolean;
  visibility: Visibility;
  /** Markdown body with frontmatter removed and content normalized. */
  body: string;
  /** Repo-relative POSIX path, e.g. `content/projects/asterweave.md`. */
  sourcePath: string;
  profile: ProfileFacts | null;
  skillGroups: SkillGroup[] | null;
  project: ProjectFacts | null;
  experience: ExperienceEntry[] | null;
  certifications: CertificationEntry[] | null;
  education: EducationEntry[] | null;
}

export interface ContentChunk {
  /** Deterministic id: `${slug}::${sectionSlug}::${ordinal}`. Stable across re-indexing. */
  id: string;
  documentSlug: string;
  documentTitle: string;
  type: ContentType;
  /** Heading breadcrumb, e.g. ["Architecture"] or ["Architecture", "Delivery graph"]. */
  headingPath: string[];
  /** Human-readable section label (last heading) or null for pre-heading content. */
  section: string | null;
  text: string;
  /** SHA-256 of the normalized chunk payload; drives incremental indexing. */
  contentHash: string;
  chunkIndex: number;
  tags: string[];
  technologies: string[];
  related: string[];
  featured: boolean;
  visibility: Visibility;
}
