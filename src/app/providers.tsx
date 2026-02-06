"use client";

import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";

import { CommandPaletteProvider } from "@/components/command-palette/CommandPaletteProvider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem={true}>
      <CommandPaletteProvider>{children}</CommandPaletteProvider>
    </ThemeProvider>
  );
}

