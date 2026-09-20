"use client";

import { useEffect, useId, useRef, type ChangeEvent, type FormEvent, type KeyboardEvent } from "react";
import { ArrowUp, Square } from "lucide-react";
import { CHAT_MESSAGE_MAX_LENGTH } from "@/types/chat";
import { cn } from "@/components/ui/utils";

export interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onStop: () => void;
  isStreaming: boolean;
  disabled?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
}

const MAX_ROWS_PX = 180;

/**
 * Auto-resizing textarea: Enter sends, Shift+Enter inserts a newline. The
 * send button becomes Stop while streaming. Uses `enterKeyHint="send"` and
 * 16px text so iOS neither zooms nor mislabels the keyboard.
 */
export function ChatInput({ value, onChange, onSubmit, onStop, isStreaming, disabled = false, placeholder = "Ask me anything about Anjo…", autoFocus = false, className }: ChatInputProps) {
  const id = useId();
  const ref = useRef<HTMLTextAreaElement>(null);
  const remaining = CHAT_MESSAGE_MAX_LENGTH - value.length;
  const canSend = !disabled && !isStreaming && value.trim().length > 0 && remaining >= 0;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${Math.min(el.scrollHeight, MAX_ROWS_PX)}px`;
  }, [value]);

  // Focus on load only for pointer devices: on phones an auto-focused
  // textarea pops the keyboard over the landing content.
  useEffect(() => {
    if (autoFocus && window.matchMedia("(pointer: fine)").matches) ref.current?.focus();
  }, [autoFocus]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (canSend) onSubmit();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      if (canSend) onSubmit();
    }
  }

  return (
    <form onSubmit={handleSubmit} className={cn("w-full", className)} aria-label="Ask Anjo AI">
      <div className="flex items-end gap-2 rounded-2xl border border-border bg-card p-2 shadow-sm transition-shadow focus-within:border-primary/50 focus-within:shadow-md">
        <label htmlFor={id} className="sr-only">
          Your question
        </label>
        <textarea
          ref={ref}
          id={id}
          rows={1}
          value={value}
          onChange={(event: ChangeEvent<HTMLTextAreaElement>) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          enterKeyHint="send"
          maxLength={CHAT_MESSAGE_MAX_LENGTH + 50}
          aria-describedby={`${id}-hint`}
          className="max-h-[180px] min-h-[44px] flex-1 resize-none bg-transparent px-2 py-2.5 text-base text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50 sm:text-sm"
        />
        {isStreaming ? (
          <button
            type="button"
            onClick={onStop}
            aria-label="Stop generating"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Square className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={!canSend}
            aria-label="Send question"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-40"
          >
            <ArrowUp className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
      <p id={`${id}-hint`} className={cn("mt-1.5 hidden text-right text-[11px] text-muted-foreground sm:block", remaining < 0 && "text-destructive")}>
        {remaining < 100 ? `${remaining} characters left · ` : ""}Press Enter to send · Shift + Enter for a new line
      </p>
    </form>
  );
}
