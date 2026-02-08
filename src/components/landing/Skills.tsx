"use client";

import Image from "next/image";

import { ScrollReveal } from "@/components/ui";

const skillIcons = [
  { name: "TypeScript", src: "/assets/tools/typescript.png" },
  { name: "Node.js", src: "/assets/tools/nodejs.png" },
  { name: "React", src: "/assets/tools/reactjs.png" },
  { name: "AWS", src: "/assets/tools/aws.png" },
  { name: "Python", src: "/assets/tools/python.png" },
  { name: "PostgreSQL", src: "/assets/tools/postgres.png" },
  { name: "Next.js", src: "/assets/tools/nextjs.svg" },
  { name: "Azure", src: "/assets/tools/azure.png" },
];

export function Skills() {
  return (
    <section className="snap-section w-full border-t border-zinc-100 bg-white py-12 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
          {/* Skills */}
          <ScrollReveal variant="fade-right" duration={600}>
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                Skills & Tools
              </h2>
              <div className="mt-4 flex flex-wrap items-center gap-4">
                {skillIcons.map((skill, index) => (
                  <div
                    key={skill.name}
                    className="group relative flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-50 p-2 transition-all hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700"
                    title={skill.name}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <Image
                      src={skill.src}
                      alt={skill.name}
                      width={24}
                      height={24}
                      className="object-contain grayscale transition-all group-hover:grayscale-0"
                    />
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* Contact CTA */}
          <ScrollReveal variant="fade-left" duration={600} delay={200}>
            <div className="w-full rounded-xl bg-slate-50 p-6 lg:w-auto dark:bg-zinc-900">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Let&apos;s Connect
              </h3>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                I&apos;m open to new opportunities and collaborations.
              </p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <a
                  href="mailto:tadena.anjo@gmail.com"
                  className="flex items-center gap-2 text-sm text-zinc-600 transition-colors hover:text-primary-600 dark:text-zinc-400 dark:hover:text-primary-400"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  tadena.anjo@gmail.com
                </a>
              </div>
              <a
                href="/contact"
                className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-primary-700 active:scale-[0.98]"
              >
                Contact Me
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
