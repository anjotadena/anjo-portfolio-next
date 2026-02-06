import type { Metadata } from "next";

import { Container } from "@/components/site/Container";

export const metadata: Metadata = {
  title: "Architecture",
  description: "Design principles, common patterns, and system thinking.",
};

export default function ArchitecturePage() {
  return (
    <Container className="py-12">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight">Architecture</h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-700 dark:text-zinc-200">
          I prefer stable primitives and explicit trade-offs. The goal is scalable systems that are
          easy to operate, easy to change, and hard to misuse.
        </p>
      </header>

      <section className="mt-10 grid gap-4 md:grid-cols-2">
        <Card
          title="Design principles"
          items={[
            "Boundaries first: clear ownership, clear contracts",
            "Observability is a feature, not an afterthought",
            "Prefer boring tech that scales with teams",
            "Optimize for failure modes and recovery paths",
          ]}
        />
        <Card
          title="Common system patterns"
          items={[
            "CQRS-style read models for search-heavy UX",
            "Event-driven workflows for long-running processes",
            "Idempotent handlers and retry-safe operations",
            "Caching with explicit invalidation strategy",
          ]}
        />
      </section>

      <section className="mt-10 grid gap-6">
        <Diagram title="Service boundaries (placeholder)">
          Short explanation of service responsibilities, contracts, and cross-cutting concerns.
        </Diagram>
        <Diagram title="Data flow (placeholder)">
          Short explanation of ingestion, transformation, and query paths.
        </Diagram>
      </section>
    </Container>
  );
}

function Card({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
      <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{title}</h2>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-zinc-700 dark:text-zinc-200">
        {items.map((x) => (
          <li key={x}>{x}</li>
        ))}
      </ul>
    </section>
  );
}

function Diagram({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
      <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{title}</h2>
      <p className="mt-3 text-sm text-zinc-700 dark:text-zinc-200">{children}</p>
      <div className="mt-4 rounded-xl border border-dashed border-zinc-200 bg-zinc-50 p-8 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/30 dark:text-zinc-300">
        Diagram placeholder (TODO)
      </div>
    </section>
  );
}

