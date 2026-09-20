import type { ChatMessage } from "@/types/chat";
import type { ContentType } from "@/types/content";
import { substantiveTerms } from "@/lib/retrieval/lexical";
import { isGreetingQuery } from "@/lib/retrieval/greeting";

export type QueryIntent = "greeting" | "profile" | "contact" | "projects" | "blog" | "skills" | "experience" | "certifications" | "general";

export interface UnderstoodQuery {
  /** The text sent to retrieval (may be augmented with conversation context). */
  retrievalQuery: string;
  intent: QueryIntent;
  /** True when the message referred back to the conversation ("tell me more about it"). */
  isFollowUp: boolean;
  /** Suggested type filter for retrieval, or null for no filter. */
  preferredTypes: ContentType[] | null;
}

const PROFILE_PATTERN =
  /^(who is|who's|whos|about|tell me about|introduce|describe) (anjo|him|anjo tadena|yourself)\b|\bwho (is|are) (you|anjo)\b|\bbackground\b|\bbio\b/i;
const CONTACT_PATTERN = /\b(contact|reach|email|e-mail|hire|hiring|get in touch|linkedin|resume|résumé|cv|available|availability|open to)\b/i;
const PROJECTS_PATTERN =
  /\b(projects?|portfolio pieces?|what (has|did) he (build|built|made|make)|things he('s| has) built|case stud(y|ies)|walk me through|how (did|was) .+ (built|designed|made))\b/i;
const BLOG_PATTERN = /\b(blog|posts?|articles?|written|writes?|writing|wrote)\b/i;
const SKILLS_PATTERN = /\b(skills?|tech(nolog(y|ies))?|stack|strongest|languages?|frameworks?|tools?|proficien|expertise|good at)\b/i;
const EXPERIENCE_PATTERN = /\b(experience|work history|career|employ(er|ment)|jobs?|roles?|companies|worked at|years)\b/i;
const CERTIFICATIONS_PATTERN = /\b(certif(ication|ied|icate)s?|credentials?|certs?)\b/i;

const REFERENTIAL_PATTERN =
  /\b(it|its|that|this|those|these|them|they|the project|the framework|the tool|more|elaborate|expand|detail|deeper|why|how so|example|again)\b/i;

/** Words that look like proper nouns / product names in the assistant's previous answer. */
function salientTermsFrom(text: string, max: number): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const match of text.matchAll(/\b([A-Z][A-Za-z0-9.+#-]{2,}|\.NET|C#)\b/g)) {
    const term = match[1]!;
    const key = term.toLowerCase();
    if (seen.has(key) || key === "anjo" || key === "he" || key === "his") continue;
    seen.add(key);
    out.push(term);
    if (out.length >= max) break;
  }
  return out;
}

/**
 * Deterministic query understanding (no model call):
 *  - classifies intent so the orchestrator can attach the right card and
 *    optionally bias retrieval by document type;
 *  - rewrites short or referential follow-ups ("tell me more about it")
 *    by adding the previous user question and the salient terms from the
 *    previous answer, so retrieval sees the actual topic.
 */
export function understandQuery(message: string, history: readonly ChatMessage[]): UnderstoodQuery {
  const trimmed = message.trim();
  const terms = substantiveTerms(trimmed);

  let intent: QueryIntent = "general";
  if (isGreetingQuery(trimmed)) intent = "greeting";
  else if (PROFILE_PATTERN.test(trimmed)) intent = "profile";
  else if (CONTACT_PATTERN.test(trimmed)) intent = "contact";
  else if (CERTIFICATIONS_PATTERN.test(trimmed)) intent = "certifications";
  else if (PROJECTS_PATTERN.test(trimmed)) intent = "projects";
  else if (BLOG_PATTERN.test(trimmed)) intent = "blog";
  else if (SKILLS_PATTERN.test(trimmed)) intent = "skills";
  else if (EXPERIENCE_PATTERN.test(trimmed)) intent = "experience";

  const lastUser = [...history].reverse().find((turn) => turn.role === "user");
  const lastAssistant = [...history].reverse().find((turn) => turn.role === "assistant");
  const referential = REFERENTIAL_PATTERN.test(trimmed);
  const isFollowUp = history.length > 0 && (referential || terms.length <= 2);

  let retrievalQuery = trimmed;
  if (isFollowUp) {
    const extra: string[] = [];
    if (lastUser) extra.push(...substantiveTerms(lastUser.content).slice(0, 8));
    if (lastAssistant) extra.push(...salientTermsFrom(lastAssistant.content, 6));
    const unique = Array.from(new Set(extra.map((term) => term.toLowerCase()))).filter((term) => !terms.includes(term));
    if (unique.length > 0) retrievalQuery = `${trimmed} ${unique.join(" ")}`;
  }

  const preferredTypes: ContentType[] | null =
    intent === "contact"
      ? ["contact", "profile"]
      : intent === "profile"
        ? ["profile"]
        : intent === "skills"
          ? ["skills"]
          : intent === "projects"
            ? ["project"]
            : intent === "blog"
              ? ["post"]
            : intent === "certifications"
              ? ["certifications"]
              : intent === "experience"
                ? ["experience"]
                : null;

  return { retrievalQuery, intent, isFollowUp, preferredTypes };
}
