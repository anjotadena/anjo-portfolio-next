"use client";

import { site } from "@/config/site";

export function Hero() {
  return (
    <section className="snap-section relative flex min-h-screen w-full flex-col overflow-hidden bg-gradient-to-b from-slate-50 via-white to-white dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-950">
      {/* Decorative gradient blobs */}
      <div className="pointer-events-none absolute left-0 top-0 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-green-200/40 via-yellow-100/30 to-orange-200/40 blur-3xl dark:from-green-900/20 dark:via-yellow-900/10 dark:to-orange-900/20" />
      <div className="pointer-events-none absolute right-0 top-1/3 h-[400px] w-[600px] translate-x-1/4 rounded-full bg-gradient-to-bl from-orange-100/30 via-rose-100/20 to-transparent blur-3xl dark:from-orange-900/10 dark:via-rose-900/10" />

      {/* Main Content Area */}
      <div className="container relative mx-auto flex min-h-0 flex-1 flex-col items-center justify-center px-4 py-8">
        {/* Logo */}
        <div className="mb-6 shrink-0">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 dark:bg-white">
            <span className="text-2xl font-bold text-white dark:text-zinc-900">A</span>
          </div>
        </div>

        {/* Greeting */}
        <p className="mb-2 shrink-0 text-lg text-zinc-700 dark:text-zinc-300">
          Hey, I&apos;m {site.name.split(" ")[0]}
          <span className="ml-1 inline-block origin-[70%_70%] animate-[wave_2s_ease-in-out_infinite]">
            👋
          </span>
        </p>

        {/* Title */}
        <h1 className="mb-8 shrink-0 text-center text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl lg:text-6xl">
          {site.title.split("/")[0].trim()}
        </h1>
      </div>

      {/* Wave animation keyframes */}
      <style jsx>{`
        @keyframes wave {
          0%,
          100% {
            transform: rotate(0deg);
          }
          10% {
            transform: rotate(14deg);
          }
          20% {
            transform: rotate(-8deg);
          }
          30% {
            transform: rotate(14deg);
          }
          40% {
            transform: rotate(-4deg);
          }
          50% {
            transform: rotate(10deg);
          }
          60%,
          100% {
            transform: rotate(0deg);
          }
        }
      `}</style>
    </section>
  );
}
