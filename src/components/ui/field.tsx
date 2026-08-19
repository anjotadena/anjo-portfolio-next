import { useId, type ReactNode } from "react";
import { cn } from "./utils";

/** Props a `Field`'s render-prop child must spread onto its form control. */
export interface FieldControlProps {
  id: string;
  "aria-describedby": string | undefined;
  "aria-invalid": boolean | undefined;
}

export interface FieldProps {
  label: string;
  error?: string | null;
  hint?: string;
  required?: boolean;
  className?: string;
  /** Render-prop so the exact control (Input/Textarea/custom) stays in the caller's control. */
  children: (controlProps: FieldControlProps) => ReactNode;
}

/**
 * Label + control + hint/error wrapper. Generates a stable id pair and
 * wires `aria-describedby`/`aria-invalid` for the control via a render prop,
 * so callers never have to hand-roll that accessibility plumbing per field.
 */
export function Field({ label, error, hint, required, className, children }: FieldProps) {
  const id = useId();
  const errorId = error ? `${id}-error` : undefined;
  const hintId = hint ? `${id}-hint` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
        {required && (
          <span className="text-destructive" aria-hidden="true">
            {" "}
            *
          </span>
        )}
      </label>
      {children({ id, "aria-describedby": describedBy, "aria-invalid": error ? true : undefined })}
      {hint && !error && (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
