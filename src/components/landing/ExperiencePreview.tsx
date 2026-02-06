"use client";

import Link from "next/link";
import { LuArrowRight, LuBriefcase, LuMapPin } from "react-icons/lu";

import { ScrollReveal } from "@/components/ui";
import { experiences, totalYearsExperience } from "@/data/experience";

export function ExperiencePreview() {
  // Show only the first 2 experiences as preview
  const previewExperiences = experiences.slice(0, 2);

  return (
    <section className="w-full bg-slate-50 py-16 dark:bg-zinc-900 lg:py-20">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <ScrollReveal variant="fade-up" duration={600}>
          <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50">
                Experience
              </h2>
              <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                {totalYearsExperience}+ years building production systems and leading teams.
              </p>
            </div>
            <Link
              href="/experience"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 transition-colors hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
            >
              View all experience
              <LuArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </ScrollReveal>

        {/* Experience Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {previewExperiences.map((exp, index) => (
            <ScrollReveal
              key={exp.id}
              variant="fade-up"
              delay={index * 150}
              duration={600}
            >
              <div className="group h-full rounded-xl border border-zinc-200 bg-white p-6 transition-all hover:border-zinc-300 hover:shadow-lg hover:shadow-zinc-900/5 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700 dark:hover:shadow-black/10">
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <span className="inline-block rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
                    {exp.period}
                  </span>
                  <h3 className="mt-3 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                    {exp.role}
                  </h3>
                  <div className="mt-1.5 flex flex-wrap items-center gap-3 text-sm text-zinc-500 dark:text-zinc-400">
                    <span className="flex items-center gap-1">
                      <LuBriefcase className="h-3.5 w-3.5" />
                      {exp.company}
                    </span>
                    <span className="flex items-center gap-1">
                      <LuMapPin className="h-3.5 w-3.5" />
                      {exp.location}
                    </span>
                  </div>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                  <LuBriefcase className="h-5 w-5" />
                </div>
              </div>

              {/* Description */}
              <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                {exp.description}
              </p>

              {/* Key highlight */}
              <div className="mt-4 flex items-start gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary-500" />
                {exp.highlights[0]}
              </div>

              {/* Technologies */}
              {exp.technologies && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {exp.technologies.slice(0, 4).map((tech) => (
                    <span
                      key={tech}
                      className="rounded bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* View All CTA - Mobile */}
        <ScrollReveal variant="fade" delay={300} duration={500}>
          <div className="mt-8 text-center sm:hidden">
            <Link
              href="/experience"
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 transition-all hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-700"
            >
              View Full Experience
              <LuArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
