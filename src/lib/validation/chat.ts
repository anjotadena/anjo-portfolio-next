import { z } from "zod";
import { CHAT_HISTORY_MAX_TURNS, CHAT_MESSAGE_MAX_LENGTH } from "@/types/api";

export const chatHistoryTurnSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1, "content is required").max(4000, "content is too long"),
});

/**
 * `role` is restricted to `user`/`assistant` at the schema level, so any
 * client-supplied `role: "system"` (or anything else) is rejected here,
 * upstream of prompt construction -- never merely filtered out silently
 * downstream. Shape and limits mirror `ChatRequestBody` /
 * `CHAT_MESSAGE_MAX_LENGTH` / `CHAT_HISTORY_MAX_TURNS` in
 * `src/types/api.ts`, the canonical contract shared with the client.
 */
export const chatRequestSchema = z.object({
  message: z
    .string()
    .min(1, "message is required")
    .max(CHAT_MESSAGE_MAX_LENGTH, `message must be ${CHAT_MESSAGE_MAX_LENGTH} characters or fewer`),
  history: z
    .array(chatHistoryTurnSchema)
    .max(CHAT_HISTORY_MAX_TURNS, `history is limited to ${CHAT_HISTORY_MAX_TURNS} turns`)
    .optional()
    .default([]),
});

export interface FieldError {
  field: string;
  code: string;
  message: string;
}

export function toFieldErrors(error: z.ZodError): FieldError[] {
  return error.issues.map((issue) => ({
    field: issue.path.length > 0 ? issue.path.join(".") : "root",
    code: issue.code,
    message: issue.message,
  }));
}
