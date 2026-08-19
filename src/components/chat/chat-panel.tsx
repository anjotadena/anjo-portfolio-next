"use client";

import { useCallback, useRef, useState } from "react";
import type { ChatMessage } from "@/types/chat";
import { CHAT_HISTORY_MAX_TURNS, type ChatRequestBody } from "@/types/api";
import { Chip } from "@/components/ui/chip";
import { cn } from "@/components/ui/utils";
import { ChatComposer } from "./chat-composer";
import { ChatMessageItem } from "./chat-message";
import { readNdjsonStream } from "./ndjson-stream";
import type { ChatUiMessage } from "./chat-types";

const INITIAL_SUGGESTIONS = ["Experience", "Projects", "Technical skills"];

export interface ChatPanelProps {
  className?: string;
}

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/** Thin emerald-outlined circle with the "AT" mark, matching the header monogram's style. */
function AtMark() {
  return (
    <span
      aria-hidden="true"
      className="inline-flex h-16 w-16 items-center justify-center rounded-full border border-primary text-lg font-semibold text-primary"
    >
      AT
    </span>
  );
}

/**
 * The homepage centerpiece: an idle hero (heading, subline, composer,
 * suggestion chips, verification note) that turns into a running
 * conversation once a question is asked.
 *
 * This is the only fetch/streaming boundary in the app — it talks directly
 * to `POST /api/chat`, which responds with NDJSON per the fixed wire
 * protocol in `src/types/chat.ts`.
 */
export function ChatPanel({ className }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatUiMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [liveStatus, setLiveStatus] = useState("");
  const abortControllerRef = useRef<AbortController | null>(null);

  const isStreaming = messages.some((message) => message.status === "streaming");

  const updateMessage = useCallback(
    (id: string, update: (message: ChatUiMessage) => ChatUiMessage) => {
      setMessages((prev) => prev.map((message) => (message.id === id ? update(message) : message)));
    },
    [],
  );

  const ask = useCallback(
    async (question: string) => {
      const trimmed = question.trim();
      if (!trimmed) return;

      // A new question (or the stop button) always supersedes any in-flight one.
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      const userMessage: ChatUiMessage = {
        id: createId(),
        role: "user",
        content: trimmed,
        status: "complete",
      };
      const assistantId = createId();
      const assistantMessage: ChatUiMessage = {
        id: assistantId,
        role: "assistant",
        content: "",
        status: "streaming",
      };

      // `history` is prior turns only; the current question travels as `message`
      // so the server can validate it independently of the conversation.
      const history: ChatMessage[] = messages
        .filter((message) => message.status !== "error" && message.content.length > 0)
        .map((message) => ({ role: message.role, content: message.content }))
        .slice(-CHAT_HISTORY_MAX_TURNS);

      const requestBody: ChatRequestBody = { message: trimmed, history };

      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      setDraft("");
      setLiveStatus("Anjo's assistant is answering.");

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        });

        if (!response.ok || !response.body) {
          throw new Error(`Chat request failed with status ${response.status}`);
        }

        for await (const event of readNdjsonStream(response.body)) {
          switch (event.type) {
            case "meta":
              updateMessage(assistantId, (message) => ({ ...message, meta: event.meta }));
              break;
            case "delta":
              updateMessage(assistantId, (message) => ({
                ...message,
                content: message.content + event.text,
              }));
              break;
            case "done":
              updateMessage(assistantId, (message) => ({ ...message, status: "complete" }));
              break;
            case "error":
              updateMessage(assistantId, (message) => ({
                ...message,
                status: "interrupted",
                errorMessage: event.message,
              }));
              break;
          }
        }

        setLiveStatus("Answer complete.");
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          updateMessage(assistantId, (message) => ({
            ...message,
            status: "interrupted",
            errorMessage: message.content.length > 0 ? undefined : "Stopped.",
          }));
          setLiveStatus("Answer stopped.");
        } else {
          updateMessage(assistantId, (message) => ({
            ...message,
            status: "error",
            errorMessage: "Something went wrong while answering. Please try again.",
          }));
          setLiveStatus("Answer failed.");
        }
      } finally {
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
        }
      }
    },
    [messages, updateMessage],
  );

  function handleStop() {
    abortControllerRef.current?.abort();
  }

  const isIdle = messages.length === 0;

  return (
    <div className={cn("mx-auto flex w-full max-w-3xl flex-col px-4 py-12 sm:px-6", className)}>
      {/* Single live region for the whole panel: announces only start/complete/stop, never per token. */}
      <p aria-live="polite" role="status" className="sr-only">
        {liveStatus}
      </p>

      {isIdle ? (
        <div className="flex flex-1 flex-col items-center gap-6 py-12 text-center">
          <AtMark />
          <div className="flex flex-col gap-3">
            <h1 className="text-3xl font-medium text-foreground sm:text-4xl">
              Ask me anything about my work.
            </h1>
            <p className="mx-auto max-w-xl text-muted-foreground">
              Explore my experience, projects, skills, and approach to software engineering.
            </p>
          </div>

          <ChatComposer
            value={draft}
            onChange={setDraft}
            onSubmit={() => ask(draft)}
            onStop={handleStop}
            isStreaming={isStreaming}
            className="w-full max-w-xl"
          />

          <div className="flex flex-wrap justify-center gap-2">
            {INITIAL_SUGGESTIONS.map((suggestion) => (
              <Chip key={suggestion} onClick={() => ask(suggestion)}>
                {suggestion}
              </Chip>
            ))}
          </div>

          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
            Answers based on Anjo&apos;s verified portfolio.
          </p>
        </div>
      ) : (
        <div className="flex flex-1 flex-col gap-6">
          <ol className="flex flex-col gap-4" aria-label="Conversation">
            {messages.map((message) => (
              <ChatMessageItem key={message.id} message={message} onFollowUpSelect={ask} />
            ))}
          </ol>

          <ChatComposer
            value={draft}
            onChange={setDraft}
            onSubmit={() => ask(draft)}
            onStop={handleStop}
            isStreaming={isStreaming}
            className="mt-2"
          />
        </div>
      )}
    </div>
  );
}
