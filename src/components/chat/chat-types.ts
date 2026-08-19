import type { ChatStreamMeta } from "@/types/chat";

export type ChatMessageStatus = "streaming" | "complete" | "interrupted" | "error";

/** A message as rendered in the chat UI — a superset of the wire `ChatMessage` shape. */
export interface ChatUiMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  status: ChatMessageStatus;
  /** Present once the `meta` frame for an assistant message has arrived. */
  meta?: ChatStreamMeta;
  /** Set when `status` is `"error"` or an in-band error frame arrived. */
  errorMessage?: string;
}
