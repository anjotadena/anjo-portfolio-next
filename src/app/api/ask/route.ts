import OpenAI from "openai";
import { z } from "zod";

import { architectureContent } from "@/contents/architecture";
import { leadershipContent } from "@/contents/leadership";
import { projectsContent } from "@/contents/projects";
import { resumeContent } from "@/contents/resume";
import { skillsContent } from "@/contents/skills";
import { buildSystemPrompt, buildUserPrompt } from "@/lib/ask/buildPrompt";
import { detectIntent } from "@/lib/ask/detectIntent";
import {
  ASK_ERROR_MESSAGES,
  type AskApiErrorResponse,
  type AskApiSuccessResponse,
  type AskContext,
  type AskErrorType,
  type AskIntent,
} from "@/lib/ask/types";
import {
  MultiTierRateLimiter,
  getClientKey,
  classifyContent,
  detectInjection,
  validateInputLength,
  ResponseCache,
  generateCacheKey,
  CACHE_TTL,
  ViolationTracker,
  safeLog,
} from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------
const MAX_INPUT_CHARS = 500;
const MAX_TOKENS = 250;
const TEMPERATURE = 0.3;

// ---------------------------------------------------------------------------
// Shared Instances (per-instance, resets on redeploy)
// TODO: Replace with Redis/Upstash for multi-instance deployments
// ---------------------------------------------------------------------------
const rateLimiter = new MultiTierRateLimiter({
  minute: { windowMs: 60_000, maxRequests: 5 },
  hour: { windowMs: 3_600_000, maxRequests: 20 },
  day: { windowMs: 86_400_000, maxRequests: 50 },
});

const responseCache = new ResponseCache<{ answer: string; links?: { label: string; href: string }[] }>({
  defaultTtlMs: CACHE_TTL.GENERAL,
  maxEntries: 500,
});

const violationTracker = new ViolationTracker({
  windowMs: 3_600_000, // 1 hour
  cooldownMs: 45_000, // 45 seconds
  blockMs: 600_000, // 10 minutes
});

// ---------------------------------------------------------------------------
// Request Validation
// ---------------------------------------------------------------------------
const AskRequestSchema = z.object({
  question: z
    .string()
    .trim()
    .min(1, "Question is required.")
    .max(MAX_INPUT_CHARS, `Question is too long (max ${MAX_INPUT_CHARS} chars).`),
});

const AskResponseSchema = z.object({
  answer: z.string(),
  links: z
    .array(
      z.object({
        label: z.string().min(1).max(80),
        href: z.string().regex(/^\/[^\s]*$/, "Link href must be a relative path."),
      })
    )
    .optional(),
});

// ---------------------------------------------------------------------------
// Response Helpers
// ---------------------------------------------------------------------------
function jsonSuccess(
  body: Omit<AskApiSuccessResponse, "status">,
  extraHeaders?: Record<string, string>
) {
  const response: AskApiSuccessResponse = { status: "success", ...body };
  return new Response(JSON.stringify(response), {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...(extraHeaders ?? {}),
    },
  });
}

function jsonError(
  httpStatus: number,
  type: AskErrorType,
  extraHeaders?: Record<string, string>
) {
  safeLog({
    level: "warn",
    route: "/api/ask",
    event: type,
    metadata: { httpStatus },
  });

  const response: AskApiErrorResponse = {
    status: "error",
    type,
    message: ASK_ERROR_MESSAGES[type],
  };
  return new Response(JSON.stringify(response), {
    status: httpStatus,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...(extraHeaders ?? {}),
    },
  });
}

function truncateToWords(text: string, maxWords: number) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return text.trim();
  return words.slice(0, maxWords).join(" ").trim();
}

