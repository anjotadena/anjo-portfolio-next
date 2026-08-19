import Link from "next/link";
import { FileText, Github, Linkedin } from "lucide-react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { MobileNav } from "./mobile-nav";
import { GITHUB_URL, LINKEDIN_URL, NAV_LINKS, RESUME_HREF } from "./nav-links";

const actionLinkClassName =
  "inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const iconLinkClassName =
  "inline-flex h-9 w-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

/** "AT" monogram set inside a thin emerald-outlined circle. Pure SVG, no image asset. */
function AtMonogram() {
  return (
    <svg viewBox="0 0 40 40" className="h-9 w-9 shrink-0 text-primary" aria-hidden="true">
      <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <text
        x="20"
        y="21"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="14"
        fontWeight="600"
        fill="currentColor"
      >
        AT
      </text>
    </svg>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="relative mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <AtMonogram />
          <span className="text-base font-medium text-foreground">Anjo Tadena</span>
        </Link>

        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="rounded-md text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <a href={RESUME_HREF} className={actionLinkClassName}>
            <FileText size={16} aria-hidden="true" />
            Résumé
          </a>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Anjo Tadena on GitHub (opens in a new tab)"
            className={iconLinkClassName}
          >
            <Github size={18} aria-hidden="true" />
          </a>
          <a
            href={LINKEDIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Anjo Tadena on LinkedIn (opens in a new tab)"
            className={iconLinkClassName}
          >
            <Linkedin size={18} aria-hidden="true" />
          </a>
          <ThemeToggle />
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <MobileNav
            links={NAV_LINKS}
            resumeHref={RESUME_HREF}
            githubUrl={GITHUB_URL}
            linkedinUrl={LINKEDIN_URL}
          />
        </div>
      </div>
    </header>
  );
}
