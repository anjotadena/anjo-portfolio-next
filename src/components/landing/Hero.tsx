"use client";

import Image from "next/image";
import Link from "next/link";

import { useCommandPalette } from "@/components/command-palette/useCommandPalette";
import { site } from "@/config/site";

export function Hero() {
  const { openPalette } = useCommandPalette();

  return (
    <section className="min-h-dvh relative w-full overflow-hidden bg-gradient-to-b from-slate-50 via-white to-white dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-950">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-100/20 via-transparent to-transparent dark:from-primary-900/10" />
      
      <div className="container relative mx-auto flex min-h-dvh items-center justify-center px-4">
        <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
          {/* Text Content */}
          <div className="flex-1 text-center lg:text-left">
            <p className="mb-2 text-sm font-medium text-primary-600 dark:text-primary-400">
              Hey, I&apos;m {site.name.split(" ")[0]}
            </p>
            
            <h1 className="text-balance text-3xl font-bold leading-tight tracking-tight text-zinc-900 sm:text-4xl lg:text-5xl dark:text-zinc-50">
              Building Scalable Solutions<br className="hidden sm:block" />
              <span className="text-primary-600 dark:text-primary-400">with Elegant Code.</span>
            </h1>
            
            <p className="mt-3 text-pretty text-lg text-zinc-600 dark:text-zinc-400 sm:mt-4">
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">{site.title}</span> specializing in backend development,
              cloud architecture, and technical leadership.
            </p>

            {/* CTA Buttons */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Link
                href="/projects"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-primary-600/20 transition-all hover:bg-primary-700 hover:shadow-xl hover:shadow-primary-600/30 active:scale-[0.98] dark:shadow-primary-500/10"
              >
                View My Projects
              </Link>
              <button
                type="button"
                onClick={openPalette}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-6 py-3 text-sm font-medium text-zinc-700 transition-all hover:border-zinc-300 hover:bg-zinc-50 active:scale-[0.98] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-700"
              >
                Check My Fit for Your Job
              </button>
            </div>
          </div>

          {/* Profile Image */}
          <div className="relative flex-shrink-0">
            <div className="relative h-56 w-56 overflow-hidden rounded-2xl shadow-2xl shadow-zinc-900/10 sm:h-64 sm:w-64 lg:h-72 lg:w-72 dark:shadow-black/20">
              <Image
                src="/assets/img/anjo_solo.png"
                alt={site.name}
                fill
                priority
                className="object-cover object-top"
                sizes="(max-width: 640px) 224px, (max-width: 1024px) 256px, 288px"
              />
            </div>
            {/* Decorative elements */}
            <div className="absolute -bottom-4 -right-4 -z-10 h-full w-full rounded-2xl bg-primary-100/50 dark:bg-primary-900/20" />
          </div>
        </div>
      </div>
    </section>
  );
}
