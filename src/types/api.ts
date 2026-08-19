import type { ChatMessage } from "./chat";

/**
 * Canonical HTTP contracts between the client components and the route handlers.
 *
 * These exist because the UI and the API were built concurrently and each side
 * would otherwise encode its own assumptions. Both sides import from here so a
 * divergence becomes a type error instead of a runtime bug found in E2E.
 */

/** Server limits. The client mirrors these for fast feedback; the server always re-validates. */
export const CHAT_MESSAGE_MAX_LENGTH = 1000;
export const CHAT_HISTORY_MAX_TURNS = 8;
export const CONTACT_NAME_MAX_LENGTH = 100;
export const CONTACT_EMAIL_MAX_LENGTH = 254;
export const CONTACT_MESSAGE_MAX_LENGTH = 2000;

/** POST /api/chat request body. `history` excludes the current `message`. */
export interface ChatRequestBody {
  message: string;
  history: ChatMessage[];
}

/** POST /api/contact request body. `company` is the honeypot and must stay empty. */
export interface ContactRequestBody {
  name: string;
  email: string;
  message: string;
  company?: string;
  startedAt?: number;
}

export type ContactFieldErrorCode =
  | "required"
  | "too_long"
  | "invalid"
  | "invalid_email";

export type ContactField = "name" | "email" | "message";

/** 400 response body: per-field machine-readable codes the UI maps to copy. */
export interface ContactValidationErrorBody {
  error: "validation_failed";
  fields: Partial<Record<ContactField, ContactFieldErrorCode>>;
}

/** 503 response body when no mail transport is configured. */
export interface ContactUnconfiguredBody {
  code: "EMAIL_NOT_CONFIGURED";
  message: string;
}

export interface ContactSuccessBody {
  ok: true;
}
