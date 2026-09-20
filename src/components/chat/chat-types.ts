import type { ChatStreamMeta, ChatUsage } from "@/types/chat";

export type ChatMessageStatus = "streaming" | "complete" | "interrupted" | "error";

/** A message as rendered in the chat UI — a superset of the wire `ChatMessage` shape. */
export interface ChatUiMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  status: ChatMessageStatus;
  createdAt: number;
  /** Present once the `meta` frame for an assistant message has arrived. */
  meta?: ChatStreamMeta;
  usage?: ChatUsage;
  finishReason?: "stop" | "length" | "timeout";
  /** Set when `status` is `"error"` or `"interrupted"`. */
  errorMessage?: string;
  /** For retry: the user question this assistant message answered. */
  question?: string;
}

export interface ChatError {
  code: string;
  message: string;
  retryAfterSeconds?: number;
}
