import type { Project } from "@/data/projects";

// Request/Response contracts
export type MatchJobRequest = {
  jobDescription?: string;
  jobUrl?: string;
};

export type MatchVerdict = "Strong Match" | "Partial Match" | "Not Ideal";

export type MatchJobResponse = {
  matchScore: number; // 0-100
  verdict: MatchVerdict;
  strengths: string[];
  gaps: string[];
  summary: string;
  resumeVariantId: string;
};

export type MatchJobErrorResponse = {
  error: string;
};

// Internal types
export type CandidateContext = {
  skills: string;
  projects: string;
  leadership: string;
  architecture: string;
  roles: string[];
  technologies: string[];
};

export type MatchAnalysis = {
  matchScore: number;
  verdict: MatchVerdict;
  strengths: string[];
  gaps: string[];
  summary: string;
  relevantProjects: string[]; // slugs
  highlightedSkills: string[];
};

export type ResumeVariant = {
  id: string;
  createdAt: number;
  jobTitle: string;
  relevantProjects: Project[];
  highlightedSkills: string[];
  reorderedBullets: string[];
};

// OpenAI response schema (internal)
export type OpenAIMatchResponse = {
  matchScore: number;
  verdict: "Strong Match" | "Partial Match" | "Not Ideal";
  strengths: string[];
  gaps: string[];
  summary: string;
  relevantProjectSlugs: string[];
  highlightedSkills: string[];
};
