"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LuArrowRight } from "react-icons/lu";

import { suggestedQuestions } from "@/data/ask";
import type { AskApiResponse } from "@/lib/ask/types";
import { on } from "@/utils";

type AskState = "idle" | "loading" | "success" | "error";

type Message =
  | { role: "user"; content: string }
  | { role: "assistant"; content: string; links?: { label: string; href: string }[]; isNew?: boolean };

/**
 * Minimal dots animation for "thinking" state.
 * Respects prefers-reduced-motion via CSS.
 */
function ThinkingIndicator() {
  return (
    <div className="flex justify-start" role="status" aria-label="Loading response">
      <div className="flex items-center gap-1.5 rounded-xl bg-zinc-100 px-4 py-3 dark:bg-zinc-900">
        <span className="sr-only">Thinking</span>
        <span className="thinking-dot h-1.5 w-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500" />
        <span className="thinking-dot h-1.5 w-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500 animation-delay-150" />
        <span className="thinking-dot h-1.5 w-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500 animation-delay-300" />
      </div>
    </div>
  );
}

export function AskClient() {
  const [input, setInput] = useState("");
  const [state, setState] = useState<AskState>("idle");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Ask about projects, architecture, leadership, skills, or my resume.",
    },
  ]);

  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const canSend = input.trim().length > 0 && state !== "loading";

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, state, scrollToBottom]);

  // Clear "isNew" flag after animation completes
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === "assistant" && lastMessage.isNew) {
      const timer = setTimeout(() => {
        setMessages((prev) =>
          prev.map((m, i) => (i === prev.length - 1 && m.role === "assistant" ? { ...m, isNew: false } : m))
        );
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [messages]);

  const onSend = useCallback(
    async (question: string) => {
      const q = question.trim();
      if (!q || state === "loading") return;

      setMessages((prev) => [...prev, { role: "user", content: q }]);
      setInput("");
      setState("loading");

      try {
        const res = await fetch("/api/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: q }),
        });

        const data: AskApiResponse = await res.json();

        if (!res.ok) {
          setState("error");
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: data.answer || "Something went wrong. Please try again.", isNew: true },
          ]);
          return;
        }

        setState("success");
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.answer, links: data.links, isNew: true },
        ]);
      } catch {
        setState("error");
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Network error. Please check your connection.", isNew: true },
        ]);
      } finally {
        inputRef.current?.focus();
      }
    },
    [state]
  );

  // Handle Escape key to clear input
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        setInput("");
        inputRef.current?.blur();
      }
    },
    []
  );

  const suggestions = useMemo(() => suggestedQuestions, []);

  return (
    <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="border-b border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Ask Anjo</h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          AI-powered answers grounded in portfolio content.
        </p>
      </div>

      <div className="p-4">
        <div className="flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onSend(s)}
              disabled={state === "loading"}
              className={on(
                "rounded-full border border-zinc-200 px-3 py-1.5 text-sm text-zinc-700",
                "hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2",
                "dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-900 dark:focus:ring-zinc-50",
                "disabled:cursor-not-allowed disabled:opacity-50"
              )}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="mt-6 space-y-3" aria-live="polite" aria-atomic="false">
          {messages.map((m, idx) => (
            <div key={idx} className={on("flex", m.role === "user" ? "justify-end" : "justify-start")}>
              <div
                className={on(
                  "max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed",
                  m.role === "user"
                    ? "bg-zinc-950 text-white dark:bg-zinc-50 dark:text-zinc-950"
                    : "bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50",
                  m.role === "assistant" && "isNew" in m && m.isNew && "animate-fadeIn"
                )}
              >
                <p>{m.content}</p>
                {"links" in m && m.links && m.links.length > 0 && (
                  <div
                    className={on(
                      "mt-3 flex flex-wrap gap-2",
                      "isNew" in m && m.isNew && "animate-fadeIn animation-delay-150"
                    )}
                  >
                    {m.links.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={on(
                          "inline-flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm",
                          "hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2",
                          "dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900 dark:focus:ring-zinc-50"
                        )}
                      >
                        {link.label}
                        <LuArrowRight aria-hidden="true" />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {state === "loading" && <ThinkingIndicator />}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSend(input);
        }}
        className="border-t border-zinc-200 p-4 dark:border-zinc-800"
      >
        <label className="sr-only" htmlFor="ask-input">
          Ask a question
        </label>
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            id="ask-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a question…"
            disabled={state === "loading"}
            className={on(
              "w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900",
              "placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2",
              "dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:ring-zinc-50",
              "disabled:cursor-not-allowed disabled:opacity-50"
            )}
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={!canSend}
            className={on(
              "rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white",
              "hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 dark:focus:ring-zinc-50"
            )}
            aria-label="Send question"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}

// TODO: Streaming responses - Use OpenAI streaming API for progressive answer display
// TODO: Embeddings / vector search - Replace intent detection with semantic search for better context retrieval

