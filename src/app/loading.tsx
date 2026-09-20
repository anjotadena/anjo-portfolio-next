import { Loader2 } from "lucide-react";

/** Route-level loading state shown inside the shell while a page's server data streams in. */
export default function Loading() {
  return (
    <div role="status" aria-label="Loading page" className="flex min-h-0 flex-1 items-center justify-center p-10">
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin text-primary" aria-hidden="true" />
        Loading…
      </div>
    </div>
  );
}
