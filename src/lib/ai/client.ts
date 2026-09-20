import "server-only";
import { getEnv } from "@/lib/config/env";
import { ExtractiveProvider } from "./extractive-provider";
import { OpenAIResponsesProvider } from "./openai-provider";
import type { ChatProvider } from "./types";

let provider: ChatProvider | null = null;

/**
 * The only place that decides which concrete `ChatProvider` runs. The
 * mode comes from the validated environment (`AI_PROVIDER` / presence of
 * `OPENAI_API_KEY`), so callers just work against the interface.
 */
export function getChatProvider(): ChatProvider {
  if (provider) return provider;
  const env = getEnv();
  provider =
    env.ai.mode === "openai"
      ? new OpenAIResponsesProvider({
          apiKey: env.ai.apiKey!,
          model: env.ai.model,
          baseUrl: env.ai.baseUrl,
          timeoutMs: env.ai.requestTimeoutMs,
        })
      : new ExtractiveProvider({ chunkDelayMs: env.chat.streamDelayMs });
  return provider;
}

/** Test hook. */
export function resetChatProvider(): void {
  provider = null;
}
