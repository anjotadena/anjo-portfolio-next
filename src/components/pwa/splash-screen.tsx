"use client";

import { useEffect, useRef, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/components/ui/utils";

export interface SplashScreenProps {
  assistantName: string;
  initials: string;
  version: string;
  documents: number;
  sections: number;
}

interface BootLine {
  id: string;
  label: string;
  /** Result text once the step completes. */
  result?: string;
  state: "pending" | "running" | "done" | "warn";
}

const SESSION_KEY = "anjo-ai:splash-shown";
const STEP_MS = 260;
const SPINNER = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

interface HealthSummary {
  retriever?: string;
  backend?: string;
  modelBacked?: boolean;
}

async function fetchHealth(signal: AbortSignal): Promise<HealthSummary | null> {
  try {
    const response = await fetch("/api/health", { signal, cache: "no-store" });
    if (!response.ok) return null;
    const body = (await response.json()) as { retrieval?: { retriever?: string; backend?: string }; ai?: { modelBacked?: boolean } };
    return { retriever: body.retrieval?.retriever, backend: body.retrieval?.backend, modelBacked: body.ai?.modelBacked };
  } catch {
    return null;
  }
}

/**
 * Terminal-style boot screen shown once per session (first paint of the
 * PWA), in the spirit of a CLI start-up: a short log of real steps —
 * knowledge base size, retrieval mode, assistant status, build — with a
 * spinner, then a blinking cursor. Any key or click skips it. Under
 * `prefers-reduced-motion` all lines render at once and it dismisses fast.
 */
export function SplashScreen({ assistantName, initials, version, documents, sections }: SplashScreenProps) {
  const [phase, setPhase] = useState<"boot" | "ready" | "leaving" | "gone">("boot");
  const [lines, setLines] = useState<BootLine[]>([
    { id: "kb", label: "Loading knowledge base", state: "pending" },
    { id: "retrieval", label: "Starting retrieval engine", state: "pending" },
    { id: "assistant", label: `Connecting ${assistantName}`, state: "pending" },
    { id: "build", label: "Checking build", state: "pending" },
  ]);
  const [frame, setFrame] = useState(0);
  const dismissedRef = useRef(false);
  const finishRef = useRef<() => void>(() => undefined);

  useEffect(() => {
    let shown = false;
    try {
      shown = sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
      // storage unavailable: show the splash, it is harmless
    }
    if (shown) {
      // Already seen this session: remove it before the next paint.
      queueMicrotask(() => setPhase("gone"));
      return;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const controller = new AbortController();
    const timers: ReturnType<typeof setTimeout>[] = [];
    const at = (ms: number, fn: () => void) => timers.push(setTimeout(fn, reduceMotion ? 0 : ms));
    const update = (id: string, patch: Partial<BootLine>) => setLines((current) => current.map((line) => (line.id === id ? { ...line, ...patch } : line)));

    const finish = () => {
      if (dismissedRef.current) return;
      dismissedRef.current = true;
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        // ignore
      }
      setPhase("leaving");
      timers.push(setTimeout(() => setPhase("gone"), reduceMotion ? 0 : 320));
    };
    finishRef.current = finish;

    const spinner = setInterval(() => setFrame((value) => (value + 1) % SPINNER.length), 80);
    const healthPromise = fetchHealth(controller.signal);

    at(0, () => update("kb", { state: "running" }));
    at(STEP_MS, () => {
      update("kb", { state: "done", result: `${documents} documents · ${sections} sections` });
      update("retrieval", { state: "running" });
    });
    at(STEP_MS * 2, async () => {
      const health = await Promise.race<HealthSummary | null>([healthPromise, new Promise((resolve) => setTimeout(() => resolve(null), 1500))]);
      if (health?.retriever) {
        update("retrieval", { state: "done", result: health.retriever === "hybrid" ? `hybrid search (${health.backend ?? "vector"} + lexical)` : "lexical search" });
        update("assistant", { state: "running" });
        at(STEP_MS, () => {
          update("assistant", { state: health.modelBacked ? "done" : "warn", result: health.modelBacked ? "online" : "quoting the portfolio (no model connected)" });
          update("build", { state: "running" });
          at(STEP_MS, () => {
            update("build", { state: "done", result: `v${version}` });
            setPhase("ready");
            at(650, finish);
          });
        });
      } else {
        update("retrieval", { state: "warn", result: navigator.onLine ? "unavailable" : "offline" });
        update("assistant", { state: "warn", result: "unreachable" });
        update("build", { state: "done", result: `v${version}` });
        setPhase("ready");
        at(650, finish);
      }
    });

    const skip = (event: KeyboardEvent | MouseEvent | TouchEvent) => {
      if (event instanceof KeyboardEvent && (event.metaKey || event.ctrlKey || event.altKey)) return;
      finish();
    };
    window.addEventListener("keydown", skip);
    window.addEventListener("pointerdown", skip);

    return () => {
      controller.abort();
      clearInterval(spinner);
      for (const timer of timers) clearTimeout(timer);
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
    };
  }, [assistantName, documents, sections, version]);

  if (phase === "gone") return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Starting ${assistantName}`}
      data-testid="splash-screen"
      className={cn(
        "fixed inset-0 z-[60] flex items-center justify-center bg-background px-6 transition-opacity duration-300",
        phase === "leaving" && "pointer-events-none opacity-0",
      )}
    >
      <div className="w-full max-w-md">
        <div className="flex items-center gap-4">
          <Avatar initials={initials} size="xl" className="animate-fade-up" />
          <div>
            <p className="text-2xl font-semibold tracking-tight text-foreground">{assistantName}</p>
            <p className="text-sm text-muted-foreground">Starting up…</p>
          </div>
        </div>

        <ol className="mt-8 flex flex-col gap-2 font-mono text-[13px]" aria-live="polite" aria-label="Start-up progress">
          {lines.map((line) => (
            <li key={line.id} className={cn("flex items-baseline gap-2", line.state === "pending" && "text-muted-foreground/50")}>
              <span className="w-4 shrink-0 text-center" aria-hidden="true">
                {line.state === "running" ? <span className="text-primary">{SPINNER[frame]}</span> : line.state === "done" ? <span className="text-success">✓</span> : line.state === "warn" ? <span className="text-destructive">!</span> : "·"}
              </span>
              <span className="shrink-0 whitespace-nowrap text-foreground">{line.label}</span>
              {line.result && <span className="min-w-0 text-muted-foreground">— {line.result}</span>}
              <span className="sr-only">{line.state === "running" ? "(in progress)" : line.state === "done" ? "(done)" : line.state === "warn" ? "(warning)" : ""}</span>
            </li>
          ))}
          <li className="mt-2 flex items-center gap-2 text-primary" aria-hidden="true">
            <span className="w-4 text-center">▸</span>
            <span>{phase === "boot" ? "" : "Ready."}</span>
            <span className="inline-block h-4 w-2 animate-pulse bg-primary" />
          </li>
        </ol>

        <button
          type="button"
          onClick={() => finishRef.current()}
          className="mt-8 rounded-md text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Press any key or tap to continue
        </button>
      </div>
    </div>
  );
}
