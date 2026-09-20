import type { Metadata } from "next";
import { PageLayout } from "@/components/layout/page-layout";
import { AskAiLink } from "@/components/portfolio/ask-ai-link";
import { DocumentBody } from "@/components/portfolio/document-body";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { getPublicDocumentsByType } from "@/lib/knowledge/repository";

export const metadata: Metadata = {
  title: "Skills",
  description: "Anjo Tadena's technical skills: .NET, Node.js, Angular, React, Next.js, PostgreSQL, AWS, Azure, Docker, CI/CD, architecture patterns, and AI engineering.",
  alternates: { canonical: "/skills" },
};

export default function SkillsPage() {
  const doc = getPublicDocumentsByType("skills")[0];
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Skills", path: "/skills" },
  ];
  if (!doc) {
    return (
      <PageLayout title="Skills" crumbs={crumbs}>
        <p className="text-sm text-muted-foreground">Skills have not been published yet.</p>
      </PageLayout>
    );
  }

  return (
    <PageLayout title={doc.title} description={doc.summary} eyebrow="Skills" crumbs={crumbs} actions={<AskAiLink question="What are his strongest technical skills?" label="Ask AI about skills" />}>
      <BreadcrumbJsonLd items={crumbs} />
      {doc.skillGroups && (
        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {doc.skillGroups.map((group) => (
            <section key={group.id} aria-labelledby={`skills-${group.id}`} className="rounded-xl border border-border bg-card p-4">
              <h2 id={`skills-${group.id}`} className="text-sm font-semibold text-foreground">
                {group.title}
              </h2>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {group.skills.map((skill) => (
                  <li key={skill}>
                    <Badge variant="neutral">{skill}</Badge>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
      <DocumentBody body={doc.body} />
    </PageLayout>
  );
}
