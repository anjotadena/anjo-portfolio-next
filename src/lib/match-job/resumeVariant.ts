import { randomBytes } from "crypto";
import { projects, type Project } from "@/data/projects";
import type { ResumeVariant, MatchAnalysis } from "./types";

/**
 * In-memory store for resume variants.
 * In production, this would be backed by a database or cache with TTL.
 *
 * Security: Variants are stored server-side and accessed by opaque ID only.
 * The variant ID is cryptographically random to prevent enumeration.
 */
const variantStore = new Map<string, ResumeVariant>();

// Clean up old variants periodically (24 hour TTL)
const VARIANT_TTL_MS = 24 * 60 * 60 * 1000;

function cleanupExpiredVariants(): void {
  const now = Date.now();
  for (const [id, variant] of variantStore) {
    if (now - variant.createdAt > VARIANT_TTL_MS) {
      variantStore.delete(id);
    }
  }
}

// Run cleanup every hour
if (typeof setInterval !== "undefined") {
  setInterval(cleanupExpiredVariants, 60 * 60 * 1000);
}

/**
 * Generate a cryptographically secure variant ID.
 */
function generateVariantId(): string {
  return randomBytes(16).toString("hex");
}

/**
 * Extract job title from job description (best effort).
 */
function extractJobTitle(jobDescription: string): string {
  // Look for common patterns
  const patterns = [
    /(?:job\s*title|position|role)\s*[:]\s*([^\n]+)/i,
    /(?:we'?re?\s*(?:looking\s*for|hiring)\s*(?:a|an)?\s*)([^.!\n]+)/i,
    /^([A-Z][^.!\n]{10,60})(?:\n|$)/m,
  ];

  for (const pattern of patterns) {
    const match = pattern.exec(jobDescription);
    if (match?.[1]) {
      return match[1].trim().slice(0, 100);
    }
  }

  return "Software Engineering Position";
}

/**
 * Reorder project bullet points based on relevance to highlighted skills.
 * Does NOT create new bullets - only reorders existing ones.
 */
function reorderBullets(
  relevantProjects: Project[],
  highlightedSkills: string[]
): string[] {
  const allBullets: Array<{ text: string; score: number }> = [];
  const skillsLower = highlightedSkills.map((s) => s.toLowerCase());

  for (const project of relevantProjects) {
    // Collect all existing bullet-like content
    const bullets = [
      `${project.role} - ${project.name}`,
      project.impact,
      ...project.impactMetrics,
      ...project.keyDecisions,
    ];

    for (const bullet of bullets) {
      // Score by how many highlighted skills appear in the bullet
      const bulletLower = bullet.toLowerCase();
      const score = skillsLower.reduce(
        (sum, skill) => sum + (bulletLower.includes(skill) ? 1 : 0),
        0
      );
      allBullets.push({ text: bullet, score });
    }
  }

  // Sort by relevance score (descending), then deduplicate
  allBullets.sort((a, b) => b.score - a.score);
  const seen = new Set<string>();
  const result: string[] = [];

  for (const { text } of allBullets) {
    const normalized = text.toLowerCase().trim();
    if (!seen.has(normalized)) {
      seen.add(normalized);
      result.push(text);
    }
  }

  return result;
}

/**
 * Create and store a resume variant based on match analysis.
 *
 * IMPORTANT: This only reorders and highlights EXISTING content.
 * No new skills, titles, or experience are added.
 */
export function createResumeVariant(
  jobDescription: string,
  analysis: MatchAnalysis
): string {
  const variantId = generateVariantId();
  const jobTitle = extractJobTitle(jobDescription);

  // Get full project objects for relevant projects
  const relevantProjects = analysis.relevantProjects
    .map((slug) => projects.find((p) => p.slug === slug))
    .filter((p): p is Project => p !== undefined);

  // If no projects matched, use featured projects as fallback
  const projectsToUse =
    relevantProjects.length > 0
      ? relevantProjects
      : projects.filter((p) => p.featured);

  // Reorder bullets based on highlighted skills
  const reorderedBullets = reorderBullets(projectsToUse, analysis.highlightedSkills);

  const variant: ResumeVariant = {
    id: variantId,
    createdAt: Date.now(),
    jobTitle,
    relevantProjects: projectsToUse,
    highlightedSkills: analysis.highlightedSkills,
    reorderedBullets,
  };

  variantStore.set(variantId, variant);
  return variantId;
}

/**
 * Retrieve a resume variant by ID.
 */
export function getResumeVariant(variantId: string): ResumeVariant | null {
  const variant = variantStore.get(variantId);
  if (!variant) return null;

  // Check TTL
  if (Date.now() - variant.createdAt > VARIANT_TTL_MS) {
    variantStore.delete(variantId);
    return null;
  }

  return variant;
}

/**
 * Format resume variant as downloadable text.
 * Tailored version emphasizes relevant experience without adding new content.
 */
export function formatResumeVariantAsText(variant: ResumeVariant): string {
  const lines: string[] = [
    "ANJO SERIÑA",
    "Senior Software Engineer / Tech Lead",
    "",
    "============================================================",
    `Tailored for: ${variant.jobTitle}`,
    "============================================================",
    "",
    "RELEVANT SKILLS",
    "---------------",
    variant.highlightedSkills.join(" • "),
    "",
    "RELEVANT EXPERIENCE & IMPACT",
    "----------------------------",
  ];

  for (const project of variant.relevantProjects) {
    lines.push("");
    lines.push(`${project.name}`);
    lines.push(`Role: ${project.role}`);
    lines.push(`Stack: ${project.stack.join(", ")}`);
    lines.push(`Impact: ${project.impact}`);
    lines.push("");
    lines.push("Key Contributions:");
    for (const metric of project.impactMetrics) {
      lines.push(`  • ${metric}`);
    }
  }

  lines.push("");
  lines.push("============================================================");
  lines.push("Note: This is a tailored view highlighting relevant experience.");
  lines.push("Full resume available at: /contact");
  lines.push("============================================================");

  return lines.join("\n");
}
