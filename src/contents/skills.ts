import { projects } from "@/data/projects";

const uniqueStacks = Array.from(new Set(projects.flatMap((p) => p.stack))).sort((a, b) =>
  a.localeCompare(b)
);

export const skillsContent = {
  title: "Skills / Stack",
  content: [
    "High-level stack:",
    "- TypeScript, React/Next.js, Node",
    "- Cloud platforms, search, observability, CI/CD",
    "",
    "Tools/technologies referenced in portfolio projects:",
    `- ${uniqueStacks.join(", ")}`,
  ].join("\n"),
} as const;

