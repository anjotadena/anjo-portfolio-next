"use client";

import { useCallback, useRef, useState } from "react";

import {
  ASK_ERROR_MESSAGES,
  isAskErrorResponse,
  type AskApiResponse,
  type AskErrorType,
  type AskLink,
} from "@/lib/ask/types";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  links?: AskLink[];
  isLoading?: boolean;
  error?: {
    type: AskErrorType;
    message: string;
  };
};

export type UseAskAiReturn = {
  messages: ChatMessage[];
  isLoading: boolean;
  sendMessage: (question: string) => Promise<void>;
  clearMessages: () => void;
};

export function useAskAi(): UseAskAiReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (question: string) => {
    const trimmed = question.trim();
    if (!trimmed) return;

    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmed,
    };

    const assistantId = `assistant-${Date.now()}`;
    const assistantMessage: ChatMessage = {
      id: assistantId,
      role: "assistant",
      content: "",
      isLoading: true,
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed }),
        signal: controller.signal,
      });

      const data: AskApiResponse = await res.json();

      if (isAskErrorResponse(data)) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId
              ? { ...msg, isLoading: false, error: { type: data.type, message: data.message } }
              : msg
          )
        );
        return;
      }

      if (!res.ok) {
        const errorType: AskErrorType = res.status === 429 ? "rate_limited" : "unknown_error";
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId
              ? { ...msg, isLoading: false, error: { type: errorType, message: ASK_ERROR_MESSAGES[errorType] } }
              : msg
          )
        );
        return;
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantId
            ? { ...msg, content: data.answer, links: data.links, isLoading: false }
            : msg
        )
      );
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantId
            ? {
                ...msg,
                isLoading: false,
                error: { type: "network_error" as AskErrorType, message: ASK_ERROR_MESSAGES.network_error },
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
  };
}
