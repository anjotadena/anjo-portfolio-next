import type { Metadata } from "next";
import { History } from "lucide-react";
import { PageLayout } from "@/components/layout/page-layout";
import { AskAiLink } from "@/components/portfolio/ask-ai-link";
import { DocumentBody } from "@/components/portfolio/document-body";
import { Timeline } from "@/components/portfolio/timeline";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { EmptyState } from "@/components/ui/empty-state";
import { getPublicDocumentsByType } from "@/lib/knowledge/repository";

export const metadata: Metadata = {
  title: "Experience",
  description: "Anjo Tadena's professional experience as a Senior Software Engineer and AI Engineer.",
  alternates: { canonical: "/experience" },
};

export default function ExperiencePage() {
  const doc = getPublicDocumentsByType("experience")[0];
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Experience", path: "/experience" },
  ];

  return (
    <PageLayout
      title="Experience"
      description={doc?.summary ?? "Professional roles, responsibilities, and the technology behind them."}
      eyebrow="Career"
      crumbs={crumbs}
      actions={<AskAiLink question="What is his professional experience?" label="Ask AI about experience" />}
    >
      <BreadcrumbJsonLd items={crumbs} />
      {doc ? (
        <>
          {doc.experience && <Timeline entries={doc.experience} />}
          <DocumentBody body={doc.body} className="mt-10" />
        </>
      ) : (
        <EmptyState
          icon={<History className="h-5 w-5" aria-hidden="true" />}
          title="Experience details are being written up"
          description="Verified role history will appear here once published. In the meantime, the projects and skills pages are complete, and the assistant can answer questions about them."
          action={<AskAiLink question="What AI projects has he built?" label="Ask about his projects" />}
        />
      )}
    </PageLayout>
  );
}
