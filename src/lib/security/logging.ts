/**
 * Safe Logging - Minimal, Non-PII Logging
 *
 * Logs ONLY:
 * - timestamp
 * - route
 * - error type
 * - rate limit hits
 *
 * Does NOT log:
 * - full user input
 * - personal data
 * - OpenAI responses
 */

export type LogLevel = "info" | "warn" | "error";

export type LogEntry = {
  timestamp: string;
  level: LogLevel;
  route: string;
  event: string;
  metadata?: Record<string, string | number | boolean>;
};

/**
 * Safe logging function that respects PII constraints.
 * Only logs in non-production or when explicitly enabled.
 */
export function safeLog(entry: Omit<LogEntry, "timestamp">): void {
  // Only log in development or when ENABLE_LOGGING is set
  if (process.env.NODE_ENV === "production" && !process.env.ENABLE_LOGGING) {
    return;
  }

  const logEntry: LogEntry = {
    timestamp: new Date().toISOString(),
    ...entry,
  };

  // Ensure no PII leaks
  if (logEntry.metadata) {
    delete (logEntry.metadata as Record<string, unknown>)["input"];
    delete (logEntry.metadata as Record<string, unknown>)["question"];
    delete (logEntry.metadata as Record<string, unknown>)["response"];
    delete (logEntry.metadata as Record<string, unknown>)["answer"];
    delete (logEntry.metadata as Record<string, unknown>)["ip"];
    delete (logEntry.metadata as Record<string, unknown>)["userAgent"];
  }

  const output = JSON.stringify(logEntry);

  switch (entry.level) {
    case "error":
      console.error(output);
      break;
    case "warn":
      console.warn(output);
      break;
    default:
      console.log(output);
  }
}
