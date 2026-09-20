import Link from "next/link";
import { Sparkles } from "lucide-react";
import { cn } from "@/components/ui/utils";

/** Deep link into the chat with a pre-filled question (server-safe). */
export function AskAiLink({ question, label, className }: { question: string; label?: string; className?: string }) {
  return (
    <Link
      href={`/?ask=${encodeURIComponent(question)}`}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
      {label ?? "Ask AI about this"}
    </Link>
  );
}
