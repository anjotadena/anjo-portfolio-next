import matter from "gray-matter";
import type { ContentDocument } from "@/types/content";
import { normalizeRawContent } from "./normalize";
import { formatIssues, frontmatterSchema } from "./schema";

export class ContentValidationError extends Error {
  constructor(
    readonly sourcePath: string,
    detail: string,
  ) {
    super(`Invalid content file "${sourcePath}":\n${detail}`);
    this.name = "ContentValidationError";
  }
}

/** Filename without directory or extension: `content/projects/asterweave.md` -> `asterweave`. */
export function slugFromPath(sourcePath: string): string {
  const base = sourcePath.split(/[\\/]/).pop() ?? sourcePath;
  return base.replace(/\.md$/i, "");
}

/**
 * Parses one Markdown file (already read into memory) into a validated
 * `ContentDocument`. Pure: no filesystem access, so it is directly
 * unit-testable and reusable by the CLI validator and the indexer.
 *
 * `gray-matter` is called with an explicit empty `engines`-free options
 * object and never with `eval`-style engines, so frontmatter can only be
 * YAML data — never executable code.
 */
export function parseMarkdownDocument(raw: string, sourcePath: string): ContentDocument {
  const normalized = normalizeRawContent(raw);
  let parsed: ReturnType<typeof matter>;
  try {
    parsed = matter(normalized, { excerpt: false });
  } catch (error) {
    throw new ContentValidationError(sourcePath, `  - frontmatter could not be parsed: ${error instanceof Error ? error.message : String(error)}`);
  }

  const result = frontmatterSchema.safeParse(parsed.data);
  if (!result.success) {
    throw new ContentValidationError(sourcePath, formatIssues(result.error));
  }
  const fm = result.data;

  const slug = fm.slug ?? slugFromPath(sourcePath);
  const body = parsed.content.trim();
  if (body.length === 0) {
    throw new ContentValidationError(sourcePath, "  - body: document body must not be empty");
  }

  return {
    slug,
    title: fm.title,
    type: fm.type,
    summary: fm.summary,
    tags: dedupe(fm.tags.map((tag) => tag.toLowerCase())),
    technologies: dedupe(fm.technologies),
    related: dedupe(fm.related),
    date: fm.date ?? null,
    updated: fm.updated ?? null,
    featured: fm.featured,
    visibility: fm.visibility,
    body,
    sourcePath: sourcePath.split("\\").join("/"),
    profile: fm.profile
      ? {
          name: fm.profile.name,
          headline: fm.profile.headline,
          tagline: fm.profile.tagline ?? null,
          location: fm.profile.location,
          email: fm.profile.email,
          githubUrl: fm.profile.githubUrl,
          linkedInUrl: fm.profile.linkedInUrl,
          resumeHref: fm.profile.resumeHref ?? null,
          availability: fm.profile.availability ?? null,
        }
      : null,
    skillGroups: fm.skillGroups ?? null,
    project: fm.project
      ? {
          role: fm.project.role ?? null,
          period: fm.project.period ?? null,
          status: fm.project.status ?? null,
          category: fm.project.category ?? null,
          repoUrl: fm.project.repoUrl ?? null,
          docsUrl: fm.project.docsUrl ?? null,
          demoUrl: fm.project.demoUrl ?? null,
          license: fm.project.license ?? null,
        }
      : null,
    caseStudy: fm.caseStudy
      ? {
          outcome: fm.caseStudy.outcome,
          role: fm.caseStudy.role,
          period: fm.caseStudy.period ?? null,
          client: fm.caseStudy.client ?? null,
          industry: fm.caseStudy.industry ?? null,
          highlights: fm.caseStudy.highlights,
          projectSlug: fm.caseStudy.projectSlug ?? null,
          readingMinutes: Math.max(1, Math.round(body.split(/\s+/).length / 220)),
        }
      : null,
    post:
      fm.type === "post"
        ? {
            author: fm.post?.author ?? null,
            series: fm.post?.series ?? null,
            readingMinutes: Math.max(1, Math.round(body.split(/\s+/).length / 220)),
          }
        : null,
    experience: fm.experience
      ? fm.experience.map((entry) => ({
          id: entry.id,
          title: entry.title,
          company: entry.company ?? null,
          location: entry.location ?? null,
          period: entry.period,
          summary: entry.summary ?? null,
          responsibilities: entry.responsibilities,
          achievements: entry.achievements,
          technologies: entry.technologies,
        }))
      : null,
    certifications: fm.certifications
      ? fm.certifications.map((entry) => ({
          id: entry.id,
          name: entry.name,
          issuer: entry.issuer,
          status: entry.status,
          date: entry.date ?? null,
          url: entry.url ?? null,
        }))
      : null,
    education: fm.education
      ? fm.education.map((entry) => ({
          id: entry.id,
          degree: entry.degree,
          institution: entry.institution,
          location: entry.location ?? null,
          period: entry.period ?? null,
        }))
      : null,
  };
}

function dedupe(values: readonly string[]): string[] {
  return Array.from(new Set(values));
}
