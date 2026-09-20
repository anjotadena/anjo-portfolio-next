"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { track } from "@/lib/analytics/track";

declare global {
  interface Window {
    va?: (...args: unknown[]) => void;
    vaq?: unknown[];
  }
}

/** Queue shim: events sent before the script loads are replayed by it. */
function ensureQueue(): void {
  window.va ??= function va(...args: unknown[]) {
    (window.vaq ??= []).push(args);
  };
}

/**
 * Vercel Web Analytics without the SDK: the loader script is served from
 * the site's own origin (`/_vercel/insights/script.js`), so it needs no
 * CSP changes, sets no cookies, and stores no personal data. Auto-tracking
 * is disabled and a page view is sent on every route change instead, which
 * is what the framework package does. Rendered only on Vercel builds.
 */
export function VercelAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    ensureQueue();
    window.va?.("pageview", { route: pathname, path: pathname });
  }, [pathname]);

  return <Script src="/_vercel/insights/script.js" strategy="afterInteractive" data-disable-auto-track="1" data-testid="vercel-analytics" />;
}

/**
 * First-party page views for every deployment (Docker included): one
 * `page_view` event per route change into the structured log stream via
 * `/api/analytics`. Path only — no query strings, no identifiers.
 */
export function PageViewTracker() {
  const pathname = usePathname();
  useEffect(() => {
    track("page_view", { path: pathname });
  }, [pathname]);
  return null;
}

/** Forwards a product event to Vercel Analytics (no-op when the script is absent). */
export function vercelEvent(name: string, data?: Record<string, string | number | boolean>): void {
  if (typeof window === "undefined") return;
  ensureQueue();
  window.va?.("event", { name, data });
}
