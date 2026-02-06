"use client";

import { useCommandPalette } from "@/components/command-palette/useCommandPalette";
import { on } from "@/utils";

export function AskAiButton() {
  const { openPalette } = useCommandPalette();

  return (
    <>
      {/* Floating Button */}
      <button
        type="button"
        onClick={openPalette}
        className={on(
          "fixed bottom-6 right-6 z-40",
          "flex items-center gap-2 rounded-full",
          "bg-primary-600 px-4 py-3 text-sm font-medium text-white",
          "shadow-lg shadow-primary-600/25",
          "transition-all duration-200 ease-out",
          "hover:bg-primary-700 hover:shadow-xl hover:shadow-primary-600/30 hover:scale-105",
          "active:scale-100",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
          "dark:shadow-primary-500/10 dark:hover:shadow-primary-500/20",
          // Mobile: smaller, icon-first
          "sm:px-5 sm:py-3",
          "motion-safe:animate-fade-in"
        )}
        aria-label="Ask Anjo - Open AI assistant"
      >
        <span className="text-base" aria-hidden="true">
          ✨
        </span>
        <span className="hidden sm:inline">Ask Anjo</span>
        <span className="sm:hidden">Ask</span>
      </button>

      {/* Keyboard shortcut hint - desktop only */}
      <div
        className={on(
          "fixed bottom-6 right-6 z-30",
          "hidden lg:flex",
          "translate-y-14",
          "items-center gap-1",
          "rounded-md bg-zinc-900/80 px-2 py-1 text-[10px] text-zinc-400 backdrop-blur-sm",
          "dark:bg-zinc-800/80"
        )}
        aria-hidden="true"
      >
        <kbd className="rounded bg-zinc-700/50 px-1 font-mono text-zinc-300">⌘</kbd>
        <span>+</span>
        <kbd className="rounded bg-zinc-700/50 px-1 font-mono text-zinc-300">K</kbd>
      </div>
    </>
  );
}
