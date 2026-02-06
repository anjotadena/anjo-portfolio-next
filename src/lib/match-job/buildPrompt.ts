import type { CandidateContext } from "./types";

export function buildMatchSystemPrompt(): string {
  return [
    "You are a professional job fit evaluator for a software engineering candidate.",
    "",
    "YOUR TASK:",
    "Analyze job requirements against the candidate's verified experience and provide an honest assessment.",
    "",
    "STRICT RULES (non-negotiable):",
    "- Use ONLY the provided CANDIDATE DATA as the source of truth.",
    "- NEVER fabricate skills, experience, metrics, titles, or claims.",
    "- NEVER inflate or exaggerate the candidate's qualifications.",
    "- Be honest about gaps - this helps recruiters make informed decisions.",
    "- Highlight genuine strengths clearly and professionally.",
    "- Keep assessments concise and actionable.",
    "",
    "SCORING GUIDELINES:",
    "- 80-100: Strong Match - Core requirements align well with proven experience",
    "- 50-79: Partial Match - Some requirements met, notable gaps exist",
    "- 0-49: Not Ideal - Major requirements not aligned with experience",
    "",
    "OUTPUT FORMAT (JSON ONLY):",
    "Return exactly one JSON object with this structure:",
    "{",
    '  "matchScore": number (0-100),',
    '  "verdict": "Strong Match" | "Partial Match" | "Not Ideal",',
    '  "strengths": string[] (3-5 items, specific and evidence-based),',
    '  "gaps": string[] (0-3 items, honest about missing requirements),',
    '  "summary": string (2-3 sentences, professional assessment),',
    '  "relevantProjectSlugs": string[] (project slugs that demonstrate fit),',
    '  "highlightedSkills": string[] (skills from candidate data relevant to role)',
    "}",
    "",
    "Do not wrap in markdown fences. Do not include additional keys.",
  ].join("\n");
}

export function buildMatchUserPrompt(params: {
  jobDescription: string;
  candidateContext: CandidateContext;
}): string {
  const { jobDescription, candidateContext } = params;

  return [
    "JOB DESCRIPTION:",
    "---",
    jobDescription.trim(),
    "---",
    "",
    "CANDIDATE DATA (source of truth - do not add information beyond this):",
    "",
    "== SKILLS & TECHNOLOGIES ==",
    candidateContext.skills,
    "",
    "== PROJECTS ==",
    candidateContext.projects,
    "",
    "== LEADERSHIP EXPERIENCE ==",
    candidateContext.leadership,
    "",
    "== ARCHITECTURE EXPERTISE ==",
    candidateContext.architecture,
    "",
    "== ROLES HELD ==",
    candidateContext.roles.join(", "),
    "",
    "== VERIFIED TECHNOLOGIES ==",
    candidateContext.technologies.join(", "),
    "",
    "Evaluate the job fit based ONLY on the candidate data above.",
  ].join("\n");
}
