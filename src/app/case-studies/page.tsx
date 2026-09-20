import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { PageLayout } from "@/components/layout/page-layout";
import { AskAiLink } from "@/components/portfolio/ask-ai-link";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { getCaseStudies } from "@/lib/knowledge/repository";

export const metadata: Metadata = {
  title: "Case Studies",
  description: "In-depth write-ups of how Anjo Tadena designs and ships software: problem, constraints, architecture, key decisions, results, and lessons learned.",
  alternates: { canonical: "/case-studies" },
};

export default function CaseStudiesPage() {
  const caseStudies = getCaseStudies();
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Case Studies", path: "/case-studies" },
  ];

  return (
    <PageLayout
      title="Case Studies"
      description="How the work actually got done — the problem, the constraints, the architecture, the decisions and their trade-offs, and what came out of it. Written from the same Markdown the assistant answers from."
      crumbs={crumbs}
      actions={<AskAiLink question="Walk me through one of his case studies" label="Ask AI about case studies" />}
      width="wide"
    >
      <BreadcrumbJsonLd items={crumbs} />
      {caseStudies.length === 0 ? (
        <p className="text-sm text-muted-foreground">Case studies are being written up.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {caseStudies.map((doc) => {
            const facts = doc.caseStudy!;
            return (
              <li key={doc.slug}>
                <article className="rounded-xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-primary/40">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        {doc.featured && <Badge variant="accent">Featured</Badge>}
                        <span>{facts.role}</span>
                        {facts.period && <span>· {facts.period}</span>}
                        {facts.client && <span>· {facts.client}</span>}
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" aria-hidden="true" /> {facts.readingMinutes} min read
                        </span>
                      </div>
                      <h2 className="mt-2 text-lg font-semibold text-foreground">
                        <Link href={`/case-studies/${doc.slug}`} className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                          {doc.title}
                        </Link>
                      </h2>
                      <p className="mt-1 font-medium text-foreground">{facts.outcome}</p>
                      <p className="mt-2 text-sm text-muted-foreground">{doc.summary}</p>
                      <ul className="mt-3 flex flex-col gap-1 text-sm text-muted-foreground">
                        {facts.highlights.slice(0, 3).map((highlight) => (
                          <li key={highlight} className="flex gap-2">
                            <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" />
                            <span>{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex shrink-0 flex-col gap-3 md:w-56">
                      <ul className="flex flex-wrap gap-1.5" aria-label="Technologies">
                        {doc.technologies.slice(0, 6).map((tech) => (
                          <li key={tech}>
                            <Badge variant="neutral">{tech}</Badge>
                          </li>
                        ))}
                      </ul>
                      <Link href={`/case-studies/${doc.slug}`} className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                        Read the case study <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      )}
    </PageLayout>
  );
}
