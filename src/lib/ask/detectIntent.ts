import type { AskIntent } from "./types";

const RULES: Array<{ intent: AskIntent; patterns: RegExp[] }> = [
  {
    intent: "resume",
    patterns: [/\bresume\b/i, /\bcv\b/i, /\bdownload\b/i, /\bpdf\b/i],
  },
  {
    intent: "projects",
    patterns: [/\bproject(s)?\b/i, /\bbuilt\b/i, /\bshipped\b/i, /\bworked on\b/i, /\bcase study\b/i],
  },
  {
    intent: "architecture",
    patterns: [/\barchitecture\b/i, /\bsystem design\b/i, /\bdesign\b/i, /\bpatterns?\b/i, /\bboundar(y|ies)\b/i],
  },
  {
    intent: "leadership",
    patterns: [/\blead(ership)?\b/i, /\bmentor(ing)?\b/i, /\bcode review(s)?\b/i, /\bownership\b/i],
  },
  {
    intent: "skills",
    patterns: [/\bskills?\b/i, /\bstack\b/i, /\btech\b/i, /\btool(ing|s)?\b/i, /\bexperience with\b/i],
  },
];

export function detectIntent(question: string): AskIntent {
  const q = question.trim();
  if (!q) return "general";

  for (const rule of RULES) {
    if (rule.patterns.some((p) => p.test(q))) return rule.intent;
  }
  return "general";
}

