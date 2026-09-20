"use client";

import { vercelEvent } from "@/components/analytics/vercel-analytics";
import type { AnalyticsEvent, AnalyticsProps } from "./events";

/**
 * Fire-and-forget client tracker. Uses `sendBeacon` when available so
 * navigation (e.g. opening a project) is never delayed. Never include
 * message text or anything identifying in `props`.
 */
export function track(event: AnalyticsEvent, props?: AnalyticsProps): void {
  if (typeof window === "undefined") return;
  vercelEvent(event, props);
  const payload = JSON.stringify({ event, props });
  try {
    if (typeof navigator.sendBeacon === "function") {
      navigator.sendBeacon("/api/analytics", new Blob([payload], { type: "application/json" }));
      return;
    }
    void fetch("/api/analytics", { method: "POST", headers: { "Content-Type": "application/json" }, body: payload, keepalive: true });
  } catch {
    // Analytics must never break the UI.
  }
}
