export type AskIntent = "projects" | "architecture" | "leadership" | "skills" | "resume" | "general";

export type AskLink = {
  label: string;
  href: string;
};

export type AskApiRequest = {
  question: string;
};

// Response contract (DO NOT BREAK):
// {
//   answer: string;
//   links?: { label: string; href: string }[];
// }
export type AskApiResponse = {
  answer: string;
  links?: AskLink[];
};

export type AskContext = {
  intent: AskIntent;
  title: string;
  content: string;
  links: AskLink[];
};

