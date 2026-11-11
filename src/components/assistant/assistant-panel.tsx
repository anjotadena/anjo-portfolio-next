"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Minus, RotateCcw, Sparkles, X } from "lucide-react";
import { MarkTile } from "@/components/brand/logo";
import { ChatInput } from "@/components/chat/chat-input";
import { SuggestedPrompts } from "@/components/chat/suggested-prompts";
import type { UseChatResult } from "@/components/chat/use-chat";
import { cn } from "@/components/ui/utils";
import { track } from "@/lib/analytics/track";

/** The message list (Markdown, highlighting, cards) is the heavy part — loaded on first use. */
const ConversationView = dynamic(() => import("./conversation-view").then((mod) => mod.ConversationView), {
  ssr: false,
  loading: () => <p className="px-4 py-6 font-mono text-xs text-muted-foreground">Loading conversation…</p>,
});

export type AssistantAvailability = "unknown" | "live" | "extractive" | "degraded" | "unavailable";

export interface AssistantPanelProps {
  id: string;
  launcherId: string;
  open: boolean;
  /** Mount the lazy conversation view (true after the first open). */
  mountConversation: boolean;
  onClose: () => void;
  onNewChat: () => void;
  chat: UseChatResult;
  draft: string;
  onDraftChange: (value: string) => void;
  online: boolean;
  availability: AssistantAvailability;
  ownerFirstName: string;
  suggestedPrompts: string[];
}

const COMPACT_QUERY = "(max-width: 639px)";
const INPUT_ID = "anjo-ai-composer";

function useCompactViewport(): boolean {
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    const query = window.matchMedia(COMPACT_QUERY);
    const sync = () => setCompact(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);
  return compact;
}

interface StatusView {
  label: string;
  tone: "ok" | "busy" | "warn" | "off";
}

function statusFor({ online, availability, chat }: Pick<AssistantPanelProps, "online" | "availability" | "chat">): StatusView {
  if (!online) return { label: "Offline — reconnect to send", tone: "off" };
  if (chat.isStreaming) return { label: "Answering…", tone: "busy" };
  const last = chat.messages[chat.messages.length - 1];
  if (last?.status === "error" && last.errorCode === "RATE_LIMITED") {
    return { label: last.retryAfterSeconds ? `Rate limited — try again in ${last.retryAfterSeconds}s` : "Rate limited — wait a moment", tone: "warn" };
  }
  switch (availability) {
    case "live":
      return { label: "Online · grounded answers with sources", tone: "ok" };
    case "extractive":
      return { label: "Online · quotes portfolio sources (no AI model connected)", tone: "ok" };
    case "degraded":
      return { label: "Limited · semantic search unavailable", tone: "warn" };
    case "unavailable":
      return { label: "Unavailable right now", tone: "off" };
    default:
      return { label: "Checking connection…", tone: "busy" };
  }
}

const TONE_CLASS: Record<StatusView["tone"], string> = {
  ok: "bg-success",
  busy: "bg-primary motion-safe:animate-pulse",
  warn: "bg-amber-300",
  off: "bg-destructive",
};

const iconButton =
  "inline-flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40";

/**
 * The floating Anjo AI panel, built on a native `<dialog>`:
 *  - desktop (≥ 640px): `show()` — a non-modal panel above the launcher;
 *    the page stays usable, Escape (inside the panel) minimises it.
 *  - phones: `showModal()` — a full-height sheet with focus trapping and an
 *    inert background; its height follows `visualViewport` so the composer
 *    stays above the software keyboard.
 * Minimising never aborts a stream; only Stop or New chat do.
 */
