import type { Metadata } from "next";
import Link from "next/link";
import { LuArrowLeft, LuBriefcase, LuDownload, LuMapPin } from "react-icons/lu";

import { experiences, totalYearsExperience } from "@/data/experience";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Experience",
  description: `${totalYearsExperience}+ years of professional software engineering experience.`,
};

export default function ExperiencePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-white dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-950">
      <div className="container mx-auto px-4 py-12 lg:py-16">
        {/* Back link */}
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
            Experience
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
            {totalYearsExperience}+ years building production systems, leading engineering teams, 
            and delivering scalable software solutions.
          </p>

          {/* Quick stats */}
          <div className="mt-6 flex flex-wrap gap-4">
            <div className="rounded-lg border border-zinc-200 bg-white px-4 py-2 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {totalYearsExperience}+
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Years Experience</p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-white px-4 py-2 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {experiences.length}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Roles</p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-white px-4 py-2 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">5+</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Engineers Mentored</p>
            </div>
          </div>
        </div>

        {/* Experience Timeline */}
        <div className="relative">
          {/* Vertical line - desktop */}
          <div className="absolute left-8 top-0 hidden h-full w-px bg-zinc-200 lg:block dark:bg-zinc-800" />

          <div className="space-y-8">
            {experiences.map((exp, index) => (
              <div key={exp.id} className="relative flex gap-6 lg:gap-10">
                {/* Timeline dot and connector - desktop */}
                <div className="hidden lg:flex lg:flex-col lg:items-center">
                  <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-xl border-2 border-primary-200 bg-white text-primary-600 dark:border-primary-800 dark:bg-zinc-900 dark:text-primary-400">
                    <LuBriefcase className="h-6 w-6" />
                  </div>
                  {index < experiences.length - 1 && (
                    <div className="h-full w-px bg-zinc-200 dark:bg-zinc-800" />
                  )}
                </div>

                {/* Content card */}
                <div className="flex-1 rounded-xl border border-zinc-200 bg-white p-6 transition-all hover:border-zinc-300 hover:shadow-lg hover:shadow-zinc-900/5 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 dark:hover:shadow-black/10">
                  {/* Header */}
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <span className="inline-block rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
                        {exp.period}
                      </span>
                      <h2 className="mt-3 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                        {exp.role}
                      </h2>
                      <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
                        <span className="flex items-center gap-1.5">
                          <LuBriefcase className="h-4 w-4 text-zinc-400" />
                          {exp.company}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <LuMapPin className="h-4 w-4 text-zinc-400" />
                          {exp.location}
                        </span>
                      </div>
                    </div>

                    {/* Mobile timeline indicator */}
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 text-primary-600 lg:hidden dark:bg-primary-900/30 dark:text-primary-400">
                      <LuBriefcase className="h-5 w-5" />
                    </div>
                  </div>

                  {/* Description */}
                  <p className="mt-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {exp.description}
                  </p>

                  {/* Highlights */}
                  <div className="mt-5">
                    <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Key Achievements
                    </h3>
                    <ul className="space-y-2">
                      {exp.highlights.map((highlight, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-3 text-sm text-zinc-600 dark:text-zinc-400"
                        >
                          <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary-500" />
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Technologies */}
                  {exp.technologies && (
                    <div className="mt-5 border-t border-zinc-100 pt-4 dark:border-zinc-800">
                      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                        Technologies
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {exp.technologies.map((tech) => (
                          <span
                            key={tech}
                            className="rounded-md bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Download Resume CTA */}
        <div className="mt-16 rounded-xl border border-zinc-200 bg-zinc-50 p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Want the full picture?
          </h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Download my complete resume with detailed experience and achievements.
          </p>
          <a
            href={site.links.resumePdf}
            download
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-primary-700 active:scale-[0.98]"
          >
            <LuDownload className="h-4 w-4" />
            Download Resume
          </a>
        </div>
      </div>
    </div>
  );
}
