import type { ButtonHTMLAttributes } from "react";
import { cn } from "./utils";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Renders a fully round button (e.g. the chat send button) instead of the default rounded-rect. */
  circle?: boolean;
}

const baseClassName =
  "inline-flex items-center justify-center gap-2 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50";

const variantClassName: Record<ButtonVariant, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/90",
  secondary:
    "border border-border bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground",
  ghost: "text-foreground hover:bg-accent hover:text-accent-foreground",
};

const sizeClassName: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-6 text-base",
  icon: "h-10 w-10 p-0",
};

/**
 * Base button primitive: three variants, four sizes, and an optional
 * `circle` shape (used for the chat send button). Radius is chosen from a
 * single exclusive source (`circle` vs. the default) rather than mixed with
 * a caller-supplied `className`, since there is no `tailwind-merge` here to
 * resolve conflicting `rounded-*` utilities.
 */
export function Button({
  variant = "primary",
  size = "md",
  circle = false,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        baseClassName,
        variantClassName[variant],
        sizeClassName[size],
        circle ? "rounded-full" : "rounded-md",
        className,
      )}
      {...props}
    />
  );
}
