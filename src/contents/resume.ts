import { site } from "@/config/site";

export const resumeContent = {
  title: "Resume",
  content: [
    "Resume availability:",
    `- Latest resume PDF path: ${site.links.resumePdf}`,
    "- The Contact page provides the download link.",
    "",
    "NOTE:",
    "- This assistant does not claim experience beyond what is shown in the portfolio content.",
  ].join("\n"),
} as const;

