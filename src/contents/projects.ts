import { projects } from "@/data/projects";

function renderProject(p: (typeof projects)[number]) {
  return [
    `- ${p.name}`,
    `  Role: ${p.role}`,
    `  Stack: ${p.stack.join(", ")}`,
    `  Impact: ${p.impact}`,
    `  Problem: ${p.problem}`,
    `  Architecture: ${p.architectureOverview}`,
    `  Key decisions: ${p.keyDecisions.join(" | ")}`,
    `  Metrics: ${p.impactMetrics.join(" | ")}`,
  ].join("\n");
}

export const projectsContent = {
  title: "Projects",
  // Local source of truth. The assistant may ONLY summarize this content.
  content: [
    "Portfolio projects (case studies):",
    projects.map(renderProject).join("\n\n"),
  ].join("\n\n"),
} as const;

