/**
 * Small-talk / greeting detection, checked BEFORE any scoring runs. "hi"
 * is one of the most common first messages a visitor types, and it
 * should get a friendly capability answer, not the "I don't have that
 * information" refusal that a zero-lexical-overlap query would otherwise
 * produce.
 */
const GREETING_PHRASES: ReadonlySet<string> = new Set([
  "hi",
  "hello",
  "hey",
  "hiya",
  "yo",
  "howdy",
  "greetings",
  "good morning",
  "good afternoon",
  "good evening",
  "good day",
  "what's up",
  "whats up",
  "sup",
]);

export function isGreetingQuery(query: string): boolean {
  const normalized = query
    .trim()
    .toLowerCase()
    .replace(/[!?.,]+$/g, "");

  if (normalized.length === 0) return false;
  if (GREETING_PHRASES.has(normalized)) return true;

  const words = normalized.split(/\s+/).filter(Boolean);
  const firstWord = words[0];
  if (!firstWord) return false;

  // Allow short trailing pleasantries, e.g. "hi there", "hello anjo".
  return words.length <= 3 && GREETING_PHRASES.has(firstWord);
}
