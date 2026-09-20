"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { cn } from "@/components/ui/utils";
import { slugifyHeading } from "@/lib/utils/slug";
import { CodeBlock } from "./code-block";

/**
 * The only URL schemes this renderer will ever let through to a live `href`.
 * `cite:` is an internal pseudo-scheme produced by `linkifyCitations` and
 * is rendered as a button, never as an anchor.
 */
const ALLOWED_URL_SCHEMES = /^(https?|mailto)$/i;

function isRelativeUrl(value: string): boolean {
  const colon = value.indexOf(":");
  if (colon === -1) return true;
  const questionMark = value.indexOf("?");
  const numberSign = value.indexOf("#");
  const slash = value.indexOf("/");
  return (slash !== -1 && colon > slash) || (questionMark !== -1 && colon > questionMark) || (numberSign !== -1 && colon > numberSign);
}

/**
 * Allowlist-based URL sanitizer for every link react-markdown renders.
 * Only relative URLs, `http`, `https`, `mailto`, and the internal `cite:`
 * scheme pass; `javascript:`, `data:`, `blob:`, `vbscript:` and any
 * obfuscated variant are rejected to an empty string (dropped href).
 */
export function safeUrlTransform(value: string): string {
  const trimmed = value.trim();
  if (isRelativeUrl(trimmed)) return trimmed;
  const scheme = trimmed.slice(0, trimmed.indexOf(":"));
  if (/^cite$/i.test(scheme) && /^cite:\d{1,2}$/.test(trimmed)) return trimmed;
  return ALLOWED_URL_SCHEMES.test(scheme) ? trimmed : "";
}

/** Turns bare `[3]` markers into `[3](cite:3)` links (skips already-linked and code spans). */
export function linkifyCitations(content: string): string {
  const parts = content.split(/(```[\s\S]*?```|`[^`\n]*`)/g);
  return parts
    .map((part, index) => (index % 2 === 1 ? part : part.replace(/\[(\d{1,2})\](?!\()/g, "[$1](cite:$1)")))
    .join("");
}

function isExternalHref(href: string): boolean {
  return /^https?:/i.test(href);
}

export interface CitationContextValue {
  onCitationClick?: (index: number) => void;
  /** Titles by index, used for the chip's accessible name. */
  labels?: Record<number, string>;
}

const CitationContext = createContext<CitationContextValue>({});

export function CitationProvider({ value, children }: { value: CitationContextValue; children: ReactNode }) {
  return <CitationContext.Provider value={value}>{children}</CitationContext.Provider>;
}

function CitationChip({ index }: { index: number }) {
  const { onCitationClick, labels } = useContext(CitationContext);
  const label = labels?.[index];
  return (
    <button
      type="button"
      onClick={() => onCitationClick?.(index)}
      aria-label={label ? `Source ${index}: ${label}` : `Source ${index}`}
      data-citation={index}
      className="mx-0.5 inline-flex h-[1.15rem] min-w-[1.15rem] -translate-y-px items-center justify-center rounded-md border border-primary/30 bg-accent px-1 align-middle font-mono text-[10px] font-semibold leading-none text-accent-foreground transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {index}
    </button>
  );
}

function textOf(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (node && typeof node === "object" && "props" in node) return textOf((node as { props: { children?: ReactNode } }).props.children);
  return "";
}

const components: Components = {
  // Anchor ids on section headings so tables of contents and citations can deep-link.
  h2({ children }) {
    return <h2 id={slugifyHeading(textOf(children))}>{children}</h2>;
  },
  h3({ children }) {
    return <h3 id={slugifyHeading(textOf(children))}>{children}</h3>;
  },
  a({ href, children }) {
    if (!href) return <>{children}</>;
    if (href.startsWith("cite:")) return <CitationChip index={Number(href.slice(5))} />;
    const external = isExternalHref(href);
    return (
      <a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        className="font-medium text-primary underline underline-offset-4 hover:opacity-80"
      >
        {children}
        {external && <span className="sr-only"> (opens in a new tab)</span>}
      </a>
    );
  },
  // Never render `<img>` from markdown — closes the content-injection ->
  // pixel-exfiltration path. Fall back to the alt text as plain content.
  img({ alt }) {
    return alt ? <>{alt}</> : null;
  },
  code({ className, children }) {
    return <code className={cn("rounded bg-muted px-1 py-0.5 font-mono text-[0.9em]", className)}>{children}</code>;
  },
  pre({ children }) {
    return <CodeBlock>{children}</CodeBlock>;
  },
};

export interface MarkdownProps {
  content: string;
  className?: string;
  /** Convert `[n]` markers into citation chips (chat answers only). */
  citations?: boolean;
}

/**
 * Renders AI output and content prose as sanitized markdown. Security
 * boundary: no `rehype-raw`, no `dangerouslySetInnerHTML` — react-markdown
 * never parses raw HTML embedded in the input; it only emits elements it
 * constructed from the markdown AST. Safe to call with partial markdown at
 * any prefix length for mid-stream rendering.
 */
export function Markdown({ content, className, citations = false }: MarkdownProps) {
  const prepared = useMemo(() => (citations ? linkifyCitations(content) : content), [content, citations]);
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeHighlight, { detect: false, ignoreMissing: true }]]}
        urlTransform={safeUrlTransform}
        components={components}
      >
        {prepared}
      </ReactMarkdown>
    </div>
  );
}
