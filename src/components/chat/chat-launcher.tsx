import Link from "next/link";
import { Sparkles } from "lucide-react";
import { cn } from "@/components/ui/utils";

export interface ChatLauncherProps {
  className?: string;
  label?: string;
}

/**
 * Compact entry point back to the homepage chat experience, for use on
 * non-home pages (e.g. a projects or experience page footer). Deliberately
 * trivial — a styled link, not a second chat surface.
 */
export function ChatLauncher({ className, label = "Ask about Anjo's work" }: ChatLauncherProps) {
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:border-primary/40 hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
    >
      <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
      {label}
    </Link>
  );
}
