"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { LuDownload, LuExternalLink, LuGithub, LuLinkedin, LuMail, LuSend, LuX } from "react-icons/lu";

import { useCommandPalette } from "@/components/command-palette/useCommandPalette";
import { InlineError } from "@/components/ui/ErrorMessage";
import { site } from "@/config/site";
import { projects } from "@/data/projects";
import {
  ASK_ERROR_MESSAGES,
  isAskErrorResponse,
  type AskApiResponse,
  type AskErrorType,
} from "@/lib/ask/types";
import type { MatchJobResponse } from "@/lib/match-job/types";
import { on } from "@/utils";

type IntentId = "projects" | "architecture" | "leadership" | "resume" | "contact" | "blog" | "skills" | "recruiter" | "match-job";

type PaletteIntent = {
  id: IntentId;
  title: string;
  keywords: string[];
  response: string;
  richContent?: boolean;
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  intentId?: IntentId;
  isLoading?: boolean;
  error?: {
    type: AskErrorType;
    message: string;
  };
};

const intents: PaletteIntent[] = [
  {
    id: "projects",
    title: "Projects",
    keywords: ["project", "projects", "impact", "case study", "work", "portfolio"],
    response: "Here are the projects I've worked on, with details on scope, architecture, and impact:",
    richContent: true,
  },
  {
    id: "architecture",
    title: "Architecture",
    keywords: ["architecture", "design", "system design", "patterns", "principles", "scaling"],
    response: "I prefer boring, scalable architecture: explicit boundaries, observable systems, and pragmatic trade-offs. Here are the principles I reach for most:",
    richContent: true,
  },
  {
    id: "leadership",
    title: "Leadership",
    keywords: ["leadership", "mentoring", "mentorship", "reviews", "code review", "team"],
    response: "I lead by clarity and ownership: aligning on outcomes, unblocking quickly, and raising the bar through feedback and coaching.",
    richContent: true,
  },
  {
    id: "blog",
    title: "Blog",
    keywords: ["blog", "writing", "posts", "thoughts", "notes"],
    response: "Short notes on engineering practice, architecture, and leading teams. Blog content coming soon!",
    richContent: false,
  },
  {
    id: "contact",
    title: "Contact",
    keywords: ["contact", "email", "linkedin", "github", "reach", "hire"],
    response: "Want to collaborate? Here's how you can reach me:",
    richContent: true,
  },
  {
    id: "resume",
    title: "Resume",
    keywords: ["resume", "cv", "download", "pdf"],
    response: "Here's my resume:",
    richContent: true,
  },
  {
    id: "skills",
    title: "Skills",
    keywords: ["skills", "tech", "technologies", "stack", "experience", "languages"],
    response: "Full-stack expertise across multiple technologies and platforms:",
    richContent: true,
  },
  {
    id: "recruiter",
    title: "Recruiter / Investor",
    keywords: ["recruiter", "recruiting", "hiring", "investor", "investment"],
    response: "Looking to evaluate fit? Here's what you need to know:",
    richContent: true,
  },
  {
    id: "match-job",
    title: "Match Job",
    keywords: ["match", "job", "fit", "position", "role", "candidate", "opportunity", "evaluate"],
    response: "Paste a job description or URL to see how well I match:",
    richContent: true,
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

const skillCategories = [
  {
    name: "Languages",
    skills: ["TypeScript", "JavaScript", "Python", "Go", "SQL"],
  },
  {
    name: "Frontend",
    skills: ["React", "Next.js", "Angular", "Tailwind CSS", "HTML/CSS"],
  },
  {
    name: "Backend",
    skills: ["Node.js", "Express", "NestJS", "Laravel", "REST APIs", "GraphQL"],
  },
  {
    name: "Cloud & DevOps",
    skills: ["AWS", "Azure", "Terraform", "Kubernetes", "Docker", "CI/CD"],
  },
  {
    name: "Databases",
    skills: ["PostgreSQL", "MySQL", "MongoDB", "Redis", "OpenSearch"],
  },
];

const architecturePrinciples = [
  {
    title: "Explicit Boundaries",
    description: "Clear separation of concerns with well-defined interfaces between services and modules.",
  },
  {
    title: "Observable Systems",
    description: "Built-in logging, metrics, and tracing for visibility into system behavior and quick debugging.",
  },
  {
    title: "Pragmatic Trade-offs",
    description: "Choosing the right tool for the job, balancing simplicity with scalability needs.",
  },
  {
    title: "Event-Driven When Needed",
    description: "Async communication for decoupling, but synchronous when consistency matters.",
  },
];

const leadershipPrinciples = [
  {
    title: "Clarity & Alignment",
    description: "Ensuring everyone understands the 'why' behind decisions and the outcomes we're working toward.",
  },
  {
    title: "Unblock Quickly",
    description: "Proactively removing blockers and making decisions to keep the team moving forward.",
  },
  {
    title: "Raise the Bar",
    description: "Thorough code reviews, constructive feedback, and coaching to grow the team's capabilities.",
  },
  {
    title: "Ownership Mindset",
    description: "Taking responsibility for outcomes, not just tasks. Thinking beyond the immediate scope.",
  },
];

function ProjectCard({ project }: { project: typeof projects[0] }) {
  return (
    <div className="group flex gap-4 border-b border-zinc-100 pb-3 transition-colors last:border-0 dark:border-zinc-800">
      {project.image && (
        <div className="relative h-16 w-24 shrink-0 overflow-hidden">
          <Image
            src={project.image}
            alt={project.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="96px"
          />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{project.name}</h4>
        <p className="mt-0.5 text-[11px] text-zinc-400 dark:text-zinc-500">{project.role}</p>
        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">{project.impact}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {project.stack.slice(0, 3).map((tech) => (
            <span
              key={tech}
              className="text-[10px] text-zinc-400 dark:text-zinc-500"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function ContactInfo() {
  return (
    <div className="stagger-children space-y-1">
      <a
        href={`mailto:${site.links.email}`}
        className="flex items-center gap-3 py-2 text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        <LuMail className="h-4 w-4" />
        <span className="text-sm">{site.links.email}</span>
      </a>
      <a
        href={site.links.linkedin}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 py-2 text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        <LuLinkedin className="h-4 w-4" />
        <span className="text-sm">LinkedIn</span>
        <LuExternalLink className="ml-auto h-3 w-3 opacity-50" />
      </a>
      <a
        href={site.links.github}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 py-2 text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        <LuGithub className="h-4 w-4" />
        <span className="text-sm">GitHub</span>
        <LuExternalLink className="ml-auto h-3 w-3 opacity-50" />
      </a>
    </div>
  );
}

function ResumeDownload() {
  return (
    <a
      href={site.links.resumePdf}
      download
      className="animate-scale-in inline-flex items-center gap-2 border border-zinc-200 px-4 py-2 text-sm text-zinc-700 transition-all hover:border-zinc-400 hover:text-zinc-900 active:scale-[0.98] dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-500 dark:hover:text-zinc-100"
    >
      <LuDownload className="h-4 w-4" />
      Download Resume
    </a>
  );
}

function SkillsGrid() {
  return (
    <div className="stagger-children space-y-3">
      {skillCategories.map((category) => (
        <div key={category.name}>
          <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">{category.name}</p>
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            {category.skills.map((skill) => (
              <span
                key={skill}
                className="text-xs text-zinc-600 dark:text-zinc-400"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function PrinciplesList({ principles }: { principles: { title: string; description: string }[] }) {
  return (
    <div className="stagger-children space-y-3">
      {principles.map((principle) => (
        <div
          key={principle.title}
          className="border-b border-zinc-100 pb-3 last:border-0 dark:border-zinc-800"
        >
          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{principle.title}</p>
          <p className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
            {principle.description}
          </p>
        </div>
      ))}
    </div>
  );
}

function RecruiterInfo() {
  return (
    <div className="space-y-4">
      <div className="animate-fade-in space-y-2 text-xs text-zinc-500 dark:text-zinc-400">
        <p>Senior Software Engineer / Lead Developer</p>
        <p>8+ years shipping production systems</p>
        <p>Full-stack: TypeScript, React, Node.js, Cloud</p>
      </div>
      <div className="flex items-center gap-3">
        <ResumeDownload />
      </div>
      <div className="border-t border-zinc-100 pt-3 dark:border-zinc-800">
        <ContactInfo />
      </div>
    </div>
  );
}

function MatchJobForm() {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<MatchJobResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const isUrl = trimmed.startsWith("http://") || trimmed.startsWith("https://");
      const body = isUrl ? { jobUrl: trimmed } : { jobDescription: trimmed };

      const res = await fetch("/api/match-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }

      setResult(data as MatchJobResponse);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case "Strong Match":
        return "text-emerald-600 dark:text-emerald-400";
      case "Partial Match":
        return "text-amber-600 dark:text-amber-400";
      default:
        return "text-zinc-500 dark:text-zinc-400";
    }
  };

  if (result) {
    return (
      <div className="space-y-4">
        {/* Score and Verdict */}
        <div className="flex items-center justify-between">
          <div>
            <p className={on("text-2xl font-semibold", getVerdictColor(result.verdict))}>
              {result.matchScore}%
            </p>
            <p className={on("text-sm", getVerdictColor(result.verdict))}>{result.verdict}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setResult(null);
              setInput("");
            }}
            className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
          >
            Try another
          </button>
        </div>

        {/* Summary */}
        <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{result.summary}</p>

        {/* Strengths */}
        {result.strengths.length > 0 && (
          <div>
            <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Strengths
            </p>
            <ul className="space-y-1">
              {result.strengths.map((strength, i) => (
                <li key={i} className="text-xs text-zinc-600 dark:text-zinc-400">
                  {strength}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Gaps */}
        {result.gaps.length > 0 && (
          <div>
            <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Gaps
            </p>
            <ul className="space-y-1">
              {result.gaps.map((gap, i) => (
                <li key={i} className="text-xs text-zinc-600 dark:text-zinc-400">
                  {gap}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Download Tailored Resume */}
        <a
          href={`/api/match-job/resume/${result.resumeVariantId}`}
          download
          className="inline-flex items-center gap-2 border border-zinc-200 px-3 py-1.5 text-xs text-zinc-600 transition-all hover:border-zinc-400 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-500 dark:hover:text-zinc-200"
        >
          <LuDownload className="h-3 w-3" />
          Download Tailored Resume
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Paste job description or URL here..."
        rows={4}
        className="w-full resize-none rounded-lg border-0 bg-zinc-50 px-3 py-2 text-sm text-zinc-800 outline-none placeholder:text-zinc-400 dark:bg-zinc-900 dark:text-zinc-200 dark:placeholder:text-zinc-500"
        disabled={isLoading}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!input.trim() || isLoading}
        className="inline-flex items-center gap-2 border border-zinc-200 px-3 py-1.5 text-xs text-zinc-600 transition-all hover:border-zinc-400 hover:text-zinc-900 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-500 dark:hover:text-zinc-200"
      >
        {isLoading ? (
          <>
            <span className="h-3 w-3 animate-spin rounded-full border border-zinc-400 border-t-transparent" />
            Analyzing...
          </>
        ) : (
          "Analyze Fit"
        )}
      </button>
    </div>
  );
}

function RichContent({ intentId }: { intentId: IntentId }) {
  switch (intentId) {
    case "projects":
      return (
        <div className="stagger-children mt-3 space-y-2">
          {projects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      );
    case "contact":
      return <div className="mt-3"><ContactInfo /></div>;
    case "resume":
      return <div className="mt-3"><ResumeDownload /></div>;
    case "skills":
      return <div className="mt-3"><SkillsGrid /></div>;
    case "architecture":
      return <div className="mt-3"><PrinciplesList principles={architecturePrinciples} /></div>;
    case "leadership":
      return <div className="mt-3"><PrinciplesList principles={leadershipPrinciples} /></div>;
    case "recruiter":
      return <div className="mt-3"><RecruiterInfo /></div>;
    case "match-job":
      return <div className="mt-3"><MatchJobForm /></div>;
    default:
      return null;
  }
}

function ThinkingIndicator() {
  return (
    <div className="flex items-center gap-1" role="status" aria-label="Loading response">
      <span className="sr-only">Thinking</span>
      <span className="thinking-dot h-1 w-1 rounded-full bg-zinc-400 dark:bg-zinc-500" />
      <span className="thinking-dot h-1 w-1 rounded-full bg-zinc-400 dark:bg-zinc-500 animation-delay-150" />
      <span className="thinking-dot h-1 w-1 rounded-full bg-zinc-400 dark:bg-zinc-500 animation-delay-300" />
    </div>
  );
}

function QuickActionChip({ intent, onClick }: { intent: PaletteIntent; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-2 py-1 text-xs text-zinc-400 transition-all hover:text-zinc-700 active:scale-95 dark:text-zinc-500 dark:hover:text-zinc-300"
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

      // Handle structured error response
      if (isAskErrorResponse(data)) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId
              ? {
                  ...msg,
                  isLoading: false,
                  error: { type: data.type, message: data.message },
                }
              : msg
          )
        );
        return;
      }

      // Handle legacy error format (fallback for non-200 without structured response)
      if (!res.ok) {
        const errorType: AskErrorType = res.status === 429 ? "rate_limited" : "unknown_error";
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId
              ? {
                  ...msg,
                  isLoading: false,
                  error: { type: errorType, message: ASK_ERROR_MESSAGES[errorType] },
                }
              : msg
          )
        );
        return;
      }

      // Success response
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? { ...msg, content: data.answer, isLoading: false }
            : msg
        )
      );
    } catch (err) {
      // Aborted requests are intentional, not errors
      if (err instanceof Error && err.name === "AbortError") {
        return;
      }

      // Network error - graceful fallback
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? {
                ...msg,
                isLoading: false,
                error: {
                  type: "network_error" as AskErrorType,
                  message: ASK_ERROR_MESSAGES.network_error,
                },
              }
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
          intentId: matchedIntent.richContent ? matchedIntent.id : undefined,
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

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="animate-overlay-in fixed inset-0 z-50 bg-black/10 backdrop-blur-[2px]" />
        <Dialog.Content
          className="animate-dialog-in fixed left-1/2 top-1/2 z-50 flex h-[min(560px,75vh)] w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-2xl shadow-zinc-900/5 dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-black/20"
          aria-label="Chat with AI"
        >
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between px-4 py-3">
            <Dialog.Title className="text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Ask me anything
            </Dialog.Title>
            <Dialog.Close
              className="p-1 text-zinc-400 transition-colors hover:text-zinc-600 dark:hover:text-zinc-300"
              aria-label="Close"
              onClick={closePalette}
            >
              <LuX size={14} aria-hidden="true" />
            </Dialog.Close>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center">
                <p className="text-xs text-zinc-400 dark:text-zinc-500">
                  Ask me anything or click a shortcut below
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={on(
                      "animate-slide-up flex",
                      message.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={on(
                        "px-3 py-2",
                        message.role === "user"
                          ? "max-w-[80%] border border-zinc-200 text-zinc-900 dark:border-zinc-700 dark:text-zinc-100"
                          : "w-full"
                      )}
                    >
                      {message.isLoading ? (
                        <ThinkingIndicator />
                      ) : message.error ? (
                        <InlineError message={message.error.message} />
                      ) : (
                        <>
                          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{message.content}</p>
                          {message.intentId && <RichContent intentId={message.intentId} />}
                        </>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input area with shortcuts */}
          <div className="shrink-0 border-t border-zinc-100 dark:border-zinc-800">
            {/* Quick action shortcuts */}
            <div className="px-3 pt-3 pb-2">
              <div className="flex flex-wrap justify-center gap-1">
                {intents.map((intent) => (
                  <QuickActionChip
                    key={intent.id}
                    intent={intent}
                    onClick={() => handleQuickAction(intent)}
                  />
                ))}
              </div>
            </div>
            {/* Input */}
            <div className="px-3 pb-3">
              <div className="flex items-center gap-2 rounded-lg bg-zinc-50 px-3 py-2 dark:bg-zinc-900">
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything..."
                  className="flex-1 border-0 bg-transparent text-sm text-zinc-800 outline-none ring-0 focus:border-0 focus:outline-none focus:ring-0 focus-visible:border-0 focus-visible:outline-none focus-visible:ring-0 placeholder:text-zinc-400 dark:text-zinc-200 dark:placeholder:text-zinc-500"
                  aria-label="Message"
                />
                <button
                  type="button"
                  onClick={() => handleSubmit(query)}
                  disabled={!query.trim()}
                  className="p-1.5 text-zinc-400 transition-all hover:text-zinc-600 disabled:opacity-30 disabled:hover:text-zinc-400 dark:hover:text-zinc-300"
                  aria-label="Send message"
                >
                  <LuSend size={14} aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

