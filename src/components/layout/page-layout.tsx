import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/components/ui/utils";

export interface Crumb {
  name: string;
  path: string;
}

export interface PageLayoutProps {
  title: string;
  description?: string;
  eyebrow?: string;
  crumbs?: Crumb[];
  actions?: ReactNode;
  children: ReactNode;
  width?: "narrow" | "wide";
}

/** Scrollable page wrapper for non-chat routes: breadcrumbs, heading, content. */
export function PageLayout({ title, description, eyebrow, crumbs, actions, children, width = "narrow" }: PageLayoutProps) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className={cn("mx-auto w-full px-4 py-8 sm:px-6 sm:py-10", width === "narrow" ? "max-w-3xl" : "max-w-5xl")}>
        {crumbs && crumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
              {crumbs.map((crumb, index) => (
                <li key={crumb.path} className="flex items-center gap-1">
                  {index > 0 && <ChevronRight className="h-3 w-3" aria-hidden="true" />}
                  {index === crumbs.length - 1 ? (
                    <span aria-current="page" className="text-foreground">
                      {crumb.name}
                    </span>
                  ) : (
                    <Link href={crumb.path} className="rounded hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      {crumb.name}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            {eyebrow && <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-primary">{eyebrow}</p>}
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{title}</h1>
            {description && <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">{description}</p>}
          </div>
          {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
        </header>
        {children}
      </div>
    </div>
  );
}
