import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CalendarDays, Clock } from "lucide-react";
import { PageLayout } from "@/components/layout/page-layout";
import { AskAiLink } from "@/components/portfolio/ask-ai-link";
import { DocumentBody } from "@/components/portfolio/document-body";
import { ArticleJsonLd, BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { getPosts, getProfile, getPublicDocumentBySlug } from "@/lib/knowledge/repository";

export const dynamicParams = false;

export function generateStaticParams() {
  return getPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = getPublicDocumentBySlug(slug);
  if (!post || post.type !== "post") return {};
  return {
    title: post.title,
    description: post.summary,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.summary,
      type: "article",
      url: `/blog/${post.slug}`,
      publishedTime: post.date ?? undefined,
      modifiedTime: post.updated ?? undefined,
      tags: post.tags,
    },
    twitter: { card: "summary", title: post.title, description: post.summary },
  };
}

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
}

export default async function BlogPostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = getPublicDocumentBySlug(slug);
  if (!post || post.type !== "post" || !post.post) notFound();

  const { profile } = getProfile();
  const posts = getPosts();
  const index = posts.findIndex((entry) => entry.slug === post.slug);
  const newer = index > 0 ? posts[index - 1] : null;
  const older = index >= 0 && index < posts.length - 1 ? posts[index + 1] : null;
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Blog", path: "/blog" },
    { name: post.title, path: `/blog/${post.slug}` },
  ];

  return (
    <PageLayout title={post.title} description={post.summary} eyebrow={post.post.series ?? "Blog"} crumbs={crumbs} actions={<AskAiLink question={`What does his post "${post.title}" cover?`} label="Ask AI about this post" />}>
      <ArticleJsonLd post={post} />
      <BreadcrumbJsonLd items={crumbs} />

      <p className="mb-8 flex flex-wrap items-center gap-3 border-b border-border pb-6 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{post.post.author ?? profile.name}</span>
        {post.date && (
          <time dateTime={post.date} className="inline-flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" /> {formatDate(post.date)}
          </time>
        )}
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" aria-hidden="true" /> {post.post.readingMinutes} min read
        </span>
        {post.updated && post.updated !== post.date && <span>Updated {formatDate(post.updated)}</span>}
      </p>

      <DocumentBody body={post.body} size="base" />

      {post.tags.length > 0 && (
        <ul className="mt-10 flex flex-wrap gap-1.5" aria-label="Tags">
          {post.tags.map((tag) => (
            <li key={tag}>
              <Badge variant="neutral">{tag}</Badge>
            </li>
          ))}
        </ul>
      )}

      <nav aria-label="More posts" className="mt-10 grid grid-cols-1 gap-3 border-t border-border pt-6 sm:grid-cols-2">
        {older ? (
          <Link href={`/blog/${older.slug}`} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-sm transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <ArrowLeft className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <span className="min-w-0">
              <span className="block text-[11px] uppercase tracking-wider text-muted-foreground">Older</span>
              <span className="block truncate font-medium text-foreground">{older.title}</span>
            </span>
          </Link>
        ) : (
          <span />
        )}
        {newer && (
          <Link href={`/blog/${newer.slug}`} className="flex items-center justify-end gap-3 rounded-xl border border-border bg-card p-4 text-right text-sm transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <span className="min-w-0">
              <span className="block text-[11px] uppercase tracking-wider text-muted-foreground">Newer</span>
              <span className="block truncate font-medium text-foreground">{newer.title}</span>
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          </Link>
        )}
      </nav>
    </PageLayout>
  );
}
