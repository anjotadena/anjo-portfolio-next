import { z } from "zod";
import { CHAT_HISTORY_MAX_TURNS, CHAT_HISTORY_TURN_MAX_LENGTH, CHAT_MESSAGE_MAX_LENGTH } from "@/types/chat";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Strips control characters (except newlines/tabs) that have no business in a chat message. */
function stripControlChars(value: string): string {
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");
}

export const chatHistoryTurnSchema = z.object({
  // `role` is restricted at the schema level, so a client-supplied
  // `role: "system"` is rejected here, upstream of prompt construction.
  role: z.enum(["user", "assistant"]),
  content: z.string().transform(stripControlChars).pipe(z.string().min(1).max(CHAT_HISTORY_TURN_MAX_LENGTH)),
});

export const chatRequestSchema = z
  .object({
    message: z
      .string()
      .transform((value) => stripControlChars(value).trim())
      .pipe(z.string().min(1, "message is required").max(CHAT_MESSAGE_MAX_LENGTH, `message must be ${CHAT_MESSAGE_MAX_LENGTH} characters or fewer`)),
    history: z.array(chatHistoryTurnSchema).max(CHAT_HISTORY_MAX_TURNS, `history is limited to ${CHAT_HISTORY_MAX_TURNS} turns`).optional().default([]),
    contextSlug: z.string().regex(SLUG_PATTERN).max(80).optional(),
  })
  .strict();

export type ChatRequestInput = z.infer<typeof chatRequestSchema>;

export const searchRequestSchema = z.object({
  q: z
    .string()
    .transform((value) => stripControlChars(value).trim())
    .pipe(z.string().min(1, "query is required").max(200, "query must be 200 characters or fewer")),
  limit: z.coerce.number().int().min(1).max(20).optional().default(10),
});

export interface FieldError {
  field: string;
  message: string;
}

export function toFieldErrors(error: z.ZodError): FieldError[] {
  return error.issues.map((issue) => ({
    field: issue.path.length > 0 ? issue.path.join(".") : "root",
    message: issue.message,
  }));
}
