"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

/** Route-level error boundary. Never renders the error message/stack — only a safe, generic notice. */
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // The digest lets the server-side log line be correlated without exposing details to the visitor.
    console.error("route_error", error.digest ?? "no-digest");
  }, [error]);

  return (
    <div className="flex min-h-0 flex-1 items-center justify-center p-6">
      <div className="max-w-md text-center">
        <AlertTriangle className="mx-auto h-8 w-8 text-destructive" aria-hidden="true" />
        <h1 className="mt-3 text-xl font-semibold text-foreground">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">An unexpected error occurred while rendering this page.</p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 inline-flex h-10 items-center rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
