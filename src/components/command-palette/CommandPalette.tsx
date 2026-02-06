"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LuArrowRight, LuSend, LuX } from "react-icons/lu";

import { useCommandPalette } from "@/components/command-palette/useCommandPalette";
import type { AskApiResponse } from "@/lib/ask/types";
import { on } from "@/utils";

type PaletteCta = { label: string; href: string };

type PaletteIntent = {
  id: "projects" | "architecture" | "leadership" | "resume" | "contact" | "blog" | "skills" | "recruiter";
  title: string;
  keywords: string[];
  response: string;
  ctas: PaletteCta[];
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  links?: PaletteCta[];
  isLoading?: boolean;
  error?: string;
};

const intents: PaletteIntent[] = [
  {
    id: "projects",
    title: "Projects",
    keywords: ["project", "projects", "impact", "case study", "work", "portfolio"],
    response:
      "I build and ship production systems end-to-end. Browse a few curated projects with scope, architecture, trade-offs, and measurable impact.",
    ctas: [
      { label: "View projects", href: "/projects" },
      { label: "Featured on home", href: "/" },
    ],
  },
  {
    id: "architecture",
    title: "Architecture",
    keywords: ["architecture", "design", "system design", "patterns", "principles", "scaling"],
    response:
      "I prefer boring, scalable architecture: explicit boundaries, observable systems, and pragmatic trade-offs. Here are the principles and patterns I reach for most.",
    ctas: [{ label: "Architecture", href: "/architecture" }],
  },
  {
    id: "leadership",
    title: "Leadership",
    keywords: ["leadership", "mentoring", "mentorship", "reviews", "code review", "team"],
    response:
      "I lead by clarity and ownership: aligning on outcomes, unblocking quickly, and raising the bar through feedback and coaching.",
    ctas: [{ label: "Leadership", href: "/leadership" }],
  },
  {
    id: "blog",
    title: "Blog",
    keywords: ["blog", "writing", "posts", "thoughts", "notes"],
    response: "Short notes on engineering practice, architecture, and leading teams.",
    ctas: [{ label: "Read posts", href: "/blog" }],
  },
  {
    id: "contact",
    title: "Contact",
    keywords: ["contact", "email", "linkedin", "github", "reach", "hire"],
    response:
      "Want to collaborate? The contact page has email + profiles, plus a resume download.",
    ctas: [{ label: "Contact", href: "/contact" }],
  },
  {
    id: "resume",
    title: "Resume",
    keywords: ["resume", "cv", "download", "pdf"],
    response: "Download the latest resume PDF.",
    ctas: [{ label: "Download resume", href: "/anjo_tadena_software_engineer_resume.pdf" }],
  },
  {
    id: "skills",
    title: "Skills",
    keywords: ["skills", "tech", "technologies", "stack", "experience", "languages"],
    response: "Full-stack expertise across TypeScript, React, Node.js, cloud infrastructure, and more.",
    ctas: [
      { label: "About", href: "/about" },
      { label: "Projects", href: "/projects" },
    ],
  },
  {
    id: "recruiter",
    title: "Recruiter / Investor",
    keywords: ["recruiter", "recruiting", "hiring", "investor", "investment", "job", "opportunity", "position", "role", "fit", "match", "candidate"],
    response: "Looking to evaluate fit? Use the Job Match tool to paste a job description or link and get an honest assessment of alignment, plus a tailored resume.",
    ctas: [
      { label: "Job Match Tool", href: "/match" },
      { label: "Download Resume", href: "/anjo_tadena_software_engineer_resume.pdf" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

function matchIntent(query: string): PaletteIntent | null {
  const q = query.trim().toLowerCase();
  if (!q) return null;

  const matches = intents
    .map((intent) => {
      const score = intent.keywords.reduce((acc, kw) => (q.includes(kw) ? acc + 2 : acc), 0) +
        (intent.title.toLowerCase().includes(q) ? 1 : 0);
      return { intent, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  return matches[0]?.intent ?? null;
}

function ThinkingIndicator() {
  return (
    <div className="flex items-center gap-1.5" role="status" aria-label="Loading response">
      <span className="sr-only">Thinking</span>
      <span className="thinking-dot h-1.5 w-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500" />
      <span className="thinking-dot h-1.5 w-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500 animation-delay-150" />
      <span className="thinking-dot h-1.5 w-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500 animation-delay-300" />
    </div>
  );
}

function QuickActionChip({ intent, onClick }: { intent: PaletteIntent; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={on(
        "rounded-full border border-zinc-200 px-3 py-1.5 text-xs font-medium",
        "text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-900",
        "focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2",
        "dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 dark:focus:ring-zinc-50"
      )}
    >
      {intent.title}
    </button>
  );
}

export function CommandPalette() {
  const { isOpen, setIsOpen, closePalette } = useCommandPalette();
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const askAi = useCallback(async (question: string, messageId: string) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
        signal: controller.signal,
      });

      const data: AskApiResponse = await res.json();

      if (!res.ok) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId
              ? { ...msg, isLoading: false, error: data.answer || "Something went wrong." }
              : msg
          )
        );
        return;
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? { ...msg, content: data.answer, links: data.links || [], isLoading: false }
            : msg
        )
      );
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        return;
      }
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? { ...msg, isLoading: false, error: "Network error. Please try again." }
            : msg
        )
      );
    }
  }, []);

  const handleSubmit = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: trimmed,
      };

      const matchedIntent = matchIntent(trimmed);
      const assistantId = `assistant-${Date.now()}`;

      if (matchedIntent) {
        const assistantMessage: ChatMessage = {
          id: assistantId,
          role: "assistant",
          content: matchedIntent.response,
          links: matchedIntent.ctas,
        };
        setMessages((prev) => [...prev, userMessage, assistantMessage]);
      } else {
        const assistantMessage: ChatMessage = {
          id: assistantId,
          role: "assistant",
          content: "",
          isLoading: true,
        };
        setMessages((prev) => [...prev, userMessage, assistantMessage]);
        askAi(trimmed, assistantId);
      }

      setQuery("");
    },
    [askAi]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(query);
      }
    },
    [query, handleSubmit]
  );

  const handleQuickAction = useCallback(
    (intent: PaletteIntent) => {
      handleSubmit(intent.title);
    },
    [handleSubmit]
  );

  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setMessages([]);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      return;
    }

    const t = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [isOpen]);

  const showQuickActions = messages.length === 0;

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
        <Dialog.Content
          className={on(
            "fixed left-1/2 top-1/2 z-50 flex h-[min(600px,80vh)] w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 flex-col",
            "rounded-xl border border-zinc-200 bg-white shadow-xl",
            "dark:border-zinc-800 dark:bg-zinc-950"
          )}
          aria-label="Chat with AI"
        >
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
            <Dialog.Title className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
              Ask me anything
            </Dialog.Title>
            <Dialog.Close
              className={on(
                "rounded-md p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900",
                "focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2",
                "dark:hover:bg-zinc-900 dark:hover:text-zinc-50 dark:focus:ring-zinc-50"
              )}
              aria-label="Close"
              onClick={closePalette}
            >
              <LuX size={16} aria-hidden="true" />
            </Dialog.Close>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {showQuickActions ? (
              <div className="flex h-full flex-col items-center justify-center gap-4">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Try asking about...
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {intents.map((intent) => (
                    <QuickActionChip
                      key={intent.id}
                      intent={intent}
                      onClick={() => handleQuickAction(intent)}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={on(
                      "flex",
                      message.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={on(
                        "max-w-[85%] rounded-2xl px-4 py-2.5",
                        message.role === "user"
                          ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                          : "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
                      )}
                    >
                      {message.isLoading ? (
                        <ThinkingIndicator />
                      ) : message.error ? (
                        <p className="text-sm text-red-600 dark:text-red-400">{message.error}</p>
                      ) : (
                        <>
                          <p className="text-sm leading-relaxed">{message.content}</p>
                          {message.links && message.links.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {message.links.map((link) => (
                                <Link
                                  key={link.href}
                                  href={link.href}
                                  onClick={() => setIsOpen(false)}
                                  className={on(
                                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
                                    "bg-white/20 hover:bg-white/30",
                                    "dark:bg-zinc-700 dark:hover:bg-zinc-600"
                                  )}
                                >
                                  {link.label}
                                  <LuArrowRight size={12} aria-hidden="true" />
                                </Link>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input area */}
          <div className="shrink-0 border-t border-zinc-200 p-4 dark:border-zinc-800">
            <div className="flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2 dark:border-zinc-700 dark:bg-zinc-900">
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about projects, skills, experience..."
                className={on(
                  "flex-1 bg-transparent text-sm text-zinc-900 placeholder:text-zinc-500",
                  "focus:outline-none dark:text-zinc-50 dark:placeholder:text-zinc-400"
                )}
                aria-label="Message"
              />
              <button
                type="button"
                onClick={() => handleSubmit(query)}
                disabled={!query.trim()}
                className={on(
                  "rounded-full p-2 transition-colors",
                  "text-zinc-400 hover:text-zinc-600 disabled:opacity-50 disabled:hover:text-zinc-400",
                  "dark:text-zinc-500 dark:hover:text-zinc-300 dark:disabled:hover:text-zinc-500"
                )}
                aria-label="Send message"
              >
                <LuSend size={16} aria-hidden="true" />
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

