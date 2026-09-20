import { Markdown } from "@/components/markdown/markdown";
import { Prose } from "@/components/ui/prose";

/**
 * Renders a content document's Markdown body on a page. The same
 * sanitized renderer as chat (no raw HTML, URL allowlist, no images).
 */
export function DocumentBody({ body, className }: { body: string; className?: string }) {
  return (
    <Prose className={className}>
      <Markdown content={body} />
    </Prose>
  );
}
