"use client";

import Link from "next/link";
import { ArrowRight, Award, Briefcase, Download, ExternalLink, Github, Linkedin, Mail, MapPin } from "lucide-react";
import type { CertificationCardData, ChatCard, ContactCardData, ExperienceCardData, ProjectCardData, SkillCardData } from "@/types/chat";
import { Badge } from "@/components/ui/badge";
import { track } from "@/lib/analytics/track";

const cardClassName = "rounded-xl border border-border bg-card p-4 text-sm text-card-foreground shadow-sm";
const linkClassName =
  "inline-flex items-center gap-1 rounded-md text-sm font-medium text-primary hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function ProjectCard({ card }: { card: ProjectCardData }) {
  return (
    <article className={cardClassName} aria-label={`Project: ${card.title}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-foreground">{card.title}</h3>
          {card.category && <p className="text-xs text-muted-foreground">{card.category}</p>}
        </div>
        {card.featured && <Badge variant="accent">Featured</Badge>}
      </div>
      <p className="mt-2 line-clamp-3 text-muted-foreground">{card.summary}</p>
      {card.technologies.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Technologies">
          {card.technologies.map((tech) => (
            <li key={tech}>
              <Badge variant="neutral">{tech}</Badge>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-4">
        <Link href={card.href} className={linkClassName} onClick={() => track("project_opened", { slug: card.slug, from: "chat-card" })}>
          View project <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
        {card.repoUrl && (
          <a href={card.repoUrl} target="_blank" rel="noopener noreferrer" className={`${linkClassName} text-muted-foreground`}>
            <Github className="h-4 w-4" aria-hidden="true" /> GitHub<span className="sr-only"> (opens in a new tab)</span>
          </a>
        )}
        {card.demoUrl && (
          <a href={card.demoUrl} target="_blank" rel="noopener noreferrer" className={`${linkClassName} text-muted-foreground`}>
            <ExternalLink className="h-4 w-4" aria-hidden="true" /> Website<span className="sr-only"> (opens in a new tab)</span>
          </a>
        )}
      </div>
    </article>
  );
}

export function SkillCard({ card }: { card: SkillCardData }) {
  return (
    <section className={cardClassName} aria-label="Skills">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {card.groups.map((group) => (
          <div key={group.id}>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{group.title}</h3>
            <ul className="mt-1.5 flex flex-wrap gap-1.5">
              {group.skills.map((skill) => (
                <li key={skill}>
                  <Badge variant="neutral">{skill}</Badge>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <Link href={card.href} className={`${linkClassName} mt-3`}>
        All skills <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </section>
  );
}

export function ContactCard({ card }: { card: ContactCardData }) {
  const action = "flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
  return (
    <section className={cardClassName} aria-label="Contact">
      <h3 className="text-base font-semibold text-foreground">{card.name}</h3>
      <p className="text-xs text-muted-foreground">{card.headline}</p>
      <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
        <MapPin className="h-3.5 w-3.5" aria-hidden="true" /> {card.location}
        {card.availability && (
          <>
            <span aria-hidden="true">·</span>
            <span className="text-success">{card.availability}</span>
          </>
        )}
      </p>
      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <a href={`mailto:${card.email}`} className={action} onClick={() => track("contact_clicked", { channel: "email" })}>
          <Mail className="h-4 w-4 text-primary" aria-hidden="true" /> <span className="truncate">{card.email}</span>
        </a>
        <a href={card.linkedInUrl} target="_blank" rel="noopener noreferrer" className={action} onClick={() => track("contact_clicked", { channel: "linkedin" })}>
          <Linkedin className="h-4 w-4 text-primary" aria-hidden="true" /> LinkedIn<span className="sr-only"> (opens in a new tab)</span>
        </a>
        <a href={card.githubUrl} target="_blank" rel="noopener noreferrer" className={action} onClick={() => track("contact_clicked", { channel: "github" })}>
          <Github className="h-4 w-4 text-primary" aria-hidden="true" /> GitHub<span className="sr-only"> (opens in a new tab)</span>
        </a>
        {card.resumeHref && (
          <a href={card.resumeHref} download className={action} onClick={() => track("resume_downloaded")}>
            <Download className="h-4 w-4 text-primary" aria-hidden="true" /> Download résumé
          </a>
        )}
      </div>
    </section>
  );
}

export function ExperienceCard({ card }: { card: ExperienceCardData }) {
  return (
    <section className={cardClassName} aria-label="Experience">
      <ul className="flex flex-col gap-3">
        {card.entries.map((entry) => (
          <li key={entry.id} className="flex gap-3">
            <Briefcase className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            <div className="min-w-0">
              <p className="font-medium text-foreground">{entry.title}</p>
              <p className="text-xs text-muted-foreground">{[entry.company, entry.period].filter(Boolean).join(" · ")}</p>
              {entry.summary && <p className="mt-1 text-muted-foreground">{entry.summary}</p>}
            </div>
          </li>
        ))}
      </ul>
      <Link href={card.href} className={`${linkClassName} mt-3`}>
        Full experience <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </section>
  );
}

export function CertificationCard({ card }: { card: CertificationCardData }) {
  return (
    <section className={cardClassName} aria-label="Certifications">
      <ul className="flex flex-col gap-2">
        {card.entries.map((entry) => (
          <li key={entry.id} className="flex items-start gap-3">
            <Award className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="font-medium text-foreground">{entry.name}</p>
              <p className="text-xs text-muted-foreground">
                {entry.issuer}
                {entry.date ? ` · ${entry.date}` : ""}
              </p>
            </div>
            <Badge variant={entry.status === "earned" ? "accent" : "outline"}>{entry.status === "earned" ? "Earned" : "Pursuing"}</Badge>
          </li>
        ))}
      </ul>
      <Link href={card.href} className={`${linkClassName} mt-3`}>
        All certifications <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </section>
  );
}

/** Renders the typed card payload from the server; the model never produces these. */
export function ChatCards({ cards }: { cards: ChatCard[] }) {
  if (cards.length === 0) return null;
  const projects = cards.filter((card): card is ProjectCardData => card.kind === "project");
  const others = cards.filter((card) => card.kind !== "project");
  return (
    <div className="mt-4 flex flex-col gap-3">
      {projects.length > 0 && (
        <div className={projects.length > 1 ? "grid grid-cols-1 gap-3 md:grid-cols-2" : ""}>
          {projects.map((card) => (
            <ProjectCard key={card.slug} card={card} />
          ))}
        </div>
      )}
      {others.map((card) => {
        switch (card.kind) {
          case "contact":
            return <ContactCard key="contact" card={card} />;
          case "skills":
            return <SkillCard key="skills" card={card} />;
          case "experience":
            return <ExperienceCard key="experience" card={card} />;
          case "certifications":
            return <CertificationCard key="certifications" card={card} />;
          default:
            return null;
        }
      })}
    </div>
  );
}
