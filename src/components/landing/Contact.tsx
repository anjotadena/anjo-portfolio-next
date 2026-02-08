"use client";

import {
  LuCalendar,
  LuExternalLink,
  LuGithub,
  LuLinkedin,
  LuMail,
  LuMapPin,
} from "react-icons/lu";

import { ScrollReveal } from "@/components/ui";
import { site } from "@/config/site";

const contactMethods = [
  {
    id: "email",
    icon: LuMail,
    label: "Email",
    value: site.links.email,
    href: `mailto:${site.links.email}`,
    external: false,
  },
  {
    id: "linkedin",
    icon: LuLinkedin,
    label: "LinkedIn",
    value: "Connect with me",
    href: site.links.linkedin,
    external: true,
  },
  {
    id: "github",
    icon: LuGithub,
    label: "GitHub",
    value: "View my code",
    href: site.links.github,
    external: true,
  },
];

export function Contact() {
  return (
    <section className="snap-section w-full bg-slate-50 py-16 dark:bg-zinc-900 lg:py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl">
          {/* Section Header */}
          <ScrollReveal variant="fade-up" duration={600}>
            <div className="mb-10 text-center">
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50">
                Let&apos;s Connect
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
                Interested in working together? I&apos;m always open to discussing new opportunities,
                interesting projects, or just having a chat about technology.
              </p>
            </div>
          </ScrollReveal>

          {/* Main CTA - Schedule Call */}
          <ScrollReveal variant="scale" delay={100} duration={500}>
            <div className="mb-8 rounded-2xl border border-primary-200 bg-gradient-to-br from-primary-50 to-white p-8 text-center shadow-sm dark:border-primary-800/50 dark:from-primary-950/50 dark:to-zinc-950">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary-100 text-primary-600 dark:bg-primary-900/50 dark:text-primary-400">
                <LuCalendar className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Schedule a Call
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-zinc-600 dark:text-zinc-400">
                Book a 30-minute call to discuss your project, team needs, or technical challenges.
              </p>
              <a
                href={site.links.schedule}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary-600 px-6 py-2.5 text-sm font-medium text-white shadow-md transition-all hover:bg-primary-700 hover:shadow-lg active:scale-[0.98]"
              >
                <LuCalendar className="h-4 w-4" />
                Book a Time
                <LuExternalLink className="h-3.5 w-3.5 opacity-70" />
              </a>
            </div>
          </ScrollReveal>

          {/* Contact Methods Grid */}
          <div className="grid gap-4 sm:grid-cols-3">
            {contactMethods.map((method, index) => (
              <ScrollReveal
                key={method.id}
                variant="fade-up"
                delay={200 + index * 100}
                duration={500}
              >
                <a
                  href={method.href}
                  target={method.external ? "_blank" : undefined}
                  rel={method.external ? "noopener noreferrer" : undefined}
                  className="flex flex-col items-center rounded-xl border border-zinc-100 bg-white p-5 text-center transition-all hover:border-primary-200 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-primary-800"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 transition-colors group-hover:bg-primary-100 group-hover:text-primary-600 dark:bg-zinc-800 dark:text-zinc-400">
                    <method.icon className="h-5 w-5" />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {method.label}
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-500">
                    {method.value}
                    {method.external && <LuExternalLink className="h-3 w-3 opacity-50" />}
                  </p>
                </a>
              </ScrollReveal>
            ))}
          </div>

          {/* Location */}
          <ScrollReveal variant="fade-up" delay={500} duration={500}>
            <div className="mt-8 flex items-center justify-center gap-2 text-sm text-zinc-500 dark:text-zinc-500">
              <LuMapPin className="h-4 w-4" />
              <span>{site.location}</span>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
