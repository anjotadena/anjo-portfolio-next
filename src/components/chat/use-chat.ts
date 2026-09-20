"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ApiErrorBody, ChatMessage, ChatRequestBody } from "@/types/chat";
import { CHAT_HISTORY_MAX_TURNS } from "@/types/chat";
import { track } from "@/lib/analytics/track";
import { setAppBusy } from "@/lib/pwa/activity";
import { readNdjsonStream } from "./ndjson-stream";
import type { ChatError, ChatUiMessage } from "./chat-types";

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/** Per-tab persistence so a reload (e.g. an automatic app update) keeps the conversation. */
const STORAGE_KEY = "anjo-ai:conversation";
const STORAGE_MAX_MESSAGES = 40;

function readStoredConversation(): ChatUiMessage[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ChatUiMessage[];
    return Array.isArray(parsed) ? parsed.filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string") : [];
  } catch {
    return [];
  }
}

function writeStoredConversation(messages: ChatUiMessage[]): void {
  try {
    const settled = messages.filter((m) => m.status !== "streaming").slice(-STORAGE_MAX_MESSAGES);
    if (settled.length === 0) sessionStorage.removeItem(STORAGE_KEY);
    else sessionStorage.setItem(STORAGE_KEY, JSON.stringify(settled));
  } catch {
    // Storage can be unavailable (private mode, quota); persistence is best-effort.
  }
}

const FRIENDLY_ERRORS: Record<string, string> = {
  RATE_LIMITED: "You're sending messages a little fast. Please wait a moment and try again.",
  PROVIDER_ERROR: "The AI service is unavailable right now. Please try again shortly.",
  RETRIEVAL_ERROR: "The knowledge base is temporarily unavailable. Please try again.",
  REQUEST_TOO_LARGE: "That message is too long. Please shorten it.",
  VALIDATION_ERROR: "That message couldn't be sent. Please rephrase and try again.",
  NETWORK: "You appear to be offline. Check your connection and try again.",
};

export interface UseChatOptions {
  /** Seeds retrieval with a document (e.g. "Ask AI about this project"). */
  contextSlug?: string;
}

export interface UseChatResult {
  messages: ChatUiMessage[];
  isStreaming: boolean;
  liveStatus: string;
  ask: (question: string, source?: "typed" | "suggested" | "followup" | "retry") => Promise<void>;
  stop: () => void;
  regenerate: () => Promise<void>;
  retry: (assistantId: string) => Promise<void>;
  reset: () => void;
}

/**
 * All chat transport state in one hook: history management, the NDJSON
 * stream loop, abort/stop, retry/regenerate, and the single `aria-live`
 * status string (announced at start/complete/stop — never per token).
 */
