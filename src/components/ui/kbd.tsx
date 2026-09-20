import type { HTMLAttributes } from "react";
import { cn } from "./utils";

/** Keyboard shortcut hint, e.g. ⌘K. Purely decorative unless labelled by the caller. */
export function Kbd({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <kbd
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center rounded border border-border bg-muted px-1 font-mono text-[10px] font-medium text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}
