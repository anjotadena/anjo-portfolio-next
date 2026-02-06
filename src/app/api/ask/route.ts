import OpenAI from "openai";
import { z } from "zod";

import { architectureContent } from "@/contents/architecture";
import { leadershipContent } from "@/contents/leadership";
import { projectsContent } from "@/contents/projects";
import { resumeContent } from "@/contents/resume";
import { skillsContent } from "@/contents/skills";
import { buildSystemPrompt, buildUserPrompt } from "@/lib/ask/buildPrompt";
import { detectIntent } from "@/lib/ask/detectIntent";
import { InMemoryRateLimiter } from "@/lib/ask/rateLimit";
import type { AskApiResponse, AskContext, AskIntent } from "@/lib/ask/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const AskRequestSchema = z.object({
  question: z
    .string()
    .trim()
    .min(1, "Question is required.")
    .max(500, "Question is too long (max 500 chars)."),
});

const AskResponseSchema = z.object({
  answer: z.string(),
  links: z
    .array(
      z.object({
        label: z.string().min(1).max(80),
        // Prevent open redirects / external links from the model.
        href: z.string().regex(/^\/[^\s]*$/, "Link href must be a relative path."),
      })
    )
    .optional(),
});

const limiter = new InMemoryRateLimiter({ windowMs: 60_000, maxRequests: 10 });

function json(status: number, body: AskApiResponse, extraHeaders?: Record<string, string>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...(extraHeaders ?? {}),
    },
  });
}

function getClientKey(req: Request) {
  const xf = req.headers.get("x-forwarded-for");
  const ip =
    (xf ? xf.split(",")[0]?.trim() : undefined) ||
    req.headers.get("x-real-ip") ||
    req.headers.get("cf-connecting-ip") ||
    undefined;
  // Best-effort fallback; avoids letting all unknown clients share one bucket.
  return ip || `ua:${req.headers.get("user-agent") ?? "unknown"}`;
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

export async function POST(req: Request) {
  const key = getClientKey(req);
  const rate = limiter.check(key);
  if (!rate.allowed) {
    return json(
      429,
      { answer: "Rate limit exceeded. Please try again shortly." },
      {
        "retry-after": String(Math.ceil(rate.resetMs / 1000)),
        "x-ratelimit-remaining": "0",
      }
    );
  }

  let input: unknown;
  try {
    input = await req.json();
  } catch {
    return json(400, { answer: "Invalid request body." });
  }

  const parsed = AskRequestSchema.safeParse(input);
  if (!parsed.success) {
    return json(400, { answer: "Invalid input." });
  }

  const question = parsed.data.question;
  const intent = detectIntent(question);
  const context = contextForIntent(intent);

  // TODO: Replace local context selection with embeddings/RAG for finer-grained retrieval.

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return json(500, { answer: "Service is temporarily unavailable." });
  }

  const openai = new OpenAI({ apiKey });
  const model = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";

  try {
    const completion = await openai.chat.completions.create({
      model,
      temperature: 0.3,
      max_tokens: 300,
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
      // Never return raw model output.
      return json(200, { answer: "That information is not available.", links: context.links });
    }

    const validated = AskResponseSchema.safeParse(obj);
    if (!validated.success) {
      return json(200, { answer: "That information is not available.", links: context.links });
    }

    const normalizedAnswer = isMissingInfoAnswer(validated.data.answer)
      ? "That information is not available."
      : truncateToWords(validated.data.answer, 120);

    const response: AskApiResponse = {
      answer: normalizedAnswer,
      links: validated.data.links?.length ? validated.data.links : context.links,
    };

    // Final contract enforcement.
    const final = AskResponseSchema.safeParse(response);
    if (!final.success) {
      return json(200, { answer: "That information is not available.", links: context.links });
    }

    return json(200, final.data, {
      "x-ratelimit-remaining": String(rate.remaining),
    });
  } catch (err) {
    // Do not leak provider errors to the client.
    console.error("Ask API error:", err);
    return json(502, { answer: "Service is temporarily unavailable." });
  }
}