export function AssistantPanel(props: AssistantPanelProps) {
  const { id, launcherId, open, mountConversation, onClose, onNewChat, chat, draft, onDraftChange, online, availability, ownerFirstName, suggestedPrompts } = props;
  const ref = useRef<HTMLDialogElement>(null);
  const compact = useCompactViewport();
  const wasOpen = useRef(false);
  const [pinSignal, setPinSignal] = useState(0);

  // Open/close the native dialog in the right mode; move focus on transitions.
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const mode = compact ? "modal" : "panel";
    if (open) {
      if (dialog.open && dialog.dataset.mode !== mode) dialog.close();
      if (!dialog.open) {
        if (mode === "modal") dialog.showModal();
        else dialog.show();
        dialog.dataset.mode = mode;
      }
      if (!wasOpen.current) {
        requestAnimationFrame(() => document.getElementById(INPUT_ID)?.focus({ preventScroll: true }));
      }
    } else if (dialog.open) {
      const focusWasInside = dialog.contains(document.activeElement) || document.activeElement === document.body;
      dialog.close();
      if (focusWasInside) document.getElementById(launcherId)?.focus();
    }
    wasOpen.current = open;
  }, [compact, launcherId, open]);

  // Native Escape on the modal sheet: keep React state as the source of truth.
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const onCancel = (event: Event) => {
      event.preventDefault();
      onClose();
    };
    dialog.addEventListener("cancel", onCancel);
    return () => dialog.removeEventListener("cancel", onCancel);
  }, [onClose]);

  // Phone sheet follows the visual viewport (software keyboard, browser chrome).
  useEffect(() => {
    const dialog = ref.current;
    const viewport = window.visualViewport;
    if (!dialog || !viewport || !open || !compact) return;
    const sync = () => {
      dialog.style.setProperty("--vv-height", `${viewport.height}px`);
      dialog.style.setProperty("--vv-top", `${viewport.offsetTop}px`);
    };
    sync();
    viewport.addEventListener("resize", sync);
    viewport.addEventListener("scroll", sync);
    return () => {
      viewport.removeEventListener("resize", sync);
      viewport.removeEventListener("scroll", sync);
      dialog.style.removeProperty("--vv-height");
      dialog.style.removeProperty("--vv-top");
    };
  }, [compact, open]);

  // Escape inside the non-modal panel minimises it — but not when it was
  // meant for a nested dialog such as the source preview.
  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDialogElement>) => {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      const target = event.target as Element | null;
      if (target?.closest("dialog") !== ref.current) return;
      event.preventDefault();
      onClose();
    },
    [onClose],
  );

  const status = statusFor({ online, availability, chat });
  const canSubmit = online;
  const isEmpty = chat.messages.length === 0;

  const submit = useCallback(() => {
    if (chat.ask(draft, "typed")) {
      onDraftChange("");
      setPinSignal((value) => value + 1);
    }
  }, [chat, draft, onDraftChange]);

  const askSuggested = useCallback(
    (prompt: string, source: "suggested" | "followup") => {
      track("suggested_prompt_clicked", { source });
      if (chat.ask(prompt, source)) setPinSignal((value) => value + 1);
    },
    [chat],
  );

  return (
    <dialog
      ref={ref}
      id={id}
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-description`}
      onKeyDown={onKeyDown}
      data-testid="assistant-panel"
      className={cn(
        "@container fixed z-50 m-0 max-h-none max-w-none flex-col overflow-hidden border border-border bg-popover p-0 text-foreground shadow-2xl shadow-black/50 open:flex",
        // Phones: full-height sheet sized to the visual viewport.
        "inset-x-0 top-[var(--vv-top,0px)] h-[var(--vv-height,100dvh)] w-full rounded-none border-0",
        // Desktop: floating panel above the launcher.
        "sm:inset-auto sm:bottom-[calc(5.25rem+env(safe-area-inset-bottom,0px))] sm:right-[calc(1.5rem+env(safe-area-inset-right,0px))] sm:h-[min(620px,calc(100dvh-7.5rem))] sm:w-[min(400px,calc(100vw-3rem))] sm:rounded-2xl sm:border",
      )}
    >
      <header className="pt-safe shrink-0 border-b border-border bg-card">
        <div className="flex items-center gap-3 px-3 py-2.5">
          <MarkTile className="h-10 w-10" />
          <div className="min-w-0 flex-1">
            <h2 id={`${id}-title`} className="flex items-center gap-2 text-sm font-semibold text-foreground">
              Anjo AI
              <span className="rounded border border-primary/50 px-1.5 py-px font-mono text-[10px] font-medium uppercase tracking-wider text-primary">AI assistant</span>
            </h2>
            <p id={`${id}-description`} className="truncate text-xs text-muted-foreground">
              Ask about my work. Answers cite the portfolio.
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground" data-testid="assistant-status">
              <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", TONE_CLASS[status.tone])} aria-hidden="true" />
              <span className="truncate">{status.label}</span>
            </p>
          </div>
          <div className="flex shrink-0 items-center">
            <button type="button" onClick={onNewChat} disabled={isEmpty && !draft} aria-label="New chat" title="New chat" className={iconButton}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
            </button>
            <button type="button" onClick={onClose} aria-label={compact ? "Close Anjo AI" : "Minimize Anjo AI"} title={compact ? "Close" : "Minimize"} className={iconButton}>
              {compact ? <X className="h-5 w-5" aria-hidden="true" /> : <Minus className="h-4 w-4" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col">
        {isEmpty ? (
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5">
            <div className="flex gap-3">
              <MarkTile className="mt-0.5 h-8 w-8" />
              <p className="min-w-0 rounded-xl rounded-tl-sm border border-border bg-card px-3.5 py-2.5 text-sm leading-relaxed text-foreground" data-testid="assistant-welcome">
                Hi! I&apos;m {ownerFirstName}&apos;s AI assistant. Ask me about his projects, experience, or how he can help your team.
              </p>
            </div>
            <p className="mb-2 mt-5 flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> Try asking
            </p>
            <SuggestedPrompts prompts={suggestedPrompts} disabled={!canSubmit} onSelect={(prompt) => askSuggested(prompt, "suggested")} />
            <p className="mt-5 text-[11px] leading-relaxed text-muted-foreground">
              Anjo AI answers only from public portfolio content and can make mistakes — check the cited sources. Please don&apos;t share personal or confidential information.
            </p>
          </div>
        ) : mountConversation ? (
          <ConversationView chat={chat} pinSignal={pinSignal} onAskSuggested={askSuggested} />
        ) : null}
      </div>

      <div className="pb-safe shrink-0 border-t border-border bg-card px-3 pt-3">
        {!online && (
          <p className="mb-2 rounded-md border border-destructive/40 px-2.5 py-1.5 text-xs text-destructive" role="note">
            You&apos;re offline. Your draft is kept — send it when you reconnect.
          </p>
        )}
        <ChatInput
          inputId={INPUT_ID}
          value={draft}
          onChange={onDraftChange}
          onSubmit={submit}
          onStop={chat.stop}
          isStreaming={chat.isStreaming}
          canSubmit={canSubmit}
          showHint={false}
          placeholder={`Ask about ${ownerFirstName}'s work…`}
        />
        <p className="pb-3 pt-1.5 text-center text-[10px] text-muted-foreground">AI-generated answers grounded in this portfolio.</p>
      </div>
    </dialog>
  );
}
