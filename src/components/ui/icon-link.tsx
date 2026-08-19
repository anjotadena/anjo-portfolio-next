import type { ReactNode } from "react";
import { cn } from "./utils";

export interface IconLinkProps {
  href: string;
  icon: ReactNode;
  /** Visible or screen-reader label. Always required for a11y — icon-only links must still have a name. */
  label: string;
  /** Show the label visibly (default: screen-reader only, icon-only button style). */
  showLabel?: boolean;
  external?: boolean;
  className?: string;
}

/** A small icon-bearing link, e.g. GitHub/LinkedIn/resume in the header, or a case-study "View source" link. */
export function IconLink({ href, icon, label, showLabel = false, external, className }: IconLinkProps) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      aria-label={showLabel ? undefined : label}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        showLabel ? "px-3 py-1.5 text-sm" : "h-9 w-9 justify-center",
        className,
      )}
    >
      <span aria-hidden="true">{icon}</span>
      {showLabel && <span>{label}</span>}
      {external && <span className="sr-only"> (opens in a new tab)</span>}
    </a>
  );
}
