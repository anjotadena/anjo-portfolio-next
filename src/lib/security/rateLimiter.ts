/**
 * Multi-tier Rate Limiter
 *
 * Enforces rate limits at multiple time windows:
 * - Per minute: burst protection
 * - Per hour: sustained abuse prevention
 * - Per day: cost control
 *
 * TODO: Replace with Redis/Upstash for multi-instance deployments
 */

type RateLimitTier = "minute" | "hour" | "day";

type TierConfig = {
  windowMs: number;
  maxRequests: number;
};

type ClientEntry = {
  timestamps: number[];
  lastCleanup: number;
};

export type RateLimitResult = {
  allowed: boolean;
  remaining: {
    minute: number;
    hour: number;
    day: number;
  };
  resetMs: number;
  exceededTier: RateLimitTier | null;
};

const DEFAULT_TIERS: Record<RateLimitTier, TierConfig> = {
  minute: { windowMs: 60_000, maxRequests: 5 },
  hour: { windowMs: 3_600_000, maxRequests: 20 },
  day: { windowMs: 86_400_000, maxRequests: 50 },
};

export class MultiTierRateLimiter {
  private readonly store = new Map<string, ClientEntry>();
  private readonly tiers: Record<RateLimitTier, TierConfig>;
  private lastGlobalCleanup = Date.now();
  private readonly globalCleanupInterval = 300_000; // 5 minutes

  constructor(customTiers?: Partial<Record<RateLimitTier, TierConfig>>) {
    this.tiers = { ...DEFAULT_TIERS, ...customTiers };
  }

  /**
   * Check if a request is allowed and record it if so.
   */
  check(key: string, now = Date.now()): RateLimitResult {
    this.maybeCleanupGlobal(now);

    const entry = this.getOrCreateEntry(key);
    this.cleanupEntry(entry, now);

    // Check each tier
    for (const tier of ["minute", "hour", "day"] as RateLimitTier[]) {
      const config = this.tiers[tier];
      const cutoff = now - config.windowMs;
      const count = entry.timestamps.filter((t) => t > cutoff).length;

      if (count >= config.maxRequests) {
        const oldest = entry.timestamps.find((t) => t > cutoff) ?? now;
        const resetMs = Math.max(0, oldest + config.windowMs - now);

        return {
          allowed: false,
          remaining: this.calculateRemaining(entry, now),
          resetMs,
          exceededTier: tier,
        };
      }
    }

    // Allowed - record timestamp
    entry.timestamps.push(now);
    this.store.set(key, entry);

    return {
      allowed: true,
      remaining: this.calculateRemaining(entry, now),
      resetMs: this.calculateResetMs(entry, now),
      exceededTier: null,
    };
  }

  /**
   * Check without recording (dry run).
   */
  peek(key: string, now = Date.now()): RateLimitResult {
    const entry = this.store.get(key) ?? { timestamps: [], lastCleanup: now };

    for (const tier of ["minute", "hour", "day"] as RateLimitTier[]) {
      const config = this.tiers[tier];
      const cutoff = now - config.windowMs;
      const count = entry.timestamps.filter((t) => t > cutoff).length;

      if (count >= config.maxRequests) {
        const oldest = entry.timestamps.find((t) => t > cutoff) ?? now;
        return {
          allowed: false,
          remaining: this.calculateRemaining(entry, now),
          resetMs: Math.max(0, oldest + config.windowMs - now),
          exceededTier: tier,
        };
      }
    }

    return {
      allowed: true,
      remaining: this.calculateRemaining(entry, now),
      resetMs: this.calculateResetMs(entry, now),
      exceededTier: null,
    };
  }

  private getOrCreateEntry(key: string): ClientEntry {
    return this.store.get(key) ?? { timestamps: [], lastCleanup: Date.now() };
  }

  private cleanupEntry(entry: ClientEntry, now: number): void {
    // Only cleanup if enough time has passed
    if (now - entry.lastCleanup < 60_000) return;

    const cutoff = now - this.tiers.day.windowMs;
    entry.timestamps = entry.timestamps.filter((t) => t > cutoff);
    entry.lastCleanup = now;
  }

  private maybeCleanupGlobal(now: number): void {
    if (now - this.lastGlobalCleanup < this.globalCleanupInterval) return;

    const cutoff = now - this.tiers.day.windowMs;
    for (const [key, entry] of this.store.entries()) {
      entry.timestamps = entry.timestamps.filter((t) => t > cutoff);
      if (entry.timestamps.length === 0) {
        this.store.delete(key);
      }
    }
    this.lastGlobalCleanup = now;
  }

  private calculateRemaining(entry: ClientEntry, now: number): RateLimitResult["remaining"] {
    return {
      minute: Math.max(
        0,
        this.tiers.minute.maxRequests -
          entry.timestamps.filter((t) => t > now - this.tiers.minute.windowMs).length
      ),
      hour: Math.max(
        0,
        this.tiers.hour.maxRequests -
          entry.timestamps.filter((t) => t > now - this.tiers.hour.windowMs).length
      ),
      day: Math.max(
        0,
        this.tiers.day.maxRequests -
          entry.timestamps.filter((t) => t > now - this.tiers.day.windowMs).length
      ),
    };
  }

  private calculateResetMs(entry: ClientEntry, now: number): number {
    const cutoff = now - this.tiers.minute.windowMs;
    const oldest = entry.timestamps.find((t) => t > cutoff);
    return oldest ? Math.max(0, oldest + this.tiers.minute.windowMs - now) : 0;
  }

  /**
   * Get store size for monitoring.
   */
  getStoreSize(): number {
    return this.store.size;
  }
}

/**
 * Get client identifier from request.
 * Uses IP + user-agent hash for better accuracy.
 */
export function getClientKey(req: Request): string {
  const xf = req.headers.get("x-forwarded-for");
  const ip =
    (xf ? xf.split(",")[0]?.trim() : undefined) ||
    req.headers.get("x-real-ip") ||
    req.headers.get("cf-connecting-ip") ||
    undefined;

  const ua = req.headers.get("user-agent") ?? "unknown";

  // Combine IP with UA hash for better fingerprinting
  if (ip) {
    // Simple hash to avoid storing full UA
    const uaHash = ua.length.toString(16) + ua.charCodeAt(0).toString(16);
    return `${ip}:${uaHash}`;
  }

  return `ua:${ua.slice(0, 64)}`;
}
