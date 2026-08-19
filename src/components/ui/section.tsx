import { useId, type ReactNode } from "react";
import { cn } from "./utils";

export interface SectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  /** Override the auto-generated heading id (e.g. to target from a skip link). */
  id?: string;
  headingLevel?: "h1" | "h2";
}

/** A labelled page section: heading (+ optional description) above content. */
export function Section({
  title,
  description,
  children,
  className,
  id,
  headingLevel = "h2",
}: SectionProps) {
  const generatedId = useId();
  const headingId = id ?? generatedId;
  const Heading = headingLevel;

  return (
    <section aria-labelledby={headingId} className={cn("flex flex-col gap-6", className)}>
      <div className="flex flex-col gap-2">
        <Heading id={headingId} className="text-2xl font-medium text-foreground">
          {title}
        </Heading>
        {description && <p className="max-w-2xl text-muted-foreground">{description}</p>}
      </div>
      {children}
    </section>
  );
}
