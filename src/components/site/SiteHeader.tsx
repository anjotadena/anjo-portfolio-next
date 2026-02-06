"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LuCommand, LuSearch } from "react-icons/lu";

import { useCommandPalette } from "@/components/command-palette/useCommandPalette";
import { Container } from "@/components/site/Container";
import { ThemeToggle } from "@/components/site/ThemeToggle";
import { on } from "@/utils";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/architecture", label: "Architecture" },
  { href: "/leadership", label: "Leadership" },
  { href: "/blog", label: "Blog" },
  { href: "/ask", label: "Ask" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { openPalette } = useCommandPalette();

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/70">
      <Container className="py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className={on(
                "font-semibold tracking-tight",
                "focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2",
                "dark:focus:ring-zinc-50"
              )}
              aria-label="Go to home"
            >
              Portfolio
            </Link>
            <nav aria-label="Primary" className="hidden md:block">
              <ul className="flex items-center gap-1">
                {navItems.map((item) => {
                  const isActive = item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={isActive ? "page" : undefined}
                        className={on(
                          "rounded-md px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950",
                          "focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2",
                          "dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-50 dark:focus:ring-zinc-50",
                          isActive && "bg-zinc-100 text-zinc-950 dark:bg-zinc-900 dark:text-zinc-50"
                        )}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openPalette}
              className={on(
                "inline-flex items-center gap-2 rounded-md border border-zinc-200 px-2.5 py-2 text-sm",
                "hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2",
                "dark:border-zinc-800 dark:hover:bg-zinc-900 dark:focus:ring-zinc-50"
              )}
              aria-label="Open command palette"
            >
              <LuSearch aria-hidden="true" />
              <span className="hidden sm:inline">Ask</span>
              <span className="ml-1 hidden items-center gap-1 rounded border border-zinc-200 px-1.5 py-0.5 text-[11px] text-zinc-500 sm:inline-flex dark:border-zinc-800 dark:text-zinc-400">
                <LuCommand aria-hidden="true" />
                K
              </span>
            </button>
            <ThemeToggle />
          </div>
        </div>

        <nav aria-label="Primary mobile" className="mt-3 md:hidden">
          <ul className="flex flex-wrap items-center gap-2">
            {navItems.map((item) => {
              const isActive = item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={on(
                      "rounded-md border border-zinc-200 px-3 py-1.5 text-sm text-zinc-700",
                      "hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2",
                      "dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-900 dark:focus:ring-zinc-50",
                      isActive && "bg-zinc-100 text-zinc-950 dark:bg-zinc-900 dark:text-zinc-50"
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </Container>
    </header>
  );
}

