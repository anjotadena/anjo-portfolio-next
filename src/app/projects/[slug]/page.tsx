import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowRight, BookOpen, BookOpenText, ExternalLink, Github } from "lucide-react";
import { PageLayout } from "@/components/layout/page-layout";
import { ChatContainer } from "@/components/chat/chat-container";
import { DocumentBody } from "@/components/portfolio/document-body";
import { BreadcrumbJsonLd, ProjectJsonLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { getCaseStudyForProject, getProfile, getProjects, getPublicDocumentBySlug } from "@/lib/knowledge/repository";
import { initialsFor } from "@/lib/utils/initials";

// Every slug is known at build time (content lives in the repo); unknown
// slugs must be a real 404, not a streamed soft-404 behind the loading boundary.
export const dynamicParams = false;

export function generateStaticParams() {
  return getProjects().map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = getPublicDocumentBySlug(slug);
  if (!project || project.type !== "project") return {};
  return {
    title: project.title,
    description: project.summary,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: { title: project.title, description: project.summary, type: "article", url: `/projects/${project.slug}` },
    twitter: { card: "summary", title: project.title, description: project.summary },
  };
}

const externalLink =
  "inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

const STATUS_LABELS: Record<string, string> = { active: "Active", maintained: "Maintained", "in-progress": "In progress", archived: "Archived" };

export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const project = getPublicDocumentBySlug(slug);
  if (!project || project.type !== "project") notFound();

  const { profile } = getProfile();
  const facts = project.project;
  const caseStudy = getCaseStudyForProject(project.slug);
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Projects", path: "/projects" },
    { name: project.title, path: `/projects/${project.slug}` },
  ];

  return (
    <PageLayout
      title={project.title}
      description={project.summary}
      eyebrow={facts?.category ?? "Project"}
      crumbs={crumbs}
      width="wide"
      actions={
        <>
          {facts?.repoUrl && (
            <a href={facts.repoUrl} target="_blank" rel="noopener noreferrer" className={externalLink}>
              <Github className="h-4 w-4" aria-hidden="true" /> GitHub<span className="sr-only"> (opens in a new tab)</span>
            </a>
          )}
          {facts?.docsUrl && (
            <a href={facts.docsUrl} target="_blank" rel="noopener noreferrer" className={externalLink}>
              <BookOpen className="h-4 w-4" aria-hidden="true" /> Docs<span className="sr-only"> (opens in a new tab)</span>
            </a>
          )}
          {facts?.demoUrl && (
            <a href={facts.demoUrl} target="_blank" rel="noopener noreferrer" className={externalLink}>
              <ExternalLink className="h-4 w-4" aria-hidden="true" /> Website<span className="sr-only"> (opens in a new tab)</span>
            </a>
          )}
        </>
      }
    >
      <ProjectJsonLd project={project} />
      <BreadcrumbJsonLd items={crumbs} />

      {caseStudy?.caseStudy && (
        <Link
          href={`/case-studies/${caseStudy.slug}`}
          className="mb-8 flex items-center gap-4 rounded-xl border border-primary/30 bg-accent/40 p-4 transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <BookOpenText className="h-6 w-6 shrink-0 text-primary" aria-hidden="true" />
          <span className="min-w-0 flex-1">
            <span className="block text-[11px] font-semibold uppercase tracking-wider text-primary">Case study</span>
            <span className="block text-sm font-semibold text-foreground">{caseStudy.title}</span>
            <span className="block text-xs text-muted-foreground">
              {caseStudy.caseStudy.outcome} · {caseStudy.caseStudy.readingMinutes} min read
            </span>
          </span>
          <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        </Link>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <DocumentBody body={project.body} className="min-w-0" />

        <aside className="order-first lg:order-none" aria-label="Project facts">
          <dl className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 text-sm">
            {facts?.role && (
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Role</dt>
                <dd className="mt-0.5 text-foreground">{facts.role}</dd>
              </div>
            )}
            {facts?.period && (
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Period</dt>
                <dd className="mt-0.5 text-foreground">{facts.period}</dd>
              </div>
            )}
            {facts?.status && (
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</dt>
                <dd className="mt-0.5 text-foreground">{STATUS_LABELS[facts.status] ?? facts.status}</dd>
              </div>
            )}
            {facts?.license && (
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">License</dt>
                <dd className="mt-0.5 text-foreground">{facts.license}</dd>
              </div>
            )}
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Technology stack</dt>
              <dd className="mt-1.5 flex flex-wrap gap-1.5">
                {project.technologies.map((tech) => (
                  <Badge key={tech} variant="neutral">
                    {tech}
                  </Badge>
                ))}
              </dd>
            </div>
            {project.tags.length > 0 && (
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tags</dt>
                <dd className="mt-1.5 flex flex-wrap gap-1.5">
                  {project.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </dd>
              </div>
            )}
            {project.updated && (
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Last updated</dt>
                <dd className="mt-0.5 text-foreground">{project.updated}</dd>
              </div>
            )}
          </dl>
        </aside>
      </div>

      <section className="mt-12 flex h-[32rem] flex-col overflow-hidden rounded-2xl border border-border bg-surface" aria-labelledby="ask-ai-heading">
        <h2 id="ask-ai-heading" className="border-b border-border px-4 py-3 text-sm font-semibold text-foreground">
          Ask AI about {project.title}
        </h2>
        <Suspense fallback={null}>
          <ChatContainer
            assistantName="Anjo AI"
            assistantInitials={initialsFor(profile.name)}
            ownerFirstName={profile.name.split(" ")[0] ?? profile.name}
            contextSlug={project.slug}
            compact
            suggestedPrompts={[
              `What problem does ${project.title} solve?`,
              `How is ${project.title} architected?`,
              `What was ${profile.name.split(" ")[0]}'s role in ${project.title}?`,
              `What technologies does ${project.title} use?`,
            ]}
          />
        </Suspense>
      </section>
    </PageLayout>
  );
}
