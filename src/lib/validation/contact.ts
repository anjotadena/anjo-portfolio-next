import { z } from "zod";
import {
  CONTACT_EMAIL_MAX_LENGTH,
  CONTACT_MESSAGE_MAX_LENGTH,
  CONTACT_NAME_MAX_LENGTH,
  type ContactField,
  type ContactFieldErrorCode,
} from "@/types/api";

/**
 * Mirrors `ContactRequestBody` in `src/types/api.ts`, the canonical
 * contract shared with `src/components/contact/contact-form.tsx`.
 * `company` is the honeypot field name on the wire (the visible form
 * input's `name` attribute is unrelated -- bots that fill in any
 * text-looking field get caught either way).
 */
export const contactRequestSchema = z.object({
  name: z.string().min(1, "name is required").max(CONTACT_NAME_MAX_LENGTH, "name is too long"),
  email: z
    .string()
    .min(1, "email is required")
    .max(CONTACT_EMAIL_MAX_LENGTH, "email is too long")
    .email("email must be a valid email address"),
  message: z.string().min(1, "message is required").max(CONTACT_MESSAGE_MAX_LENGTH, "message is too long"),
  // Honeypot: a hidden field real users never fill in. Any non-empty
  // value marks the submission as spam. The shipped client-side form
  // never even sends this when empty (it short-circuits before calling
  // the API at all when its own honeypot is filled), so this is
  // defense-in-depth against a bot that calls the API directly.
  company: z.string().optional().default(""),
  // Epoch ms captured when the form was rendered client-side, used for
  // the minimum time-to-submit check below. Optional because the
  // shipped client doesn't currently send it -- treated as "unknown",
  // never as suspicious, when absent.
  startedAt: z.number().optional(),
});

export type ContactRequestInput = z.infer<typeof contactRequestSchema>;

const HEADER_INJECTION_PATTERN = /[\r\n]/;

/** Guards against header injection via free-text fields a transport
 * might ever place into an email header (name, email). */
export function containsHeaderInjection(value: string): boolean {
  return HEADER_INJECTION_PATTERN.test(value);
}

export function findHeaderInjectionField(
  input: Pick<ContactRequestInput, "name" | "email">,
): "name" | "email" | null {
  if (containsHeaderInjection(input.name)) return "name";
  if (containsHeaderInjection(input.email)) return "email";
  return null;
}

/** Minimum time, in milliseconds, a real human is expected to take
 * between the form rendering and submitting it. Bots that submit forms
 * programmatically tend to do so near-instantly. */
export const MIN_SUBMIT_MS = 1500;

export interface SpamCheckInput {
  company: string;
  startedAt?: number;
  now?: number;
}

export function isLikelySpam(input: SpamCheckInput): boolean {
  if (input.company.trim().length > 0) return true;
  if (typeof input.startedAt === "number") {
    const elapsed = (input.now ?? Date.now()) - input.startedAt;
    if (elapsed < MIN_SUBMIT_MS) return true;
  }
  return false;
}

/**
 * Maps zod issues onto the canonical, closed `ContactFieldErrorCode` set
 * (`required | too_long | invalid | invalid_email`) keyed by
 * `ContactField`, matching `ContactValidationErrorBody["fields"]`
 * exactly. Only the first issue per field is kept; issues on fields
 * outside `name`/`email`/`message` (e.g. a malformed `startedAt`) are
 * dropped rather than surfaced, since they're not user-facing form
 * fields.
 */
export function toContactFieldErrors(error: z.ZodError): Partial<Record<ContactField, ContactFieldErrorCode>> {
  const fields: Partial<Record<ContactField, ContactFieldErrorCode>> = {};
  for (const issue of error.issues) {
    const rawField = issue.path[0];
    if (rawField !== "name" && rawField !== "email" && rawField !== "message") continue;
    if (fields[rawField]) continue;
    fields[rawField] = mapIssueToFieldErrorCode(issue);
  }
  return fields;
}

function mapIssueToFieldErrorCode(issue: z.ZodError["issues"][number]): ContactFieldErrorCode {
  if (issue.code === "invalid_type" || issue.code === "too_small") return "required";
  if (issue.code === "too_big") return "too_long";
  if (issue.code === "invalid_format" && "format" in issue && issue.format === "email") return "invalid_email";
  return "invalid";
}
