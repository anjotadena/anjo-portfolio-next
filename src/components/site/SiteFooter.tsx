import Link from "next/link";

import { Container } from "@/components/site/Container";
import { on } from "@/utils";

export function SiteFooter() {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800">
      <Container className="py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            &copy; {new Date().getFullYear()} Portfolio. All rights reserved.
          </p>
          <nav aria-label="Footer" className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Link
              className={on(
                "text-sm text-zinc-600 underline-offset-4 hover:underline",
                "focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2",
                "dark:text-zinc-400 dark:focus:ring-zinc-50"
              )}
              href="/contact"
            >
              Contact
            </Link>
            <Link
              className={on(
                "text-sm text-zinc-600 underline-offset-4 hover:underline",
                "focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2",
                "dark:text-zinc-400 dark:focus:ring-zinc-50"
              )}
              href="/projects"
            >
              Projects
            </Link>
            <Link
              className={on(
                "text-sm text-zinc-600 underline-offset-4 hover:underline",
                "focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2",
                "dark:text-zinc-400 dark:focus:ring-zinc-50"
              )}
              href="/ask"
            >
              Ask
            </Link>
          </nav>
        </div>
      </Container>
    </footer>
  );
}

