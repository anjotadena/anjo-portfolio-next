import type { HTMLAttributes } from "react";
import { cn } from "./utils";

export type BadgeVariant = "neutral" | "accent" | "outline";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClassName: Record<BadgeVariant, string> = {
  neutral: "bg-secondary text-secondary-foreground",
  accent: "bg-accent text-accent-foreground",
  outline: "border border-border text-foreground",
};

/** Small status/category label. Not a proficiency meter — text only. */
export function Badge({ variant = "neutral", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variantClassName[variant],
        className,
      )}
      {...props}
    />
  );
}
