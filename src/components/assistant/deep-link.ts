/**
 * Query-string contract for opening the assistant from a URL:
 *
 *   /?ask=<question>      open the widget and submit <question> once
 *   /?assistant=open      open the widget without submitting anything
 *
 * `/chat` and `/chat?ask=` redirect here (see `src/app/chat/page.tsx`).
 * After consumption the parameters are removed with `router.replace`, so a
 * reload or back/forward never replays the question.
 */
export const ASK_PARAM = "ask";
export const OPEN_PARAM = "assistant";

export interface AssistantDeepLink {
  /** The question to submit, already URL-decoded and trimmed (null when absent/blank). */
  ask: string | null;
  /** Whether the widget should open (true when `ask` is present too). */
  open: boolean;
  /** The remaining query string without the assistant parameters ("" or "?a=b"). */
  remainingQuery: string;
}

export function parseAssistantDeepLink(params: URLSearchParams): AssistantDeepLink | null {
  const rawAsk = params.get(ASK_PARAM);
  const openFlag = params.get(OPEN_PARAM);
  if (rawAsk === null && openFlag === null) return null;
  const ask = rawAsk?.trim() ? rawAsk.trim() : null;
  const rest = new URLSearchParams(params);
  rest.delete(ASK_PARAM);
  rest.delete(OPEN_PARAM);
  const query = rest.toString();
  return { ask, open: true, remainingQuery: query ? `?${query}` : "" };
}

/** Builds a progressive-enhancement href for "Ask Anjo AI" links (works before hydration). */
export function askHref(question: string): string {
  return `/?${ASK_PARAM}=${encodeURIComponent(question)}`;
}
