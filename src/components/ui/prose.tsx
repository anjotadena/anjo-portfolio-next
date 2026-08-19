import type { ReactNode } from "react";
import { cn } from "./utils";

export interface ProseProps {
  children: ReactNode;
  className?: string;
}

/**
 * Typographic wrapper for markdown/rich-text output. Hand-rolled (no
 * `@tailwindcss/typography` plugin installed) using child-element selectors,
 * scoped so it only affects elements the `Markdown` renderer actually emits.
 */
export function Prose({ children, className }: ProseProps) {
  return (
    <div
      className={cn(
        "max-w-none text-sm leading-relaxed text-foreground",
        "[&>*+*]:mt-3",
        "[&_h1]:mt-6 [&_h1]:text-lg [&_h1]:font-medium [&_h1]:first:mt-0",
        "[&_h2]:mt-6 [&_h2]:text-base [&_h2]:font-medium [&_h2]:first:mt-0",
        "[&_h3]:mt-4 [&_h3]:text-sm [&_h3]:font-medium [&_h3]:first:mt-0",
        "[&_p]:leading-relaxed",
        "[&_a]:font-medium",
        "[&_ul]:ml-5 [&_ul]:list-disc [&_ul]:space-y-1",
        "[&_ol]:ml-5 [&_ol]:list-decimal [&_ol]:space-y-1",
        "[&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-muted-foreground",
        "[&_strong]:font-medium",
        "[&_hr]:border-border",
        "[&_table]:w-full [&_table]:border-collapse [&_table]:text-left",
        "[&_th]:border-b [&_th]:border-border [&_th]:pb-1 [&_th]:pr-3 [&_th]:font-medium",
        "[&_td]:border-b [&_td]:border-border [&_td]:py-1 [&_td]:pr-3",
        className,
      )}
    >
      {children}
    </div>
  );
}
