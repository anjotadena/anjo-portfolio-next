import type { ContentStatus } from "./content";

/** Capability-grouped skills (spec Section 9). Never rendered as percentage bars. */
export interface SkillGroup {
  id: string;
  title: string;
  skills: string[];
}

export type ProjectCategory =
  | "AI"
  | "Full Stack"
  | "Cloud"
  | "Developer Tools"
  | "Mobile";

export const PROJECT_CATEGORIES: readonly ProjectCategory[] = [
  "AI",
  "Full Stack",
  "Cloud",
  "Developer Tools",
  "Mobile",
] as const;

/**
 * A project card (spec Section 10).
 * Fields that have no verified source are `null` and must render as an honest
 * "details coming soon" state rather than being invented.
 */
export interface ProjectSummary {
  slug: string;
  name: string;
  problem: string | null;
  role: string | null;
  technologies: string[];
  impact: string | null;
  categories: ProjectCategory[];
  status: ContentStatus;
}

/** One section of a case study (spec Section 11). `body === null` => not yet documented. */
export interface CaseStudySection {
  id: string;
  title: string;
  body: string | null;
}

export interface CaseStudy {
  project: ProjectSummary;
  sections: CaseStudySection[];
}

/** Vertical timeline entry (spec Section 12). */
export interface ExperienceEntry {
  id: string;
  period: string;
  title: string;
  company: string | null;
  location: string | null;
  summary: string | null;
  responsibilities: string[];
  achievements: string[];
  technologies: string[];
  leadership: string[];
}

/** Canonical, verified identity facts. */
export interface ProfileFacts {
  name: string;
  headline: string;
  location: string;
  email: string;
  githubUrl: string;
  linkedInUrl: string;
  resumeHref: string;
}
