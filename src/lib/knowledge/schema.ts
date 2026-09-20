import { z } from "zod";
import { CONTENT_TYPES } from "@/types/content";

/**
 * Frontmatter schema for every file under `content/**`. Documented in
 * `docs/CONTENT_SCHEMA.md`.
 *
 * Validation is fail-fast: a malformed content file breaks
 * `npm run content:validate`, the build, and the dev server immediately
 * rather than being silently skipped or rendered with blank data.
 *
 * Structured facts (profile identity, skill groups, project links,
 * experience/certification/education entries) live in frontmatter so the
 * portfolio pages and rich chat cards read exact values instead of
 * scraping prose. The Markdown body remains the source for retrieval.
 */

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const slugSchema = z
  .string()
  .regex(SLUG_PATTERN, "slug must be lowercase kebab-case (a-z, 0-9, hyphens)");

/** Accepts `YYYY-MM-DD` strings and Date objects (YAML parses bare dates into Dates). */
const isoDateSchema = z.preprocess((value) => {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return value;
}, z.string().regex(ISO_DATE_PATTERN, "date must be YYYY-MM-DD"));

const httpUrlSchema = z
  .string()
  .url()
  .refine((value) => /^https?:\/\//i.test(value), "url must use http(s)");

const nonEmptyString = z.string().trim().min(1);

const stringList = z.array(nonEmptyString).default([]);

export const profileFactsSchema = z.object({
  name: nonEmptyString,
  headline: nonEmptyString,
  tagline: nonEmptyString.optional(),
  location: nonEmptyString,
  email: z.string().email(),
  githubUrl: httpUrlSchema,
  linkedInUrl: httpUrlSchema,
  /** Site-relative (`/resume.pdf`) or absolute http(s) URL. */
  resumeHref: z
    .string()
    .refine((value) => value.startsWith("/") || /^https?:\/\//i.test(value), "resumeHref must be a site-relative path or http(s) URL")
    .optional(),
  availability: nonEmptyString.optional(),
});

export const skillGroupSchema = z.object({
  id: slugSchema,
  title: nonEmptyString,
  skills: z.array(nonEmptyString).min(1),
});

export const projectFactsSchema = z.object({
  role: nonEmptyString.optional(),
  period: nonEmptyString.optional(),
  status: z.enum(["active", "maintained", "in-progress", "archived"]).optional(),
  category: nonEmptyString.optional(),
  repoUrl: httpUrlSchema.optional(),
  docsUrl: httpUrlSchema.optional(),
  demoUrl: httpUrlSchema.optional(),
  license: nonEmptyString.optional(),
});

export const caseStudyFactsSchema = z.object({
  outcome: z.string().trim().min(10).max(160),
  role: nonEmptyString,
  period: nonEmptyString.optional(),
  client: nonEmptyString.optional(),
  industry: nonEmptyString.optional(),
  highlights: z.array(nonEmptyString.max(200)).min(2).max(6),
  projectSlug: slugSchema.optional(),
});

export const postFactsSchema = z.object({
  author: nonEmptyString.optional(),
  series: nonEmptyString.optional(),
});

export const experienceEntrySchema = z.object({
  id: slugSchema,
  title: nonEmptyString,
  company: nonEmptyString.optional(),
  location: nonEmptyString.optional(),
  period: nonEmptyString,
  summary: nonEmptyString.optional(),
  responsibilities: stringList,
  achievements: stringList,
  technologies: stringList,
});

export const certificationEntrySchema = z.object({
  id: slugSchema,
  name: nonEmptyString,
  issuer: nonEmptyString,
  status: z.enum(["earned", "pursuing"]),
  date: z.preprocess((value) => (value instanceof Date ? value.toISOString().slice(0, 10) : typeof value === "number" ? String(value) : value), nonEmptyString).optional(),
  url: httpUrlSchema.optional(),
});

export const educationEntrySchema = z.object({
  id: slugSchema,
  degree: nonEmptyString,
  institution: nonEmptyString,
  location: nonEmptyString.optional(),
  period: nonEmptyString.optional(),
});

export const frontmatterSchema = z
  .object({
    title: nonEmptyString,
    slug: slugSchema.optional(),
    type: z.enum(CONTENT_TYPES),
    summary: z.string().trim().min(20, "summary should be at least 20 characters").max(500),
    tags: stringList,
    technologies: stringList,
    related: z.array(slugSchema).default([]),
    date: isoDateSchema.optional(),
    updated: isoDateSchema.optional(),
    featured: z.boolean().default(false),
    visibility: z.enum(["public", "private"]),

    profile: profileFactsSchema.optional(),
    skillGroups: z.array(skillGroupSchema).optional(),
    project: projectFactsSchema.optional(),
    caseStudy: caseStudyFactsSchema.optional(),
    post: postFactsSchema.optional(),
    experience: z.array(experienceEntrySchema).optional(),
    certifications: z.array(certificationEntrySchema).optional(),
    education: z.array(educationEntrySchema).optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    const requireBlock = (field: keyof typeof data, forType: string) => {
      if (data.type === forType && data[field] === undefined) {
        ctx.addIssue({ code: "custom", path: [field], message: `${forType} documents require a \`${field}\` block` });
      }
      if (data.type !== forType && data[field] !== undefined) {
        ctx.addIssue({ code: "custom", path: [field], message: `\`${field}\` is only allowed on ${forType} documents` });
      }
    };
    requireBlock("profile", "profile");
    requireBlock("caseStudy", "case-study");
    requireBlock("skillGroups", "skills");
    requireBlock("experience", "experience");
    requireBlock("certifications", "certifications");
    requireBlock("education", "education");

    if (data.type !== "post" && data.post !== undefined) {
      ctx.addIssue({ code: "custom", path: ["post"], message: "`post` is only allowed on post documents" });
    }
    if (data.type === "post" && !data.date) {
      ctx.addIssue({ code: "custom", path: ["date"], message: "posts require a publication `date`" });
    }
    if (data.type !== "project" && data.project !== undefined) {
      ctx.addIssue({ code: "custom", path: ["project"], message: "`project` is only allowed on project documents" });
    }
    if (data.type === "project" && data.technologies.length === 0) {
      ctx.addIssue({ code: "custom", path: ["technologies"], message: "projects must list at least one technology" });
    }
    if (data.featured && data.visibility !== "public") {
      ctx.addIssue({ code: "custom", path: ["featured"], message: "only public documents can be featured" });
    }
  });

export type Frontmatter = z.infer<typeof frontmatterSchema>;

/** Formats a ZodError into a compact, human-readable list for CLI output. */
export function formatIssues(error: z.ZodError): string {
  return error.issues
    .map((issue) => `  - ${issue.path.length > 0 ? issue.path.join(".") : "(root)"}: ${issue.message}`)
    .join("\n");
}
