import type { ContentType } from "./content";

export type SearchGroup = "projects" | "skills" | "experience" | "knowledge";

export interface SearchHit {
  documentSlug: string;
  title: string;
  section: string | null;
  type: ContentType;
  group: SearchGroup;
  href: string | null;
  excerpt: string;
  /** Relevance in (0, 1]. */
  score: number;
}

export interface SearchResponseBody {
  query: string;
  groups: Array<{ group: SearchGroup; label: string; hits: SearchHit[] }>;
  total: number;
}

export function groupForType(type: ContentType): SearchGroup {
  switch (type) {
    case "project":
      return "projects";
    case "skills":
      return "skills";
    case "experience":
      return "experience";
    default:
      return "knowledge";
  }
}

export const SEARCH_GROUP_LABELS: Record<SearchGroup, string> = {
  projects: "Projects",
  skills: "Skills",
  experience: "Experience",
  knowledge: "Knowledge",
};
