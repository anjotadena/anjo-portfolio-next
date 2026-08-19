import type { AnchorHTMLAttributes, ReactNode } from "react";
import { cn } from "@/components/ui/utils";

export interface ExternalLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: ReactNode;
}

/** An `<a>` that always opens in a new tab safely, with a screen-reader hint. */
export function ExternalLink({ href, children, className, ...props }: ExternalLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn("text-primary underline-offset-4 hover:underline", className)}
      {...props}
    >
      {children}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}
