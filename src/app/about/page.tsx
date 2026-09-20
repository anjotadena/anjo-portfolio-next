import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { PageLayout } from "@/components/layout/page-layout";
import { AskAiLink } from "@/components/portfolio/ask-ai-link";
import { DocumentBody } from "@/components/portfolio/document-body";
import { BreadcrumbJsonLd, PersonJsonLd } from "@/components/seo/json-ld";
import { Avatar } from "@/components/ui/avatar";
import { TOPIC_LABELS, TOPIC_TYPES } from "@/components/navigation/nav-config";
import { getProfile, getPublicDocuments, getPublicDocumentsByType } from "@/lib/knowledge/repository";
import { initialsFor } from "@/lib/utils/initials";

export const metadata: Metadata = {
  title: "About",
  description: "About Anjo Tadena — Senior Software Engineer and AI Engineer based in Cebu, Philippines.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  const doc = getProfile();
  const { profile } = doc;
  const philosophy = getPublicDocumentsByType("philosophy")[0];
  const topics = getPublicDocuments().filter((entry) => TOPIC_TYPES.includes(entry.type) && entry.type !== "philosophy");
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
  ];

  return (
    <PageLayout title={profile.name} description={profile.headline} eyebrow="About" crumbs={crumbs} actions={<AskAiLink question="Tell me about Anjo" label="Ask AI about Anjo" />}>
      <PersonJsonLd />
      <BreadcrumbJsonLd items={crumbs} />

      <div className="mb-8 flex items-center gap-4 rounded-xl border border-border bg-card p-4">
        <Avatar initials={initialsFor(profile.name)} size="xl" />
        <div className="text-sm">
          <p className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="h-4 w-4" aria-hidden="true" /> {profile.location}
          </p>
          {profile.availability && <p className="mt-1 text-success">{profile.availability}</p>}
          {profile.tagline && <p className="mt-2 italic text-muted-foreground">“{profile.tagline}”</p>}
        </div>
      </div>

      <DocumentBody body={doc.body} />

      {philosophy && (
        <section className="mt-12" aria-labelledby="philosophy-heading">
          <h2 id="philosophy-heading" className="text-xl font-semibold tracking-tight text-foreground">
            {philosophy.title}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{philosophy.summary}</p>
          <DocumentBody body={philosophy.body} className="mt-4" />
        </section>
      )}

      {topics.length > 0 && (
        <section className="mt-12" aria-labelledby="topics-heading">
          <h2 id="topics-heading" className="text-xl font-semibold tracking-tight text-foreground">
            Go deeper
          </h2>
          <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {topics.map((topic) => (
              <li key={topic.slug}>
                <Link href={`/topics/${topic.slug}`} className="flex h-full flex-col rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <span className="flex items-center justify-between text-sm font-semibold text-foreground">
                    {TOPIC_LABELS[topic.type] ?? topic.title}
                    <ArrowRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  </span>
                  <span className="mt-1 line-clamp-2 text-xs text-muted-foreground">{topic.summary}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </PageLayout>
  );
}
