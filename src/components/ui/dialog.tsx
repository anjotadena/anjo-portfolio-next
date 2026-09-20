"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "./utils";

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  /** Accessible name for the dialog. */
  title: string;
  /** Visually hide the title (still announced). */
  hideTitle?: boolean;
  description?: string;
  children: ReactNode;
  /** "center" for modals; "side" for a right-hand panel (source preview); "top" for the command palette. */
  placement?: "center" | "side" | "top";
  className?: string;
  /** Skip rendering the built-in close button (e.g. the search palette has its own input). */
  hideCloseButton?: boolean;
}

const closeButtonClassName =
  "-mr-1 -mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

/**
 * Accessible modal built on the native `<dialog>` element: `showModal()`
 * gives us focus trapping, Escape handling, inert background, and
 * top-layer rendering for free — no portal or Radix dependency. Focus
 * returns to the previously focused element on close.
 */
export function Dialog({
  open,
  onClose,
  title,
  hideTitle = false,
  description,
  children,
  placement = "center",
  className,
  hideCloseButton = false,
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const previousFocus = useRef<Element | null>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      previousFocus.current = document.activeElement;
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const handleClose = () => {
      onClose();
      if (previousFocus.current instanceof HTMLElement) previousFocus.current.focus();
    };
    // `cancel` fires on Escape; `close` fires for every close path.
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [onClose]);

  const titleId = `${title.replace(/\s+/g, "-").toLowerCase()}-title`;
  const descriptionId = description ? `${titleId}-description` : undefined;

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onClick={(event) => {
        // Click on the backdrop (outside the panel) closes.
        if (event.target === event.currentTarget) event.currentTarget.close();
      }}
      className={cn(
        "m-0 max-h-none max-w-none bg-transparent p-0 text-foreground backdrop:bg-transparent",
        "open:flex h-full w-full",
        placement === "center" && "items-center justify-center p-4",
        placement === "side" && "items-stretch justify-end",
        placement === "top" && "items-start justify-center px-4 pt-[10vh]",
      )}
    >
      <div
        className={cn(
          "relative flex max-h-full flex-col overflow-hidden border border-border bg-popover text-popover-foreground shadow-xl animate-fade-up",
          placement === "center" && "w-full max-w-lg rounded-2xl",
          // Side panels take the full width on phones and become a drawer from `sm` up.
          placement === "side" && "h-full w-full border-y-0 border-r-0 sm:max-w-md sm:rounded-l-2xl",
          placement === "top" && "w-full max-w-xl rounded-2xl",
          className,
        )}
      >
        <div className={cn("flex items-start justify-between gap-4 px-5 pt-5", hideTitle && "sr-only")}>
          <div className="min-w-0">
            <h2 id={titleId} className="text-base font-semibold leading-tight">
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="mt-1 text-sm text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          {!hideCloseButton && !hideTitle && (
            <button type="button" onClick={() => ref.current?.close()} aria-label="Close" className={closeButtonClassName}>
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
        {/* With a hidden title the close control still has to be visible — a
            full-width sheet on a phone has no backdrop to tap. */}
        {!hideCloseButton && hideTitle && (
          <button
            type="button"
            onClick={() => ref.current?.close()}
            aria-label="Close"
            className={cn(closeButtonClassName, "pt-safe absolute right-3 top-3 z-10 box-content")}
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </div>
    </dialog>
  );
}
