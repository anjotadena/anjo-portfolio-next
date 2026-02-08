"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  LuBriefcase,
  LuChevronDown,
  LuLightbulb,
  LuMessageCircle,
  LuSend,
  LuSparkles,
  LuTrendingUp,
  LuUsers,
  LuX,
} from "react-icons/lu";

import { InlineError } from "@/components/ui/ErrorMessage";
import { useAskAi, type ChatMessage } from "@/hooks/useAskAi";
import { on } from "@/utils";

type ShortcutCategory = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  questions: string[];
};

const shortcutCategories: ShortcutCategory[] = [
  {
    id: "recruiter",
    label: "Recruiter",
    icon: LuBriefcase,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    questions: [
      "Is Anjo a good fit for a Senior Software Engineer role?",
      "What roles does Anjo perform best in?",
      "Backend or frontend — where is Anjo strongest?",
      "What kind of production systems has Anjo worked on?",
      "What problems does Anjo usually solve?",
      "How does Anjo add value beyond coding?",
      "How does Anjo approach architecture and design?",
      "How does Anjo handle ambiguity or unclear requirements?",
      "What kind of teams does Anjo work best with?",
    ],
  },
  {
    id: "tech-lead",
    label: "Tech Lead",
    icon: LuUsers,
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-900/20",
    questions: [
      "How does Anjo make technical trade-offs?",
      "How does Anjo think about scalability and performance?",
      "How does Anjo handle technical debt?",
      "How does Anjo approach code reviews and mentoring?",
      "What would Anjo improve in an existing system?",
    ],
  },
  {
    id: "investor",
    label: "Investor",
    icon: LuTrendingUp,
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
    questions: [
      "What products could Anjo realistically build solo?",
      "How does Anjo validate ideas before building?",
      "What markets or problems does Anjo understand deeply?",
      "If Anjo had funding, what would he build first?",
      "Why is Anjo a strong technical co-founder?",
    ],
  },
  {
    id: "growth",
    label: "Growth",
    icon: LuLightbulb,
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-900/20",
    questions: [
      "What are Anjo's current growth areas?",
      "What would Anjo improve in this portfolio?",
      "How has Anjo's thinking evolved as a senior engineer?",
      "What mistakes has Anjo learned from?",
    ],
  },
  {
    id: "general",
    label: "General",
    icon: LuSparkles,
    color: "text-zinc-600 dark:text-zinc-400",
    bgColor: "bg-zinc-100 dark:bg-zinc-800",
    questions: [
      "Tell me about Anjo's experience and projects",
      "What engineering decisions has Anjo made?",
      "What are Anjo's thoughts on architecture?",
    ],
  },
];

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

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={on(
          "max-w-[85%] rounded-2xl px-3.5 py-2.5",
          isUser
            ? "bg-primary-600 text-white"
            : "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
        )}
      >
        {message.isLoading ? (
          <ThinkingIndicator />
        ) : message.error ? (
          <InlineError message={message.error.message} />
        ) : (
          <p className="text-sm leading-relaxed">{message.content}</p>
        )}
      </div>
    </div>
  );
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const { messages, isLoading, sendMessage } = useAskAi();
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const hasMessages = messages.length > 0;

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, scrollToBottom]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      const trimmed = query.trim();
      if (!trimmed || isLoading) return;

      setQuery("");
      setActiveCategory(null);
      await sendMessage(trimmed);
    },
    [query, isLoading, sendMessage]
  );

  const handleShortcutClick = useCallback(
    async (question: string) => {
      if (isLoading) return;
      setActiveCategory(null);
      await sendMessage(question);
    },
    [isLoading, sendMessage]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const toggleCategory = useCallback((categoryId: string) => {
    setActiveCategory((prev) => (prev === categoryId ? null : categoryId));
  }, []);

  // Close on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  const activeCategoryData = shortcutCategories.find((c) => c.id === activeCategory);

  return (
    <>
      {/* Chat Panel */}
      <div
        className={on(
          "fixed bottom-20 right-4 z-50 flex w-[calc(100vw-2rem)] max-w-md flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl transition-all duration-300 ease-out dark:border-zinc-700 dark:bg-zinc-900 sm:right-6 sm:bottom-24",
          isOpen
            ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-4 scale-95 opacity-0"
        )}
        role="dialog"
        aria-label="AI Chat Assistant"
        aria-hidden={!isOpen}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-800/50">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-white">
              <LuMessageCircle className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Ask About Anjo
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                AI-powered assistant
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={toggleOpen}
            className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-200"
            aria-label="Close chat"
          >
            <LuX className="h-5 w-5" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="border-b border-zinc-100 px-2 py-2 dark:border-zinc-800">
          <div className="flex flex-wrap gap-1">
            {shortcutCategories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => toggleCategory(category.id)}
                disabled={isLoading}
                className={on(
                  "flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-all active:scale-[0.98] disabled:opacity-50",
                  activeCategory === category.id
                    ? `${category.bgColor} ${category.color}`
                    : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                )}
              >
                <category.icon className="h-3.5 w-3.5" />
                <span>{category.label}</span>
                <LuChevronDown
                  className={on(
                    "h-3 w-3 transition-transform",
                    activeCategory === category.id && "rotate-180"
                  )}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Expanded Questions for Active Category */}
        {activeCategoryData && (
          <div className="max-h-32 overflow-y-auto border-b border-zinc-100 bg-zinc-50/50 p-2 dark:border-zinc-800 dark:bg-zinc-800/30">
            <div className="space-y-1">
              {activeCategoryData.questions.map((question, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleShortcutClick(question)}
                  disabled={isLoading}
                  className="w-full rounded-lg px-3 py-2 text-left text-xs text-zinc-700 transition-all hover:bg-white dark:text-zinc-300 dark:hover:bg-zinc-800 disabled:opacity-50"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages Area */}
        <div
          className="flex-1 overflow-y-auto p-4"
          style={{ maxHeight: activeCategoryData ? "200px" : "280px", minHeight: "120px" }}
        >
          {!hasMessages ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
                Select a category above or ask your own question.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="border-t border-zinc-100 p-3 dark:border-zinc-800">
          <div className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 transition-colors focus-within:border-primary-300 dark:border-zinc-700 dark:bg-zinc-800 dark:focus-within:border-primary-600">
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question..."
              className="flex-1 border-0 bg-transparent text-sm text-zinc-800 outline-none placeholder:text-zinc-400 dark:text-zinc-200 dark:placeholder:text-zinc-500"
              aria-label="Type your question"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!query.trim() || isLoading}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-white transition-all hover:bg-primary-700 disabled:opacity-50 disabled:hover:bg-primary-600"
              aria-label="Send message"
            >
              <LuSend className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Floating Button */}
      <button
        type="button"
        onClick={toggleOpen}
        className={on(
          "fixed bottom-4 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary-600 text-white shadow-lg transition-all hover:bg-primary-700 hover:shadow-xl active:scale-95 sm:right-6 sm:bottom-6",
          isOpen && "rotate-90 scale-0 opacity-0"
        )}
        aria-label="Open chat assistant"
        aria-expanded={isOpen}
      >
        <LuMessageCircle className="h-6 w-6" />
      </button>
    </>
  );
}
