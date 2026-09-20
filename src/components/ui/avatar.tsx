import { cn } from "./utils";

export interface AvatarProps {
  /** Two-letter monogram, e.g. "AT". */
  initials: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  /** Solid primary fill (assistant identity) or outlined (visitor). */
  variant?: "solid" | "outline" | "soft";
}

const sizeClassName = {
  sm: "h-7 w-7 text-[11px]",
  md: "h-9 w-9 text-xs",
  lg: "h-12 w-12 text-sm",
  xl: "h-20 w-20 text-xl",
} as const;

const variantClassName = {
  solid: "bg-primary text-primary-foreground",
  outline: "border border-border bg-background text-foreground",
  soft: "bg-accent text-accent-foreground",
} as const;

/** The "AT" monogram used for the brand mark and the assistant's identity. No image assets. */
export function Avatar({ initials, size = "md", variant = "solid", className }: AvatarProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 select-none items-center justify-center rounded-full font-semibold tracking-tight",
        sizeClassName[size],
        variantClassName[variant],
        className,
      )}
    >
      {initials}
    </span>
  );
}
