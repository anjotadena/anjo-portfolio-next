import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarDays, Clock, Rss } from "lucide-react";
import { PageLayout } from "@/components/layout/page-layout";
import { AskAiLink } from "@/components/portfolio/ask-ai-link";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { getPosts } from "@/lib/knowledge/repository";

export const metadata: Metadata = {
  title: "Blog",
  description: "Engineering notes by Anjo Tadena on AI systems, retrieval, .NET and TypeScript, cloud, and developer tooling.",
  alternates: { canonical: "/blog", types: { "application/rss+xml": "/feed.xml" } },
};

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
}

export default function BlogPage() {
  const posts = getPosts();
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Blog", path: "/blog" },
  ];

  return (
    <PageLayout
      title="Blog"
      description="Notes from building software and AI systems. Every post is part of the assistant's knowledge base, so you can ask questions about them too."
      crumbs={crumbs}
      actions={
        <>
          <a href="/feed.xml" className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Rss className="h-4 w-4" aria-hidden="true" /> RSS
          </a>
          <AskAiLink question="What has he written about?" label="Ask AI about the blog" />
        </>
      }
    >
      <BreadcrumbJsonLd items={crumbs} />
      {posts.length === 0 ? (
        <p className="text-sm text-muted-foreground">No posts published yet.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-border">
          {posts.map((post) => (
            <li key={post.slug} className="py-6 first:pt-0">
              <article>
                <p className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  {post.date && (
                    <time dateTime={post.date} className="inline-flex items-center gap-1">
                      <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" /> {formatDate(post.date)}
                    </time>
                  )}
                  {post.post && (
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" aria-hidden="true" /> {post.post.readingMinutes} min read
                    </span>
                  )}
                  {post.post?.series && <Badge variant="outline">{post.post.series}</Badge>}
                </p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
                  <Link href={`/blog/${post.slug}`} className="rounded hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    {post.title}
                  </Link>
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">{post.summary}</p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <Link href={`/blog/${post.slug}`} className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    Read post <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                  <ul className="flex flex-wrap gap-1.5" aria-label="Tags">
                    {post.tags.slice(0, 5).map((tag) => (
                      <li key={tag}>
                        <Badge variant="neutral">{tag}</Badge>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}
    </PageLayout>
  );
}
