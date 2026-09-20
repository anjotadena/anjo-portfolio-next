"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Github } from "lucide-react";
import type { ProjectCardData } from "@/types/chat";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/components/ui/utils";
import { track } from "@/lib/analytics/track";

export function ProjectListCard({ project }: { project: ProjectCardData }) {
  return (
    <article className="flex h-full flex-col rounded-xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-primary/40">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-foreground">
            <Link href={project.href} className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" onClick={() => track("project_opened", { slug: project.slug, from: "list" })}>
              {project.title}
            </Link>
          </h2>
          {project.category && <p className="text-xs text-muted-foreground">{project.category}</p>}
        </div>
        {project.featured && <Badge variant="accent">Featured</Badge>}
      </div>
      <p className="mt-2 flex-1 text-sm text-muted-foreground">{project.summary}</p>
      <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Technologies">
        {project.technologies.map((tech) => (
          <li key={tech}>
            <Badge variant="neutral">{tech}</Badge>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex items-center gap-4 border-t border-border pt-3 text-sm">
        <Link href={project.href} className="inline-flex items-center gap-1 font-medium text-primary hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" onClick={() => track("project_opened", { slug: project.slug, from: "list" })}>
          View project <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
        {project.repoUrl && (
          <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">
            <Github className="h-4 w-4" aria-hidden="true" /> GitHub<span className="sr-only"> (opens in a new tab)</span>
          </a>
        )}
      </div>
    </article>
  );
}

/** Project grid with a category filter (derived from the projects' own frontmatter). */
export function ProjectList({ projects }: { projects: ProjectCardData[] }) {
  const categories = useMemo(() => ["All", ...Array.from(new Set(projects.map((p) => p.category).filter((c): c is string => Boolean(c))))], [projects]);
  const [filter, setFilter] = useState("All");
  const visible = filter === "All" ? projects : projects.filter((p) => p.category === filter);

  return (
    <div className="flex flex-col gap-6">
      {categories.length > 2 && (
        <div role="radiogroup" aria-label="Filter projects by category" className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const selected = category === filter;
            return (
              <button
                key={category}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setFilter(category)}
                className={cn(
                  "min-h-9 rounded-full border px-3.5 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  selected ? "border-primary bg-accent font-medium text-accent-foreground" : "border-border bg-card text-foreground hover:bg-muted",
                )}
              >
                {category}
              </button>
            );
          })}
        </div>
      )}
      <ul className="grid grid-cols-1 gap-4 md:grid-cols-2" aria-live="polite">
        {visible.map((project) => (
          <li key={project.slug}>
            <ProjectListCard project={project} />
          </li>
        ))}
      </ul>
    </div>
  );
}
