"use client";

import { MessageSquareText, X } from "lucide-react";
import { cn } from "@/components/ui/utils";

export interface AssistantLauncherProps {
  id: string;
  panelId: string;
  open: boolean;
  /** An answer is streaming (shown as a small activity dot while minimised). */
  busy: boolean;
  onToggle: () => void;
}

/**
 * Fixed bottom-right launcher. 48px tall (≥ 44px touch target), offset from
 * the viewport edges plus the device safe-area insets. The visible label
 * collapses to an icon on narrow screens; the accessible name is constant.
 */
export function AssistantLauncher({ id, panelId, open, busy, onToggle }: AssistantLauncherProps) {
  return (
    <button
      id={id}
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      aria-controls={panelId}
      aria-label={open ? "Minimize Anjo AI" : "Ask Anjo AI"}
      data-testid="assistant-launcher"
      className={cn(
        "fixed z-40 inline-flex h-12 min-w-12 items-center justify-center gap-2 rounded-full border border-primary bg-primary px-3.5 font-mono text-sm font-semibold text-primary-foreground shadow-lg shadow-black/40 transition-[transform,opacity] hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:px-4",
        "bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] right-[calc(1rem+env(safe-area-inset-right,0px))] sm:bottom-[calc(1.5rem+env(safe-area-inset-bottom,0px))] sm:right-[calc(1.5rem+env(safe-area-inset-right,0px))]",
        // On phones the open panel is a full-screen sheet with its own close control.
        open && "max-sm:pointer-events-none max-sm:opacity-0",
      )}
    >
      {open ? <X className="h-5 w-5" aria-hidden="true" /> : <MessageSquareText className="h-5 w-5" aria-hidden="true" />}
      <span className="hidden sm:inline" aria-hidden="true">
        {open ? "Minimize" : "Ask Anjo AI"}
      </span>
      {busy && !open && (
        <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3" aria-hidden="true">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60 motion-reduce:hidden" />
          <span className="relative inline-flex h-3 w-3 rounded-full border-2 border-background bg-success" />
        </span>
      )}
    </button>
  );
}
