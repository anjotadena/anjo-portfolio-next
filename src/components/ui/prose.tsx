import type { ReactNode } from "react";
import { cn } from "./utils";

export interface ProseProps {
  children: ReactNode;
  className?: string;
  size?: "sm" | "base";
}

/**
 * Typographic wrapper for markdown output. Hand-rolled (no typography
 * plugin) with child-element selectors scoped to what the `Markdown`
 * renderer emits.
 */
export function Prose({ children, className, size = "sm" }: ProseProps) {
  return (
    <div
      className={cn(
        "max-w-none text-foreground",
        size === "sm" ? "text-sm leading-relaxed" : "text-base leading-7",
        "[&>*+*]:mt-3",
        "[&_h1]:mt-8 [&_h1]:text-xl [&_h1]:font-semibold [&_h1]:tracking-tight [&_h1]:first:mt-0",
        "[&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:first:mt-0",
        "[&_h3]:mt-6 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:first:mt-0",
        "[&_h4]:mt-4 [&_h4]:text-sm [&_h4]:font-semibold",
        "[&_p]:leading-relaxed",
        "[&_ul]:ml-5 [&_ul]:list-disc [&_ul]:space-y-1",
        "[&_ol]:ml-5 [&_ol]:list-decimal [&_ol]:space-y-1",
        "[&_li>p]:inline",
        "[&_blockquote]:border-l-2 [&_blockquote]:border-primary/40 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-muted-foreground",
        "[&_strong]:font-semibold",
        "[&_hr]:my-6 [&_hr]:border-border",
        "[&_table]:w-full [&_table]:border-collapse [&_table]:text-left [&_table]:text-sm",
        "[&_th]:border-b [&_th]:border-border [&_th]:pb-1.5 [&_th]:pr-3 [&_th]:font-semibold",
        "[&_td]:border-b [&_td]:border-border [&_td]:py-1.5 [&_td]:pr-3 [&_td]:align-top",
        className,
      )}
    >
      {children}
    </div>
  );
}
