"use client";

import { useCommandPaletteContext } from "@/components/command-palette/CommandPaletteProvider";

export function useCommandPalette() {
  const { isOpen, setIsOpen, openPalette, closePalette } = useCommandPaletteContext();
  return { isOpen, setIsOpen, openPalette, closePalette };
}

