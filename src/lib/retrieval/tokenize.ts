// Matches lowercase alphanumeric runs, allowing a single `.`, `+`, or `#` to
// glue two runs together so tech terms like "c#", "node.js", "asp.net", and
// "c++" survive as one token instead of being shredded into fragments.
const TOKEN_PATTERN = /[a-z0-9]+(?:[.+#][a-z0-9]*)*/g;

/**
 * Very light stemming — enough to make "projects" match "project" and
 * "technologies" match "technology" without pulling in a full Porter
 * stemmer. Applied identically to queries and documents, so it only has
 * to be consistent, not linguistically perfect.
 */
export function stem(token: string): string {
  if (token.length <= 3 || /[.+#0-9]/.test(token)) return token;
  if (token.endsWith("ies") && token.length > 4) return `${token.slice(0, -3)}y`;
  if (token.endsWith("sses")) return token.slice(0, -2);
  if (token.endsWith("ss") || token.endsWith("us") || token.endsWith("is")) return token;
  if (token.endsWith("s")) return token.slice(0, -1);
  // Past tense: "learned" -> "learn", "applied" -> "apply", "planned" -> "plan".
  if (token.endsWith("ed") && token.length > 5) {
    let stemmed = token.slice(0, -2);
    if (stemmed.endsWith("i")) stemmed = `${stemmed.slice(0, -1)}y`;
    else if (stemmed.length > 3 && stemmed[stemmed.length - 1] === stemmed[stemmed.length - 2] && !/[aeiou]/.test(stemmed[stemmed.length - 1]!)) stemmed = stemmed.slice(0, -1);
    return stemmed;
  }
  return token;
}

/**
 * Tokenizes text for lexical scoring. Compound tech tokens are emitted
 * both whole and as their parts ("asp.net" -> "asp.net", "asp", "net") so
 * a query for ".NET" (which tokenizes to "net") still credits "ASP.NET".
 */
export function tokenize(text: string): string[] {
  const matches = text.toLowerCase().match(TOKEN_PATTERN);
  if (!matches) return [];
  const out: string[] = [];
  for (const raw of matches) {
    // A trailing "." is sentence punctuation, but "#"/"+" are part of the term (c#, c++).
    const token = raw.replace(/\.+$/, "");
    if (token.length === 0) continue;
    out.push(stem(token));
    if (/[.+#]/.test(token)) {
      for (const part of token.split(/[.+#]/)) {
        if (part.length >= 2) out.push(stem(part));
      }
    }
  }
  return out;
}
