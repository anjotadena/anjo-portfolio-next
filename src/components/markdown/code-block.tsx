"use client";

import { useRef, useState, type ReactNode } from "react";
import { Check, Copy } from "lucide-react";

/** `<pre>` wrapper with a copy-to-clipboard button; the code text is read from the DOM on click. */
export function CodeBlock({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  async function copy() {
    const text = ref.current?.textContent ?? "";
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard can be unavailable (insecure context / permissions); fail quietly.
    }
  }

  return (
    <div className="group relative my-3">
      <pre
        ref={ref}
        tabIndex={0}
        className="overflow-x-auto rounded-lg border border-border bg-surface p-3 pr-12 font-mono text-[13px] leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {children}
      </pre>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? "Copied" : "Copy code"}
        className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground opacity-70 transition-opacity hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-success" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
      </button>
    </div>
  );
}
