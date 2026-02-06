"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LuCalendar, LuMenu, LuX } from "react-icons/lu";

import { site } from "@/config/site";
import { on } from "@/utils";

const navItems = [
  { href: "/experience", label: "Experience" },
  { href: "/projects", label: "Projects" },
  { href: "/architecture", label: "Architecture" },
  { href: "/leadership", label: "Leadership" },
  { href: "/blog", label: "Insights" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Check initial state

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={on(
        "fixed left-0 right-0 top-0 z-40 transition-all duration-300 ease-in-out",
        isScrolled
          ? "border-b border-zinc-200/80 bg-white/95 shadow-sm backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/95"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <div className="container mx-auto px-4">
        <div
          className={on(
            "flex items-center justify-between transition-all duration-300",
            isScrolled ? "h-14" : "h-20"
          )}
        >
          {/* Logo / Name */}
          <Link
            href="/"
            className={on(
              "text-lg font-semibold tracking-tight text-zinc-900",
              "transition-colors hover:text-primary-600",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
              "dark:text-zinc-50 dark:hover:text-primary-400"
            )}
            aria-label="Go to home"
          >
            {site.name}
          </Link>

          {/* Desktop Navigation */}
          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={isActive ? "page" : undefined}
                      className={on(
                        "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
                        "dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100",
                        isActive && "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Schedule a Call Button */}
            <a
              href={site.links.schedule}
              target="_blank"
              rel="noopener noreferrer"
              className={on(
                "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium",
                "bg-primary-600 text-white",
                "transition-all hover:bg-primary-700",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
                "active:scale-[0.98]"
              )}
              aria-label="Schedule a call"
            >
              <LuCalendar className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Schedule a Call</span>
              <span className="sm:hidden">Schedule</span>
            </a>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={on(
                "inline-flex items-center justify-center rounded-lg p-2 lg:hidden",
                "text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
                "dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
              )}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <LuX className="h-5 w-5" aria-hidden="true" />
              ) : (
                <LuMenu className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav
            aria-label="Primary mobile"
            className={on(
              "border-t py-4 lg:hidden",
              isScrolled
                ? "border-zinc-100 dark:border-zinc-800"
                : "border-zinc-200/50 bg-white/95 backdrop-blur-md dark:border-zinc-700/50 dark:bg-zinc-950/95"
            )}
          >
            <ul className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      aria-current={isActive ? "page" : undefined}
                      className={on(
                        "block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                        "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900",
                        "dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100",
                        isActive && "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
}