export function useChat(options: UseChatOptions = {}): UseChatResult {
  const [messages, setMessages] = useState<ChatUiMessage[]>([]);
  const [liveStatus, setLiveStatus] = useState("");
  const abortRef = useRef<AbortController | null>(null);
  // Latest messages for event handlers without re-creating callbacks per render.
  const messagesRef = useRef<ChatUiMessage[]>([]);
  // Persist only after the restore below has run, otherwise the initial
  // empty state would wipe the stored conversation before it is read.
  const restoredRef = useRef(false);
  useEffect(() => {
    messagesRef.current = messages;
    if (restoredRef.current) writeStoredConversation(messages);
  }, [messages]);

  // Restore the previous conversation after hydration (a synchronous
  // setState here would be a hydration mismatch, so it is deferred).
  useEffect(() => {
    const stored = readStoredConversation();
    queueMicrotask(() => {
      if (stored.length > 0) setMessages((current) => (current.length === 0 ? stored : current));
      restoredRef.current = true;
    });
  }, []);

  const isStreaming = messages.some((message) => message.status === "streaming");
  useEffect(() => {
    setAppBusy(isStreaming);
    return () => setAppBusy(false);
  }, [isStreaming]);

  const update = useCallback((id: string, fn: (message: ChatUiMessage) => ChatUiMessage) => {
    setMessages((prev) => prev.map((message) => (message.id === id ? fn(message) : message)));
  }, []);

  const run = useCallback(
    async (question: string, historySource: ChatUiMessage[], assistantId: string) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const history: ChatMessage[] = historySource
        .filter((message) => message.status !== "error" && message.content.length > 0)
        .map((message) => ({ role: message.role, content: message.content }))
        .slice(-CHAT_HISTORY_MAX_TURNS);

      const body: ChatRequestBody = { message: question, history, ...(options.contextSlug ? { contextSlug: options.contextSlug } : {}) };
      setLiveStatus("Anjo AI is answering.");

      try {
        let response: Response;
        try {
          response = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
            signal: controller.signal,
          });
        } catch (error) {
          if (error instanceof DOMException && error.name === "AbortError") throw error;
          throw { code: "NETWORK", message: FRIENDLY_ERRORS.NETWORK ?? "You appear to be offline." } satisfies ChatError;
        }

        if (!response.ok || !response.body) {
          let code = "UNKNOWN";
          try {
            code = ((await response.json()) as ApiErrorBody).code ?? code;
          } catch {
            // non-JSON error body
          }
          const retryAfter = Number(response.headers.get("retry-after") ?? "0");
          throw { code, message: FRIENDLY_ERRORS[code] ?? "Something went wrong. Please try again.", retryAfterSeconds: retryAfter || undefined } satisfies ChatError;
        }

        for await (const event of readNdjsonStream(response.body)) {
          switch (event.type) {
            case "meta":
              update(assistantId, (message) => ({ ...message, meta: event.meta }));
              break;
            case "delta":
              update(assistantId, (message) => ({ ...message, content: message.content + event.text }));
              break;
            case "done":
              update(assistantId, (message) => ({ ...message, status: "complete", usage: event.usage, finishReason: event.finishReason }));
              break;
            case "error":
              update(assistantId, (message) => ({ ...message, status: "interrupted", errorMessage: event.message }));
              break;
          }
        }
        // If the stream ended without a `done`, treat it as interrupted.
        update(assistantId, (message) => (message.status === "streaming" ? { ...message, status: "interrupted", errorMessage: "The connection dropped before the answer finished." } : message));
        setLiveStatus("Answer complete.");
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          update(assistantId, (message) => ({ ...message, status: "interrupted", errorMessage: message.content.length > 0 ? undefined : "Stopped." }));
          setLiveStatus("Answer stopped.");
        } else {
          const chatError = error as ChatError;
          update(assistantId, (message) => ({ ...message, status: "error", errorMessage: chatError.message ?? FRIENDLY_ERRORS.PROVIDER_ERROR }));
          setLiveStatus("Answer failed.");
        }
      } finally {
        if (abortRef.current === controller) abortRef.current = null;
      }
    },
    [options.contextSlug, update],
  );

  const ask = useCallback(
    async (question: string, source: "typed" | "suggested" | "followup" | "retry" = "typed") => {
      const trimmed = question.trim();
      if (!trimmed) return;
      const prior = messagesRef.current;
      if (prior.length === 0) track("chat_started");
      track("question_submitted", { source, length: trimmed.length });

      const userMessage: ChatUiMessage = { id: createId(), role: "user", content: trimmed, status: "complete", createdAt: Date.now() };
      const assistantId = createId();
      const assistantMessage: ChatUiMessage = { id: assistantId, role: "assistant", content: "", status: "streaming", createdAt: Date.now(), question: trimmed };
      setMessages((prev) => [...prev.filter((m) => m.status !== "streaming"), userMessage, assistantMessage]);
      await run(trimmed, prior, assistantId);
    },
    [run],
  );

  const stop = useCallback(() => abortRef.current?.abort(), []);

  const retry = useCallback(
    async (assistantId: string) => {
      const current = messagesRef.current;
      const index = current.findIndex((message) => message.id === assistantId);
      const target = current[index];
      if (!target || target.role !== "assistant" || !target.question) return;
      const history = current.slice(0, Math.max(0, index - 1));
      const newId = createId();
      setMessages([...current.slice(0, index), { ...target, id: newId, content: "", status: "streaming", meta: undefined, errorMessage: undefined, usage: undefined, createdAt: Date.now() }]);
      track("question_submitted", { source: "retry", length: target.question.length });
      await run(target.question, history, newId);
    },
    [run],
  );

  const regenerate = useCallback(async () => {
    const last = [...messagesRef.current].reverse().find((message) => message.role === "assistant");
    if (last) await retry(last.id);
  }, [retry]);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    setLiveStatus("New conversation started.");
  }, []);

  return { messages, isStreaming, liveStatus, ask, stop, regenerate, retry, reset };
}
