import type { Metadata } from "next";

import { Container } from "@/components/site/Container";

export const metadata: Metadata = {
  title: "Leadership",
  description: "Mentorship, code review philosophy, and ownership examples.",
};

export default function LeadershipPage() {
  return (
    <Container className="py-12">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight">Leadership</h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-700 dark:text-zinc-200">
          I lead with clarity and ownership: align on outcomes, reduce ambiguity, and create tight
          feedback loops that keep quality high without slowing delivery.
        </p>
      </header>

      <section className="mt-10 grid gap-4 md:grid-cols-2">
        <Card
          title="Team leadership"
          items={[
            "Align on outcomes and constraints (scope, quality, timelines)",
            "Define ownership boundaries and decision-making paths",
            "Unblock quickly by making trade-offs explicit and documented",
          ]}
        />
        <Card
          title="Mentorship"
          items={[
            "Pair on critical work to build intuition, not just output",
            "Teach systematic debugging and safe incremental changes",
            "Make success repeatable via playbooks and shared primitives",
          ]}
        />
      </section>

      <section className="mt-4 grid gap-4 md:grid-cols-2">
        <Card
          title="Code review philosophy"
          items={[
            "Protect users and production first: correctness, security, performance",
            "Prefer clear contracts, tests at boundaries, and minimal surface area",
            "Use reviews to transfer context and raise the bar, not to gatekeep",
          ]}
        />
        <Card
          title="Ownership examples"
          items={[
            "Driving refactors that simplify hot paths and reduce failure modes",
            "Establishing conventions to prevent classes of bugs",
            "Operational readiness: logs, metrics, alerts, runbooks",
          ]}
        />
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

