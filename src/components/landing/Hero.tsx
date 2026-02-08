"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  LuBriefcase,
  LuCode,
  LuDownload,
  LuExternalLink,
  LuGithub,
  LuLinkedin,
  LuMail,
  LuSend,
  LuSparkles,
  LuUser,
} from "react-icons/lu";

import { InlineError } from "@/components/ui/ErrorMessage";
import { site } from "@/config/site";
import { projects } from "@/data/projects";
import {
  ASK_ERROR_MESSAGES,
  isAskErrorResponse,
  type AskApiResponse,
  type AskErrorType,
} from "@/lib/ask/types";

type QuickAction = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
};

type IntentId = "projects" | "skills" | "contact" | "resume" | "me" | "fun";

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

const quickActions: QuickAction[] = [
  { id: "me", label: "Me", icon: LuUser, color: "text-emerald-500" },
  { id: "projects", label: "Projects", icon: LuBriefcase, color: "text-blue-500" },
  { id: "skills", label: "Skills", icon: LuCode, color: "text-teal-500" },
  { id: "fun", label: "Fun", icon: LuSparkles, color: "text-rose-500" },
  { id: "contact", label: "Contact", icon: LuMail, color: "text-amber-500" },
];

const intents: PaletteIntent[] = [
  {
    id: "me",
    title: "Me",
    keywords: ["me", "about", "who", "yourself", "introduction", "bio"],
    response: `I'm ${site.name}, a ${site.title}. ${site.tagline}`,
    richContent: false,
  },
  {
    id: "projects",
    title: "Projects",
    keywords: ["project", "projects", "work", "portfolio", "case study"],
    response: "Here are some projects I've worked on:",
    richContent: true,
  },
  {
    id: "skills",
    title: "Skills",
    keywords: ["skills", "tech", "technologies", "stack", "languages"],
    response: "Full-stack expertise across multiple technologies:",
    richContent: true,
  },
  {
    id: "fun",
    title: "Fun",
    keywords: ["fun", "hobby", "hobbies", "interests", "free time"],
    response: "When I'm not coding, I enjoy exploring new technologies, gaming, and continuous learning!",
    richContent: false,
  },
  {
    id: "contact",
    title: "Contact",
    keywords: ["contact", "email", "linkedin", "github", "reach", "hire"],
    response: "Want to connect? Here's how to reach me:",
    richContent: true,
  },
  {
    id: "resume",
    title: "Resume",
    keywords: ["resume", "cv", "download", "pdf"],
    response: "Here's my resume:",
    richContent: true,
  },
];

const skillCategories = [
  { name: "Languages", skills: ["TypeScript", "JavaScript", "Python", "Go", "SQL"] },
  { name: "Frontend", skills: ["React", "Next.js", "Angular", "Tailwind CSS"] },
  { name: "Backend", skills: ["Node.js", "Express", "NestJS", "Laravel"] },
  { name: "Cloud", skills: ["AWS", "Azure", "Docker", "Kubernetes"] },
];

