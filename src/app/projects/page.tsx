import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/site/Container";
import { projects } from "@/data/projects";
import { on } from "@/utils";

export const metadata: Metadata = {
  title: "Projects",
  description: "A curated set of projects with role, stack, and measurable impact.",
};

export default function ProjectsPage() {
  return (
    <Container className="py-12">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight">Projects</h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-700 dark:text-zinc-200">
          Case studies focusing on problem framing, architecture choices, trade-offs, and impact.
        </p>
      </header>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {projects.map((p) => (
          <Link
            key={p.slug}
            href={`/projects/${p.slug}`}
            className={on(
              "group rounded-xl border border-zinc-200 bg-white p-5",
              "hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2",
              "dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900 dark:focus:ring-zinc-50"
            )}
            aria-label={`View project: ${p.name}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">{p.name}</h2>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{p.role}</p>
              </div>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">View</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-zinc-700 dark:text-zinc-200">{p.impact}</p>
            <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">{p.stack.join(" • ")}</p>
          </Link>
        ))}
      </div>
    </Container>
  );
}
