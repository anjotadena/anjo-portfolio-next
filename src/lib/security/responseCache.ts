/**
 * Response Cache - In-Memory Caching for AI Responses
 *
 * Caches OpenAI responses to:
 * - Reduce costs (avoid repeated API calls)
 * - Improve latency for common questions
 * - Protect against cache-bypass attacks
 *
 * TODO: Replace with Redis/Upstash for multi-instance deployments
 */

type CacheEntry<T> = {
  value: T;
  createdAt: number;
  ttlMs: number;
  hits: number;
};

type CacheConfig = {
  defaultTtlMs: number;
  maxEntries: number;
  cleanupIntervalMs: number;
};

const DEFAULT_CONFIG: CacheConfig = {
  defaultTtlMs: 300_000, // 5 minutes
  maxEntries: 500,
  cleanupIntervalMs: 60_000, // 1 minute
};

export class ResponseCache<T = unknown> {
  private readonly store = new Map<string, CacheEntry<T>>();
  private readonly config: CacheConfig;
  private lastCleanup = Date.now();

  constructor(config?: Partial<CacheConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Get cached value if exists and not expired.
   */
  get(key: string, now = Date.now()): T | null {
    this.maybeCleanup(now);

    const entry = this.store.get(key);
    if (!entry) return null;

    if (now - entry.createdAt > entry.ttlMs) {
      this.store.delete(key);
      return null;
    }

    entry.hits++;
    return entry.value;
  }

  /**
   * Set cached value with optional custom TTL.
   */
  set(key: string, value: T, ttlMs?: number, now = Date.now()): void {
    this.maybeCleanup(now);

    // Evict oldest entries if at capacity
    if (this.store.size >= this.config.maxEntries) {
      this.evictOldest();
    }

    this.store.set(key, {
      value,
      createdAt: now,
      ttlMs: ttlMs ?? this.config.defaultTtlMs,
      hits: 0,
    });
  }

  /**
   * Check if key exists and is not expired.
   */
  has(key: string, now = Date.now()): boolean {
    const entry = this.store.get(key);
    if (!entry) return false;

    if (now - entry.createdAt > entry.ttlMs) {
      this.store.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Invalidate a specific key.
   */
  invalidate(key: string): boolean {
    return this.store.delete(key);
  }

  /**
   * Clear all entries.
   */
  clear(): void {
    this.store.clear();
  }

  private maybeCleanup(now: number): void {
    if (now - this.lastCleanup < this.config.cleanupIntervalMs) return;

    for (const [key, entry] of this.store.entries()) {
      if (now - entry.createdAt > entry.ttlMs) {
        this.store.delete(key);
      }
    }
    this.lastCleanup = now;
  }

  private evictOldest(): void {
    // Evict entries with lowest hits, then oldest
    let oldestKey: string | null = null;
    let oldestScore = Infinity;

    for (const [key, entry] of this.store.entries()) {
      // Score = hits * 1000 - age (prioritize frequently accessed, newer entries)
      const age = Date.now() - entry.createdAt;
      const score = entry.hits * 1000 - age;

      if (score < oldestScore) {
        oldestScore = score;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.store.delete(oldestKey);
    }
  }

  /**
   * Get cache statistics for monitoring.
   */
  getStats(): { size: number; oldestMs: number | null } {
    let oldest: number | null = null;
    for (const entry of this.store.values()) {
      if (oldest === null || entry.createdAt < oldest) {
        oldest = entry.createdAt;
      }
    }

    return {
      size: this.store.size,
      oldestMs: oldest ? Date.now() - oldest : null,
    };
  }
}

/**
 * Generate cache key from normalized input and intent.
 * Normalizes input to increase cache hit rate.
 */
export function generateCacheKey(input: string, intent?: string): string {
  const normalized = input
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 200);

  const prefix = intent ? `${intent}:` : "";
  return `${prefix}${normalized}`;
}

// ---------------------------------------------------------------------------
// Pre-defined TTL values based on content type
// ---------------------------------------------------------------------------
export const CACHE_TTL = {
  // Static content (rarely changes)
  STATIC_INTENT: 1_800_000, // 30 minutes

  // Dynamic but stable (projects, skills)
  STABLE_CONTENT: 600_000, // 10 minutes

  // General queries (may vary)
  GENERAL: 300_000, // 5 minutes

  // Short-lived (time-sensitive)
  SHORT: 60_000, // 1 minute
} as const;
