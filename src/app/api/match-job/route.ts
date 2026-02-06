import OpenAI from "openai";
import { z } from "zod";

import { projects } from "@/data/projects";
import { architectureContent } from "@/contents/architecture";
import { leadershipContent } from "@/contents/leadership";
import { projectsContent } from "@/contents/projects";
import { skillsContent } from "@/contents/skills";
import { InMemoryRateLimiter } from "@/lib/ask/rateLimit";
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

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Request validation schema
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

// OpenAI response validation schema
const OpenAIMatchResponseSchema = z.object({
  matchScore: z.number().int().min(0).max(100),
  verdict: z.enum(["Strong Match", "Partial Match", "Not Ideal"]),
  strengths: z.array(z.string().max(200)).min(1).max(5),
  gaps: z.array(z.string().max(200)).max(5),
  summary: z.string().max(500),
  relevantProjectSlugs: z.array(z.string()).max(10),
  highlightedSkills: z.array(z.string()).max(15),
});

// Rate limiter: 5 requests per minute (more restrictive than ask endpoint)
const limiter = new InMemoryRateLimiter({ windowMs: 60_000, maxRequests: 5 });

function json(
  status: number,
  body: MatchJobResponse | MatchJobErrorResponse,
  extraHeaders?: Record<string, string>
) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...(extraHeaders ?? {}),
    },
  });
}

function getClientKey(req: Request): string {
  const xf = req.headers.get("x-forwarded-for");
  const ip =
    (xf ? xf.split(",")[0]?.trim() : undefined) ||
    req.headers.get("x-real-ip") ||
    req.headers.get("cf-connecting-ip") ||
    undefined;
  return ip || `ua:${req.headers.get("user-agent") ?? "unknown"}`;
}

/**
 * Build candidate context from data files.
 * This is the ONLY source of truth for the LLM.
 */
function buildCandidateContext(): CandidateContext {
  // Extract unique roles from projects
  const roles = Array.from(new Set(projects.map((p) => p.role)));

  // Extract unique technologies from projects
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

/**
 * Validate that analysis only references real project slugs.
 */
function validateAnalysis(raw: OpenAIMatchResponse): MatchAnalysis {
  const validSlugs = new Set(projects.map((p) => p.slug));

  // Filter to only valid project slugs
  const relevantProjects = raw.relevantProjectSlugs.filter((slug) => validSlugs.has(slug));

  // Filter highlighted skills to only those in our data
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

export async function POST(req: Request) {
  // Rate limiting
  const key = getClientKey(req);
  const rate = limiter.check(key);
  if (!rate.allowed) {
    return json(
      429,
      { error: "Rate limit exceeded. Please try again shortly." },
      {
        "retry-after": String(Math.ceil(rate.resetMs / 1000)),
        "x-ratelimit-remaining": "0",
      }
    );
  }

  // Parse request body
  let input: unknown;
  try {
    input = await req.json();
  } catch {
    return json(400, { error: "Invalid request body." });
  }

  // Validate input
  const parsed = MatchJobRequestSchema.safeParse(input);
  if (!parsed.success) {
    const errorMessage = parsed.error.errors[0]?.message ?? "Invalid input.";
    return json(400, { error: errorMessage });
  }

  // Get job description (from text or URL)
  let jobDescription: string;
  let source = "direct";

  if (parsed.data.jobUrl) {
    const fetchResult = await fetchJobContent(parsed.data.jobUrl);
    if (!fetchResult.success) {
      return json(400, { error: fetchResult.error });
    }
    jobDescription = fetchResult.content;
    source = fetchResult.source;
  } else if (parsed.data.jobDescription) {
    jobDescription = parsed.data.jobDescription;
  } else {
    return json(400, { error: "Job description or URL is required." });
  }

  // Validate job description length
  if (jobDescription.length < 50) {
    return json(400, { error: "Job description too short. Please provide more details." });
  }

  // Check OpenAI API key
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("OPENAI_API_KEY not configured");
    return json(500, { error: "Service temporarily unavailable." });
  }

  const openai = new OpenAI({ apiKey });
  const model = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";

  try {
    const candidateContext = buildCandidateContext();

    const completion = await openai.chat.completions.create({
      model,
      temperature: 0.2, // Low temperature for consistent, factual output
      max_tokens: 400,
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

    // Parse and validate OpenAI response
    let rawResponse: unknown;
    try {
      rawResponse = JSON.parse(content);
    } catch {
      console.error("Failed to parse OpenAI response as JSON");
      return json(500, { error: "Failed to analyze job match. Please try again." });
    }

    const validatedResponse = OpenAIMatchResponseSchema.safeParse(rawResponse);
    if (!validatedResponse.success) {
      console.error("OpenAI response validation failed:", validatedResponse.error);
      return json(500, { error: "Failed to analyze job match. Please try again." });
    }

    // Validate and sanitize analysis (ensure only real data is referenced)
    const analysis = validateAnalysis(validatedResponse.data);

    // Create resume variant (only reorders existing content)
    const resumeVariantId = createResumeVariant(jobDescription, analysis);

    // Build response
    const response: MatchJobResponse = {
      matchScore: analysis.matchScore,
      verdict: analysis.verdict,
      strengths: analysis.strengths,
      gaps: analysis.gaps,
      summary: analysis.summary,
      resumeVariantId,
    };

    return json(200, response, {
      "x-ratelimit-remaining": String(rate.remaining),
      "x-match-source": source,
    });
  } catch (err) {
    console.error("Match job API error:", err);
    return json(502, { error: "Service temporarily unavailable." });
  }
}
