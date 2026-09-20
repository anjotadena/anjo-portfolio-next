"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, Search, Sparkles } from "lucide-react";
import type { SearchResponseBody } from "@/types/search";
import { Dialog } from "@/components/ui/dialog";
import { Kbd } from "@/components/ui/kbd";
import { cn } from "@/components/ui/utils";
import { track } from "@/lib/analytics/track";

interface Row {
  id: string;
  kind: "ask" | "hit";
  label: string;
  sublabel?: string;
  href: string;
  group?: string;
}

const DEBOUNCE_MS = 180;

/**
 * Ctrl/Cmd+K semantic search. Results come from `/api/search` (the same
 * retriever the chat uses) grouped by projects / skills / experience /
 * knowledge, plus an "Ask Anjo AI" row that hands the query to the chat.
 */
export function SearchPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const inputId = useId();
  const listId = useId();
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<SearchResponseBody["groups"]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  const close = useCallback(() => {
    setQuery("");
    setHits([]);
    setError(null);
    setActive(0);
    onClose();
  }, [onClose]);

  useEffect(() => {
    const trimmed = query.trim();
    const timer = setTimeout(async () => {
      if (trimmed.length < 2) {
        setHits([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}&limit=10`, { signal: controller.signal });
        if (response.status === 429) throw new Error("Too many searches — please wait a moment.");
        if (!response.ok) throw new Error("Search is unavailable right now.");
        const body = (await response.json()) as SearchResponseBody;
        setHits(body.groups);
        setError(null);
        setActive(0);
        track("search_used", { results: body.total });
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Search failed.");
      } finally {
        if (abortRef.current === controller) setLoading(false);
      }
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  const rows = useMemo<Row[]>(() => {
    const trimmed = query.trim();
    const list: Row[] = [];
    if (trimmed.length > 0) {
      list.push({ id: "ask", kind: "ask", label: `Ask Anjo AI: "${trimmed}"`, href: `/?ask=${encodeURIComponent(trimmed)}` });
    }
    for (const group of hits) {
      for (const hit of group.hits) {
        list.push({
          id: `${group.group}:${hit.documentSlug}:${hit.section ?? ""}`,
          kind: "hit",
          label: hit.section ? `${hit.title} — ${hit.section}` : hit.title,
          sublabel: hit.excerpt,
          href: hit.href ?? `/?ask=${encodeURIComponent(`Tell me about ${hit.title}`)}`,
          group: group.label,
        });
      }
    }
    return list;
  }, [hits, query]);

  const navigate = useCallback(
    (row: Row) => {
      close();
      router.push(row.href);
    },
    [close, router],
  );

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((i) => Math.min(i + 1, rows.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (event.key === "Enter") {
      const row = rows[active];
      if (row) {
        event.preventDefault();
        navigate(row);
      }
    }
  }

  let lastGroup: string | undefined;

  return (
    <Dialog open={open} onClose={close} title="Search the portfolio" hideTitle placement="top" hideCloseButton>
      <div className="flex items-center gap-3 border-b border-border px-4">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <label htmlFor={inputId} className="sr-only">
          Search projects, skills, and knowledge
        </label>
        <input
          id={inputId}
          role="combobox"
          aria-expanded={rows.length > 0}
          aria-controls={listId}
          aria-activedescendant={rows[active] ? `${listId}-${active}` : undefined}
          aria-autocomplete="list"
          autoFocus
          autoComplete="off"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Search Asterweave, Angular, AWS, .NET, architecture…"
          className="h-14 w-full bg-transparent text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
        {loading ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" aria-hidden="true" /> : <Kbd>Esc</Kbd>}
      </div>

      <div className="max-h-[60vh] overflow-y-auto p-2" role="presentation">
        {error && (
          <p role="alert" className="px-3 py-6 text-center text-sm text-destructive">
            {error}
          </p>
        )}
        {!error && rows.length === 0 && (
          <p className="px-3 py-8 text-center text-sm text-muted-foreground">
            {query.trim().length < 2 ? "Type to search projects, skills, experience, and knowledge." : loading ? "Searching…" : "No results. Try asking the assistant instead."}
          </p>
        )}
        <ul id={listId} role="listbox" aria-label="Search results" className="flex flex-col">
          {rows.map((row, index) => {
            const showHeader = row.kind === "hit" && row.group !== lastGroup;
            if (row.kind === "hit") lastGroup = row.group;
            return (
              <li key={row.id} role="presentation">
                {showHeader && (
                  <p className="px-3 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{row.group}</p>
                )}
                <button
                  type="button"
                  id={`${listId}-${index}`}
                  role="option"
                  aria-selected={index === active}
                  onMouseEnter={() => setActive(index)}
                  onClick={() => navigate(row)}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors focus-visible:outline-none",
                    index === active ? "bg-accent text-accent-foreground" : "text-foreground hover:bg-muted",
                  )}
                >
                  {row.kind === "ask" ? (
                    <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  ) : (
                    <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{row.label}</span>
                    {row.sublabel && <span className="block truncate text-xs text-muted-foreground">{row.sublabel}</span>}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="flex items-center gap-3 border-t border-border px-4 py-2 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Kbd>↑</Kbd>
          <Kbd>↓</Kbd> navigate
        </span>
        <span className="inline-flex items-center gap-1">
          <Kbd>↵</Kbd> open
        </span>
      </div>
    </Dialog>
  );
}

/** Global Ctrl/Cmd+K listener + trigger button state. */
export function useSearchPalette() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
  return { open, setOpen };
}
