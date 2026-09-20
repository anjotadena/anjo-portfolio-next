"use client";

import Link from "next/link";
import { useCallback, useState, type ReactNode } from "react";
import { Download, Github, Linkedin, Mail, Menu, Search } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Dialog } from "@/components/ui/dialog";
import { Kbd } from "@/components/ui/kbd";
import { SidebarNav } from "@/components/navigation/sidebar-nav";
import type { NavItem } from "@/components/navigation/nav-config";
import { SearchPalette, useSearchPalette } from "@/components/search/search-palette";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { track } from "@/lib/analytics/track";

export interface ShellBrand {
  name: string;
  initials: string;
  headline: string;
  tagline: string | null;
  email: string;
  githubUrl: string;
  linkedInUrl: string;
  resumeHref: string | null;
}

export interface ShellFrameProps {
  brand: ShellBrand;
  primary: NavItem[];
  topics: NavItem[];
  children: ReactNode;
}

const iconButtonClassName =
  "inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

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

function SidebarContent({ brand, primary, topics, onNavigate }: Omit<ShellFrameProps, "children"> & { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <Link
        href="/"
        onClick={onNavigate}
        className="flex items-center gap-3 rounded-lg px-2 py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Avatar initials={brand.initials} size="md" />
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold text-foreground">{brand.name}</span>
          <span className="block truncate text-[11px] text-muted-foreground">{brand.headline}</span>
        </span>
      </Link>

      <div className="mt-6 flex-1">
        <SidebarNav primary={primary} topics={topics} onNavigate={onNavigate} />
      </div>

      <div className="mt-6 flex flex-col gap-4 border-t border-border pt-4">
        {brand.tagline && <p className="px-2 text-xs italic leading-relaxed text-muted-foreground">“{brand.tagline}”</p>}
        <SocialLinks brand={brand} className="flex items-center gap-1 px-1" />
      </div>
    </div>
  );
}

/**
 * The application frame: fixed sidebar (desktop), top bar, scrollable
 * main region, and the mobile drawer. `h-app` (100dvh) + `min-h-0` on the
 * column keeps the chat composer on screen when the mobile keyboard opens.
 */
export function ShellFrame({ brand, primary, topics, children }: ShellFrameProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const search = useSearchPalette();
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const closeSearch = useCallback(() => search.setOpen(false), [search]);

  return (
    <div className="h-app flex w-full overflow-hidden bg-background">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>

      <aside className="hidden w-64 shrink-0 border-r border-border bg-surface p-4 lg:flex lg:flex-col" aria-label="Sidebar">
        <SidebarContent brand={brand} primary={primary} topics={topics} />
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="pt-safe flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border bg-background/95 px-3 backdrop-blur sm:px-4">
          <div className="flex min-w-0 items-center gap-2">
            <button type="button" onClick={() => setMenuOpen(true)} aria-label="Open menu" className={`${iconButtonClassName} lg:hidden`}>
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
            <Link href="/" className="flex items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <span className="text-sm font-semibold text-foreground">Anjo AI</span>
              <span className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:inline-flex">
                <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />
                Online
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => search.setOpen(true)}
              className="hidden h-9 items-center gap-2 rounded-full border border-border bg-surface px-3 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:inline-flex"
            >
              <Search className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Search</span>
              <Kbd aria-hidden="true">⌘K</Kbd>
            </button>
            <button type="button" onClick={() => search.setOpen(true)} aria-label="Search" className={`${iconButtonClassName} md:hidden`}>
              <Search className="h-4 w-4" aria-hidden="true" />
            </button>
            <ThemeToggle />
            {brand.resumeHref && (
              <a
                href={brand.resumeHref}
                download
                onClick={() => track("resume_downloaded")}
                className="hidden h-9 items-center gap-1.5 rounded-full border border-border px-3 text-xs font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:inline-flex"
              >
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                Resume
              </a>
            )}
            <Link
              href="/contact"
              className="inline-flex h-9 items-center rounded-full bg-primary px-3.5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Get in touch
            </Link>
          </div>
        </header>

        <main id="main" className="flex min-h-0 flex-1 flex-col">
          {children}
        </main>
      </div>

      <Dialog open={menuOpen} onClose={closeMenu} title="Menu" hideTitle placement="side" className="max-w-xs">
        <div className="p-4">
          <SidebarContent brand={brand} primary={primary} topics={topics} onNavigate={closeMenu} />
        </div>
      </Dialog>

      <SearchPalette open={search.open} onClose={closeSearch} />
    </div>
  );
}
