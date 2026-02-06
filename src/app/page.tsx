import Link from "next/link";
import type { Metadata } from "next";

import { AskInput } from "@/components/site/AskInput";
import { site } from "@/config/site";
import { featuredProjects } from "@/data/projects";
import { on } from "@/utils";

export const metadata: Metadata = {
  title: "Home",
  description: "Senior Software Engineer / Lead Developer portfolio.",
};

export default function Page() {
  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-24 left-1/2 h-72 w-[48rem] -translate-x-1/2 rounded-full bg-zinc-200/60 blur-3xl dark:bg-zinc-800/40" />
          <div className="absolute top-40 left-1/2 h-72 w-[40rem] -translate-x-1/2 rounded-full bg-zinc-100/80 blur-3xl dark:bg-zinc-900/50" />
        </div>

        <div className="mx-auto w-full max-w-5xl px-4 py-16 sm:py-20">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Hey, I&apos;m {site.name.split(" ")[0]}.
          </p>
          <h1 className="mt-3 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            {site.title}
          </h1>
          <p className="mt-4 max-w-2xl text-pretty text-base leading-relaxed text-zinc-700 dark:text-zinc-200">
            {site.tagline}
          </p>

          <div className="mt-8 max-w-xl">
            {/* Opens command palette modal */}
            {/* TODO: Replace intent responses with real AI integration */}
            <AskMeAnything />
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <HighlightCard
              title="Experience"
              body="Senior engineer with a product mindset: reliable delivery, strong fundamentals, and healthy systems."
            />
            <HighlightCard
              title="Stack"
              body="TypeScript, React/Next.js, Node, cloud platforms, search, observability, CI/CD."
            />
            <HighlightCard
              title="Role"
              body="Lead developer who unblocks teams, drives technical direction, and maintains quality through reviews."
            />
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <PrimaryLink href="/projects">View Projects</PrimaryLink>
            <SecondaryLink href="/contact">Contact</SecondaryLink>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 pb-16">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Featured Projects</h2>
          <Link
            href="/projects"
            className="text-sm text-zinc-600 underline-offset-4 hover:underline dark:text-zinc-400"
          >
            See all
          </Link>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {featuredProjects.map((p) => (
            <Link
              key={p.slug}
              href={`/projects/${p.slug}`}
              className={on(
                "group rounded-xl border border-zinc-200 bg-white p-5",
                "hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2",
                "dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900 dark:focus:ring-zinc-50"
              )}
            >
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{p.name}</p>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{p.role}</p>
              <p className="mt-3 text-sm leading-relaxed text-zinc-700 dark:text-zinc-200">
                {p.impact}
              </p>
              <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
                {p.stack.join(" • ")}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function AskMeAnything() {
  return <AskInput />;
}

function HighlightCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{title}</p>
      <p className="mt-2 text-sm leading-relaxed text-zinc-700 dark:text-zinc-200">{body}</p>
    </div>
  );
}

function PrimaryLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={on(
        "inline-flex items-center justify-center rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white",
        "hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2",
        "dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 dark:focus:ring-zinc-50"
      )}
    >
      {children}
    </Link>
  );
}

function SecondaryLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={on(
        "inline-flex items-center justify-center rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-900",
        "hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2",
        "dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900 dark:focus:ring-zinc-50"
      )}
    >
      {children}
    </Link>
  );
}
