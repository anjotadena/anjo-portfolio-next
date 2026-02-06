export type AskIntent = "projects" | "architecture" | "leadership" | "skills" | "resume" | "general";

export type AskLink = {
  label: string;
  href: string;
};

export type AskApiRequest = {
  question: string;
};

// ---------------------------------------------------------------------------
// Error Classification
// ---------------------------------------------------------------------------
export type AskErrorType =
  | "rate_limited"
  | "rate_limited_hour"
  | "rate_limited_day"
  | "not_related"
  | "abusive"
  | "injection_detected"
  | "input_too_long"
  | "spam_detected"
  | "temporarily_blocked"
  | "openai_error"
  | "openai_unavailable"
  | "network_error"
  | "validation_error"
  | "unknown_error";

// Human-friendly error messages (recruiter-safe, non-technical)
export const ASK_ERROR_MESSAGES: Record<AskErrorType, string> = {
  rate_limited: "You're asking a bit too quickly. Please try again in a moment.",
  rate_limited_hour: "You've reached the hourly limit. Please try again in a bit.",
  rate_limited_day: "You've reached the daily limit. Please come back tomorrow.",
  not_related: "I can help with questions about Anjo's experience, projects, or qualifications.",
  abusive: "I can help with questions about Anjo's experience, projects, or qualifications.",
  injection_detected: "I can help with questions about Anjo's experience, projects, or qualifications.",
  input_too_long: "Please keep your question shorter (under 500 characters).",
  spam_detected: "Please ask a clear question about the portfolio.",
  temporarily_blocked: "Access temporarily restricted. Please try again later.",
  openai_error: "Something didn't load correctly. Please try again shortly.",
  openai_unavailable: "AI assistance is temporarily unavailable. You can still explore the portfolio.",
  network_error: "Something didn't load correctly. Please try again shortly.",
  validation_error: "Please enter a question related to the portfolio.",
  unknown_error: "Something unexpected happened. Refreshing usually helps.",
};

// ---------------------------------------------------------------------------
// Response Contract (STRICT)
// ---------------------------------------------------------------------------
// Success response:
// {
//   status: "success";
//   answer: string;
//   links?: { label: string; href: string }[];
// }
//
// Error response:
// {
//   status: "error";
//   type: AskErrorType;
//   message: string;
// }
// ---------------------------------------------------------------------------

export type AskApiSuccessResponse = {
  status: "success";
  answer: string;
  links?: AskLink[];
};

export type AskApiErrorResponse = {
  status: "error";
  type: AskErrorType;
  message: string;
};

export type AskApiResponse = AskApiSuccessResponse | AskApiErrorResponse;

// Legacy response (for backward compatibility during transition)
// TODO: Remove after frontend migration complete
export type AskApiLegacyResponse = {
  answer: string;
  links?: AskLink[];
};

export type AskContext = {
  intent: AskIntent;
  title: string;
  content: string;
  links: AskLink[];
};

// ---------------------------------------------------------------------------
// Type Guards
// ---------------------------------------------------------------------------
export function isAskErrorResponse(response: AskApiResponse): response is AskApiErrorResponse {
  return response.status === "error";
}

export function isAskSuccessResponse(response: AskApiResponse): response is AskApiSuccessResponse {
  return response.status === "success";
}

