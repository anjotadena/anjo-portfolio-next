import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Container } from "@/components/site/Container";
import { getProjectBySlug, projects } from "@/data/projects";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return { title: "Project" };
  return {
    title: project.name,
    description: project.impact,
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  return (
    <Container className="py-12">
      <header className="max-w-2xl">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Project</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">{project.name}</h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-700 dark:text-zinc-200">
          <span className="font-medium text-zinc-900 dark:text-zinc-50">Role:</span> {project.role}
        </p>
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">{project.stack.join(" • ")}</p>
      </header>

      <div className="mt-10 grid gap-6">
        <Section title="Problem">{project.problem}</Section>
        <Section title="Architecture overview">
          <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-200">
            {project.architectureOverview}
          </p>
          <div className="mt-4 rounded-xl border border-dashed border-zinc-200 bg-zinc-50 p-6 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/30 dark:text-zinc-300">
            Diagram placeholder (TODO)
          </div>
        </Section>
        <Section title="Key decisions & trade-offs">
          <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-zinc-700 dark:text-zinc-200">
            {project.keyDecisions.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </Section>
        <Section title="Impact / metrics">
          <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-zinc-700 dark:text-zinc-200">
            {project.impactMetrics.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </Section>
      </div>
    </Container>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
      <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{title}</h2>
      <div className="mt-3 text-sm leading-relaxed text-zinc-700 dark:text-zinc-200">{children}</div>
    </section>
  );
}

