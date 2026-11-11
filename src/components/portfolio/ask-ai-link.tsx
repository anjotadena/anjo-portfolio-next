"use client";

import type { MouseEvent, ReactNode } from "react";
import { MessageSquareText } from "lucide-react";
import { useAssistantActions } from "@/components/assistant/assistant-context";
import { askHref, OPEN_PARAM } from "@/components/assistant/deep-link";
import { cn } from "@/components/ui/utils";

export interface AskAiLinkProps {
  /** Explicit question to submit. Omit to just open the assistant. */
  question?: string;
  /** Seeds retrieval with this public document (e.g. the current project). */
  contextSlug?: string;
  label?: ReactNode;
  className?: string;
  /** "pill" (default) or "plain" (caller supplies the styling). */
  variant?: "pill" | "plain";
  icon?: boolean;
}

/**
 * "Ask Anjo AI" action. Opens the site-wide floating assistant in place
 * (and submits the explicit question, if any). It is a real link to the
 * `?ask=` deep link, so it still works before hydration or with modifier
 * clicks (new tab).
 */
export function AskAiLink({ question, contextSlug, label, className, variant = "pill", icon = true }: AskAiLinkProps) {
  const actions = useAssistantActions();
  const href = question ? askHref(question) : `/?${OPEN_PARAM}=open`;

  function onClick(event: MouseEvent<HTMLAnchorElement>) {
    if (!actions || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (question) actions.askAbout(question, { contextSlug, source: "cta" });
    else actions.open("cta");
  }

  return (
    <a
      href={href}
      onClick={onClick}
      rel="nofollow"
      className={cn(
        variant === "pill" &&
          "inline-flex min-h-10 items-center gap-2 rounded-lg border border-input bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      {icon && <MessageSquareText className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />}
      {label ?? "Ask Anjo AI about this"}
    </a>
  );
}
