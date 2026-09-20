import { getPosts, getProfile } from "@/lib/knowledge/repository";
import { absoluteUrl, getSiteUrl } from "@/lib/seo/site";

export const dynamic = "force-static";

function escapeXml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

/** GET /feed.xml — RSS 2.0 feed of public blog posts (summaries only; the full post is on the site). */
export function GET(): Response {
  const { profile } = getProfile();
  const posts = getPosts();
  const items = posts
    .map((post) => {
      const url = absoluteUrl(`/blog/${post.slug}`);
      const pubDate = new Date(`${post.date}T00:00:00Z`).toUTCString();
      const categories = post.tags.map((tag) => `      <category>${escapeXml(tag)}</category>`).join("\n");
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(post.summary)}</description>
${categories}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(`${profile.name} — Blog`)}</title>
    <link>${absoluteUrl("/blog")}</link>
    <atom:link href="${absoluteUrl("/feed.xml")}" rel="self" type="application/rss+xml" />
    <description>${escapeXml(`Engineering notes by ${profile.name} on AI systems, retrieval, .NET and TypeScript, cloud, and developer tooling.`)}</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <generator>${escapeXml(getSiteUrl())}</generator>
${items}
  </channel>
</rss>
`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
