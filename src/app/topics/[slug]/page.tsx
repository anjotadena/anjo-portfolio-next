import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Award } from "lucide-react";
import { PageLayout } from "@/components/layout/page-layout";
import { TOPIC_LABELS, TOPIC_TYPES } from "@/components/navigation/nav-config";
import { AskAiLink } from "@/components/portfolio/ask-ai-link";
import { DocumentBody } from "@/components/portfolio/document-body";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { getPublicDocumentBySlug, getPublicDocuments } from "@/lib/knowledge/repository";

function topicDocs() {
  return getPublicDocuments().filter((doc) => TOPIC_TYPES.includes(doc.type));
}

export function generateStaticParams() {
  return topicDocs().map((doc) => ({ slug: doc.slug }));
}

export async function generateMetadata({ params }: PageProps<"/topics/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const doc = getPublicDocumentBySlug(slug);
  if (!doc || !TOPIC_TYPES.includes(doc.type)) return {};
  return { title: doc.title, description: doc.summary, alternates: { canonical: `/topics/${doc.slug}` } };
}

/** Generic page for topic documents (AI, cloud, DevOps, architecture, certifications, education, philosophy). */
export default async function TopicPage({ params }: PageProps<"/topics/[slug]">) {
  const { slug } = await params;
  const doc = getPublicDocumentBySlug(slug);
  if (!doc || !TOPIC_TYPES.includes(doc.type)) notFound();

  const label = TOPIC_LABELS[doc.type] ?? doc.title;
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: label, path: `/topics/${doc.slug}` },
  ];

  return (
    <PageLayout title={doc.title} description={doc.summary} eyebrow={label} crumbs={crumbs} actions={<AskAiLink question={`Tell me about his ${label.toLowerCase()} experience`} label={`Ask AI about ${label}`} />}>
      <BreadcrumbJsonLd items={crumbs} />

      {doc.certifications && doc.certifications.length > 0 && (
        <ul className="mb-8 flex flex-col gap-2" aria-label="Certifications">
          {doc.certifications.map((entry) => (
            <li key={entry.id} className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
              <Award className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground">
                  {entry.url ? (
                    <a href={entry.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      {entry.name}
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  ) : (
                    entry.name
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  {entry.issuer}
                  {entry.date ? ` · ${entry.date}` : ""}
                </p>
              </div>
              <Badge variant={entry.status === "earned" ? "accent" : "outline"}>{entry.status === "earned" ? "Earned" : "Pursuing"}</Badge>
            </li>
          ))}
        </ul>
      )}

      {doc.education && doc.education.length > 0 && (
        <ul className="mb-8 flex flex-col gap-2" aria-label="Education">
          {doc.education.map((entry) => (
            <li key={entry.id} className="rounded-xl border border-border bg-card p-4">
              <p className="font-medium text-foreground">{entry.degree}</p>
              <p className="text-xs text-muted-foreground">{[entry.institution, entry.location, entry.period].filter(Boolean).join(" · ")}</p>
            </li>
          ))}
        </ul>
      )}

      {doc.technologies.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-1.5" aria-label="Technologies">
          {doc.technologies.map((tech) => (
            <Badge key={tech} variant="neutral">
              {tech}
            </Badge>
          ))}
        </div>
      )}

      <DocumentBody body={doc.body} />
    </PageLayout>
  );
}
