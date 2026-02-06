import type { Metadata } from "next";

import { Container } from "@/components/site/Container";
import { posts } from "@/data/posts";
import { on } from "@/utils";

export const metadata: Metadata = {
  title: "Blog",
  description: "Short notes on engineering practice, architecture, and leadership.",
};

export default function BlogPage() {
  return (
    <Container className="py-12">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight">Blog</h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-700 dark:text-zinc-200">
          Mock posts for now. No CMS yet.
        </p>
      </header>

      <div className="mt-10 space-y-3">
        {posts.map((p) => (
          <article
            key={p.slug}
            className={on(
              "rounded-xl border border-zinc-200 bg-white p-5",
              "dark:border-zinc-800 dark:bg-zinc-950"
            )}
          >
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">{p.title}</h2>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{p.date}</p>
            <p className="mt-3 text-sm leading-relaxed text-zinc-700 dark:text-zinc-200">{p.excerpt}</p>
          </article>
        ))}
      </div>
    </Container>
  );
}
