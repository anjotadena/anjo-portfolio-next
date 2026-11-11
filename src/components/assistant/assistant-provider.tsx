"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CHAT_MESSAGE_MAX_LENGTH } from "@/types/chat";
import { useChat } from "@/components/chat/use-chat";
import { track } from "@/lib/analytics/track";
import { AssistantActionsContext, type AskAboutOptions, type AssistantActions, type AssistantOpenSource } from "./assistant-context";
import { AssistantLauncher } from "./assistant-launcher";
import { AssistantPanel, type AssistantAvailability } from "./assistant-panel";
import { parseAssistantDeepLink } from "./deep-link";

export const DRAFT_STORAGE_KEY = "anjo-ai:draft";
export const ASSISTANT_PANEL_ID = "anjo-ai-panel";
export const LAUNCHER_ID = "anjo-ai-launcher";

function readDraft(): string {
  try {
    return (sessionStorage.getItem(DRAFT_STORAGE_KEY) ?? "").slice(0, CHAT_MESSAGE_MAX_LENGTH + 50);
  } catch {
    return "";
  }
}

function writeDraft(value: string): void {
  try {
    if (value) sessionStorage.setItem(DRAFT_STORAGE_KEY, value.slice(0, CHAT_MESSAGE_MAX_LENGTH + 50));
    else sessionStorage.removeItem(DRAFT_STORAGE_KEY);
  } catch {
    // Storage unavailable (private mode / quota): the draft simply isn't kept across reloads.
  }
}

function useOnline(): boolean {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    const sync = () => setOnline(navigator.onLine);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);
  return online;
}

interface PendingAsk {
  question: string;
  options: AskAboutOptions;
}

export interface AssistantProviderProps {
  children: ReactNode;
  ownerFirstName: string;
  suggestedPrompts: string[];
}

/**
 * The one conversation controller for the whole site. Mounted once in the
 * root layout (which persists across client navigations), so opening,
 * minimising, or changing pages never creates a competing chat session.
 *
 * `children` (the page) is passed through untouched: streaming tokens
 * re-render only the launcher and the panel, never the portfolio.
 */