function matchIntent(query: string): PaletteIntent | null {
  const q = query.trim().toLowerCase();
  if (!q) return null;

  const matches = intents
    .map((intent) => {
      const score =
        intent.keywords.reduce((acc, kw) => (q.includes(kw) ? acc + 2 : acc), 0) +
        (intent.title.toLowerCase().includes(q) ? 3 : 0) +
        (q.includes(intent.title.toLowerCase()) ? 3 : 0);
      return { intent, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  return matches[0]?.intent ?? null;
}

function ThinkingIndicator() {
  return (
    <div className="flex items-center gap-1" role="status" aria-label="Loading response">
      <span className="sr-only">Thinking</span>
      <span className="thinking-dot h-1.5 w-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500" />
      <span className="thinking-dot animation-delay-150 h-1.5 w-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500" />
      <span className="thinking-dot animation-delay-300 h-1.5 w-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500" />
    </div>
  );
}

function ProjectsContent() {
  return (
    <div className="mt-3 space-y-2">
      {projects.slice(0, 3).map((project) => (
        <div
          key={project.slug}
          className="rounded-lg border border-zinc-100 bg-zinc-50/50 p-3 transition-colors hover:bg-zinc-100/50 dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:bg-zinc-800/50"
        >
          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{project.name}</p>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{project.impact}</p>
        </div>
      ))}
    </div>
  );
}

function SkillsContent() {
  return (
    <div className="mt-3 space-y-2">
      {skillCategories.map((cat) => (
        <div key={cat.name}>
          <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            {cat.name}
          </p>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">{cat.skills.join(" · ")}</p>
        </div>
      ))}
    </div>
  );
}

function ContactContent() {
  return (
    <div className="mt-3 space-y-1">
      <a
        href={`mailto:${site.links.email}`}
        className="flex items-center gap-2 py-1.5 text-xs text-zinc-500 transition-colors hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
      >
        <LuMail className="h-3.5 w-3.5" />
        {site.links.email}
      </a>
      <a
        href={site.links.linkedin}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 py-1.5 text-xs text-zinc-500 transition-colors hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
      >
        <LuLinkedin className="h-3.5 w-3.5" />
        LinkedIn
        <LuExternalLink className="ml-auto h-3 w-3 opacity-50" />
      </a>
      <a
        href={site.links.github}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 py-1.5 text-xs text-zinc-500 transition-colors hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
      >
        <LuGithub className="h-3.5 w-3.5" />
        GitHub
        <LuExternalLink className="ml-auto h-3 w-3 opacity-50" />
      </a>
    </div>
  );
}

function ResumeContent() {
  return (
    <div className="mt-3">
      <a
        href={site.links.resumePdf}
        download
        className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-xs text-zinc-600 transition-all hover:border-zinc-400 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-500 dark:hover:text-zinc-200"
      >
        <LuDownload className="h-3.5 w-3.5" />
        Download Resume
      </a>
    </div>
  );
}

function RichContent({ intentId }: { intentId: IntentId }) {
  switch (intentId) {
    case "projects":
      return <ProjectsContent />;
    case "skills":
      return <SkillsContent />;
    case "contact":
      return <ContactContent />;
    case "resume":
      return <ResumeContent />;
    default:
      return null;
  }
}

export function Hero() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const hasMessages = messages.length > 0;

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

      if (isAskErrorResponse(data)) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId
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
            msg.id === messageId
              ? { ...msg, isLoading: false, error: { type: errorType, message: ASK_ERROR_MESSAGES[errorType] } }
              : msg
          )
        );
        return;
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, content: data.answer, isLoading: false } : msg
        )
      );
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? {
                ...msg,
                isLoading: false,
                error: { type: "network_error" as AskErrorType, message: ASK_ERROR_MESSAGES.network_error },
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
    (action: QuickAction) => {
      handleSubmit(action.label);
    },
    [handleSubmit]
  );

  return (
    <section className="snap-section relative flex min-h-screen w-full flex-col overflow-hidden bg-gradient-to-b from-slate-50 via-white to-white dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-950">
      {/* Decorative gradient blobs */}
      <div className="pointer-events-none absolute left-0 top-0 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-green-200/40 via-yellow-100/30 to-orange-200/40 blur-3xl dark:from-green-900/20 dark:via-yellow-900/10 dark:to-orange-900/20" />
      <div className="pointer-events-none absolute right-0 top-1/3 h-[400px] w-[600px] translate-x-1/4 rounded-full bg-gradient-to-bl from-orange-100/30 via-rose-100/20 to-transparent blur-3xl dark:from-orange-900/10 dark:via-rose-900/10" />

      {/* Main Content Area */}
      <div className="container relative mx-auto flex min-h-0 flex-1 flex-col items-center justify-center px-4 py-8">
        {/* Logo */}
        <div className={`shrink-0 transition-all duration-500 ${hasMessages ? "mb-3" : "mb-6"}`}>
          <div
            className={`flex items-center justify-center rounded-xl bg-zinc-900 transition-all duration-500 dark:bg-white ${
              hasMessages ? "h-8 w-8" : "h-12 w-12"
            }`}
          >
            <span
              className={`font-bold text-white transition-all duration-500 dark:text-zinc-900 ${
                hasMessages ? "text-lg" : "text-2xl"
              }`}
            >
              A
            </span>
          </div>
        </div>

        {/* Greeting */}
        <p
          className={`shrink-0 text-zinc-700 transition-all duration-500 dark:text-zinc-300 ${
            hasMessages ? "mb-1 text-sm" : "mb-2 text-lg"
          }`}
        >
          Hey, I&apos;m {site.name.split(" ")[0]}
          <span className="ml-1 inline-block origin-[70%_70%] animate-[wave_2s_ease-in-out_infinite]">
            👋
          </span>
        </p>

        {/* Title */}
        <h1
          className={`shrink-0 text-center font-bold tracking-tight text-zinc-900 transition-all duration-500 dark:text-zinc-50 ${
            hasMessages ? "mb-4 text-xl sm:text-2xl" : "mb-8 text-4xl sm:text-5xl lg:text-6xl"
          }`}
        >
          {site.title.split("/")[0].trim()}
        </h1>

        {/* Chat Messages Area */}
        {hasMessages && (
          <div className="mb-4 w-full min-h-0 max-w-xl flex-1 overflow-hidden">
            <div className="h-full max-h-[60vh] space-y-3 overflow-y-auto p-4 scrollbar-hide">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-xl px-3 py-2 ${
                      message.role === "user"
                        ? "bg-primary-600 text-white"
                        : "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
                    }`}
                  >
                    {message.isLoading ? (
                      <ThinkingIndicator />
                    ) : message.error ? (
                      <InlineError message={message.error.message} />
                    ) : (
                      <>
                        <p className="text-sm leading-relaxed">{message.content}</p>
                        {message.intentId && <RichContent intentId={message.intentId} />}
                      </>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}
      </div>

      {/* Bottom Chat Section */}
      <div className="container relative mx-auto px-4 pb-8">
        {/* AI Prompt Input */}
        <div className="mx-auto w-full max-w-xl">
          <div className="flex items-center gap-3 rounded-full border border-zinc-200 bg-white px-5 py-3 shadow-lg shadow-zinc-900/5 transition-all hover:border-zinc-300 hover:shadow-xl dark:border-zinc-700 dark:bg-zinc-900 dark:shadow-black/10 dark:hover:border-zinc-600">
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything..."
              className="flex-1 border-0 bg-transparent text-sm text-zinc-800 outline-none ring-0 placeholder:text-zinc-400 dark:text-zinc-200 dark:placeholder:text-zinc-500"
              aria-label="Ask me anything"
            />
            <button
              type="button"
              onClick={() => handleSubmit(query)}
              disabled={!query.trim()}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-600 text-white shadow-md transition-all hover:bg-primary-700 hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:hover:bg-primary-600"
              aria-label="Send message"
            >
              <LuSend size={16} aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {quickActions.map((action) => (
            <button
              key={action.id}
              type="button"
              onClick={() => handleQuickAction(action)}
              className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-600 transition-all hover:border-zinc-300 hover:bg-zinc-50 active:scale-[0.98] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:bg-zinc-700"
            >
              <action.icon className={`h-3 w-3 ${action.color}`} />
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Wave animation keyframes */}
      <style jsx>{`
        @keyframes wave {
          0%,
          100% {
            transform: rotate(0deg);
          }
          10% {
            transform: rotate(14deg);
          }
          20% {
            transform: rotate(-8deg);
          }
          30% {
            transform: rotate(14deg);
          }
          40% {
            transform: rotate(-4deg);
          }
          50% {
            transform: rotate(10deg);
          }
          60%,
          100% {
            transform: rotate(0deg);
          }
        }
      `}</style>
    </section>
  );
}
