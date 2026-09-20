import { Markdown } from "@/components/markdown/markdown";
import { Prose } from "@/components/ui/prose";

/**
 * Renders a content document's Markdown body on a page. The same
 * sanitized renderer as chat (no raw HTML, URL allowlist, no images).
 */
export function DocumentBody({ body, className, size = "sm" }: { body: string; className?: string; size?: "sm" | "base" }) {
  return (
    <Prose className={className} size={size}>
      <Markdown content={body} />
    </Prose>
  );
}
