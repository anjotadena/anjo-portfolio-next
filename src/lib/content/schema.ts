import { z } from "zod";
import { PROJECT_CATEGORIES } from "@/types/portfolio";

/**
 * Frontmatter schema for every file under `src/content/**`.
 *
 * Validation is intentionally fail-fast: `frontmatterSchema.parse(...)`
 * throws on any invalid or missing-but-required field, so a malformed
 * content file breaks the build/dev-server immediately instead of being
 * silently skipped or rendered with blank data.
 *
 * Beyond the fields on the shared `ContentDocument` type, this schema also
 * carries category-specific *structured* facts (profile identity fields,
 * skill groups, project technology/UI-category tags) directly in
 * frontmatter. Putting structured facts in frontmatter — rather than
 * parsing them out of prose — keeps `src/lib/content/portfolio.ts`
 * reliable and avoids brittle text scraping, while the markdown body
 * remains the source of truth for retrieval (RAG) chunks.
 */

const CONTENT_CATEGORIES = [
  "profile",
  "skills",
  "philosophy",
  "ai-engineering",
  "experience",
  "projects",
  "contact",
] as const;

const skillGroupSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  skills: z.array(z.string().min(1)).min(1),
});

export const frontmatterSchema = z
  .object({
    title: z.string().min(1, "title is required"),
    category: z.enum(CONTENT_CATEGORIES),
    status: z.enum(["verified", "draft"]),
    summary: z.string().min(1, "summary is required"),
    tags: z.array(z.string()).default([]),
    related: z.array(z.string()).default([]),

    // Project-only UI metadata. `categories` here is a navigation
    // classification for filtering, not a factual claim about the project.
    categories: z.array(z.enum(PROJECT_CATEGORIES)).optional(),
    technologies: z.array(z.string()).optional(),

    // Profile-only structured identity facts.
    name: z.string().min(1).optional(),
    headline: z.string().min(1).optional(),
    location: z.string().min(1).optional(),
    email: z.string().email().optional(),
    githubUrl: z.string().url().optional(),
    linkedInUrl: z.string().url().optional(),
    resumeHref: z.string().min(1).optional(),

    // Skills-only structured groups.
    groups: z.array(skillGroupSchema).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.category === "projects") {
      if (!data.categories || data.categories.length === 0) {
        ctx.addIssue({
          code: "custom",
          path: ["categories"],
          message: "projects require at least one UI category",
        });
      }
      if (!data.technologies || data.technologies.length === 0) {
        ctx.addIssue({
          code: "custom",
          path: ["technologies"],
          message: "projects require at least one technology",
        });
      }
    }

    if (data.category === "profile") {
      const requiredProfileFields = [
        "name",
        "headline",
        "location",
        "email",
        "githubUrl",
        "linkedInUrl",
        "resumeHref",
      ] as const;
      for (const field of requiredProfileFields) {
        if (!data[field]) {
          ctx.addIssue({
            code: "custom",
            path: [field],
            message: `profile requires ${field}`,
          });
        }
      }
    }

    if (data.category === "skills" && (!data.groups || data.groups.length === 0)) {
      ctx.addIssue({
        code: "custom",
        path: ["groups"],
        message: "skills requires at least one group",
      });
    }
  });

export type Frontmatter = z.infer<typeof frontmatterSchema>;
