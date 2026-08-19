import { FileQuestion } from "lucide-react";
import { Prose } from "@/components/ui/prose";
import { Markdown } from "@/components/markdown/markdown";
import type { CaseStudySection } from "@/types/portfolio";

export interface CaseStudyProps {
  sections: CaseStudySection[];
}

/**
 * Renders every case-study section in order. A section whose `body` is
 * `null` is clearly marked "Not yet documented" rather than being hidden
 * (which would look like missing content) or filled with invented prose.
 */
export function CaseStudy({ sections }: CaseStudyProps) {
  return (
    <div className="flex flex-col gap-10">
      {sections.map((section) => (
        <section key={section.id} aria-labelledby={`case-study-${section.id}`} className="flex flex-col gap-3">
          <h2 id={`case-study-${section.id}`} className="text-xl font-medium text-foreground">
            {section.title}
          </h2>
          {section.body ? (
            <Prose>
              <Markdown content={section.body} />
            </Prose>
          ) : (
            <p className="flex items-center gap-2 rounded-md border border-dashed border-border bg-muted/40 px-4 py-3 text-sm italic text-muted-foreground">
              <FileQuestion className="h-4 w-4 shrink-0" aria-hidden="true" />
              Not yet documented.
            </p>
          )}
        </section>
      ))}
    </div>
  );
}
