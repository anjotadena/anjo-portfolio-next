/**
 * Structured, sanitized logging.
 *
 * Every log line is one JSON object on stdout/stderr (12-factor style) so
 * Vercel, Docker, or any log shipper can index it. Request bodies, chat
 * messages, email addresses, and retrieved content must never be logged
 * — this helper drops any field whose key looks like it could carry that
 * kind of payload, so a call site accidentally passing
 * `{ message: userInput }` cannot leak it.
 */
export type LogLevel = "debug" | "info" | "warn" | "error";

export type LogValue = string | number | boolean | null | undefined;

export interface LogFields {
  route: string;
  event: string;
  [key: string]: LogValue;
}

const LEVEL_ORDER: Record<LogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40 };

const FORBIDDEN_KEYS = new Set([
  "message",
  "email",
  "body",
  "content",
  "name",
  "history",
  "query",
  "prompt",
  "answer",
  "text",
  "apikey",
  "api_key",
  "authorization",
  "token",
  "secret",
  "password",
  "databaseurl",
  "database_url",
]);

function minimumLevel(): LogLevel {
  const raw = process.env.LOG_LEVEL;
  return raw === "debug" || raw === "info" || raw === "warn" || raw === "error" ? raw : "info";
}

export function sanitizeLogFields(fields: LogFields): Record<string, LogValue> {
  const safe: Record<string, LogValue> = {};
  for (const [key, value] of Object.entries(fields)) {
    if (FORBIDDEN_KEYS.has(key.toLowerCase())) continue;
    if (value === undefined) continue;
    safe[key] = value;
  }
  return safe;
}

export function logEvent(level: LogLevel, fields: LogFields): void {
  if (LEVEL_ORDER[level] < LEVEL_ORDER[minimumLevel()]) return;
  if (process.env.NODE_ENV === "test" && process.env.LOG_IN_TESTS !== "1") return;

  const payload = JSON.stringify({ level, ts: new Date().toISOString(), ...sanitizeLogFields(fields) });
  if (level === "error") console.error(payload);
  else if (level === "warn") console.warn(payload);
  else console.info(payload);
}
