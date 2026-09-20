import { NextResponse } from "next/server";
import { safeHandler } from "@/lib/security/handler";
import { z } from "zod";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { logEvent } from "@/lib/observability/log";
import { readBodyWithLimit, RequestTooLargeError } from "@/lib/security/read-body";
import { TokenBucketRateLimiter } from "@/lib/security/rate-limit";
import { deriveClientKey } from "@/lib/security/client-key";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const eventSchema = z
  .object({
    event: z.enum(ANALYTICS_EVENTS),
    // Only small, non-identifying properties are accepted. Free text such
    // as the question itself is never sent or stored.
    props: z.record(z.string().max(40), z.union([z.string().max(80), z.number(), z.boolean()])).optional(),
  })
  .strict();

const limiter = new TokenBucketRateLimiter({ capacity: 60, refillPerSecond: 1 });

/**
 * POST /api/analytics — privacy-conscious product analytics sink. Events
 * become structured log lines (no third-party script, no cookies, no
 * message contents). Replace the log call with a real analytics client
 * when one is chosen; the client contract stays the same.
 */
export const POST = safeHandler("analytics", async (request: Request): Promise<Response> => {
  if (!limiter.consume(deriveClientKey(request.headers)).allowed) {
    return new Response(null, { status: 429 });
  }
  let raw: string;
  try {
    raw = await readBodyWithLimit(request, 4 * 1024);
  } catch (error) {
    if (error instanceof RequestTooLargeError) return new Response(null, { status: 413 });
    throw error;
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return NextResponse.json({ code: "INVALID_JSON" }, { status: 400 });
  }
  const result = eventSchema.safeParse(parsed);
  if (!result.success) return NextResponse.json({ code: "VALIDATION_ERROR" }, { status: 400 });

  const props = Object.fromEntries(Object.entries(result.data.props ?? {}).map(([key, value]) => [`prop_${key}`, value]));
  logEvent("info", { route: "analytics", event: result.data.event, ...props });
  return new Response(null, { status: 204 });
});
