import type { ContentCategory } from "@/types/content";

/**
 * Maps a content category to the site page it's rendered on, per the
 * site's nav structure (`src/components/layout/nav-links.ts`: `/about`,
 * `/projects`, `/experience`, `/contact`). Categories with no dedicated
 * page of their own (skills, philosophy, ai-engineering) fold into
 * `/about`, which is expected to surface that content. Returns `null`
 * only if a future category has genuinely no home yet.
 */
export function hrefForCategory(category: ContentCategory, slug: string): string | null {
  switch (category) {
    case "projects":
      return `/projects/${slug}`;
    case "experience":
      return "/experience";
    case "contact":
      return "/contact";
    case "profile":
    case "skills":
    case "philosophy":
    case "ai-engineering":
      return "/about";
    default:
      return null;
  }
}
