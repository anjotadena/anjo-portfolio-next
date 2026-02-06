"use client";

import { LuAward, LuBriefcase, LuCloud, LuTerminal } from "react-icons/lu";

import { ScrollReveal } from "@/components/ui";

const highlights = [
  {
    icon: LuBriefcase,
    label: "10+ Years Experience",
    description: "Building production systems",
  },
  {
    icon: LuAward,
    label: "Lead Engineer",
    description: "Technical leadership & mentoring",
  },
  {
    icon: LuCloud,
    label: "AWS & Cloud Expert",
    description: "Scalable architecture design",
  },
  {
    icon: LuTerminal,
    label: "TypeScript Expert",
    description: "Full-stack development",
  },
];

export function Highlights() {
  return (
    <section className="w-full bg-white py-6 dark:bg-zinc-950">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 lg:gap-8">
          {highlights.map((item, index) => (
            <ScrollReveal
              key={item.label}
              variant="fade-up"
              delay={index * 100}
              duration={500}
            >
              <div className="flex items-center gap-3 rounded-xl border border-zinc-100 bg-zinc-50/50 px-4 py-3 transition-all hover:border-zinc-200 hover:bg-white dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:border-zinc-700 dark:hover:bg-zinc-900">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {item.label}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {item.description}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
