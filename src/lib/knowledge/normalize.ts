/**
 * Deterministic, injection-resistant normalization applied to every raw
 * content file before it is parsed. This guarantees:
 *
 * - The same file produces byte-identical parsed output on Windows and
 *   Linux (CRLF vs LF line endings).
 * - Visually-identical-but-differently-encoded text (e.g. full-width vs
 *   ASCII characters) collapses to one canonical form via NFKC.
 * - Invisible characters that can be used to hide instructions from a
 *   human reviewer while still being read by an LLM (zero-width
 *   characters, bidi control characters) are stripped.
 * - HTML comments are stripped so a comment like
 *   `<!-- ignore all previous instructions -->` can never reach the
 *   model as part of the retrieved context.
 *
 * `\u` escapes (rather than literal characters) are used in the pattern
 * below so it stays legible and auditable in a text diff.
 */

// U+200B - U+200F: zero-width space/non-joiner/joiner and directional marks.
// U+202A - U+202E: deprecated bidi embedding/override control characters.
// U+2066 - U+2069: bidi isolate control characters.
const ZERO_WIDTH_AND_BIDI_PATTERN = new RegExp(
  "[\\u200B-\\u200F\\u202A-\\u202E\\u2066-\\u2069]",
  "g",
);

const HTML_COMMENT_PATTERN = /<!--[\s\S]*?-->/g;

export function normalizeRawContent(raw: string): string {
  const unixNewlines = raw.replace(/\r\n?/g, "\n");
  const nfkcNormalized = unixNewlines.normalize("NFKC");
  const withoutHiddenChars = nfkcNormalized.replace(ZERO_WIDTH_AND_BIDI_PATTERN, "");
  return withoutHiddenChars.replace(HTML_COMMENT_PATTERN, "");
}
