import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { LuArrowLeft, LuExternalLink } from "react-icons/lu";

import { site } from "@/config/site";
import { projects } from "@/data/projects";

export const metadata: Metadata = {
  title: "Projects",
  description: `Explore projects built by ${site.name} - showcasing full-stack development, cloud architecture, and scalable systems.`,
  openGraph: {
    title: `Projects | ${site.name}`,
    description: `Explore projects built by ${site.name}`,
    type: "website",
  },
};

export default function ProjectsPage() {
  return (
    <div className="min-h-screen bg-white pt-20 dark:bg-zinc-950">
      <div className="container mx-auto px-4 py-12">
        {/* Back Link */}
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          <LuArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        {/* Page Header */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50">
            Projects
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
            A selection of projects I&apos;ve built or contributed to, showcasing system design,
            full-stack development, and cloud architecture.
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid gap-8 md:grid-cols-2">
          {projects.map((project) => (
            <article
              key={project.slug}
              className="group overflow-hidden rounded-2xl border border-zinc-100 bg-white transition-all hover:border-zinc-200 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
            >
              {/* Project Image */}
              {project.image ? (
                <div className="relative aspect-[16/10] overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                  <Image
                    src={project.image}
                    alt={project.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              ) : (
                <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl font-bold text-primary-600/20 dark:text-primary-400/20">
                      {project.name.charAt(0)}
                    </span>
                  </div>
                </div>
              )}

              {/* Project Content */}
              <div className="p-6">
                {/* Header */}
                <div className="mb-4">
                  <span className="inline-block rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
                    {project.role}
                  </span>
                  <h2 className="mt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                    {project.name}
                  </h2>
                </div>

                {/* Impact */}
                <p className="mb-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {project.impact}
                </p>

                {/* Problem */}
                <div className="mb-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                    Challenge
                  </p>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    {project.problem}
                  </p>
                </div>

                {/* Tech Stack */}
                <div className="mb-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                    Tech Stack
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {project.stack.map((tech) => (
                      <span
                        key={tech}
                        className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Key Decisions */}
                <div className="mb-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                    Key Decisions
                  </p>
                  <ul className="mt-2 space-y-1">
                    {project.keyDecisions.slice(0, 2).map((decision, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-400"
                      >
                        <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-primary-500" />
                        {decision}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Impact Metrics */}
                <div className="border-t border-zinc-100 pt-4 dark:border-zinc-800">
                  <p className="text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                    Results
                  </p>
                  <ul className="mt-2 space-y-1">
                    {project.impactMetrics.slice(0, 2).map((metric, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-xs font-medium text-primary-600 dark:text-primary-400"
                      >
                        <span className="mt-1">→</span>
                        {metric}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 rounded-2xl border border-zinc-100 bg-slate-50 p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Interested in working together?
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-zinc-600 dark:text-zinc-400">
            I&apos;m always open to discussing new projects, challenges, or opportunities.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-primary-700"
            >
              Get in Touch
            </Link>
            <a
              href={site.links.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 transition-all hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-700"
            >
              LinkedIn
              <LuExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
