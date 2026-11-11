import type { ReactNode } from "react";
import { getProfile, getPublicDocuments } from "@/lib/knowledge/repository";
import { APP_VERSION, BUILD_ID, commitUrl } from "@/lib/version";
import { EXPLORE_NAV, PRIMARY_NAV, TOPIC_ICONS, TOPIC_LABELS, TOPIC_TYPES, type NavItem } from "@/components/navigation/nav-config";
import { AssistantProvider } from "@/components/assistant/assistant-provider";
import { getAssistantPrompts } from "@/lib/portfolio/assistant-prompts";
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
    headline: profile.headline,
    email: profile.email,
    githubUrl: profile.githubUrl,
    linkedInUrl: profile.linkedInUrl,
  };
}

/**
 * Server component: reads profile + topics from Markdown, renders the site
 * frame, and mounts the single Anjo AI controller around it. The root
 * layout persists across client navigations, so the conversation does too.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const brand = getBrand();
  const firstName = brand.name.split(" ")[0] ?? brand.name;
  return (
    <AssistantProvider ownerFirstName={firstName} suggestedPrompts={getAssistantPrompts()}>
      <ShellFrame brand={brand} primary={PRIMARY_NAV} explore={EXPLORE_NAV} topics={getTopicNav()}>
        {children}
      </ShellFrame>
    </AssistantProvider>
  );
}
