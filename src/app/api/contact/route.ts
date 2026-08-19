import { NextResponse } from "next/server";
import type { ContactSuccessBody, ContactUnconfiguredBody, ContactValidationErrorBody } from "@/types/api";
import { getMailTransport } from "@/lib/mail/transport";
import {
  contactRequestSchema,
  findHeaderInjectionField,
  isLikelySpam,
  toContactFieldErrors,
} from "@/lib/validation/contact";
import { readBodyWithLimit, RequestTooLargeError } from "@/lib/security/read-body";
import { TokenBucketRateLimiter } from "@/lib/security/rate-limit";
import { deriveClientKey } from "@/lib/security/client-key";
import { logEvent } from "@/lib/security/log";

export const runtime = "nodejs";

// 5 submissions per 30 minutes per bucket key. Contact-form abuse is
// lower-volume but higher-cost (a human eventually reads these) than
// chat traffic, so this budget is intentionally tighter. See
// `src/lib/security/rate-limit.ts` for the honest limits of this.
const contactRateLimiter = new TokenBucketRateLimiter({ capacity: 5, refillPerSecond: 5 / 1800 });

// Process-lifetime counter, purely for basic observability. Reset on
// every deploy/instance restart -- not a persisted metric.
let spamSubmissionCount = 0;

/**
 * The same success-shaped body is returned whether the message was
 * actually queued for delivery or silently discarded as spam (honeypot
 * filled in, or submitted faster than a human plausibly could). This is
 * intentional: it gives a bot no signal to distinguish "accepted" from
 * "silently dropped".
 */
function successResponse(): Response {
  const body: ContactSuccessBody = { ok: true };
  return NextResponse.json(body, { status: 200 });
}

function validationErrorResponse(fields: ContactValidationErrorBody["fields"]): Response {
  const body: ContactValidationErrorBody = { error: "validation_failed", fields };
  return NextResponse.json(body, { status: 400 });
}

export async function POST(request: Request): Promise<Response> {
  let rawBody: string;
  try {
    rawBody = await readBodyWithLimit(request);
  } catch (error) {
    if (error instanceof RequestTooLargeError) {
      return NextResponse.json({ code: "REQUEST_TOO_LARGE" }, { status: 413 });
    }
    throw error;
  }

  let parsedBody: unknown;
  try {
    parsedBody = rawBody.length > 0 ? JSON.parse(rawBody) : {};
  } catch {
    return NextResponse.json({ code: "INVALID_JSON" }, { status: 400 });
  }

  const validation = contactRequestSchema.safeParse(parsedBody);
  if (!validation.success) {
    return validationErrorResponse(toContactFieldErrors(validation.error));
  }
  const input = validation.data;

  const injectedField = findHeaderInjectionField(input);
  if (injectedField) {
    return validationErrorResponse({ [injectedField]: "invalid" });
  }

  const clientKey = deriveClientKey(request.headers);
  const rateLimitResult = contactRateLimiter.consume(clientKey);
  if (!rateLimitResult.allowed) {
    logEvent("warn", { route: "contact", event: "rate_limited" });
    return NextResponse.json(
      { code: "RATE_LIMITED" },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimitResult.retryAfterSeconds),
          "X-RateLimit-Remaining": String(rateLimitResult.remaining),
        },
      },
    );
  }

  if (isLikelySpam({ company: input.company, startedAt: input.startedAt })) {
    spamSubmissionCount += 1;
    logEvent("info", { route: "contact", event: "spam_discarded", totalSpamCount: spamSubmissionCount });
    return successResponse();
  }

  const transport = getMailTransport();
  if (!transport.isConfigured) {
    const body: ContactUnconfiguredBody = {
      code: "EMAIL_NOT_CONFIGURED",
      message: "Email delivery isn't configured on this site yet.",
    };
    return NextResponse.json(body, { status: 503 });
  }

  try {
    await transport.send({ name: input.name, email: input.email, message: input.message });
  } catch {
    // Generic error text to clients in production; never echo internals
    // (transport errors may carry provider-specific details).
    logEvent("error", { route: "contact", event: "transport_send_failed" });
    return NextResponse.json({ code: "SEND_FAILED" }, { status: 500 });
  }

  return successResponse();
}
