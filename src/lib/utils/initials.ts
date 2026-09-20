/** "Anjo Tadena" -> "AT". Falls back to the first two letters of a single word. */
export function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase();
  return (parts[0] ?? "").slice(0, 2).toUpperCase();
}
