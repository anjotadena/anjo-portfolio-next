import type { ContentCategory } from "./content";

export type ChatRole = "user" | "assistant";
export interface ChatMessage { role: ChatRole; content: string; }

export interface RetrievedSource {
  slug: string; title: string; category: ContentCategory;
  href: string | null; score: number;
}
export interface RelatedProject { slug: string; title: string; href: string; }

/** live = real LLM answered; unconfigured = no API key; ungrounded = corpus had no answer */
export type ChatMode = "live" | "unconfigured" | "ungrounded";

export interface ChatStreamMeta {
  mode: ChatMode;
  sources: RetrievedSource[];
  followUps: string[];
  relatedProjects: RelatedProject[];
  grounded: boolean;
  providerConfigured: boolean;
}

/** NDJSON wire protocol: one JSON object per line, content-type application/x-ndjson */
export type ChatStreamEvent =
  | { type: "meta"; meta: ChatStreamMeta }
  | { type: "delta"; text: string }
  | { type: "done" }
  | { type: "error"; message: string };
