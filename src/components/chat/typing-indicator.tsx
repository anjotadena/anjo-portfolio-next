/** Three pulsing dots shown before the first token arrives. Motion is neutralized under prefers-reduced-motion. */
export function TypingIndicator() {
  return (
    <span className="inline-flex items-center gap-1 py-1" aria-hidden="true">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground" />
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground [animation-delay:150ms]" />
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground [animation-delay:300ms]" />
    </span>
  );
}
