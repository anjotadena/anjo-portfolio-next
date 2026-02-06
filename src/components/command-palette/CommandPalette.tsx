"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LuArrowRight, LuSearch, LuX } from "react-icons/lu";

import { useCommandPalette } from "@/components/command-palette/useCommandPalette";
import type { AskApiResponse } from "@/lib/ask/types";
import { on } from "@/utils";

type PaletteCta = { label: string; href: string };

type PaletteIntent = {
  id: "projects" | "architecture" | "leadership" | "resume" | "contact" | "blog" | "skills";
  title: string;
  keywords: string[];
  response: string;
  ctas: PaletteCta[];
};

type AiResponse = {
  answer: string;
  links: PaletteCta[];
  isLoading: boolean;
  error: string | null;
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
];

function matchIntents(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return intents;

  return intents
    .map((intent) => {
      const score = intent.keywords.reduce((acc, kw) => (q.includes(kw) ? acc + 2 : acc), 0) +
        (intent.title.toLowerCase().includes(q) ? 1 : 0);
      return { intent, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.intent);
}

function ThinkingIndicator() {
  return (
    <div className="flex items-center gap-1.5 py-2" role="status" aria-label="Loading response">
      <span className="sr-only">Thinking</span>
      <span className="thinking-dot h-1.5 w-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500" />
      <span className="thinking-dot h-1.5 w-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500 animation-delay-150" />
      <span className="thinking-dot h-1.5 w-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500 animation-delay-300" />
    </div>
  );
}

export function CommandPalette() {
  const { isOpen, setIsOpen, closePalette } = useCommandPalette();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<PaletteIntent | null>(null);
  const [aiResponse, setAiResponse] = useState<AiResponse>({
    answer: "",
    links: [],
    isLoading: false,
    error: null,
  });
  const inputRef = useRef<HTMLInputElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const results = useMemo(() => matchIntents(query), [query]);

  // Determine if we should use AI for this query (no matching intents or custom question)
  const shouldUseAi = query.trim().length > 0 && results.length === 0;

  const askAi = useCallback(async (question: string) => {
    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setAiResponse({ answer: "", links: [], isLoading: true, error: null });

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
        signal: controller.signal,
      });

      const data: AskApiResponse = await res.json();

      if (!res.ok) {
        setAiResponse({
          answer: "",
          links: [],
          isLoading: false,
          error: data.answer || "Something went wrong. Please try again.",
        });
        return;
      }

      setAiResponse({
        answer: data.answer,
        links: data.links || [],
        isLoading: false,
        error: null,
      });
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        return; // Request was cancelled, ignore
      }
      setAiResponse({
        answer: "",
        links: [],
        isLoading: false,
        error: "Network error. Please check your connection.",
      });
    }
  }, []);

  // Debounced AI query when no matching intents
  useEffect(() => {
    if (!shouldUseAi) {
      setAiResponse({ answer: "", links: [], isLoading: false, error: null });
      return;
    }

    const timer = setTimeout(() => {
      askAi(query);
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [query, shouldUseAi, askAi]);

  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setSelected(null);
      setAiResponse({ answer: "", links: [], isLoading: false, error: null });
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      return;
    }

    const t = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [isOpen]);

  const active = selected ?? results[0] ?? null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
        <Dialog.Content
          className={on(
            "fixed left-1/2 top-20 z-50 w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2",
            "rounded-xl border border-zinc-200 bg-white shadow-xl",
            "dark:border-zinc-800 dark:bg-zinc-950"
          )}
          aria-label="Command palette"
        >
          <div className="flex items-center justify-between gap-3 border-b border-zinc-200 p-4 dark:border-zinc-800">
            <Dialog.Title className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
              Ask me anything
            </Dialog.Title>
            <Dialog.Close
              className={on(
                "rounded-md p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900",
                "focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2",
                "dark:hover:bg-zinc-900 dark:hover:text-zinc-50 dark:focus:ring-zinc-50"
              )}
              aria-label="Close command palette"
              onClick={closePalette}
            >
              <LuX aria-hidden="true" />
            </Dialog.Close>
          </div>

          <div className="p-4">
            <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950">
              <LuSearch className="text-zinc-500" aria-hidden="true" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelected(null);
                }}
                placeholder="Try: projects, architecture, leadership, resume…"
                className={on(
                  "w-full bg-transparent text-sm text-zinc-900 placeholder:text-zinc-500",
                  "focus:outline-none dark:text-zinc-50"
                )}
                aria-label="Search"
              />
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs font-medium text-zinc-500">Quick actions</p>
                <ul className="mt-2 space-y-1">
                  {results.length === 0 ? (
                    <li className="rounded-md border border-dashed border-zinc-200 p-3 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-300">
                      {query.trim()
                        ? "AI is answering your question..."
                        : "No matches. Try \"projects\", \"architecture\", or \"resume\"."}
                    </li>
                  ) : (
                    results.map((intent) => {
                      const isActive = active?.id === intent.id;
                      return (
                        <li key={intent.id}>
                          <button
                            type="button"
                            onClick={() => setSelected(intent)}
                            className={on(
                              "w-full rounded-md px-3 py-2 text-left text-sm",
                              "hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2",
                              "dark:hover:bg-zinc-900 dark:focus:ring-zinc-50",
                              isActive
                                ? "bg-zinc-100 text-zinc-950 dark:bg-zinc-900 dark:text-zinc-50"
                                : "text-zinc-700 dark:text-zinc-200"
                            )}
                          >
                            {intent.title}
                          </button>
                        </li>
                      );
                    })
                  )}
                </ul>
              </div>

              <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
                <p className="text-xs font-medium text-zinc-500">Response</p>
                {shouldUseAi ? (
                  // AI-powered response for custom questions
                  <>
                    {aiResponse.isLoading && (
                      <>
                        <h3 className="mt-2 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                          Thinking...
                        </h3>
                        <ThinkingIndicator />
                      </>
                    )}
                    {aiResponse.error && (
                      <>
                        <h3 className="mt-2 text-sm font-semibold text-red-600 dark:text-red-400">
                          Error
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-zinc-700 dark:text-zinc-200">
                          {aiResponse.error}
                        </p>
                      </>
                    )}
                    {aiResponse.answer && !aiResponse.isLoading && (
                      <>
                        <h3 className="mt-2 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                          AI Response
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-zinc-700 dark:text-zinc-200">
                          {aiResponse.answer}
                        </p>
                        {aiResponse.links.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {aiResponse.links.map((link) => (
                              <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setIsOpen(false)}
                                className={on(
                                  "inline-flex items-center gap-2 rounded-md border border-zinc-200 px-3 py-2 text-sm",
                                  "hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2",
                                  "dark:border-zinc-800 dark:hover:bg-zinc-900 dark:focus:ring-zinc-50"
                                )}
                              >
                                {link.label}
                                <LuArrowRight aria-hidden="true" />
                              </Link>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                    {!aiResponse.isLoading && !aiResponse.answer && !aiResponse.error && (
                      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                        Asking AI...
                      </p>
                    )}
                  </>
                ) : active ? (
                  // Static response for matched intents
                  <>
                    <h3 className="mt-2 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                      {active.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-700 dark:text-zinc-200">
                      {active.response}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {active.ctas.map((cta) => (
                        <Link
                          key={cta.href}
                          href={cta.href}
                          onClick={() => setIsOpen(false)}
                          className={on(
                            "inline-flex items-center gap-2 rounded-md border border-zinc-200 px-3 py-2 text-sm",
                            "hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2",
                            "dark:border-zinc-800 dark:hover:bg-zinc-900 dark:focus:ring-zinc-50"
                          )}
                        >
                          {cta.label}
                          <LuArrowRight aria-hidden="true" />
                        </Link>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                    Start typing to see suggestions.
                  </p>
                )}
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

