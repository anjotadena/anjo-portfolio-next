import { NullProvider } from "./null-provider";
import { OpenAiCompatibleProvider } from "./openai-provider";
import type { ChatProvider } from "./types";

/**
 * Selects the active `ChatProvider` for a request: the OpenAI-compatible
 * provider when an API key is present in the environment, otherwise the
 * inert `NullProvider`. This is the only place that decides which
 * concrete provider is used — callers just work against the `ChatProvider`
 * interface.
 */
export function getChatProvider(): ChatProvider {
  const apiKey = process.env.OPENAI_API_KEY;
  if (apiKey && apiKey.trim().length > 0) {
    return new OpenAiCompatibleProvider({ apiKey });
  }
  return new NullProvider();
}
