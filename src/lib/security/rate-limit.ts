export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export interface RateLimiterOptions {
  /** Maximum tokens (requests) a bucket can hold. */
  capacity: number;
  /** Tokens refilled per second. */
  refillPerSecond: number;
  /** Bounded key-space: oldest bucket is evicted once this is exceeded. */
  maxKeys?: number;
  /** A bucket with no activity for this long is swept away on next access. */
  staleAfterMs?: number;
}

interface Bucket {
  tokens: number;
  lastRefillMs: number;
  lastAccessMs: number;
}

const DEFAULT_MAX_KEYS = 5000;
const DEFAULT_STALE_AFTER_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Per-key token bucket rate limiter, usable directly from a Node-runtime
 * route handler (no middleware/Edge dependency, so it's plain,
 * synchronous, and directly unit-testable).
 *
 * IMPORTANT — honest limitation: this is a single-instance, in-memory
 * heuristic meant to damp accidental request storms and naive scripted
 * abuse from one Node process, NOT a distributed rate-limiting control.
 * Every serverless/Node instance holds its own independent bucket map, so
 * a client hitting a fleet of N instances can receive up to
 * `N * capacity` requests with zero cross-instance coordination. A real
 * distributed limiter (e.g. Redis/Upstash-backed) is out of scope here.
 *
 * There is no `setInterval` background sweep: expired buckets are swept
 * lazily on each `consume()` call, bounding total memory by `maxKeys`
 * regardless of how many distinct keys are ever seen.
 */
export class TokenBucketRateLimiter {
  private readonly buckets = new Map<string, Bucket>();
  private readonly capacity: number;
  private readonly refillPerSecond: number;
  private readonly maxKeys: number;
  private readonly staleAfterMs: number;

  constructor(options: RateLimiterOptions) {
    this.capacity = options.capacity;
    this.refillPerSecond = options.refillPerSecond;
    this.maxKeys = options.maxKeys ?? DEFAULT_MAX_KEYS;
    this.staleAfterMs = options.staleAfterMs ?? DEFAULT_STALE_AFTER_MS;
  }

  consume(key: string, cost = 1): RateLimitResult {
    const now = Date.now();
    this.sweepExpired(now);

    let bucket = this.buckets.get(key);
    if (!bucket) {
      if (this.buckets.size >= this.maxKeys) {
        this.evictOldest();
      }
      bucket = { tokens: this.capacity, lastRefillMs: now, lastAccessMs: now };
      this.buckets.set(key, bucket);
    }

    const elapsedSeconds = Math.max(0, (now - bucket.lastRefillMs) / 1000);
    bucket.tokens = Math.min(this.capacity, bucket.tokens + elapsedSeconds * this.refillPerSecond);
    bucket.lastRefillMs = now;
    bucket.lastAccessMs = now;

    if (bucket.tokens >= cost) {
      bucket.tokens -= cost;
      return { allowed: true, remaining: Math.floor(bucket.tokens), retryAfterSeconds: 0 };
    }

    const deficit = cost - bucket.tokens;
    const retryAfterSeconds = Math.max(1, Math.ceil(deficit / this.refillPerSecond));
    return { allowed: false, remaining: 0, retryAfterSeconds };
  }

  private sweepExpired(now: number): void {
    for (const [key, bucket] of this.buckets) {
      if (now - bucket.lastAccessMs > this.staleAfterMs) {
        this.buckets.delete(key);
      }
    }
  }

  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestAccess = Infinity;
    for (const [key, bucket] of this.buckets) {
      if (bucket.lastAccessMs < oldestAccess) {
        oldestAccess = bucket.lastAccessMs;
        oldestKey = key;
      }
    }
    if (oldestKey !== null) this.buckets.delete(oldestKey);
  }

  /** Test/inspection helper — never used by route handlers. */
  size(): number {
    return this.buckets.size;
  }
}
