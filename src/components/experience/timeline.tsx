import { History } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import type { ExperienceEntry } from "@/types/portfolio";

export interface TimelineProps {
  entries: ExperienceEntry[];
}

function BulletGroup({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="flex flex-col gap-1.5">
      <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</h4>
      <ul className="flex flex-col gap-1 text-sm text-foreground">
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

function TagGroup({ title, items, variant }: { title: string; items: string[]; variant: "neutral" | "accent" }) {
  if (items.length === 0) return null;
  return (
    <div className="flex flex-col gap-1.5">
      <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</h4>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <Badge key={item} variant={variant}>
            {item}
          </Badge>
        ))}
      </div>
    </div>
  );
}

/**
 * Vertical timeline of experience entries. Deliberately not a résumé
 * document: period + title lead, then short bulleted groups and chip rows
 * rather than a dense paragraph dump. Given an empty array, renders a
 * designed empty state instead of a blank section — this is the expected
 * initial state before verified history is written up.
 */
export function Timeline({ entries }: TimelineProps) {
  if (entries.length === 0) {
    return (
      <EmptyState
        icon={<History className="h-5 w-5" aria-hidden="true" />}
        title="Experience details coming soon"
        description="Verified role history, responsibilities, and achievements are being written up — check back shortly."
      />
    );
  }

  return (
    <ol className="flex flex-col gap-10 border-l border-border pl-6 sm:pl-8">
      {entries.map((entry) => (
        <li key={entry.id} className="relative flex flex-col gap-4">
          <span
            aria-hidden="true"
            className="absolute -left-[calc(1.5rem+4px)] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-primary bg-background sm:-left-[calc(2rem+4px)]"
          />
          <div>
            <p className="text-sm font-medium text-primary">{entry.period}</p>
            <h3 className="mt-0.5 text-lg font-medium text-foreground">{entry.title}</h3>
            {(entry.company ?? entry.location) && (
              <p className="text-sm text-muted-foreground">
                {[entry.company, entry.location].filter(Boolean).join(" · ")}
              </p>
            )}
            {entry.summary && <p className="mt-2 text-sm text-foreground">{entry.summary}</p>}
          </div>

          <div className="flex flex-col gap-4">
            <BulletGroup title="Responsibilities" items={entry.responsibilities} />
            <BulletGroup title="Achievements" items={entry.achievements} />
            <TagGroup title="Technologies" items={entry.technologies} variant="neutral" />
            <TagGroup title="Leadership" items={entry.leadership} variant="accent" />
          </div>
        </li>
      ))}
    </ol>
  );
}
