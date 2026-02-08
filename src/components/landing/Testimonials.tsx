"use client";

import { LuQuote } from "react-icons/lu";

import { ScrollReveal } from "@/components/ui";
import { testimonials } from "@/data/testimonials";

export function Testimonials() {
  return (
    <section className="snap-section w-full bg-white py-16 dark:bg-zinc-950 lg:py-20">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <ScrollReveal variant="fade-up" duration={600}>
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50">
              What People Say
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
              Feedback from colleagues, managers, and collaborators I&apos;ve worked with.
            </p>
          </div>
        </ScrollReveal>

        {/* Testimonials Grid */}
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <ScrollReveal
              key={testimonial.id}
              variant="scale"
              delay={index * 100}
              duration={500}
            >
              <div className="flex h-full flex-col rounded-xl border border-zinc-100 bg-slate-50/50 p-6 transition-all hover:border-primary-200 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:border-primary-800">
                {/* Quote Icon */}
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                  <LuQuote className="h-5 w-5" />
                </div>

                {/* Quote Text */}
                <blockquote className="flex-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>

                {/* Author Info */}
                <div className="mt-4 border-t border-zinc-100 pt-4 dark:border-zinc-800">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {testimonial.author}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-500">
                    {testimonial.role} at {testimonial.company}
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
