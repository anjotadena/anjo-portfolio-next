"use client";

import { useEffect, useState } from "react";
import { Kbd } from "@/components/ui/kbd";

const SPINNER = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

/** Stage words reflect what the pipeline is actually doing while the first token is awaited. */
const STAGES = ["Reading the portfolio", "Retrieving sources", "Cross-checking facts", "Composing an answer", "Citing sources"];

export interface TypingIndicatorProps {
  /** Timestamp the request started, for the elapsed counter. */
  startedAt?: number;
  /** Show the "esc to stop" hint (desktop). */
  showStopHint?: boolean;
}

/**
 * CLI-style "thinking" line shown before the first token arrives: a
 * braille spinner, a rotating stage word, elapsed seconds, and the stop
 * shortcut. Decorative for screen readers — the chat's single live region
 * announces start/complete/stop. Motion is neutralised under
 * `prefers-reduced-motion` by rendering the first frame only.
 */
export function TypingIndicator({ startedAt, showStopHint = true }: TypingIndicatorProps) {
  const [frame, setFrame] = useState(0);
  const [stage, setStage] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const start = startedAt ?? Date.now();
    const spin = setInterval(() => setFrame((value) => (value + 1) % SPINNER.length), 80);
    const rotate = setInterval(() => setStage((value) => (value + 1) % STAGES.length), 1400);
    const tick = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 250);
    return () => {
      clearInterval(spin);
      clearInterval(rotate);
      clearInterval(tick);
    };
  }, [startedAt]);

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 py-0.5 font-mono text-[13px] text-muted-foreground" aria-hidden="true">
      <span className="inline-flex items-center gap-2">
        <span className="w-3 text-primary">{SPINNER[frame]}</span>
        <span className="text-foreground">{STAGES[stage]}…</span>
      </span>
      <span className="tabular-nums">{elapsed}s</span>
      {showStopHint && (
        <span className="hidden items-center gap-1 sm:inline-flex">
          <Kbd>esc</Kbd> to stop
        </span>
      )}
    </div>
  );
}
