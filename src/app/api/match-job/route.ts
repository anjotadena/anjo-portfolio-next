import OpenAI from "openai";
import { z } from "zod";

import { projects } from "@/data/projects";
import { architectureContent } from "@/contents/architecture";
import { leadershipContent } from "@/contents/leadership";
import { projectsContent } from "@/contents/projects";
import { skillsContent } from "@/contents/skills";
import { buildMatchSystemPrompt, buildMatchUserPrompt } from "@/lib/match-job/buildPrompt";
import { fetchJobContent } from "@/lib/match-job/fetchJobContent";
import { createResumeVariant } from "@/lib/match-job/resumeVariant";
import type {
  CandidateContext,
  MatchAnalysis,
  MatchJobResponse,
  MatchJobErrorResponse,
  OpenAIMatchResponse,
} from "@/lib/match-job/types";
import {
  MultiTierRateLimiter,
  getClientKey,
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
const MAX_JOB_DESC_CHARS = 8000;
const MAX_TOKENS = 400;
const TEMPERATURE = 0.2;

// ---------------------------------------------------------------------------
// Shared Instances (per-instance, resets on redeploy)
// TODO: Replace with Redis/Upstash for multi-instance deployments
// ---------------------------------------------------------------------------
const rateLimiter = new MultiTierRateLimiter({
  minute: { windowMs: 60_000, maxRequests: 3 },
  hour: { windowMs: 3_600_000, maxRequests: 15 },
  day: { windowMs: 86_400_000, maxRequests: 30 },
});

const responseCache = new ResponseCache<MatchJobResponse>({
  defaultTtlMs: CACHE_TTL.STABLE_CONTENT,
  maxEntries: 200,
});

const violationTracker = new ViolationTracker({
  windowMs: 3_600_000,
  cooldownMs: 60_000, // 60 seconds (slightly longer for this endpoint)
  blockMs: 900_000, // 15 minutes
});

// ---------------------------------------------------------------------------
// Error Messages (recruiter-safe)
// ---------------------------------------------------------------------------
const ERROR_MESSAGES = {
  rate_limited: "You're using this feature a bit too quickly. Please try again in a moment.",
  rate_limited_hour: "You've reached the hourly limit. Please try again in a bit.",
  rate_limited_day: "You've reached the daily limit. Please come back tomorrow.",
  temporarily_blocked: "Access temporarily restricted. Please try again later.",
  validation_error: "Invalid request. Please check your input.",
  input_too_long: "Job description is too long. Please shorten it.",
  injection_detected: "Please provide a valid job description.",
  url_fetch_failed: "Could not fetch the job posting. Please paste the description instead.",
  job_too_short: "Job description too short. Please provide more details.",
  openai_unavailable: "Analysis is temporarily unavailable. Please try again later.",
  openai_error: "Something went wrong. Please try again.",
  unknown_error: "Something unexpected happened. Please try again.",
};

type MatchErrorType = keyof typeof ERROR_MESSAGES;

// ---------------------------------------------------------------------------
// Request Validation
// ---------------------------------------------------------------------------
const MatchJobRequestSchema = z
  .object({
    jobDescription: z
      .string()
      .trim()
      .max(10000, "Job description too long (max 10,000 chars)")
      .optional(),
    jobUrl: z
      .string()
      .trim()
      .url("Invalid URL format")
      .max(2000, "URL too long")
      .optional(),
  })
  .refine((data) => data.jobDescription || data.jobUrl, {
    message: "Either jobDescription or jobUrl is required",
  });

const OpenAIMatchResponseSchema = z.object({
  matchScore: z.number().int().min(0).max(100),
  verdict: z.enum(["Strong Match", "Partial Match", "Not Ideal"]),
  strengths: z.array(z.string().max(200)).min(1).max(5),
  gaps: z.array(z.string().max(200)).max(5),
  summary: z.string().max(500),
  relevantProjectSlugs: z.array(z.string()).max(10),
  highlightedSkills: z.array(z.string()).max(15),
});

// ---------------------------------------------------------------------------
// Response Helpers
// ---------------------------------------------------------------------------
function jsonSuccess(
  body: MatchJobResponse,
  extraHeaders?: Record<string, string>
) {
  return new Response(JSON.stringify(body), {
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
  type: MatchErrorType,
  extraHeaders?: Record<string, string>
) {
  safeLog({
    level: "warn",
    route: "/api/match-job",
    event: type,
    metadata: { httpStatus },
  });

  const response: MatchJobErrorResponse = {
    error: ERROR_MESSAGES[type],
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

// ---------------------------------------------------------------------------
// Candidate Context Builder
// ---------------------------------------------------------------------------
function buildCandidateContext(): CandidateContext {
  const roles = Array.from(new Set(projects.map((p) => p.role)));
  const technologies = Array.from(new Set(projects.flatMap((p) => p.stack))).sort();

  return {
    skills: skillsContent.content,
    projects: projectsContent.content,
    leadership: leadershipContent.content,
    architecture: architectureContent.content,
    roles,
    technologies,
  };
}

// ---------------------------------------------------------------------------
// Analysis Validator
// ---------------------------------------------------------------------------
function validateAnalysis(raw: OpenAIMatchResponse): MatchAnalysis {
  const validSlugs = new Set(projects.map((p) => p.slug));
  const relevantProjects = raw.relevantProjectSlugs.filter((slug) => validSlugs.has(slug));

  const validTechnologies = new Set(projects.flatMap((p) => p.stack).map((s) => s.toLowerCase()));
  const highlightedSkills = raw.highlightedSkills.filter(
    (skill) => validTechnologies.has(skill.toLowerCase())
  );

  return {
    matchScore: raw.matchScore,
    verdict: raw.verdict,
    strengths: raw.strengths,
    gaps: raw.gaps,
    summary: raw.summary,
    relevantProjects,
    highlightedSkills,
  };
}

// ---------------------------------------------------------------------------
// Main Handler
// ---------------------------------------------------------------------------
export async function POST(req: Request) {
  const clientKey = getClientKey(req);

  // =========================================================================
  // STEP 1: Check if client is temporarily blocked
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
    violationTracker.recordViolation(clientKey, "rate_limit");

    const errorType: MatchErrorType =
      rateResult.exceededTier === "day"
        ? "rate_limited_day"
        : rateResult.exceededTier === "hour"
          ? "rate_limited_hour"
          : "rate_limited";

    return jsonError(429, errorType, {
      "retry-after": String(Math.ceil(rateResult.resetMs / 1000)),
      "x-ratelimit-remaining-minute": String(rateResult.remaining.minute),
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

  const parsed = MatchJobRequestSchema.safeParse(input);
  if (!parsed.success) {
    const errorMessage = parsed.error.errors[0]?.message ?? "Invalid input.";
    safeLog({
      level: "warn",
      route: "/api/match-job",
      event: "validation_failed",
      metadata: { reason: errorMessage.slice(0, 50) },
    });
    return jsonError(400, "validation_error");
  }

  // =========================================================================
  // STEP 4: Get job description (from text or URL)
  // =========================================================================
  let jobDescription: string;
  let source = "direct";

  if (parsed.data.jobUrl) {
    const fetchResult = await fetchJobContent(parsed.data.jobUrl);
    if (!fetchResult.success) {
      return jsonError(400, "url_fetch_failed");
    }
    jobDescription = fetchResult.content;
    source = fetchResult.source;
  } else if (parsed.data.jobDescription) {
    jobDescription = parsed.data.jobDescription;
  } else {
    return jsonError(400, "validation_error");
  }

  // =========================================================================
  // STEP 5: Input length and structure validation
  // =========================================================================
  const lengthCheck = validateInputLength(jobDescription, MAX_JOB_DESC_CHARS);
  if (!lengthCheck.valid) {
    if (lengthCheck.reason === "spam_pattern") {
      violationTracker.recordViolation(clientKey, "spam");
      return jsonError(400, "validation_error");
    }
    return jsonError(400, "input_too_long");
  }

  if (jobDescription.length < 50) {
    return jsonError(400, "job_too_short");
  }

  // =========================================================================
  // STEP 6: Injection detection (CRITICAL)
  // =========================================================================
  if (detectInjection(jobDescription)) {
    violationTracker.recordViolation(clientKey, "injection");
    safeLog({
      level: "warn",
      route: "/api/match-job",
      event: "injection_attempt",
    });
    return jsonError(400, "injection_detected");
  }

  // =========================================================================
  // STEP 7: Cache lookup
  // =========================================================================
  const cacheKey = generateCacheKey(jobDescription.slice(0, 500), "match");
  const cachedResponse = responseCache.get(cacheKey);

  if (cachedResponse) {
    safeLog({
      level: "info",
      route: "/api/match-job",
      event: "cache_hit",
    });

    return jsonSuccess(cachedResponse, {
      "x-ratelimit-remaining-minute": String(rateResult.remaining.minute),
      "x-cache": "HIT",
      "x-match-source": source,
    });
  }

  // =========================================================================
  // STEP 8: OpenAI API call
  // =========================================================================
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    safeLog({
      level: "error",
      route: "/api/match-job",
      event: "missing_api_key",
    });
    return jsonError(503, "openai_unavailable");
  }

  const openai = new OpenAI({ apiKey });
  const model = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";

  try {
    const candidateContext = buildCandidateContext();

    const completion = await openai.chat.completions.create({
      model,
      temperature: TEMPERATURE,
      max_tokens: MAX_TOKENS,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: buildMatchSystemPrompt() },
        {
          role: "user",
          content: buildMatchUserPrompt({ jobDescription, candidateContext }),
        },
      ],
    });

    const content = completion.choices[0]?.message?.content ?? "";

    let rawResponse: unknown;
    try {
      rawResponse = JSON.parse(content);
    } catch {
      safeLog({
        level: "error",
        route: "/api/match-job",
        event: "json_parse_failed",
      });
      return jsonError(500, "openai_error");
    }

    const validatedResponse = OpenAIMatchResponseSchema.safeParse(rawResponse);
    if (!validatedResponse.success) {
      safeLog({
        level: "error",
        route: "/api/match-job",
        event: "response_validation_failed",
      });
      return jsonError(500, "openai_error");
    }

    const analysis = validateAnalysis(validatedResponse.data);
    const resumeVariantId = createResumeVariant(jobDescription, analysis);

    const response: MatchJobResponse = {
      matchScore: analysis.matchScore,
      verdict: analysis.verdict,
      strengths: analysis.strengths,
      gaps: analysis.gaps,
      summary: analysis.summary,
      resumeVariantId,
    };

    // =========================================================================
    // STEP 9: Cache the response
    // =========================================================================
    responseCache.set(cacheKey, response, CACHE_TTL.STABLE_CONTENT);

    return jsonSuccess(response, {
      "x-ratelimit-remaining-minute": String(rateResult.remaining.minute),
      "x-cache": "MISS",
      "x-match-source": source,
    });
  } catch (err) {
    if (err instanceof OpenAI.APIError) {
      safeLog({
        level: "error",
        route: "/api/match-job",
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

    safeLog({
      level: "error",
      route: "/api/match-job",
      event: "unexpected_error",
    });

    return jsonError(500, "unknown_error");
  }
}
