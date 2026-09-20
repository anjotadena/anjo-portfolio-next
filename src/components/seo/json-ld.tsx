import type { ContentDocument } from "@/types/content";
import { getProfile } from "@/lib/knowledge/repository";
import { absoluteUrl } from "@/lib/seo/site";

/**
 * JSON-LD is the one reviewed, deliberate use of `dangerouslySetInnerHTML`
 * in this codebase. The payload is built exclusively from validated
 * frontmatter (never from user input or model output) and every `<` is
 * escaped to its unicode escape sequence, so a string can never close the script element.
 * See docs/SECURITY.md.
 */
const LINE_SEPARATOR = String.fromCharCode(0x2028);
const PARAGRAPH_SEPARATOR = String.fromCharCode(0x2029);

export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .split(LINE_SEPARATOR)
    .join("\\u2028")
    .split(PARAGRAPH_SEPARATOR)
    .join("\\u2029");
}

function JsonLd({ data }: { data: Record<string, unknown> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />;
}

export function PersonJsonLd() {
  const { profile, summary } = getProfile();
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Person",
        name: profile.name,
        jobTitle: profile.headline,
        description: summary,
        email: `mailto:${profile.email}`,
        url: absoluteUrl("/"),
        address: { "@type": "PostalAddress", addressLocality: profile.location },
        sameAs: [profile.githubUrl, profile.linkedInUrl],
      }}
    />
  );
}

export function BreadcrumbJsonLd({ items }: { items: Array<{ name: string; path: string }> }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: absoluteUrl(item.path),
        })),
      }}
    />
  );
}

export function ProjectJsonLd({ project }: { project: ContentDocument }) {
  const { profile } = getProfile();
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "SoftwareSourceCode",
        name: project.title,
        description: project.summary,
        url: absoluteUrl(`/projects/${project.slug}`),
        ...(project.project?.repoUrl ? { codeRepository: project.project.repoUrl } : {}),
        ...(project.project?.license ? { license: project.project.license } : {}),
        programmingLanguage: project.technologies,
        keywords: project.tags.join(", "),
        ...(project.date ? { dateCreated: project.date } : {}),
        ...(project.updated ? { dateModified: project.updated } : {}),
        author: { "@type": "Person", name: profile.name, url: absoluteUrl("/") },
      }}
    />
  );
}
