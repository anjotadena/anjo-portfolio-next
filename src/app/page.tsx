import { AboutSection, ContactSection, HelpSection, Hero, WorkSection, type WorkCardData } from "@/components/home/home-sections";
import { ScrollToHash } from "@/components/home/scroll-to-hash";
import { PersonJsonLd } from "@/components/seo/json-ld";
import { getCaseStudyForProject, getProfile, getPublicDocumentBySlug, getPublicDocumentsByType } from "@/lib/knowledge/repository";
import { getAvailableResumeHref } from "@/lib/portfolio/resume";
import type { ContentDocument } from "@/types/content";

const STATUS_LABELS: Record<string, string> = { active: "Active", maintained: "Maintained", "in-progress": "In development", archived: "Archived" };

interface CardConfig {
  slug: string;
  icon: WorkCardData["icon"];
  title?: string;
  status?: (doc: ContentDocument) => string;
  primary: (doc: ContentDocument) => WorkCardData["primary"];
  secondary?: (doc: ContentDocument) => WorkCardData["secondary"];
}

/**
 * The three featured cards. Every fact (audience, problem, what was built,
 * role, status, links) comes from the validated project Markdown, so the
 * homepage and the assistant can never disagree.
 */
const FEATURED: CardConfig[] = [
  {
    slug: "unexaro",
    icon: "layers",
    primary: (doc) => ({ href: `/projects/${doc.slug}`, label: "Read about Unexaro" }),
  },
  {
    slug: "asterweave",
    icon: "code",
    status: (doc) => (doc.project?.license ? "Open source" : STATUS_LABELS[doc.project?.status ?? ""] ?? "Project"),
    primary: (doc) => ({ href: `/projects/${doc.slug}`, label: "How it works" }),
    secondary: (doc) => {
      const links: WorkCardData["secondary"] = [];
      const caseStudy = getCaseStudyForProject(doc.slug);
      if (caseStudy) links.push({ href: `/case-studies/${caseStudy.slug}`, label: "Case study" });
      if (doc.project?.repoUrl) links.push({ href: doc.project.repoUrl, label: "GitHub", external: true });
      return links;
    },
  },
  {
    slug: "anjo-ai-portfolio",
    icon: "sparkles",
    title: "Anjo AI",
    // The assistant is running on this site right now.
    status: () => "Live demo",
    primary: () => ({ assistant: true, label: "Try Anjo AI" }),
    secondary: (doc) => [{ href: `/projects/${doc.slug}`, label: "How it's built" }],
  },
];

function toCard(config: CardConfig): WorkCardData | null {
  const doc = getPublicDocumentBySlug(config.slug);
  const facts = doc?.project;
  if (!doc || doc.type !== "project" || !facts) return null;
  return {
    slug: doc.slug,
    title: config.title ?? doc.title,
    icon: config.icon,
    status: config.status?.(doc) ?? STATUS_LABELS[facts.status ?? ""] ?? "Project",
    audience: facts.audience ?? "",
    problem: facts.problem ?? doc.summary,
    built: facts.built ?? "",
    role: facts.role ?? "",
    primary: config.primary(doc),
    secondary: config.secondary?.(doc) ?? [],
  };
}

/** First paragraph under a `## Heading` in a Markdown body. */
function sectionParagraph(body: string, heading: string): string | null {
  const match = body.match(new RegExp(`^##\\s+${heading}\\s*\\n+([^#][\\s\\S]*?)(?:\\n\\n|$)`, "m"));
  return match?.[1]?.trim() ?? null;
}

/** "security first, maintainability over cleverness, …" → list items. */
function approachItems(body: string): string[] {
  const text = sectionParagraph(body, "Approach");
  const match = text?.match(/emphasi[sz]es\s+(.+?)\.\s/);
  if (!match?.[1]) return [];
  return match[1]
    .split(/,\s*(?:and\s+)?/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => item.charAt(0).toUpperCase() + item.slice(1));
}

export default function HomePage() {
  const profileDoc = getProfile();
  const { profile } = profileDoc;
  const cards = FEATURED.map(toCard).filter((card): card is WorkCardData => card !== null);
  const skillGroups = (getPublicDocumentsByType("skills")[0]?.skillGroups ?? []).filter((group) => ["backend", "frontend", "data", "cloud", "ai-engineering"].includes(group.id));

  return (
    <>
      <PersonJsonLd />
      <ScrollToHash />
      <Hero />
      <WorkSection cards={cards} />
      <HelpSection email={profile.email} />
      <AboutSection profile={profile} overview={sectionParagraph(profileDoc.body, "Overview") ?? profileDoc.summary} approach={approachItems(profileDoc.body)} skillGroups={skillGroups} />
      <ContactSection profile={profile} resumeHref={getAvailableResumeHref()} />
    </>
  );
}