function contextForIntent(intent: AskIntent): AskContext {
  const generalContent = [
    "About Anjo:",
    "- Senior Software Engineer / Lead Developer",
    "- Focus: scalable systems, healthy teams, predictable delivery",
    "- Values: security-first, clarity over cleverness, operational ownership, performance as a feature",
  ].join("\n");

  switch (intent) {
    case "projects":
      return {
        intent,
        title: projectsContent.title,
        content: projectsContent.content,
        links: [{ label: "Projects", href: "/projects" }],
      };
    case "architecture":
      return {
        intent,
        title: architectureContent.title,
        content: architectureContent.content,
        links: [{ label: "Architecture", href: "/architecture" }],
      };
    case "leadership":
      return {
        intent,
        title: leadershipContent.title,
        content: leadershipContent.content,
        links: [{ label: "Leadership", href: "/leadership" }],
      };
    case "skills":
      return {
        intent,
        title: skillsContent.title,
        content: skillsContent.content,
        links: [
          { label: "About", href: "/about" },
          { label: "Projects", href: "/projects" },
        ],
      };
    case "resume":
      return {
        intent,
        title: resumeContent.title,
        content: resumeContent.content,
        links: [{ label: "Resume", href: "/contact" }],
      };
    case "general":
    default:
      return {
        intent: "general",
        title: "General",
        content: generalContent,
        links: [
          { label: "About", href: "/about" },
          { label: "Projects", href: "/projects" },
        ],
      };
  }
}

function isMissingInfoAnswer(answer: string) {
  const a = answer.trim();
  return (
    a === "That information is not available." ||
    /not (enough|sufficient) information/i.test(a) ||
    /\bnot available\b/i.test(a) ||
    /\bunknown\b/i.test(a) ||
    /\bcan'?t (answer|confirm|find)\b/i.test(a)
  );
}

