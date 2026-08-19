/**
 * Sanitized structured logging helper.
 *
 * Request bodies, chat message contents, and email addresses must never
 * be logged, at any level -- this helper drops any field whose key looks
 * like it could carry that kind of payload, so a call site accidentally
 * passing `{ message: userInput }` doesn't leak it into logs.
 */
export type LogLevel = "info" | "warn" | "error";

export interface LogFields {
  route: string;
  [key: string]: string | number | boolean;
}

const FORBIDDEN_KEYS = new Set(["message", "email", "body", "content", "name", "history", "query"]);

export function logEvent(level: LogLevel, fields: LogFields): void {
  const safeFields: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(fields)) {
    if (FORBIDDEN_KEYS.has(key.toLowerCase())) continue;
    safeFields[key] = value;
  }

  const payload = JSON.stringify({ level, ts: new Date().toISOString(), ...safeFields });
  if (level === "error") {
    console.error(payload);
  } else if (level === "warn") {
    console.warn(payload);
  } else {
    console.info(payload);
  }
}
