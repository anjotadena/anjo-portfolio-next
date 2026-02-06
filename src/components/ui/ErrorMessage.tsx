"use client";

import { useEffect, useState } from "react";

import type { AskErrorType } from "@/lib/ask/types";
import { on } from "@/utils";

// ---------------------------------------------------------------------------
// Error Message Component
// ---------------------------------------------------------------------------
// A calm, professional error display for the Ask AI feature.
// - No red alerts or warning icons
// - Soft, subtle visual treatment
// - Recruiter-friendly language
// - Smooth fade-in animation (respects prefers-reduced-motion)
// ---------------------------------------------------------------------------

type ErrorMessageProps = {
  type: AskErrorType;
  message: string;
  className?: string;
  onRetry?: () => void;
};

// TODO: Add user feedback loop (e.g., "Was this helpful?" for error recovery)

export function ErrorMessage({ type, message, className, onRetry }: ErrorMessageProps) {
  const [isVisible, setIsVisible] = useState(false);

  // Trigger fade-in animation on mount
  useEffect(() => {
    const timer = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(timer);
  }, []);

  // Determine if retry is allowed for this error type
  const canRetry = type !== "rate_limited" && type !== "abusive";

  return (
    <div
      className={on(
        // Base styles - soft, professional appearance
        "rounded-lg bg-zinc-50 px-4 py-3 dark:bg-zinc-900/50",
        // Animation - subtle fade-in
        "transition-opacity duration-200 ease-out",
        isVisible ? "opacity-100" : "opacity-0",
        // Optional soft pulse animation for emphasis
        "animate-error-fade-in",
        className
      )}
      role="status"
      aria-live="polite"
    >
      <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        {message}
      </p>

      {/* Retry hint - only shown when retry is allowed */}
      {canRetry && onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 text-xs text-zinc-400 transition-colors hover:text-zinc-600 dark:hover:text-zinc-300"
        >
          Try again
        </button>
      )}

      {/* Rate limit hint */}
      {type === "rate_limited" && (
        <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">
          Please wait a moment before trying again.
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Inline Error Variant (for chat messages)
// ---------------------------------------------------------------------------
type InlineErrorProps = {
  message: string;
  className?: string;
};

export function InlineError({ message, className }: InlineErrorProps) {
  return (
    <p
      className={on(
        "text-sm leading-relaxed text-zinc-500 dark:text-zinc-400",
        "animate-error-fade-in",
        className
      )}
      role="status"
      aria-live="polite"
    >
      {message}
    </p>
  );
}
