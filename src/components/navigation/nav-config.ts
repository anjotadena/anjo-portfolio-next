import type { ContentType } from "@/types/content";

export interface NavItem {
  href: string;
  label: string;
  /** Icon key resolved client-side (keeps this module serializable for RSC props). */
  icon: NavIcon;
  /** Optional short description for the mobile drawer. */
  description?: string;
}

export type NavIcon =
  | "chat"
  | "user"
  | "briefcase"
  | "folder"
  | "sparkles"
  | "cloud"
  | "git"
  | "layers"
  | "award"
  | "mail"
  | "book"
  | "pen"
  | "compass";

/** Top navigation: homepage sections. Absolute `/#…` hrefs work from every route. */
export const PRIMARY_NAV: NavItem[] = [
  { href: "/#work", label: "Work", icon: "folder" },
  { href: "/#help", label: "How I help", icon: "briefcase" },
  { href: "/#about", label: "About", icon: "user" },
  { href: "/#contact", label: "Contact", icon: "mail" },
];

/** Deeper pages, listed in the footer and the mobile menu. */
export const EXPLORE_NAV: NavItem[] = [
  { href: "/projects", label: "Projects", icon: "folder" },
  { href: "/case-studies", label: "Case studies", icon: "book" },
  { href: "/blog", label: "Blog", icon: "pen" },
  { href: "/skills", label: "Skills", icon: "layers" },
  { href: "/about", label: "About page", icon: "user" },
  { href: "/contact", label: "Contact page", icon: "mail" },
];

/** Topic document types that get a `/topics/[slug]` page and a sidebar entry. */
export const TOPIC_TYPES: ContentType[] = ["ai-engineering", "cloud", "devops", "architecture", "certifications", "education", "philosophy"];

export const TOPIC_ICONS: Record<string, NavIcon> = {
  "ai-engineering": "sparkles",
  cloud: "cloud",
  devops: "git",
  architecture: "compass",
  certifications: "award",
  education: "book",
  philosophy: "book",
};

export const TOPIC_LABELS: Record<string, string> = {
  "ai-engineering": "AI & LLMs",
  cloud: "Cloud",
  devops: "DevOps",
  architecture: "Architecture",
  certifications: "Certifications",
  education: "Education",
  philosophy: "Philosophy",
};
