import type { Metadata } from "next";

import { Container } from "@/components/site/Container";

export const metadata: Metadata = {
  title: "About",
  description: "Professional summary, experience snapshot, and engineering values.",
};

export default function AboutPage() {
  return (
    <Container className="py-12">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight">About</h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-700 dark:text-zinc-200">
          I&apos;m a senior engineer and lead developer focused on building scalable systems and
          healthy teams. I optimize for clarity, strong fundamentals, and predictable delivery.
        </p>
      </header>

      <section className="mt-10 grid gap-6 md:grid-cols-3">
        <Card title="Professional summary">
          Product-minded engineer with end-to-end ownership: discovery → architecture → delivery → operations.
        </Card>
        <Card title="Experience snapshot">
          Frontend systems, platform/tooling, and search/data-heavy UIs. Comfortable leading cross-functional execution.
        </Card>
        <Card title="How I work">
          Small feedback loops, explicit trade-offs, and stable primitives. I prefer boring tech that scales.
        </Card>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold tracking-tight">Engineering values</h2>
        <ul className="mt-4 grid gap-3 md:grid-cols-2">
          <Value
            title="Security-first"
            body="Validate inputs at boundaries, default to least privilege, and avoid fragile implicit behavior."
          />
          <Value
            title="Clarity over cleverness"
            body="Readable code, explicit contracts, and strong naming. Optimize for the next engineer."
          />
          <Value
            title="Operational ownership"
            body="Metrics, tracing, and failure modes are part of the feature. Build for on-call reality."
          />
          <Value
            title="Performance as a feature"
            body="Measure, budget, and ship improvements that users actually feel."
          />
        </ul>
      </section>
    </Container>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{title}</p>
      <p className="mt-2 text-sm leading-relaxed text-zinc-700 dark:text-zinc-200">{children}</p>
    </div>
  );
}

function Value({ title, body }: { title: string; body: string }) {
  return (
    <li className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{title}</p>
      <p className="mt-2 text-sm leading-relaxed text-zinc-700 dark:text-zinc-200">{body}</p>
    </li>
  );
}