export function AssistantProvider({ children, ownerFirstName, suggestedPrompts }: AssistantProviderProps) {
  const chat = useChat();
  const online = useOnline();
  const [open, setOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const [draft, setDraftState] = useState("");
  const [availability, setAvailability] = useState<AssistantAvailability>("unknown");
  const pendingRef = useRef<PendingAsk | null>(null);
  const [pendingTick, setPendingTick] = useState(0);
  const healthRequested = useRef(false);

  // Latest values for the stable action callbacks.
  const chatRef = useRef(chat);
  const openRef = useRef(open);
  useEffect(() => {
    chatRef.current = chat;
    openRef.current = open;
  });

  useEffect(() => {
    const stored = readDraft();
    if (stored) queueMicrotask(() => setDraftState((current) => current || stored));
  }, []);

  const setDraft = useCallback((value: string) => {
    setDraftState(value);
    writeDraft(value);
  }, []);

  // Capability/connection status from the real health endpoint, once, on first open.
  useEffect(() => {
    if (!open || healthRequested.current) return;
    healthRequested.current = true;
    const controller = new AbortController();
    fetch("/api/health", { signal: controller.signal, cache: "no-store" })
      .then(async (response) => {
        const body = (await response.json().catch(() => null)) as { status?: string; ai?: { modelBacked?: boolean }; retrieval?: { ok?: boolean } } | null;
        if (body?.status === "degraded" || body?.retrieval?.ok === false) setAvailability("degraded");
        else if (!response.ok || !body || body.status === "error") setAvailability("unavailable");
        else setAvailability(body.ai?.modelBacked ? "live" : "extractive");
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") healthRequested.current = false;
        else setAvailability("unavailable");
      });
    return () => controller.abort();
  }, [open]);

  const openPanel = useCallback((source: AssistantOpenSource = "launcher") => {
    setHasOpened(true);
    if (!openRef.current) track("assistant_opened", { source });
    openRef.current = true;
    setOpen(true);
  }, []);

  const closePanel = useCallback(() => {
    openRef.current = false;
    setOpen(false);
  }, []);

  const submitOrQueue = useCallback(
    (pending: PendingAsk) => {
      const current = chatRef.current;
      if (!current.ready) {
        pendingRef.current = pending;
        return;
      }
      const source = pending.options.source ?? "cta";
      if (current.isStreaming || !current.ask(pending.question, source, { contextSlug: pending.options.contextSlug })) {
        // Never cancel or race an active answer: hand the question to the visitor instead.
        setDraft(pending.question);
      }
    },
    [setDraft],
  );

  // Flush a question that arrived before the stored conversation was restored.
  useEffect(() => {
    if (!chat.ready || !pendingRef.current) return;
    const pending = pendingRef.current;
    pendingRef.current = null;
    submitOrQueue(pending);
  }, [chat.ready, pendingTick, submitOrQueue]);

  const askAbout = useCallback(
    (question: string, options: AskAboutOptions = {}) => {
      const trimmed = question.trim().slice(0, CHAT_MESSAGE_MAX_LENGTH);
      openPanel(options.source === "deeplink" ? "deeplink" : "cta");
      if (!trimmed) return;
      submitOrQueue({ question: trimmed, options });
      setPendingTick((tick) => tick + 1);
    },
    [openPanel, submitOrQueue],
  );

  const actions = useMemo<AssistantActions>(
    () => ({
      open: openPanel,
      close: closePanel,
      toggle: () => (openRef.current ? closePanel() : openPanel("launcher")),
      askAbout,
    }),
    [askAbout, closePanel, openPanel],
  );

  const newChat = useCallback(() => {
    chatRef.current.reset();
    setDraft("");
  }, [setDraft]);

  return (
    <AssistantActionsContext.Provider value={actions}>
      {children}
      <p aria-live="polite" role="status" className="sr-only">
        {chat.liveStatus}
      </p>
      <AssistantLauncher id={LAUNCHER_ID} panelId={ASSISTANT_PANEL_ID} open={open} busy={chat.isStreaming} onToggle={actions.toggle} />
      <AssistantPanel
        id={ASSISTANT_PANEL_ID}
        launcherId={LAUNCHER_ID}
        open={open}
        mountConversation={hasOpened}
        onClose={closePanel}
        onNewChat={newChat}
        chat={chat}
        draft={draft}
        onDraftChange={setDraft}
        online={online}
        availability={availability}
        ownerFirstName={ownerFirstName}
        suggestedPrompts={suggestedPrompts}
      />
      <Suspense fallback={null}>
        <AssistantDeepLinkHandler actions={actions} />
      </Suspense>
    </AssistantActionsContext.Provider>
  );
}

/**
 * Consumes `?ask=` / `?assistant=open` on any route (except the `/chat`
 * redirect itself) — initial load or soft
 * navigation — exactly once, then strips them from the URL (preserving the
 * pathname and any other parameters) so reloads and history traversal
 * never replay the question.
 */
function AssistantDeepLinkHandler({ actions }: { actions: AssistantActions }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const consumed = useRef<string | null>(null);

  useEffect(() => {
    // `/chat` is a server redirect to `/?ask=…`; consuming here too would
    // race it (and replace() would re-run the redirect without the question).
    if (pathname === "/chat") return;
    const link = parseAssistantDeepLink(new URLSearchParams(searchParams.toString()));
    if (!link) {
      consumed.current = null;
      return;
    }
    const key = `${pathname}?${searchParams.toString()}`;
    if (consumed.current === key) return; // StrictMode / duplicate effect run
    consumed.current = key;
    router.replace(`${pathname}${link.remainingQuery}${window.location.hash}`, { scroll: false });
    if (link.ask) actions.askAbout(link.ask, { source: "deeplink" });
    else actions.open("deeplink");
  }, [actions, pathname, router, searchParams]);

  return null;
}
