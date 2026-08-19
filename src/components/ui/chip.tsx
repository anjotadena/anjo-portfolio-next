import type { ButtonHTMLAttributes } from "react";
import { cn } from "./utils";

export type ChipProps = ButtonHTMLAttributes<HTMLButtonElement>;

/** A clickable suggestion pill (chat suggestions, follow-up questions, project filters). */
export function Chip({ className, type = "button", ...props }: ChipProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3.5 py-1.5 text-sm text-foreground transition-colors hover:border-primary/40 hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
