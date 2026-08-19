"use client";

import type { KeyboardEvent } from "react";
import { PROJECT_CATEGORIES, type ProjectCategory } from "@/types/portfolio";
import { cn } from "@/components/ui/utils";

export type ProjectFilterValue = "All" | ProjectCategory;

const FILTER_VALUES: ProjectFilterValue[] = ["All", ...PROJECT_CATEGORIES];

export interface ProjectFiltersProps {
  value: ProjectFilterValue;
  onChange: (value: ProjectFilterValue) => void;
  className?: string;
}

/**
 * An accessible single-select toggle group (All / AI / Full Stack / Cloud /
 * Developer Tools / Mobile) for filtering a project list held by the parent.
 * Implemented as `role="radiogroup"` of `role="radio"` buttons: exactly one
 * option is checked, and the whole group is one stop in the tab order with
 * arrow-key roving between options, matching native radio-group behavior.
 */
export function ProjectFilters({ value, onChange, className }: ProjectFiltersProps) {
  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const currentIndex = FILTER_VALUES.indexOf(value);
    if (currentIndex === -1) return;

    let nextIndex: number | null = null;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (currentIndex + 1) % FILTER_VALUES.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = (currentIndex - 1 + FILTER_VALUES.length) % FILTER_VALUES.length;
    }

    if (nextIndex !== null) {
      event.preventDefault();
      const nextValue = FILTER_VALUES[nextIndex];
      if (nextValue) onChange(nextValue);
    }
  }

  return (
    <div
      role="radiogroup"
      aria-label="Filter projects by category"
      className={cn("flex flex-wrap gap-2", className)}
      onKeyDown={handleKeyDown}
    >
      {FILTER_VALUES.map((filter) => {
        const isSelected = filter === value;
        return (
          <button
            key={filter}
            type="button"
            role="radio"
            aria-checked={isSelected}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => onChange(filter)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              isSelected
                ? "border-primary bg-accent text-accent-foreground"
                : "border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            {filter}
          </button>
        );
      })}
    </div>
  );
}
