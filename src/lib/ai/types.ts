import type { ChatMessage } from "@/types/chat";

export interface StreamCompletionInput {
  system: string;
  messages: ChatMessage[];
  signal?: AbortSignal;
}

/**
 * A pluggable chat completion backend. `isConfigured` lets callers decide
 * the response `mode` (`live` vs `unconfigured`) without needing to know
 * which concrete provider is in use. Dropping a real API key in requires
 * no architectural change: `getChatProvider()` simply starts returning
 * `OpenAiCompatibleProvider` instead of `NullProvider`.
 */
export interface ChatProvider {
  readonly name: string;
  readonly isConfigured: boolean;
  streamCompletion(input: StreamCompletionInput): AsyncIterable<string>;
}
