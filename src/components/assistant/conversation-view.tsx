"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDown } from "lucide-react";
import type { ChatSource } from "@/types/chat";
import { ChatMessageItem } from "@/components/chat/chat-message";
import { SourcePreview } from "@/components/chat/source-citations";
import type { ChatUiMessage } from "@/components/chat/chat-types";
import type { UseChatResult } from "@/components/chat/use-chat";
import { track } from "@/lib/analytics/track";

export interface ConversationViewProps {
  chat: UseChatResult;
  /** Incremented when the visitor sends something: re-pins the view to the bottom. */
  pinSignal: number;
  onAskSuggested: (prompt: string, source: "suggested" | "followup") => void;
}

/** Distance from the bottom (px) within which the reader counts as "following" the answer. */
const PIN_THRESHOLD = 64;

/**
 * The scrollable conversation inside the assistant panel. Auto-scrolls only
 * while the reader is near the bottom, so scrolling up to re-read an answer
 * is never fought by incoming tokens.
 */
export function ConversationView({ chat, pinSignal, onAskSuggested }: ConversationViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [pinned, setPinned] = useState(true);
  const [preview, setPreview] = useState<ChatSource | null>(null);

  useEffect(() => {
    if (pinSignal > 0) queueMicrotask(() => setPinned(true));
  }, [pinSignal]);

  const messageCount = chat.messages.length;
  const lastContent = chat.messages[messageCount - 1]?.content;
  const lastStatus = chat.messages[messageCount - 1]?.status;
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !pinned || messageCount === 0) return;
    el.scrollTo({ top: el.scrollHeight });
  }, [messageCount, lastContent, lastStatus, pinned]);

  const onScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setPinned(el.scrollHeight - el.scrollTop - el.clientHeight < PIN_THRESHOLD);
  }, []);

  const openSource = useCallback((message: ChatUiMessage, index: number) => {
    const source = message.meta?.sources.find((entry) => entry.index === index) ?? null;
    if (source) {
      track("citation_opened", { type: source.type });
      setPreview(source);
    }
  }, []);

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div ref={scrollRef} onScroll={onScroll} className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain px-3 py-4">
        <ol className="flex flex-col gap-5" aria-label="Conversation">
          {chat.messages.map((message, index) => (
            <ChatMessageItem
              key={message.id}
              message={message}
              isLast={index === chat.messages.length - 1}
              canRetry={!chat.isStreaming}
              onFollowUp={(question) => onAskSuggested(question, "followup")}
              onRetry={(id) => void chat.retry(id)}
              onOpenSource={openSource}
            />
          ))}
        </ol>
      </div>
      {!pinned && (
        <button
          type="button"
          onClick={() => {
            setPinned(true);
            scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
          }}
          aria-label="Scroll to latest"
          className="absolute bottom-3 left-1/2 inline-flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full border border-input bg-card text-foreground shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowDown className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
      <SourcePreview source={preview} onClose={() => setPreview(null)} />
    </div>
  );
}
