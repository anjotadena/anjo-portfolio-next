import type { MetadataRoute } from "next";
import { TOPIC_TYPES } from "@/components/navigation/nav-config";
import { getCaseStudies, getPosts, getProjects, getPublicDocuments } from "@/lib/knowledge/repository";
import { absoluteUrl } from "@/lib/seo/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = ["/", "/about", "/projects", "/case-studies", "/blog", "/skills", "/experience", "/contact"].map((path) => ({
    url: absoluteUrl(path),
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));

  const projects: MetadataRoute.Sitemap = getProjects().map((project) => ({
    url: absoluteUrl(`/projects/${project.slug}`),
    lastModified: project.updated ?? project.date ?? undefined,
    changeFrequency: "monthly",
    priority: project.featured ? 0.9 : 0.6,
  }));

  const caseStudies: MetadataRoute.Sitemap = getCaseStudies().map((doc) => ({
    url: absoluteUrl(`/case-studies/${doc.slug}`),
    lastModified: doc.updated ?? doc.date ?? undefined,
    changeFrequency: "monthly",
    priority: doc.featured ? 0.9 : 0.7,
  }));

  const posts: MetadataRoute.Sitemap = getPosts().map((doc) => ({
    url: absoluteUrl(`/blog/${doc.slug}`),
    lastModified: doc.updated ?? doc.date ?? undefined,
    changeFrequency: "yearly",
    priority: 0.6,
  }));

  const topics: MetadataRoute.Sitemap = getPublicDocuments()
    .filter((doc) => TOPIC_TYPES.includes(doc.type))
    .map((doc) => ({ url: absoluteUrl(`/topics/${doc.slug}`), lastModified: doc.updated ?? undefined, changeFrequency: "monthly", priority: 0.5 }));

  return [...staticRoutes, ...projects, ...caseStudies, ...posts, ...topics];
}
