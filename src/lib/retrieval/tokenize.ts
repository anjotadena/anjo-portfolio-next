// Matches lowercase alphanumeric runs, allowing a single `.`, `+`, or `#`
// to glue two runs together so tech terms like "c#", "node.js", and
// "c++" survive as one token instead of being shredded into fragments.
const TOKEN_PATTERN = /[a-z0-9]+(?:[.+#][a-z0-9]*)*/g;

export function tokenize(text: string): string[] {
  const matches = text.toLowerCase().match(TOKEN_PATTERN);
  return matches ?? [];
}