// ---------------------------------------------------------------------------
// Main Handler
// ---------------------------------------------------------------------------
export async function POST(req: Request) {
  const clientKey = getClientKey(req);

  // =========================================================================
  // STEP 1: Check if client is temporarily blocked (progressive restriction)
  // =========================================================================
  const violationStatus = violationTracker.checkStatus(clientKey);
  if (violationStatus.blocked) {
    return jsonError(429, "temporarily_blocked", {
      "retry-after": String(Math.ceil((violationStatus.blockedUntilMs! - Date.now()) / 1000)),
    });
  }

  // =========================================================================
  // STEP 2: Rate limit check (multi-tier)
  // =========================================================================
  const rateResult = rateLimiter.check(clientKey);
  if (!rateResult.allowed) {
    // Record rate limit violation for progressive restriction
    violationTracker.recordViolation(clientKey, "rate_limit");

    const errorType: AskErrorType =
      rateResult.exceededTier === "day"
        ? "rate_limited_day"
        : rateResult.exceededTier === "hour"
          ? "rate_limited_hour"
          : "rate_limited";

    return jsonError(429, errorType, {
      "retry-after": String(Math.ceil(rateResult.resetMs / 1000)),
      "x-ratelimit-remaining-minute": String(rateResult.remaining.minute),
      "x-ratelimit-remaining-hour": String(rateResult.remaining.hour),
      "x-ratelimit-remaining-day": String(rateResult.remaining.day),
    });
  }

  // =========================================================================
  // STEP 3: Parse and validate request body
  // =========================================================================
  let input: unknown;
  try {
    input = await req.json();
  } catch {
    return jsonError(400, "validation_error");
  }

  const parsed = AskRequestSchema.safeParse(input);
  if (!parsed.success) {
    return jsonError(400, "validation_error");
  }

  const question = parsed.data.question;

  // =========================================================================
  // STEP 4: Input length and structure validation
  // =========================================================================
  const lengthCheck = validateInputLength(question, MAX_INPUT_CHARS);
  if (!lengthCheck.valid) {
    if (lengthCheck.reason === "spam_pattern") {
      violationTracker.recordViolation(clientKey, "spam");
      return jsonError(400, "spam_detected");
    }
    return jsonError(400, "input_too_long");
  }

  // =========================================================================
  // STEP 5: Injection detection (CRITICAL - before any processing)
  // =========================================================================
  if (detectInjection(question)) {
    violationTracker.recordViolation(clientKey, "injection");
    safeLog({
      level: "warn",
      route: "/api/ask",
      event: "injection_attempt",
    });
    return jsonError(400, "injection_detected");
  }

  // =========================================================================
  // STEP 6: Relevance classification
  // =========================================================================
  const classification = classifyContent(question);

  if (classification.blocked) {
    if (classification.classification === "abusive") {
      violationTracker.recordViolation(clientKey, "abusive");
      return jsonError(400, "abusive");
    }
    if (classification.classification === "not_related") {
      violationTracker.recordViolation(clientKey, "off_topic");
      return jsonError(400, "not_related");
    }
  }

  // =========================================================================
  // STEP 7: Detect intent and prepare context
  // =========================================================================
  const intent = detectIntent(question);
  const context = contextForIntent(intent);

  // =========================================================================
  // STEP 8: Cache lookup (before OpenAI call)
  // =========================================================================
  const cacheKey = generateCacheKey(question, intent);
  const cachedResponse = responseCache.get(cacheKey);

  if (cachedResponse) {
    safeLog({
      level: "info",
      route: "/api/ask",
      event: "cache_hit",
      metadata: { intent },
    });

    return jsonSuccess(cachedResponse, {
      "x-ratelimit-remaining-minute": String(rateResult.remaining.minute),
      "x-cache": "HIT",
    });
  }

  // =========================================================================
  // STEP 9: OpenAI API call (only if cache miss)
  // =========================================================================
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    safeLog({
      level: "error",
      route: "/api/ask",
      event: "missing_api_key",
    });
    return jsonError(503, "openai_unavailable");
  }

  const openai = new OpenAI({ apiKey });
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  try {
    const completion = await openai.chat.completions.create({
      model,
      temperature: TEMPERATURE,
      max_tokens: MAX_TOKENS,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: buildSystemPrompt() },
        { role: "user", content: buildUserPrompt({ question, context }) },
      ],
    });

    const content = completion.choices[0]?.message?.content ?? "";
    let obj: unknown;
    try {
      obj = JSON.parse(content);
    } catch {
      return jsonSuccess({
        answer: "That information is not available.",
        links: context.links,
      });
    }

    const validated = AskResponseSchema.safeParse(obj);
    if (!validated.success) {
      return jsonSuccess({
        answer: "That information is not available.",
        links: context.links,
      });
    }

    const normalizedAnswer = isMissingInfoAnswer(validated.data.answer)
      ? "That information is not available."
      : truncateToWords(validated.data.answer, 120);

    const finalData = {
      answer: normalizedAnswer,
      links: validated.data.links?.length ? validated.data.links : context.links,
    };

    const final = AskResponseSchema.safeParse(finalData);
    if (!final.success) {
      return jsonSuccess({
        answer: "That information is not available.",
        links: context.links,
      });
    }

    // =========================================================================
    // STEP 10: Cache the response
    // =========================================================================
    const ttl =
      intent === "general" ? CACHE_TTL.GENERAL : CACHE_TTL.STABLE_CONTENT;
    responseCache.set(cacheKey, final.data, ttl);

    return jsonSuccess(final.data, {
      "x-ratelimit-remaining-minute": String(rateResult.remaining.minute),
      "x-cache": "MISS",
    });
  } catch (err) {
    // Classify OpenAI errors
    if (err instanceof OpenAI.APIError) {
      safeLog({
        level: "error",
        route: "/api/ask",
        event: "openai_api_error",
        metadata: { status: err.status ?? 0, code: err.code ?? "unknown" },
      });

      if (err.status === 429) {
        return jsonError(429, "rate_limited");
      }
      if (err.status && err.status >= 500) {
        return jsonError(502, "openai_unavailable");
      }
      return jsonError(502, "openai_error");
    }

    if (err instanceof Error && err.name === "AbortError") {
      return jsonError(504, "network_error");
    }

    safeLog({
      level: "error",
      route: "/api/ask",
      event: "unexpected_error",
    });

    return jsonError(500, "unknown_error");
  }
}
