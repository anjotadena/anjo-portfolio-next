/**
 * Violation Tracker - Progressive Restriction System
 *
 * Tracks violations per client and applies progressive restrictions:
 * - 1st violation: warning (logged)
 * - 2nd violation: cooldown (30-60s)
 * - 3rd+ violation: temporary block (5-10 min)
 *
 * Violations decay over time to allow recovery.
 *
 * TODO: Replace with Redis/Upstash for multi-instance deployments
 */

export type ViolationType =
  | "rate_limit"
  | "injection"
  | "abusive"
  | "off_topic"
  | "spam"
  | "invalid_input";

type Violation = {
  type: ViolationType;
  timestamp: number;
};

type ClientViolations = {
  violations: Violation[];
  blockedUntil: number | null;
  lastCleanup: number;
};

export type ViolationCheckResult = {
  blocked: boolean;
  blockedUntilMs: number | null;
  violationCount: number;
  action: "allow" | "warn" | "cooldown" | "block";
  message: string;
};

type ViolationConfig = {
  // Time window for counting violations
  windowMs: number;
  // Cooldown duration (2nd violation)
  cooldownMs: number;
  // Block duration (3rd+ violation)
  blockMs: number;
  // Cleanup interval
  cleanupIntervalMs: number;
};

const DEFAULT_CONFIG: ViolationConfig = {
  windowMs: 3_600_000, // 1 hour
  cooldownMs: 45_000, // 45 seconds
  blockMs: 600_000, // 10 minutes
  cleanupIntervalMs: 300_000, // 5 minutes
};

// Friendly messages (recruiter-safe)
const MESSAGES = {
  allow: "",
  warn: "Please keep questions focused on the portfolio.",
  cooldown: "Please wait a moment before asking again.",
  block: "Access temporarily restricted. Please try again later.",
};

export class ViolationTracker {
  private readonly store = new Map<string, ClientViolations>();
  private readonly config: ViolationConfig;
  private lastGlobalCleanup = Date.now();

  constructor(config?: Partial<ViolationConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Record a violation and check current restriction status.
   */
  recordViolation(key: string, type: ViolationType, now = Date.now()): ViolationCheckResult {
    this.maybeCleanupGlobal(now);

    const client = this.getOrCreateClient(key, now);
    this.cleanupClient(client, now);

    // Check if currently blocked
    if (client.blockedUntil && now < client.blockedUntil) {
      return {
        blocked: true,
        blockedUntilMs: client.blockedUntil,
        violationCount: client.violations.length,
        action: "block",
        message: MESSAGES.block,
      };
    }

    // Clear expired block
    if (client.blockedUntil && now >= client.blockedUntil) {
      client.blockedUntil = null;
    }

    // Record new violation
    client.violations.push({ type, timestamp: now });
    this.store.set(key, client);

    const recentViolations = this.countRecentViolations(client, now);

    // Apply progressive restrictions
    if (recentViolations >= 3) {
      // 3rd+ violation: block
      client.blockedUntil = now + this.config.blockMs;
      this.store.set(key, client);

      return {
        blocked: true,
        blockedUntilMs: client.blockedUntil,
        violationCount: recentViolations,
        action: "block",
        message: MESSAGES.block,
      };
    }

    if (recentViolations === 2) {
      // 2nd violation: cooldown
      client.blockedUntil = now + this.config.cooldownMs;
      this.store.set(key, client);

      return {
        blocked: true,
        blockedUntilMs: client.blockedUntil,
        violationCount: recentViolations,
        action: "cooldown",
        message: MESSAGES.cooldown,
      };
    }

    // 1st violation: warn only
    return {
      blocked: false,
      blockedUntilMs: null,
      violationCount: recentViolations,
      action: "warn",
      message: MESSAGES.warn,
    };
  }

  /**
   * Check current status without recording a violation.
   */
  checkStatus(key: string, now = Date.now()): ViolationCheckResult {
    const client = this.store.get(key);

    if (!client) {
      return {
        blocked: false,
        blockedUntilMs: null,
        violationCount: 0,
        action: "allow",
        message: MESSAGES.allow,
      };
    }

    // Check if currently blocked
    if (client.blockedUntil && now < client.blockedUntil) {
      return {
        blocked: true,
        blockedUntilMs: client.blockedUntil,
        violationCount: client.violations.length,
        action: "block",
        message: MESSAGES.block,
      };
    }

    const recentViolations = this.countRecentViolations(client, now);

    return {
      blocked: false,
      blockedUntilMs: null,
      violationCount: recentViolations,
      action: recentViolations > 0 ? "warn" : "allow",
      message: recentViolations > 0 ? MESSAGES.warn : MESSAGES.allow,
    };
  }

  private getOrCreateClient(key: string, now: number): ClientViolations {
    return this.store.get(key) ?? { violations: [], blockedUntil: null, lastCleanup: now };
  }

  private countRecentViolations(client: ClientViolations, now: number): number {
    const cutoff = now - this.config.windowMs;
    return client.violations.filter((v) => v.timestamp > cutoff).length;
  }

  private cleanupClient(client: ClientViolations, now: number): void {
    if (now - client.lastCleanup < 60_000) return;

    const cutoff = now - this.config.windowMs;
    client.violations = client.violations.filter((v) => v.timestamp > cutoff);
    client.lastCleanup = now;
  }

  private maybeCleanupGlobal(now: number): void {
    if (now - this.lastGlobalCleanup < this.config.cleanupIntervalMs) return;

    const cutoff = now - this.config.windowMs;
    for (const [key, client] of this.store.entries()) {
      client.violations = client.violations.filter((v) => v.timestamp > cutoff);

      // Remove entries with no recent activity
      if (client.violations.length === 0 && (!client.blockedUntil || now >= client.blockedUntil)) {
        this.store.delete(key);
      }
    }
    this.lastGlobalCleanup = now;
  }

  /**
   * Get store size for monitoring.
   */
  getStoreSize(): number {
    return this.store.size;
  }
}
