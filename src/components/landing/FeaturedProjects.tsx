"use client";

import Image from "next/image";
import Link from "next/link";
import { LuArrowRight } from "react-icons/lu";

import { ScrollReveal } from "@/components/ui";
import { featuredProjects } from "@/data/projects";

export function FeaturedProjects() {
  return (
    <section className="w-full bg-white py-16 dark:bg-zinc-950 lg:py-20">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <ScrollReveal variant="fade-up" duration={600}>
          <div className="mb-10">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50">
              Featured Projects
            </h2>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              Real-world impact through innovative solutions.
            </p>
          </div>
        </ScrollReveal>

        {/* Projects Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredProjects.map((project, index) => (
            <ScrollReveal
              key={project.slug}
              variant="fade-up"
              delay={index * 150}
              duration={600}
            >
              <Link
                href={`/projects/${project.slug}`}
                className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-zinc-100 bg-white transition-all hover:border-zinc-200 hover:shadow-lg hover:shadow-zinc-900/5 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 dark:hover:shadow-black/10"
              >
              {/* Project Image */}
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-zinc-800 dark:to-zinc-900">
                {project.image ? (
                  <Image
                    src={project.image}
                    alt={project.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>

              {/* Project Info */}
              <div className="flex flex-1 flex-col p-5">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  {project.name}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {project.impact}
                </p>
                
                {/* Learn More */}
                <div className="mt-4 flex items-center gap-1 text-sm font-medium text-primary-600 transition-colors group-hover:text-primary-700 dark:text-primary-400 dark:group-hover:text-primary-300">
                  Learn More
                  <LuArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>

        {/* View All Link */}
        <ScrollReveal variant="fade" delay={450} duration={500}>
          <div className="mt-10 text-center">
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              View all projects
              <LuArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
