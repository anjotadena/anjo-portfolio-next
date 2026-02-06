"use client";

import { LuCloud, LuDatabase, LuLayers, LuUsers } from "react-icons/lu";

import { ScrollReveal } from "@/components/ui";

const expertiseAreas = [
  {
    icon: LuLayers,
    label: "System Architecture",
    description: "Designing scalable, maintainable systems",
  },
  {
    icon: LuUsers,
    label: "Team Leadership",
    description: "Mentoring and growing engineering teams",
  },
  {
    icon: LuCloud,
    label: "Cloud Solutions",
    description: "AWS, Azure, and cloud-native architectures",
  },
  {
    icon: LuDatabase,
    label: "PostgreSQL",
    description: "Database design and optimization",
  },
];

export function About() {
  return (
    <section className="w-full bg-slate-50 py-16 dark:bg-zinc-900 lg:py-20">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <ScrollReveal variant="fade-up" duration={600}>
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50">
              About Me
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
              Passionate about crafting robust and scalable software solutions that drive business success.
            </p>
          </div>
        </ScrollReveal>

        {/* Expertise Grid */}
        <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {expertiseAreas.map((area, index) => (
            <ScrollReveal
              key={area.label}
              variant="scale"
              delay={index * 100}
              duration={500}
            >
              <div className="flex h-full flex-col items-center rounded-xl border border-zinc-100 bg-white p-6 text-center transition-all hover:border-primary-200 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-primary-800">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                  <area.icon className="h-7 w-7" />
                </div>
                <h3 className="mt-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {area.label}
                </h3>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  {area.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Resume Download */}
        <ScrollReveal variant="fade-up" delay={400} duration={500}>
          <div className="mt-10 text-center">
            <a
              href="/anjo_tadena_software_engineer_resume.pdf"
              download
              className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-6 py-2.5 text-sm font-medium text-zinc-700 shadow-sm transition-all hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-primary-700 dark:hover:bg-primary-900/20 dark:hover:text-primary-400"
            >
              Download Resume
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
