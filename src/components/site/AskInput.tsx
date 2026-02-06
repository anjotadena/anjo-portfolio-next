"use client";

import { LuSearch } from "react-icons/lu";

import { useCommandPalette } from "@/components/command-palette/useCommandPalette";
import { on } from "@/utils";

export function AskInput() {
  const { openPalette } = useCommandPalette();

  return (
    <button
      type="button"
      onClick={openPalette}
      className={on(
        "group flex w-full items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-3 text-left text-sm",
        "hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2",
        "dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900 dark:focus:ring-zinc-50"
      )}
      aria-label="Open Ask Me Anything command palette"
    >
      <LuSearch aria-hidden="true" className="text-zinc-500" />
      <span className="flex-1 text-zinc-500 group-hover:text-zinc-600 dark:group-hover:text-zinc-300">
        Ask me anything…
      </span>
      <span className="rounded-full border border-zinc-200 px-2 py-1 text-[11px] text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
        Ctrl K
      </span>
    </button>
  );
}

