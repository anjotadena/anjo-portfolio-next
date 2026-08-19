import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ProjectSummary } from "@/types/portfolio";

export interface ProjectCardProps {
  project: ProjectSummary;
}

function FieldRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className={value ? "text-sm text-foreground" : "text-sm italic text-muted-foreground"}>
        {value ?? "Details coming soon"}
      </dd>
    </div>
  );
}

/**
 * A single project summary card. `problem`, `role`, and `impact` are
 * nullable — when a value hasn't been verified yet, this renders an honest
 * "Details coming soon" affordance rather than an empty gap or invented copy.
 */
export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <CardTitle>{project.name}</CardTitle>
          {project.status === "draft" && <Badge variant="outline">Draft</Badge>}
        </div>
        <p className={project.problem ? "text-sm text-muted-foreground" : "text-sm italic text-muted-foreground"}>
          {project.problem ?? "Problem statement coming soon."}
        </p>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4">
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <FieldRow label="Role" value={project.role} />
          <FieldRow label="Impact" value={project.impact} />
        </dl>

        {project.technologies.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Technology
            </span>
            <div className="flex flex-wrap gap-1.5">
              {project.technologies.map((technology) => (
                <Badge key={technology} variant="neutral">
                  {technology}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Link
          href={`/projects/${project.slug}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          View case study
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </CardFooter>
    </Card>
  );
}
