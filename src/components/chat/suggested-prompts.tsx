"use client";

import { Cloud, Code2, Compass, FolderKanban, Mail, Sparkles, User, Wrench } from "lucide-react";
import { cn } from "@/components/ui/utils";

export interface SuggestedPromptsProps {
  prompts: string[];
  onSelect: (prompt: string) => void;
  disabled?: boolean;
  /** "grid" for the landing state; "chips" for compact inline use. */
  variant?: "grid" | "chips";
  className?: string;
}

function iconFor(prompt: string) {
  const p = prompt.toLowerCase();
  if (/contact|reach/.test(p)) return Mail;
  if (/cloud|aws|azure/.test(p)) return Cloud;
  if (/\.net|angular|skills?/.test(p)) return Code2;
  if (/architecture|approach/.test(p)) return Compass;
  if (/devops|pipeline/.test(p)) return Wrench;
  if (/project|asterweave|what is/.test(p)) return FolderKanban;
  if (/agentic|ai/.test(p)) return Sparkles;
  return User;
}

/** Suggested questions generated server-side from the content that actually exists. */
export function SuggestedPrompts({ prompts, onSelect, disabled, variant = "grid", className }: SuggestedPromptsProps) {
  if (prompts.length === 0) return null;
  return (
    <ul className={cn(variant === "grid" ? "grid grid-cols-1 gap-2 sm:grid-cols-2" : "flex flex-wrap gap-2", className)} aria-label="Suggested questions">
      {prompts.map((prompt) => {
        const Icon = iconFor(prompt);
        return (
          <li key={prompt}>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onSelect(prompt)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl border border-border bg-card text-left text-sm text-foreground transition-colors hover:border-primary/40 hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
                variant === "grid" ? "min-h-12 px-3.5 py-2.5" : "min-h-9 rounded-full px-3.5 py-1.5",
              )}
            >
              {variant === "grid" && (
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
              )}
              <span className="line-clamp-2">{prompt}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
