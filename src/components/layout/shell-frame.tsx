"use client";

import Link from "next/link";
import { useCallback, useState, type ReactNode } from "react";
import { Github, Linkedin, Mail, Menu, Search } from "lucide-react";
import { Wordmark } from "@/components/brand/logo";
import { Dialog } from "@/components/ui/dialog";
import { SidebarNav } from "@/components/navigation/sidebar-nav";
import type { NavItem } from "@/components/navigation/nav-config";
import { SearchPalette, useSearchPalette } from "@/components/search/search-palette";
import { track } from "@/lib/analytics/track";

export interface ShellBrand {
  /** e.g. "1.0.0" */
  version: string;
  /** Short commit SHA or "dev". */
  buildId: string;
  /** Link to the commit, when known. */
  buildUrl: string | null;
  name: string;
  headline: string;
  email: string;
  githubUrl: string;
  linkedInUrl: string;
}

export interface ShellFrameProps {
  brand: ShellBrand;
  primary: NavItem[];
  explore: NavItem[];
  topics: NavItem[];
  children: ReactNode;
}

const iconButtonClassName =
  "inline-flex h-11 w-11 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

const navLinkClassName =
  "rounded-md px-3 py-2 font-mono text-[13px] text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function SocialLinks({ brand, className }: { brand: ShellBrand; className?: string }) {
  return (
    <div className={className}>
      <a href={brand.linkedInUrl} target="_blank" rel="noopener noreferrer" aria-label={`${brand.name} on LinkedIn (opens in a new tab)`} className={iconButtonClassName} onClick={() => track("contact_clicked", { channel: "linkedin" })}>
        <Linkedin className="h-4 w-4" aria-hidden="true" />
      </a>
      <a href={brand.githubUrl} target="_blank" rel="noopener noreferrer" aria-label={`${brand.name} on GitHub (opens in a new tab)`} className={iconButtonClassName} onClick={() => track("contact_clicked", { channel: "github" })}>
        <Github className="h-4 w-4" aria-hidden="true" />
      </a>
      <a href={`mailto:${brand.email}`} aria-label={`Email ${brand.name}`} className={iconButtonClassName} onClick={() => track("contact_clicked", { channel: "email" })}>
        <Mail className="h-4 w-4" aria-hidden="true" />
      </a>
    </div>
  );
}

function Version({ brand }: { brand: ShellBrand }) {
  return brand.buildUrl ? (
    <a
      href={brand.buildUrl}
      target="_blank"
      rel="noopener noreferrer"
      title={`Build ${brand.buildId}`}
      data-testid="app-version"
      className="rounded font-mono text-[11px] text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      v{brand.version}
      <span className="sr-only"> (build {brand.buildId}, opens in a new tab)</span>
    </a>
  ) : (
    <span className="font-mono text-[11px] text-muted-foreground" title={`Build ${brand.buildId}`} data-testid="app-version">
      v{brand.version}
    </span>
  );
}

/**
 * The site frame: sticky top navigation (wordmark + section anchors), the
 * mobile menu, the search palette, document-scrolling main content, and
 * the footer with the deeper pages.
 */
export function ShellFrame({ brand, primary, explore, topics, children }: ShellFrameProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const search = useSearchPalette();
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const closeSearch = useCallback(() => search.setOpen(false), [search]);

  return (
    <div className="flex min-h-dvh w-full flex-col bg-background">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[60] focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>

      <header className="pt-safe pl-safe pr-safe sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link href="/" aria-label={`${brand.name} — home`} className="-ml-1 inline-flex items-center rounded-md p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Wordmark title={null} className="h-6 sm:h-7" />
          </Link>

          <nav aria-label="Primary" className="hidden md:block">
            <ul className="flex items-center gap-1">
              {primary.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={navLinkClassName}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-1">
            <button type="button" onClick={() => search.setOpen(true)} aria-label="Search the portfolio" title="Search (Ctrl/⌘ K)" className={iconButtonClassName}>
              <Search className="h-4 w-4" aria-hidden="true" />
            </button>
            <button type="button" onClick={() => setMenuOpen(true)} aria-label="Open menu" aria-expanded={menuOpen} className={`${iconButtonClassName} md:hidden`}>
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <main id="main" tabIndex={-1} className="flex flex-1 flex-col focus:outline-none">
        {children}
      </main>

      <footer className="pl-safe pr-safe border-t border-border">
        {/* Bottom padding leaves room for the floating assistant launcher. */}
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 pb-28 pt-10 sm:grid-cols-[1fr_auto] sm:px-6">
          <div className="flex flex-col gap-3">
            <Wordmark title={brand.name} className="h-6 self-start" />
            <p className="max-w-sm text-sm text-muted-foreground">{brand.headline}</p>
            <div className="flex items-center gap-3">
              <SocialLinks brand={brand} className="-ml-3 flex items-center" />
              <Version brand={brand} />
            </div>
          </div>
          <nav aria-label="Explore" className="grid grid-cols-2 gap-x-10 gap-y-1 text-sm sm:grid-cols-[auto_auto]">
            <div>
              <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Explore</p>
              <ul className="flex flex-col">
                {explore.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="inline-flex min-h-9 items-center rounded text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            {topics.length > 0 && (
              <div>
                <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Topics</p>
                <ul className="flex flex-col">
                  {topics.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href} className="inline-flex min-h-9 items-center rounded text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </nav>
        </div>
      </footer>

      <Dialog open={menuOpen} onClose={closeMenu} title="Menu" hideTitle placement="side" className="sm:max-w-xs">
        <div className="pt-safe flex h-full flex-col">
          <div className="flex h-16 shrink-0 items-center border-b border-border px-4">
            <Link href="/" onClick={closeMenu} aria-label={`${brand.name} — home`} className="inline-flex rounded-md p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <Wordmark title={null} className="h-6" />
            </Link>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
            <SidebarNav
              sections={[
                { items: primary },
                { label: "Explore", items: explore },
                { label: "Topics", items: topics },
              ]}
              onNavigate={closeMenu}
            />
          </div>
          <div className="pb-safe flex shrink-0 items-center justify-between border-t border-border px-3 py-3">
            <SocialLinks brand={brand} className="flex items-center" />
            <Version brand={brand} />
          </div>
        </div>
      </Dialog>

      <SearchPalette open={search.open} onClose={closeSearch} />
    </div>
  );
}
