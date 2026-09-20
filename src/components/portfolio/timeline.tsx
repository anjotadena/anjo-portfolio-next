import type { ExperienceEntry } from "@/types/content";
import { Badge } from "@/components/ui/badge";

function BulletGroup({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h4>
      <ul className="mt-1.5 flex flex-col gap-1 text-sm text-foreground">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Vertical timeline of experience entries from `experience.md` frontmatter. */
export function Timeline({ entries }: { entries: ExperienceEntry[] }) {
  if (entries.length === 0) return null;
  return (
    <ol className="flex flex-col gap-10 border-l border-border pl-6 sm:pl-8">
      {entries.map((entry) => (
        <li key={entry.id} className="relative flex flex-col gap-4">
          <span aria-hidden="true" className="absolute -left-[calc(1.5rem+5px)] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-primary bg-background sm:-left-[calc(2rem+5px)]" />
          <div>
            <p className="text-sm font-medium text-primary">{entry.period}</p>
            <h3 className="mt-0.5 text-lg font-semibold text-foreground">{entry.title}</h3>
            {(entry.company ?? entry.location) && <p className="text-sm text-muted-foreground">{[entry.company, entry.location].filter(Boolean).join(" · ")}</p>}
            {entry.summary && <p className="mt-2 text-sm text-foreground">{entry.summary}</p>}
          </div>
          <div className="flex flex-col gap-4">
            <BulletGroup title="Responsibilities" items={entry.responsibilities} />
            <BulletGroup title="Achievements" items={entry.achievements} />
            {entry.technologies.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Technologies</h4>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {entry.technologies.map((tech) => (
                    <Badge key={tech} variant="neutral">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
