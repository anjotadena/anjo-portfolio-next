/**
 * Server-side caps applied to any `ChatProvider`'s output stream,
 * independent of whatever `max_tokens`-style parameter (if any) the
 * provider itself was asked to respect. This guarantees a hard ceiling
 * even against a misbehaving or misconfigured upstream API.
 */
export interface StreamLimitOptions {
  /** Hard cap on total streamed characters. */
  maxChars: number;
  /** Abort if no chunk arrives within this many milliseconds. */
  idleTimeoutMs: number;
  /** Optional hard cap on total stream duration, distinct from idle time. */
  totalTimeoutMs?: number;
  /** Called once if a limit ends the stream early. */
  onLimit?: (reason: "maxChars" | "idleTimeout" | "totalTimeout") => void;
}

export const DEFAULT_MAX_STREAM_CHARS = 4000;
export const DEFAULT_IDLE_TIMEOUT_MS = 15_000;
export const DEFAULT_TOTAL_TIMEOUT_MS = 45_000;

const IDLE_TIMEOUT_SENTINEL = Symbol("idle-timeout");

async function raceWithIdleTimeout<T>(promise: Promise<T>, ms: number): Promise<T | typeof IDLE_TIMEOUT_SENTINEL> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<typeof IDLE_TIMEOUT_SENTINEL>((resolve) => {
    timer = setTimeout(() => resolve(IDLE_TIMEOUT_SENTINEL), ms);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/**
 * Wraps `source` so that iteration stops once `maxChars` characters have
 * been emitted in total, or once `idleTimeoutMs` elapses between chunks
 * (an "idle" timeout — distinct from `totalTimeoutMs`, an overall wall-
 * clock cap on the whole stream). Reaching any limit ends the stream
 * cleanly (no error thrown) so callers can still emit a `done` frame.
 */
export async function* capStream(
  source: AsyncIterable<string>,
  options: StreamLimitOptions,
): AsyncIterable<string> {
  const { maxChars, idleTimeoutMs, totalTimeoutMs, onLimit } = options;
  const startedAt = Date.now();
  const iterator = source[Symbol.asyncIterator]();
  let emitted = 0;

  try {
    for (;;) {
      if (totalTimeoutMs !== undefined && Date.now() - startedAt >= totalTimeoutMs) {
        onLimit?.("totalTimeout");
        return;
      }

      const next = await raceWithIdleTimeout(iterator.next(), idleTimeoutMs);
      if (next === IDLE_TIMEOUT_SENTINEL) {
        onLimit?.("idleTimeout");
        return;
      }

      const { done, value } = next;
      if (done) return;

      const remaining = maxChars - emitted;
      const piece = value.length > remaining ? value.slice(0, remaining) : value;
      emitted += piece.length;
      if (piece.length > 0) yield piece;

      if (emitted >= maxChars) {
        onLimit?.("maxChars");
        return;
      }
    }
  } finally {
    if (typeof iterator.return === "function") {
      await iterator.return();
    }
  }
}
