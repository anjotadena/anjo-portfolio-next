"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Check, Copy, RefreshCw, ThumbsDown, ThumbsUp } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Prose } from "@/components/ui/prose";
import { cn } from "@/components/ui/utils";
import { CitationProvider, Markdown } from "@/components/markdown/markdown";
import { extractCitedIndices } from "@/lib/ai/citations";
import { track } from "@/lib/analytics/track";
import { ChatCards } from "./cards/chat-cards";
import { SourceList } from "./source-citations";
import { SuggestedPrompts } from "./suggested-prompts";
import { TypingIndicator } from "./typing-indicator";
import type { ChatUiMessage } from "./chat-types";

export interface ChatMessageItemProps {
  message: ChatUiMessage;
  assistantInitials: string;
  isLast: boolean;
  onFollowUp: (question: string) => void;
  onRetry: (assistantId: string) => void;
  onOpenSource: (message: ChatUiMessage, index: number) => void;
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

const actionClassName =
  "inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40";

function MessageActions({ message, onRetry }: { message: ChatUiMessage; onRetry: (id: string) => void }) {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);

  async function copy() {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable
    }
  }

  function rate(value: "up" | "down") {
    setFeedback(value);
    track("answer_feedback", { rating: value, mode: message.meta?.mode ?? "unknown" });
  }

  return (
    <div className="mt-2 flex items-center gap-0.5" aria-label="Answer actions">
      <button type="button" onClick={copy} aria-label={copied ? "Copied" : "Copy answer"} className={actionClassName}>
        {copied ? <Check className="h-3.5 w-3.5 text-success" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
      </button>
      <button type="button" onClick={() => rate("up")} aria-pressed={feedback === "up"} aria-label="Helpful" className={cn(actionClassName, feedback === "up" && "text-primary")}>
        <ThumbsUp className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
      <button type="button" onClick={() => rate("down")} aria-pressed={feedback === "down"} aria-label="Not helpful" className={cn(actionClassName, feedback === "down" && "text-primary")}>
        <ThumbsDown className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
      <button type="button" onClick={() => onRetry(message.id)} aria-label="Regenerate answer" className={actionClassName}>
        <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
      <span className="ml-2 text-[11px] text-muted-foreground">{formatTime(message.createdAt)}</span>
    </div>
  );
}

/** One turn: right-aligned visitor bubble, or the assistant's answer with citations, cards, sources and follow-ups. */
export function ChatMessageItem({ message, assistantInitials, isLast, onFollowUp, onRetry, onOpenSource }: ChatMessageItemProps) {
  const citedIndices = useMemo(() => (message.role === "assistant" ? extractCitedIndices(message.content) : []), [message.content, message.role]);
  const labels = useMemo(() => Object.fromEntries((message.meta?.sources ?? []).map((source) => [source.index, source.section ? `${source.title} — ${source.section}` : source.title])), [message.meta]);

  if (message.role === "user") {
    return (
      <li className="flex justify-end gap-3 animate-fade-up">
        <div className="flex max-w-[85%] flex-col items-end gap-1">
          <p className="whitespace-pre-wrap break-words rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-sm text-primary-foreground">{message.content}</p>
          <span className="text-[11px] text-muted-foreground">{formatTime(message.createdAt)}</span>
        </div>
        <Avatar initials="You" size="sm" variant="outline" className="mt-1 text-[9px]" />
      </li>
    );
  }

  const isStreaming = message.status === "streaming";
  const isEmpty = message.content.length === 0;
  const meta = message.meta;

  return (
    <li className="flex gap-3 animate-fade-up">
      <Avatar initials={assistantInitials} size="sm" className="mt-1" />
      <div className="min-w-0 flex-1">
        <div aria-busy={isStreaming} className="rounded-2xl rounded-tl-md border border-border bg-card px-4 py-3 shadow-sm">
          {isEmpty && isStreaming ? (
            <TypingIndicator />
          ) : (
            <CitationProvider value={{ onCitationClick: (index) => onOpenSource(message, index), labels }}>
              <Prose>
                <Markdown content={message.content} citations />
              </Prose>
            </CitationProvider>
          )}

          {message.status === "error" && (
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-destructive">
              <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{message.errorMessage ?? "Something went wrong."}</span>
              <button type="button" onClick={() => onRetry(message.id)} className="rounded-md font-medium underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                Retry
              </button>
            </div>
          )}
          {message.status === "interrupted" && (
            <p className="mt-2 text-xs italic text-muted-foreground">{message.errorMessage ?? "Stopped before finishing."}</p>
          )}
          {message.status === "complete" && message.finishReason === "length" && (
            <p className="mt-2 text-xs italic text-muted-foreground">The answer was cut short at the length limit. Ask a narrower question for more detail.</p>
          )}
          {message.status === "complete" && meta?.mode === "extractive" && (
            <p className="mt-2 text-[11px] text-muted-foreground">Quoted directly from the portfolio — no language model is connected on this deployment.</p>
          )}

          {meta && message.status === "complete" && <ChatCards cards={meta.cards} />}
        </div>

        {meta && message.status === "complete" && meta.sources.length > 0 && (
          <SourceList sources={meta.sources} citedIndices={citedIndices} onOpen={(index) => onOpenSource(message, index)} className="mt-3" />
        )}

        {message.status !== "streaming" && <MessageActions message={message} onRetry={onRetry} />}

        {isLast && meta && message.status === "complete" && meta.followUps.length > 0 && (
          <div className="mt-3">
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">Related questions</p>
            <SuggestedPrompts prompts={meta.followUps} onSelect={onFollowUp} variant="chips" />
          </div>
        )}
      </div>
    </li>
  );
}
