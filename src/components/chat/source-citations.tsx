"use client";

import Link from "next/link";
import { ArrowUpRight, BookOpen } from "lucide-react";
import type { ChatSource } from "@/types/chat";
import { Dialog } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/components/ui/utils";

const TYPE_LABELS: Record<string, string> = {
  project: "Project",
  profile: "Profile",
  skills: "Skills",
  experience: "Experience",
  contact: "Contact",
  "ai-engineering": "AI Engineering",
  cloud: "Cloud",
  devops: "DevOps",
  architecture: "Architecture",
  philosophy: "Philosophy",
  certifications: "Certifications",
  education: "Education",
};

export function sourceTypeLabel(type: string): string {
  return TYPE_LABELS[type] ?? type;
}

export interface SourceListProps {
  sources: ChatSource[];
  /** Indices actually cited in the answer; those are emphasised. */
  citedIndices: number[];
  onOpen: (index: number) => void;
  className?: string;
}

/** Compact source cards under an answer. Cited sources are listed first. */
export function SourceList({ sources, citedIndices, onOpen, className }: SourceListProps) {
  if (sources.length === 0) return null;
  const cited = new Set(citedIndices);
  const ordered = [...sources].sort((a, b) => Number(cited.has(b.index)) - Number(cited.has(a.index)) || a.index - b.index);
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
        Sources
      </p>
      <ul className="flex flex-wrap gap-2" aria-label="Sources">
        {ordered.map((source) => (
          <li key={source.index}>
            <button
              type="button"
              onClick={() => onOpen(source.index)}
              className={cn(
                "flex max-w-[16rem] items-center gap-2 rounded-lg border px-2.5 py-1.5 text-left text-xs transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                cited.has(source.index) ? "border-primary/40 bg-card" : "border-border bg-transparent text-muted-foreground",
              )}
            >
              <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-muted font-mono text-[10px] font-semibold">{source.index}</span>
              <span className="min-w-0">
                <span className="block truncate font-medium">{source.title}</span>
                {source.section && <span className="block truncate text-[11px] opacity-80">{source.section}</span>}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export interface SourcePreviewProps {
  source: ChatSource | null;
  onClose: () => void;
}

/** Side panel showing the cited section's excerpt with a link to the full page. */
export function SourcePreview({ source, onClose }: SourcePreviewProps) {
  return (
    <Dialog open={source !== null} onClose={onClose} title={source?.title ?? "Source"} description={source?.section ?? undefined} placement="side">
      {source && (
        <div className="flex flex-col gap-4 px-5 pb-5 pt-2">
          <div className="flex items-center gap-2">
            <Badge variant="accent">{sourceTypeLabel(source.type)}</Badge>
            <span className="font-mono text-[11px] text-muted-foreground">Source [{source.index}]</span>
          </div>
          <blockquote className="rounded-xl border border-border bg-surface p-4 text-sm leading-relaxed text-foreground">“{source.excerpt}”</blockquote>
          {source.href ? (
            <Link
              href={source.href}
              className="inline-flex items-center gap-1.5 self-start rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Open full {sourceTypeLabel(source.type).toLowerCase()} page
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          ) : (
            <p className="text-xs text-muted-foreground">This source has no dedicated page.</p>
          )}
        </div>
      )}
    </Dialog>
  );
}
