export type AskIntent = "projects" | "architecture" | "leadership" | "resume";

export type AskResponse = {
  intent: AskIntent;
  title: string;
  body: string;
  ctas: { label: string; href: string }[];
};

export const suggestedQuestions = [
  "Show me 3 projects with measurable impact",
  "What architecture principles do you follow?",
  "How do you mentor engineers and run code reviews?",
  "Where can I download your resume?",
] as const;

export const responses: Record<AskIntent, AskResponse> = {
  projects: {
    intent: "projects",
    title: "Projects",
    body:
      "Here are a few curated case studies. Each includes the problem context, role, architecture overview, key trade-offs, and impact.",
    ctas: [
      { label: "Browse projects", href: "/projects" },
      { label: "Featured projects", href: "/" },
    ],
  },
  architecture: {
    intent: "architecture",
    title: "Architecture",
    body:
      "I optimize for clarity and operational simplicity: explicit boundaries, observability, and pragmatic trade-offs over clever abstractions.",
    ctas: [{ label: "Architecture page", href: "/architecture" }],
  },
  leadership: {
    intent: "leadership",
    title: "Leadership",
    body:
      "I lead by aligning on outcomes, making ownership clear, and creating tight feedback loops through mentorship and reviews.",
    ctas: [{ label: "Leadership page", href: "/leadership" }],
  },
  resume: {
    intent: "resume",
    title: "Resume",
    body: "You can download the latest resume as a PDF.",
    ctas: [{ label: "Download resume PDF", href: "/anjo_tadena_software_engineer_resume.pdf" }],
  },
};

export function detectIntent(question: string): AskIntent {
  const q = question.toLowerCase();
  if (q.includes("resume") || q.includes("cv") || q.includes("pdf") || q.includes("download")) return "resume";
  if (q.includes("lead") || q.includes("mentor") || q.includes("review") || q.includes("ownership")) return "leadership";
  if (q.includes("arch") || q.includes("design") || q.includes("pattern") || q.includes("system")) return "architecture";
  return "projects";
}

