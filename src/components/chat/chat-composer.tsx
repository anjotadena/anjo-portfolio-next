import { useId, type ChangeEvent, type FormEvent } from "react";
import { ArrowUp, Square } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ChatComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onStop: () => void;
  isStreaming: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

/**
 * The single rounded chat input with a circular send/stop button. Purely
 * controlled — all state lives in `chat-panel.tsx` — so this stays a small,
 * easily testable leaf.
 */
export function ChatComposer({
  value,
  onChange,
  onSubmit,
  onStop,
  isStreaming,
  disabled = false,
  placeholder = "Ask a question about Anjo...",
  className,
}: ChatComposerProps) {
  const inputId = useId();

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onChange(event.target.value);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isStreaming || disabled || value.trim().length === 0) return;
    onSubmit();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={className ? `${className}` : undefined}
      aria-label="Ask a question about Anjo's work"
    >
      <div className="flex w-full items-center gap-2 rounded-full border border-border bg-background py-1.5 pl-4 pr-1.5 shadow-sm transition-colors focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background">
        <label htmlFor={inputId} className="sr-only">
          Ask a question about Anjo
        </label>
        <input
          id={inputId}
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          className="h-9 min-w-0 flex-1 border-0 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
        />
        {isStreaming ? (
          <Button type="button" size="icon" circle onClick={onStop} aria-label="Stop generating">
            <Square className="h-4 w-4" aria-hidden="true" />
          </Button>
        ) : (
          <Button
            type="submit"
            size="icon"
            circle
            disabled={disabled || value.trim().length === 0}
            aria-label="Send question"
          >
            <ArrowUp className="h-4 w-4" aria-hidden="true" />
          </Button>
        )}
      </div>
    </form>
  );
}
