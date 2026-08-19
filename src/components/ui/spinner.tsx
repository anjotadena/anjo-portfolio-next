import { Loader2 } from "lucide-react";
import { cn } from "./utils";

export interface SpinnerProps {
  className?: string;
  /**
   * Accessible label. Omit when a sibling `aria-live` region already
   * announces status (e.g. the chat panel's single live region) — otherwise
   * this renders its own `role="status"` announcement.
   */
  label?: string;
}

/**
 * Small spinning loader. `animate-spin` is neutralized globally under
 * `prefers-reduced-motion: reduce` (see globals.css), so no extra handling
 * is needed here.
 */
export function Spinner({ className, label }: SpinnerProps) {
  if (!label) {
    return (
      <Loader2
        aria-hidden="true"
        className={cn("h-4 w-4 animate-spin text-muted-foreground", className)}
      />
    );
  }

  return (
    <span role="status" className="inline-flex items-center gap-2">
      <Loader2 aria-hidden="true" className={cn("h-4 w-4 animate-spin text-muted-foreground", className)} />
      <span>{label}</span>
    </span>
  );
}
