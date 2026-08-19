import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/components/ui/utils";

/**
 * The only URL schemes this renderer will ever let through to a live `href`.
 * react-markdown's own `defaultUrlTransform` additionally allows `ircs?:`
 * and `xmpp:` — those are deliberately excluded here.
 */
const ALLOWED_URL_SCHEMES = /^(https?|mailto)$/i;

/**
 * A URL is "relative" (no scheme to validate) if there is no `:` before the
 * first `/`, `?`, or `#` — mirrors react-markdown's own relative-URL check,
 * so relative links/anchors keep working unmodified.
 */
function isRelativeUrl(value: string): boolean {
  const colon = value.indexOf(":");
  if (colon === -1) return true;
  const questionMark = value.indexOf("?");
  const numberSign = value.indexOf("#");
  const slash = value.indexOf("/");
  return (
    (slash !== -1 && colon > slash) ||
    (questionMark !== -1 && colon > questionMark) ||
    (numberSign !== -1 && colon > numberSign)
  );
}

/**
 * Allowlist-based URL sanitizer used for every link and autolink (including
 * bare `www.` autolinks introduced by `remark-gfm`) react-markdown renders.
 *
 * Only relative URLs and the `http`, `https`, and `mailto` schemes pass
 * through unchanged; every other scheme is rejected to an empty string,
 * which react-markdown then drops from the rendered anchor's `href`. This
 * rejects `javascript:`, `data:`, `blob:`, `vbscript:`, and react-markdown's
 * default extra allowances (`ircs?:`, `xmpp:`) outright, and rejects any
 * obfuscated variant of a disallowed scheme (mixed case, embedded
 * tabs/newlines such as `java\tscript:`, etc.) because the allowlist regex
 * only matches an exact, unmodified `http`/`https`/`mailto` token — any
 * obfuscation just produces a scheme string that still fails the match.
 * HTML-entity-escaped schemes (e.g. `javascript&colon;...`) never reach this
 * function as an intact scheme string in the first place: CommonMark decodes
 * character references in link destinations before react-markdown calls
 * this transform.
 */
export function safeUrlTransform(value: string): string {
  const trimmed = value.trim();
  if (isRelativeUrl(trimmed)) return trimmed;
  const scheme = trimmed.slice(0, trimmed.indexOf(":"));
  return ALLOWED_URL_SCHEMES.test(scheme) ? trimmed : "";
}

function isExternalHref(href: string): boolean {
  return /^https?:/i.test(href);
}

const components: Components = {
  a({ href, children }) {
    if (!href) return <>{children}</>;
    const external = isExternalHref(href);
    return (
      <a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
      >
        {children}
        {external && <span className="sr-only"> (opens in a new tab)</span>}
      </a>
    );
  },
  // Never render `<img>` from markdown — closes the corpus-injection ->
  // pixel-exfiltration path. Fall back to the alt text as plain content.
  img({ alt }) {
    return alt ? <>{alt}</> : null;
  },
  code({ className, children }) {
    return <code className={cn("font-mono text-sm", className)}>{children}</code>;
  },
  pre({ children }) {
    return (
      <pre className="overflow-x-auto rounded-md border border-border bg-muted p-3 font-mono text-sm">
        {children}
      </pre>
    );
  },
};

export interface MarkdownProps {
  content: string;
  className?: string;
}

/**
 * Renders AI output and content prose as sanitized markdown. Security
 * boundary: no `rehype-raw`, no `dangerouslySetInnerHTML` — react-markdown
 * never parses raw HTML embedded in the input, it only emits elements it
 * itself constructed from the markdown AST. Safe to call with partial
 * markdown (unterminated code fence, unbalanced bracket, etc.) at any
 * prefix length for mid-stream rendering — CommonMark parsers are built to
 * complete gracefully on truncated input rather than throw.
 */
export function Markdown({ content, className }: MarkdownProps) {
  return (
    <div className={className}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} urlTransform={safeUrlTransform} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
