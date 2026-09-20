import type { CertificationEntry, ContentType, ExperienceEntry, SkillGroup } from "./content";

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

/** Server limits. The client mirrors these for fast feedback; the server always re-validates. */
export const CHAT_MESSAGE_MAX_LENGTH = 1000;
export const CHAT_HISTORY_MAX_TURNS = 10;
export const CHAT_HISTORY_TURN_MAX_LENGTH = 4000;

/** POST /api/chat request body. `history` excludes the current `message`. */
export interface ChatRequestBody {
  message: string;
  history?: ChatMessage[];
  /** Optional project/topic slug that seeds retrieval (e.g. "Ask AI about this project"). */
  contextSlug?: string;
}

/**
 * live       = a language model answered from retrieved context
 * extractive = no model configured; the answer quotes retrieved content verbatim
 * ungrounded = retrieval found nothing relevant; a fixed fallback was returned
 */
export type ChatMode = "live" | "extractive" | "ungrounded";

/** A human-readable citation. Never exposes chunk ids or embedding internals. */
export interface ChatSource {
  /** 1-based index used as `[n]` in the answer text. */
  index: number;
  documentSlug: string;
  title: string;
  section: string | null;
  type: ContentType;
  /** Site URL for the full document (null when the doc has no page). */
  href: string | null;
  /** Short excerpt for the preview panel. */
  excerpt: string;
}

export interface ProjectCardData {
  kind: "project";
  slug: string;
  title: string;
  summary: string;
  technologies: string[];
  tags: string[];
  category: string | null;
  status: string | null;
  href: string;
  repoUrl: string | null;
  demoUrl: string | null;
  featured: boolean;
}

export interface CaseStudyCardData {
  kind: "case-study";
  slug: string;
  title: string;
  outcome: string;
  role: string;
  period: string | null;
  highlights: string[];
  readingMinutes: number;
  href: string;
  projectHref: string | null;
}

export interface PostCardData {
  kind: "post";
  slug: string;
  title: string;
  summary: string;
  date: string;
  readingMinutes: number;
  tags: string[];
  href: string;
}

export interface SkillCardData {
  kind: "skills";
  groups: SkillGroup[];
  href: string;
}

export interface ContactCardData {
  kind: "contact";
  name: string;
  headline: string;
  location: string;
  availability: string | null;
  email: string;
  linkedInUrl: string;
  githubUrl: string;
  resumeHref: string | null;
}

export interface ExperienceCardData {
  kind: "experience";
  entries: ExperienceEntry[];
  href: string;
}

export interface CertificationCardData {
  kind: "certifications";
  entries: CertificationEntry[];
  href: string;
}

export type ChatCard = ProjectCardData | CaseStudyCardData | PostCardData | SkillCardData | ContactCardData | ExperienceCardData | CertificationCardData;

export interface ChatStreamMeta {
  requestId: string;
  mode: ChatMode;
  grounded: boolean;
  sources: ChatSource[];
  cards: ChatCard[];
  followUps: string[];
}

export interface ChatUsage {
  inputTokens: number;
  outputTokens: number;
}

/** NDJSON wire protocol: one JSON object per line, content-type application/x-ndjson. */
export type ChatStreamEvent =
  | { type: "meta"; meta: ChatStreamMeta }
  | { type: "delta"; text: string }
  | { type: "done"; usage?: ChatUsage; finishReason?: "stop" | "length" | "timeout" }
  | { type: "error"; message: string };

/** Non-stream error body shared by chat and search endpoints. */
export interface ApiErrorBody {
  code:
    | "INVALID_JSON"
    | "VALIDATION_ERROR"
    | "REQUEST_TOO_LARGE"
    | "RATE_LIMITED"
    | "PROVIDER_ERROR"
    | "RETRIEVAL_ERROR"
    | "METHOD_NOT_ALLOWED";
  message: string;
  fields?: Array<{ field: string; message: string }>;
}
