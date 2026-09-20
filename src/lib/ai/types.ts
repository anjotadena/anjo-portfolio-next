import type { ChatMessage, ChatUsage } from "@/types/chat";

export interface ProviderContextBlock {
  index: number;
  title: string;
  section: string | null;
  text: string;
}

export interface StreamCompletionInput {
  system: string;
  messages: ChatMessage[];
  /** The retrieved context, already rendered into `system`; also passed structurally for extractive providers. */
  context: ProviderContextBlock[];
  maxOutputTokens: number;
  signal?: AbortSignal;
}

export type ProviderEvent =
  | { type: "text"; text: string }
  | { type: "usage"; usage: ChatUsage }
  | { type: "finish"; reason: "stop" | "length" };

/**
 * A pluggable answer backend. The chat route only depends on this
 * interface; `getChatProvider()` picks the concrete implementation from
 * the validated environment.
 */
export interface ChatProvider {
  readonly name: string;
  /** True when a real language model backs the answers. */
  readonly isModelBacked: boolean;
  stream(input: StreamCompletionInput): AsyncIterable<ProviderEvent>;
}
