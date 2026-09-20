import type { ReactNode } from "react";
import { getProfile, getPublicDocuments } from "@/lib/knowledge/repository";
import { initialsFor } from "@/lib/utils/initials";
import { APP_VERSION, BUILD_ID, commitUrl } from "@/lib/version";
import { PRIMARY_NAV, TOPIC_ICONS, TOPIC_LABELS, TOPIC_TYPES, type NavItem } from "@/components/navigation/nav-config";
import { ShellFrame, type ShellBrand } from "./shell-frame";

/** Topic nav entries exist only for public topic documents — never for private templates. */
export function getTopicNav(): NavItem[] {
  const docs = getPublicDocuments();
  return TOPIC_TYPES.flatMap((type) =>
    docs
      .filter((doc) => doc.type === type)
      .map((doc) => ({
        href: `/topics/${doc.slug}`,
        label: TOPIC_LABELS[type] ?? doc.title,
        icon: TOPIC_ICONS[type] ?? "book",
      })),
  );
}

export function getBrand(): ShellBrand {
  const { profile } = getProfile();
  const portfolioRepo = getPublicDocuments().find((doc) => doc.slug === "anjo-ai-portfolio")?.project?.repoUrl ?? null;
  return {
    version: APP_VERSION,
    buildId: BUILD_ID,
    buildUrl: portfolioRepo ? commitUrl(portfolioRepo) : null,
    name: profile.name,
    initials: initialsFor(profile.name),
    headline: profile.headline,
    tagline: profile.tagline,
    email: profile.email,
    githubUrl: profile.githubUrl,
    linkedInUrl: profile.linkedInUrl,
    resumeHref: profile.resumeHref,
  };
}

/** Server component: reads profile + topics from Markdown and renders the client frame. */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <ShellFrame brand={getBrand()} primary={PRIMARY_NAV} topics={getTopicNav()}>
      {children}
    </ShellFrame>
  );
}
