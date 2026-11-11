"use client";

import { createContext, useContext } from "react";
import type { AskSource } from "@/components/chat/use-chat";

export type AssistantOpenSource = "launcher" | "cta" | "deeplink" | "search";

export interface AskAboutOptions {
  /** Seeds retrieval with a public document (e.g. the project the visitor is reading). */
  contextSlug?: string;
  source?: Extract<AskSource, "cta" | "deeplink" | "suggested">;
}

/**
 * Stable actions — consumed by "Ask Anjo AI" buttons all over the site. The
 * value never changes identity, so those buttons never re-render while an
 * answer streams.
 */
export interface AssistantActions {
  open: (source?: AssistantOpenSource) => void;
  close: () => void;
  toggle: () => void;
  /**
   * Opens the widget and submits an explicit question. If an answer is
   * already streaming, the question is placed in the composer instead so it
   * never cancels or races the active request.
   */
  askAbout: (question: string, options?: AskAboutOptions) => void;
}

export const AssistantActionsContext = createContext<AssistantActions | null>(null);

export function useAssistantActions(): AssistantActions | null {
  return useContext(AssistantActionsContext);
}
