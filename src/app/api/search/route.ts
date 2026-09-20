import { NextResponse } from "next/server";
import { safeHandler } from "@/lib/security/handler";
import type { ApiErrorBody } from "@/types/chat";
import { SEARCH_GROUP_LABELS, groupForType, type SearchGroup, type SearchHit, type SearchResponseBody } from "@/types/search";
import { getEnv } from "@/lib/config/env";
import { getRetriever } from "@/lib/retrieval";
import { hrefForDocument, toExcerpt } from "@/lib/ai/citations";
import { searchRequestSchema, toFieldErrors } from "@/lib/validation/chat";
import { MultiWindowRateLimiter } from "@/lib/security/rate-limit";
import { deriveClientKey } from "@/lib/security/client-key";
import { RequestMetrics } from "@/lib/observability/metrics";
import { logEvent } from "@/lib/observability/log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

let limiter: MultiWindowRateLimiter | null = null;
function getLimiter(): MultiWindowRateLimiter {
  const env = getEnv();
  // Search is cheaper than chat (no model call) so it gets a 3x budget.
  limiter ??= new MultiWindowRateLimiter({ perMinute: env.rateLimit.perMinute * 3, perHour: env.rateLimit.perHour * 3 });
  return limiter;
}

const GROUP_ORDER: SearchGroup[] = ["projects", "case-studies", "blog", "skills", "experience", "knowledge"];

/**
 * GET /api/search?q=...&limit=10 — semantic search over public content,
 * grouped for the Ctrl/Cmd+K palette. Uses the same `KnowledgeRetriever`
 * as chat, so search and chat can never disagree about what exists.
 */
export const GET = safeHandler("search", async (request: Request): Promise<Response> => {
  const metrics = new RequestMetrics("search");
  const url = new URL(request.url);
  const validation = searchRequestSchema.safeParse({
    q: url.searchParams.get("q") ?? "",
    limit: url.searchParams.get("limit") ?? undefined,
  });
  if (!validation.success) {
    const body: ApiErrorBody = { code: "VALIDATION_ERROR", message: "Invalid search query.", fields: toFieldErrors(validation.error) };
    return NextResponse.json(body, { status: 400, headers: { "Cache-Control": "no-store" } });
  }
  const { q, limit } = validation.data;

  const rate = getLimiter().consume(deriveClientKey(request.headers));
  if (!rate.allowed) {
    logEvent("warn", { route: "search", event: "rate_limited", requestId: metrics.requestId });
    const body: ApiErrorBody = { code: "RATE_LIMITED", message: "Too many searches. Please wait a moment." };
    return NextResponse.json(body, {
      status: 429,
      headers: { "Retry-After": String(rate.retryAfterSeconds), "Cache-Control": "no-store" },
    });
  }

  let hits: SearchHit[];
  try {
    const results = await metrics.time("retrieval", () => getRetriever().search(q, { limit }));
    // One hit per document section: collapse duplicates to their best chunk.
    const seen = new Set<string>();
    hits = [];
    for (const result of results) {
      const key = `${result.chunk.documentSlug}::${result.chunk.section ?? ""}`;
      if (seen.has(key)) continue;
      seen.add(key);
      hits.push({
        documentSlug: result.chunk.documentSlug,
        title: result.chunk.documentTitle,
        section: result.chunk.section,
        type: result.chunk.type,
        group: groupForType(result.chunk.type),
        href: hrefForDocument(result.chunk.type, result.chunk.documentSlug),
        excerpt: toExcerpt(result.chunk.text, 160),
        score: Math.round(result.score * 1000) / 1000,
      });
    }
  } catch (error) {
    metrics.set("errorName", error instanceof Error ? error.name : "unknown");
    metrics.flush("search_failed", "error");
    const body: ApiErrorBody = { code: "RETRIEVAL_ERROR", message: "Search is temporarily unavailable." };
    return NextResponse.json(body, { status: 503, headers: { "Cache-Control": "no-store" } });
  }

  const groups = GROUP_ORDER.map((group) => ({
    group,
    label: SEARCH_GROUP_LABELS[group],
    hits: hits.filter((hit) => hit.group === group),
  })).filter((entry) => entry.hits.length > 0);

  const body: SearchResponseBody = { query: q, groups, total: hits.length };
  metrics.set("results", hits.length);
  metrics.flush("search_completed");
  return NextResponse.json(body, { headers: { "Cache-Control": "private, max-age=30" } });
});
