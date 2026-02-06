"use client";

import { useTheme } from "next-themes";
import { useEffect, useMemo, useState } from "react";
import { LuMoon, LuSun } from "react-icons/lu";

import { on } from "@/utils";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const current = useMemo(() => {
    if (!mounted) return "system";
    return (theme === "system" ? resolvedTheme : theme) ?? "light";
  }, [mounted, resolvedTheme, theme]);

  const nextTheme = current === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      className={on(
        "inline-flex items-center gap-2 rounded-md border border-zinc-200 px-2.5 py-2 text-sm",
        "hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2",
        "dark:border-zinc-800 dark:hover:bg-zinc-900 dark:focus:ring-zinc-50"
      )}
      aria-label={mounted ? `Switch to ${nextTheme} theme` : "Toggle theme"}
      onClick={() => setTheme(nextTheme)}
    >
      {current === "dark" ? <LuMoon aria-hidden="true" /> : <LuSun aria-hidden="true" />}
      <span className="hidden sm:inline">{current === "dark" ? "Dark" : "Light"}</span>
    </button>
  );
}

