import Link from "next/link";
import { ArrowRight, Download, ExternalLink, Github, Linkedin, Mail, MapPin } from "lucide-react";
import type { ContentDocument, ProfileFacts } from "@/types/content";
import { Avatar } from "@/components/ui/avatar";
import { initialsFor } from "@/lib/utils/initials";

const railLink =
  "flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

/** Right-hand rail on the home page: identity, featured projects, quick links. Server component. */
export function HomeRail({ profile, tagline, projects }: { profile: ProfileFacts; tagline: string | null; projects: ContentDocument[] }) {
  return (
    <aside className="hidden w-80 shrink-0 flex-col gap-4 overflow-y-auto border-l border-border bg-surface p-4 xl:flex" aria-label="Profile and featured projects">
      <section className="rounded-xl border border-border bg-card p-4">
        <Avatar initials={initialsFor(profile.name)} size="xl" />
        <h2 className="mt-3 text-base font-semibold text-foreground">{profile.name}</h2>
        <p className="text-xs text-muted-foreground">{profile.headline}</p>
        <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" aria-hidden="true" /> {profile.location}
        </p>
        {profile.availability && (
          <p className="mt-1 flex items-center gap-1.5 text-xs text-success">
            <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" /> {profile.availability}
          </p>
        )}
      </section>

      {projects.length > 0 && (
        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Featured projects</h2>
            <Link href="/projects" className="text-xs text-primary hover:opacity-80">
              View all →
            </Link>
          </div>
          <ul className="flex flex-col gap-2">
            {projects.map((project) => (
              <li key={project.slug}>
                <Link href={`/projects/${project.slug}`} className="block rounded-xl border border-border bg-card p-3 transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium text-foreground">{project.title}</span>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                  </span>
                  <span className="mt-1 line-clamp-2 block text-xs text-muted-foreground">{project.summary}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="mb-2 text-sm font-semibold text-foreground">Quick links</h2>
        <ul className="flex flex-col gap-1.5">
          {profile.resumeHref && (
            <li>
              <a href={profile.resumeHref} download className={railLink}>
                <span className="inline-flex items-center gap-2">
                  <Download className="h-4 w-4 text-muted-foreground" aria-hidden="true" /> Download résumé
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
              </a>
            </li>
          )}
          <li>
            <a href={`mailto:${profile.email}`} className={railLink}>
              <span className="inline-flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" aria-hidden="true" /> Email
              </span>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
            </a>
          </li>
          <li>
            <a href={profile.linkedInUrl} target="_blank" rel="noopener noreferrer" className={railLink}>
              <span className="inline-flex items-center gap-2">
                <Linkedin className="h-4 w-4 text-muted-foreground" aria-hidden="true" /> LinkedIn
              </span>
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </li>
          <li>
            <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer" className={railLink}>
              <span className="inline-flex items-center gap-2">
                <Github className="h-4 w-4 text-muted-foreground" aria-hidden="true" /> GitHub
              </span>
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </li>
        </ul>
      </section>

      {tagline && (
        <blockquote className="rounded-xl border border-border bg-card p-4 text-xs italic leading-relaxed text-muted-foreground">
          “{tagline}”
          <footer className="mt-1 not-italic">— {profile.name}</footer>
        </blockquote>
      )}
    </aside>
  );
}
