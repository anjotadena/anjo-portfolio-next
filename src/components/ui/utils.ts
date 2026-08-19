type ClassValue = string | false | null | undefined;

/**
 * Joins truthy class name fragments together, skipping falsy ones.
 * Minimal dependency-free `clsx` alternative (no `clsx`/`tailwind-merge`
 * dependency is installed, so conflicting utilities must be avoided by the
 * caller rather than resolved here).
 */
export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(" ");
}
