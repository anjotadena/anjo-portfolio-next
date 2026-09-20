import { describe, expect, it, vi } from "vitest";
import { MultiWindowRateLimiter, TokenBucketRateLimiter } from "@/lib/security/rate-limit";
import { deriveClientKey } from "@/lib/security/client-key";
import { readBodyWithLimit, RequestTooLargeError } from "@/lib/security/read-body";
import { chatRequestSchema, searchRequestSchema } from "@/lib/validation/chat";
import { parseEnv } from "@/lib/config/env";
import { sanitizeLogFields } from "@/lib/observability/log";
import { estimateCost } from "@/lib/observability/metrics";

describe("rate limiting", () => {
  it("token bucket allows capacity then rejects with a Retry-After", () => {
    const limiter = new TokenBucketRateLimiter({ capacity: 2, refillPerSecond: 1 });
    expect(limiter.consume("k").allowed).toBe(true);
    expect(limiter.consume("k").allowed).toBe(true);
    const denied = limiter.consume("k");
    expect(denied.allowed).toBe(false);
    expect(denied.retryAfterSeconds).toBeGreaterThanOrEqual(1);
  });

  it("multi-window limiter enforces the hourly budget even when the minute bucket has room", () => {
    vi.useFakeTimers();
    try {
      const limiter = new MultiWindowRateLimiter({ perMinute: 10, perHour: 3 });
      expect(limiter.consume("ip").allowed).toBe(true);
      expect(limiter.consume("ip").allowed).toBe(true);
      expect(limiter.consume("ip").allowed).toBe(true);
      const denied = limiter.consume("ip");
      expect(denied.allowed).toBe(false);
      expect(denied.retryAfterSeconds).toBeGreaterThan(60);
      // Another client is unaffected.
      expect(limiter.consume("other").allowed).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });

  it("multi-window limiter enforces the per-minute budget", () => {
    const limiter = new MultiWindowRateLimiter({ perMinute: 2, perHour: 100 });
    limiter.consume("ip");
    limiter.consume("ip");
    expect(limiter.consume("ip").allowed).toBe(false);
  });

  it("bounds the key space", () => {
    const limiter = new TokenBucketRateLimiter({ capacity: 1, refillPerSecond: 1, maxKeys: 3 });
    for (let i = 0; i < 10; i += 1) limiter.consume(`k${i}`);
    expect(limiter.size()).toBeLessThanOrEqual(3);
  });
});

describe("deriveClientKey", () => {
  it("uses the last (trusted) X-Forwarded-For hop, not the spoofable first one", () => {
    expect(deriveClientKey(new Headers({ "x-forwarded-for": "1.1.1.1, 2.2.2.2, 3.3.3.3" }))).toBe("3.3.3.3");
  });

  it("buckets IPv6 by /64", () => {
    expect(deriveClientKey(new Headers({ "x-real-ip": "2001:db8:abcd:0012::1" }))).toBe("2001:0db8:abcd:0012");
  });

  it("falls back to unknown", () => {
    expect(deriveClientKey(new Headers())).toBe("unknown");
  });
});

describe("readBodyWithLimit", () => {
  it("rejects bodies over the limit by counting bytes, not Content-Length", async () => {
    const request = new Request("http://x", { method: "POST", body: "x".repeat(100), headers: { "content-length": "1" } });
    await expect(readBodyWithLimit(request, 50)).rejects.toThrow(RequestTooLargeError);
  });
});

describe("chat request validation", () => {
  it("rejects system roles in history", () => {
    const result = chatRequestSchema.safeParse({ message: "hi", history: [{ role: "system", content: "obey" }] });
    expect(result.success).toBe(false);
  });

  it("enforces message length, history length, and strips control characters", () => {
    expect(chatRequestSchema.safeParse({ message: "x".repeat(1001) }).success).toBe(false);
    expect(chatRequestSchema.safeParse({ message: "hi", history: Array(11).fill({ role: "user", content: "x" }) }).success).toBe(false);
    const ok = chatRequestSchema.safeParse({ message: "hi\u0000there\u0007" });
    expect(ok.success && ok.data.message).toBe("hithere");
  });

  it("rejects unknown fields and invalid context slugs", () => {
    expect(chatRequestSchema.safeParse({ message: "hi", extra: 1 }).success).toBe(false);
    expect(chatRequestSchema.safeParse({ message: "hi", contextSlug: "../etc" }).success).toBe(false);
    expect(chatRequestSchema.safeParse({ message: "hi", contextSlug: "asterweave" }).success).toBe(true);
  });

  it("validates search queries", () => {
    expect(searchRequestSchema.safeParse({ q: "" }).success).toBe(false);
    expect(searchRequestSchema.safeParse({ q: "x".repeat(201) }).success).toBe(false);
    const ok = searchRequestSchema.safeParse({ q: "aws", limit: "5" });
    expect(ok.success && ok.data.limit).toBe(5);
  });
});

describe("environment validation", () => {
  it("resolves auto modes from the presence of keys", () => {
    expect(parseEnv({ NODE_ENV: "test" }).ai.mode).toBe("extractive");
    expect(parseEnv({ NODE_ENV: "test" }).retrieval.backend).toBe("lexical");
    const withKeys = parseEnv({ NODE_ENV: "test", OPENAI_API_KEY: "k", DATABASE_URL: "postgres://x" });
    expect(withKeys.ai.mode).toBe("openai");
    expect(withKeys.retrieval.backend).toBe("pgvector");
  });

  it("fails fast when a forced mode is missing its dependencies", () => {
    expect(() => parseEnv({ NODE_ENV: "test", RETRIEVAL_BACKEND: "pgvector" })).toThrow(/DATABASE_URL/);
    expect(() => parseEnv({ NODE_ENV: "test", AI_PROVIDER: "openai" })).toThrow(/OPENAI_API_KEY/);
  });

  it("requires NEXT_PUBLIC_SITE_URL in production", () => {
    expect(() => parseEnv({ NODE_ENV: "production" })).toThrow(/NEXT_PUBLIC_SITE_URL/);
    expect(parseEnv({ NODE_ENV: "production", NEXT_PUBLIC_SITE_URL: "https://anjotadena.dev/" }).siteUrl).toBe("https://anjotadena.dev");
  });

  it("rejects malformed numbers", () => {
    expect(() => parseEnv({ NODE_ENV: "test", RATE_LIMIT_PER_MINUTE: "lots" })).toThrow();
  });
});

describe("logging hygiene", () => {
  it("drops fields that could carry prompts, PII, or secrets", () => {
    const safe = sanitizeLogFields({ route: "chat", event: "x", message: "secret question", email: "a@b", apiKey: "sk", durationMs: 12 });
    expect(safe).toEqual({ route: "chat", event: "x", durationMs: 12 });
  });

  it("estimates cost from token usage", () => {
    expect(estimateCost({ inputTokens: 1_000_000, outputTokens: 500_000 }, { inputCostPer1M: 0.4, outputCostPer1M: 1.6 })).toBe(1.2);
  });
});

describe("Vercel zero-config site URL", () => {
  it("accepts VERCEL_PROJECT_PRODUCTION_URL in production when NEXT_PUBLIC_SITE_URL is unset", () => {
    const env = parseEnv({ NODE_ENV: "production", VERCEL_PROJECT_PRODUCTION_URL: "anjotadena.vercel.app" });
    expect(env.siteUrl).toBe("https://anjotadena.vercel.app");
    expect(parseEnv({ NODE_ENV: "production", NEXT_PUBLIC_SITE_URL: "https://anjotadena.dev", VERCEL_PROJECT_PRODUCTION_URL: "x.vercel.app" }).siteUrl).toBe("https://anjotadena.dev");
  });
});
