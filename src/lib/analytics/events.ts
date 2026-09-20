/** Closed list of product analytics events. Shared by the client tracker and the API validator. */
export const ANALYTICS_EVENTS = [
  "chat_started",
  "question_submitted",
  "suggested_prompt_clicked",
  "project_opened",
  "citation_opened",
  "resume_downloaded",
  "contact_clicked",
  "search_used",
  "answer_feedback",
] as const;

export type AnalyticsEvent = (typeof ANALYTICS_EVENTS)[number];

export type AnalyticsProps = Record<string, string | number | boolean>;
