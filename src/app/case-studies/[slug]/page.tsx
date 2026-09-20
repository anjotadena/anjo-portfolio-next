import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowRight, Clock, FolderKanban } from "lucide-react";
import { PageLayout } from "@/components/layout/page-layout";
import { ChatContainer } from "@/components/chat/chat-container";
import { DocumentBody } from "@/components/portfolio/document-body";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { slugifyHeading } from "@/lib/utils/slug";
import { getCaseStudies, getProfile, getPublicDocumentBySlug } from "@/lib/knowledge/repository";
import { initialsFor } from "@/lib/utils/initials";

export const dynamicParams = false;

export function generateStaticParams() {
  return getCaseStudies().map((doc) => ({ slug: doc.slug }));
}

export async function generateMetadata({ params }: PageProps<"/case-studies/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const doc = getPublicDocumentBySlug(slug);
  if (!doc || doc.type !== "case-study") return {};
  return {
    title: `${doc.title} — Case Study`,
    description: doc.summary,
    alternates: { canonical: `/case-studies/${doc.slug}` },
    openGraph: { title: doc.title, description: doc.summary, type: "article", url: `/case-studies/${doc.slug}` },
    twitter: { card: "summary", title: doc.title, description: doc.summary },
  };
}

/** H2 headings of the body, for the table of contents. */
function sectionsOf(body: string): Array<{ id: string; title: string }> {
  return (body.match(/^##\s+(.+)$/gm) ?? []).map((line) => {
    const title = line.replace(/^##\s+/, "").trim();
    return { id: slugifyHeading(title), title };
  });
}

export default async function CaseStudyPage({ params }: PageProps<"/case-studies/[slug]">) {
  const { slug } = await params;
  const doc = getPublicDocumentBySlug(slug);
  if (!doc || doc.type !== "case-study" || !doc.caseStudy) notFound();

  const facts = doc.caseStudy;
  const { profile } = getProfile();
  const firstName = profile.name.split(" ")[0] ?? profile.name;
  const project = facts.projectSlug ? getPublicDocumentBySlug(facts.projectSlug) : null;
  const sections = sectionsOf(doc.body);
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Case Studies", path: "/case-studies" },
    { name: doc.title, path: `/case-studies/${doc.slug}` },
  ];

  return (
    <PageLayout title={doc.title} description={facts.outcome} eyebrow="Case study" crumbs={crumbs} width="wide">
      <BreadcrumbJsonLd items={crumbs} />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_17rem]">
        <div className="min-w-0">
          <p className="text-base leading-7 text-muted-foreground">{doc.summary}</p>
          <DocumentBody body={doc.body} className="mt-8" size="base" />
        </div>

        <aside className="order-first flex flex-col gap-4 lg:order-none" aria-label="Case study facts">
          <dl className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 text-sm">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Role</dt>
              <dd className="mt-0.5 text-foreground">{facts.role}</dd>
            </div>
            {facts.period && (
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Period</dt>
                <dd className="mt-0.5 text-foreground">{facts.period}</dd>
              </div>
            )}
            {facts.client && (
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Client</dt>
                <dd className="mt-0.5 text-foreground">{facts.client}</dd>
              </div>
            )}
            {facts.industry && (
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Industry</dt>
                <dd className="mt-0.5 text-foreground">{facts.industry}</dd>
              </div>
            )}
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Reading time</dt>
              <dd className="mt-0.5 inline-flex items-center gap-1 text-foreground">
                <Clock className="h-3.5 w-3.5" aria-hidden="true" /> {facts.readingMinutes} min
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Highlights</dt>
              <dd>
                <ul className="mt-1.5 flex flex-col gap-1.5 text-foreground">
                  {facts.highlights.map((highlight) => (
                    <li key={highlight} className="flex gap-2">
                      <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
            {doc.technologies.length > 0 && (
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Stack</dt>
                <dd className="mt-1.5 flex flex-wrap gap-1.5">
                  {doc.technologies.map((tech) => (
                    <Badge key={tech} variant="neutral">
                      {tech}
                    </Badge>
                  ))}
                </dd>
              </div>
            )}
          </dl>

          {project && (
            <Link href={`/projects/${project.slug}`} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-sm transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <FolderKanban className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
              <span className="min-w-0 flex-1">
                <span className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Project</span>
                <span className="block truncate font-medium text-foreground">{project.title}</span>
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            </Link>
          )}

          {sections.length > 1 && (
            <nav aria-label="On this page" className="hidden rounded-xl border border-border bg-card p-4 text-sm lg:block">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">On this page</p>
              <ol className="mt-2 flex flex-col gap-1">
                {sections.map((section) => (
                  <li key={section.id}>
                    <a href={`#${section.id}`} className="block rounded text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      {section.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          )}
        </aside>
      </div>

      <section className="mt-12 flex h-[32rem] flex-col overflow-hidden rounded-2xl border border-border bg-surface" aria-labelledby="ask-ai-heading">
        <h2 id="ask-ai-heading" className="border-b border-border px-4 py-3 text-sm font-semibold text-foreground">
          Ask AI about this case study
        </h2>
        <Suspense fallback={null}>
          <ChatContainer
            assistantName="Anjo AI"
            assistantInitials={initialsFor(profile.name)}
            ownerFirstName={firstName}
            contextSlug={doc.slug}
            compact
            suggestedPrompts={[
              `What problem did ${doc.title} address?`,
              `What were the key decisions in ${doc.title}?`,
              `What were the results of ${doc.title}?`,
              `What did ${firstName} learn from ${doc.title}?`,
            ]}
          />
        </Suspense>
      </section>
    </PageLayout>
  );
}
