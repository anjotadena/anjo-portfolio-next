/**
 * Security Module - Unified Exports
 *
 * Central export for all security utilities used in API routes.
 */

export { MultiTierRateLimiter, getClientKey, type RateLimitResult } from "./rateLimiter";

export {
  classifyContent,
  detectInjection,
  detectAbusive,
  validateInputLength,
  normalizeForDedup,
  type RelevanceClassification,
  type ContentGuardResult,
} from "./contentGuard";

export {
  ResponseCache,
  generateCacheKey,
  CACHE_TTL,
} from "./responseCache";

export {
  ViolationTracker,
  type ViolationType,
  type ViolationCheckResult,
} from "./violationTracker";

export { safeLog, type LogLevel, type LogEntry } from "./logging";
