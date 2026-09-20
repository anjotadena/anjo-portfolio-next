/** Heading text -> anchor id, e.g. "Key Challenges & Results" -> "key-challenges-and-results". Client-safe. */
export function slugifyHeading(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "section"
  );
}
