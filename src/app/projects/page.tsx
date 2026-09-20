import type { Metadata } from "next";
import { PageLayout } from "@/components/layout/page-layout";
import { AskAiLink } from "@/components/portfolio/ask-ai-link";
import { ProjectList } from "@/components/portfolio/project-list";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { toProjectCard } from "@/lib/ai/cards";
import { getProjects } from "@/lib/knowledge/repository";

export const metadata: Metadata = {
  title: "Projects",
  description: "Open-source and professional projects by Anjo Tadena: agentic AI frameworks, developer tools, and .NET services.",
  alternates: { canonical: "/projects" },
};

export default function ProjectsPage() {
  const projects = getProjects().map(toProjectCard);
  return (
    <PageLayout
      title="Projects"
      description="Every project below is generated from the same Markdown the assistant answers from — open one and ask the AI about it."
      crumbs={[
        { name: "Home", path: "/" },
        { name: "Projects", path: "/projects" },
      ]}
      actions={<AskAiLink question="Show me his AI projects" label="Ask AI about projects" />}
      width="wide"
    >
      <BreadcrumbJsonLd items={[{ name: "Home", path: "/" }, { name: "Projects", path: "/projects" }]} />
      <ProjectList projects={projects} />
    </PageLayout>
  );
}
