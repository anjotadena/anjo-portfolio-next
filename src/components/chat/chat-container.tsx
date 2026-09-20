"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowDown, RotateCcw, Sparkles } from "lucide-react";
import type { ChatSource } from "@/types/chat";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/components/ui/utils";
import { track } from "@/lib/analytics/track";
import { ChatInput } from "./chat-input";
import { ChatMessageItem } from "./chat-message";
import { SourcePreview } from "./source-citations";
import { SuggestedPrompts } from "./suggested-prompts";
import type { ChatUiMessage } from "./chat-types";
import { useChat } from "./use-chat";

export interface ChatContainerProps {
  assistantName: string;
  assistantInitials: string;
  ownerFirstName: string;
  suggestedPrompts: string[];
  /** Optional document slug that seeds retrieval (project pages). */
  contextSlug?: string;
  /** Compact heading used on project pages. */
  compact?: boolean;
  className?: string;
}

/**
 * The conversation surface: landing state -> running conversation, with a
 * pinned composer. Owns auto-scroll (pinned to bottom unless the visitor
 * scrolls up), the source preview panel, and the `?ask=` deep link.
 */
export function ChatContainer({ assistantName, assistantInitials, ownerFirstName, suggestedPrompts, contextSlug, compact = false, className }: ChatContainerProps) {
  const chat = useChat({ contextSlug });
  const [draft, setDraft] = useState("");
  const [preview, setPreview] = useState<ChatSource | null>(null);
  const [pinned, setPinned] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const askedFromUrl = useRef(false);

  // Deep link: /?ask=Tell%20me%20about%20Asterweave submits once on load.
  useEffect(() => {
    const ask = searchParams.get("ask");
    if (ask && !askedFromUrl.current) {
      askedFromUrl.current = true;
      void chat.ask(ask, "suggested");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const messageCount = chat.messages.length;
  const lastContent = chat.messages[messageCount - 1]?.content;
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !pinned || messageCount === 0) return;
    el.scrollTo({ top: el.scrollHeight });
  }, [messageCount, lastContent, pinned]);

  // Escape stops a streaming answer (mirrors the "esc to stop" hint).
  const isStreaming = chat.isStreaming;
  const stop = chat.stop;
  useEffect(() => {
    if (!isStreaming) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") stop();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isStreaming, stop]);

  const onScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setPinned(el.scrollHeight - el.scrollTop - el.clientHeight < 48);
  }, []);

  const submit = useCallback(() => {
    const question = draft;
    setDraft("");
    setPinned(true);
    void chat.ask(question, "typed");
  }, [chat, draft]);

  const askSuggested = useCallback(
    (prompt: string, source: "suggested" | "followup") => {
      track("suggested_prompt_clicked", { source });
      setPinned(true);
      void chat.ask(prompt, source);
    },
    [chat],
  );

  const openSource = useCallback((message: ChatUiMessage, index: number) => {
    const source = message.meta?.sources.find((entry) => entry.index === index) ?? null;
    if (source) {
      track("citation_opened", { type: source.type });
      setPreview(source);
    }
  }, []);

  const isIdle = chat.messages.length === 0;
  // The home page owns the <h1>; embedded (compact) instances must not add a second one.
  const Heading = compact ? "h3" : "h1";

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col", className)}>
      <p aria-live="polite" role="status" className="sr-only">
        {chat.liveStatus}
      </p>

      <div ref={scrollRef} onScroll={onScroll} className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className={cn("mx-auto w-full max-w-3xl px-4 py-6 sm:px-6", compact && "py-4")}>
          {isIdle ? (
            <div className={cn("flex flex-col gap-6", compact ? "py-2" : "py-6 sm:py-10")}>
              <div className="flex items-start gap-4">
                <Avatar initials={assistantInitials} size="lg" />
                <div>
                  <Heading className={cn("font-semibold tracking-tight text-foreground", compact ? "text-lg" : "text-2xl sm:text-3xl")}>
                    Hi, I&apos;m {assistantName} <span aria-hidden="true">👋</span>
                  </Heading>
                  <p className="mt-1 max-w-xl text-sm text-muted-foreground sm:text-base">
                    {contextSlug
                      ? `Ask me anything about this project — its architecture, ${ownerFirstName}'s role, challenges, or results.`
                      : `Ask me about ${ownerFirstName}'s software engineering experience, AI systems, cloud architecture, projects, or technical skills.`}
                  </p>
                </div>
              </div>
              <div>
                <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> Try a question
                </p>
                <SuggestedPrompts
                  prompts={suggestedPrompts}
                  onSelect={(prompt) => askSuggested(prompt, "suggested")}
                  className="[&>li:nth-child(n+5)]:hidden sm:[&>li:nth-child(n+5)]:block"
                />
              </div>
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
                Answers are grounded in {ownerFirstName}&apos;s portfolio and cite their sources.
              </p>
            </div>
          ) : (
            <ol className="flex flex-col gap-6" aria-label="Conversation">
              {chat.messages.map((message, index) => (
                <ChatMessageItem
                  key={message.id}
                  message={message}
                  assistantInitials={assistantInitials}
                  isLast={index === chat.messages.length - 1}
                  onFollowUp={(question) => askSuggested(question, "followup")}
                  onRetry={(id) => void chat.retry(id)}
                  onOpenSource={openSource}
                />
              ))}
            </ol>
          )}
        </div>
      </div>

      <div className="relative shrink-0 border-t border-border bg-background/95 backdrop-blur">
        {!pinned && !isIdle && (
          <button
            type="button"
            onClick={() => {
              setPinned(true);
              scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
            }}
            aria-label="Scroll to latest"
            className="absolute -top-11 left-1/2 inline-flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowDown className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
        <div className="pb-safe mx-auto w-full max-w-3xl px-4 pt-3 sm:px-6">
          <div className="pb-3">
            <ChatInput value={draft} onChange={setDraft} onSubmit={submit} onStop={chat.stop} isStreaming={chat.isStreaming} autoFocus={!compact} />
            {!isIdle && (
              <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                <button type="button" onClick={chat.reset} className="inline-flex items-center gap-1 rounded-md hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <RotateCcw className="h-3 w-3" aria-hidden="true" /> New chat
                </button>
                <span>{assistantName} can make mistakes — check the cited sources.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <SourcePreview source={preview} onClose={() => setPreview(null)} />
    </div>
  );
}
