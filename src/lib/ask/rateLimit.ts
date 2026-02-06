type Entry = {
  timestamps: number[];
};

export type RateLimitResult =
  | { allowed: true; remaining: number; resetMs: number }
  | { allowed: false; remaining: 0; resetMs: number };

/**
 * In-memory rate limiter (best-effort).
 *
 * NOTE: This is per-instance and resets on redeploy.
 * TODO: Replace with a shared store (Redis / Upstash) for multi-instance deployments.
 */
export class InMemoryRateLimiter {
  private readonly store = new Map<string, Entry>();
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(opts: { windowMs: number; maxRequests: number }) {
    this.windowMs = opts.windowMs;
    this.maxRequests = opts.maxRequests;
  }

  check(key: string, now = Date.now()): RateLimitResult {
    const cutoff = now - this.windowMs;
    const entry = this.store.get(key) ?? { timestamps: [] };

    entry.timestamps = entry.timestamps.filter((t) => t > cutoff);
    const used = entry.timestamps.length;

    if (used >= this.maxRequests) {
      const oldest = entry.timestamps[0] ?? now;
      const resetMs = Math.max(0, oldest + this.windowMs - now);
      this.store.set(key, entry);
      return { allowed: false, remaining: 0, resetMs };
    }

    entry.timestamps.push(now);
    this.store.set(key, entry);
    const remaining = Math.max(0, this.maxRequests - entry.timestamps.length);
    const oldest = entry.timestamps[0] ?? now;
    const resetMs = Math.max(0, oldest + this.windowMs - now);
    return { allowed: true, remaining, resetMs };
  }
}

