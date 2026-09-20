"use client";

import { useEffect, useState } from "react";
import { RefreshCw, WifiOff, X } from "lucide-react";
import { whenIdle } from "@/lib/pwa/activity";
import { APP_VERSION } from "@/lib/version";

const UPDATE_CHECK_INTERVAL_MS = 30 * 60 * 1000;

type Notice = { kind: "updated"; version: string } | { kind: "offline" } | null;

/**
 * Registers the versioned service worker and keeps the app current:
 *  - checks for a new worker every 30 minutes and whenever the tab regains focus;
 *  - a new worker activates immediately (skipWaiting + clients.claim in the worker);
 *  - on `controllerchange` (i.e. an update took control) the page reloads as
 *    soon as the app is idle — never while an answer is streaming — after a
 *    brief notice. The conversation is persisted, so nothing is lost.
 * Also shows a small offline indicator. Registration is skipped in
 * development so caching never interferes with hot reload.
 */
export function ServiceWorkerManager() {
  const [notice, setNotice] = useState<Notice>(null);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;

    let registration: ServiceWorkerRegistration | undefined;
    let reloading = false;
    const hadController = Boolean(navigator.serviceWorker.controller);

    const reloadWhenIdle = async (version: string) => {
      if (reloading) return;
      reloading = true;
      setNotice({ kind: "updated", version });
      await whenIdle();
      // Give the notice a moment to be seen, then load the new version.
      setTimeout(() => window.location.reload(), 1200);
    };

    const onControllerChange = () => {
      // First install (no previous controller) needs no reload; the current
      // page was already served fresh from the network.
      if (!hadController) return;
      void reloadWhenIdle(APP_VERSION);
    };
    const onMessage = (event: MessageEvent) => {
      const data = event.data as { type?: string; version?: string } | undefined;
      if (data?.type === "SW_ACTIVATED" && hadController && data.version) void reloadWhenIdle(data.version.split("+")[0] ?? data.version);
    };
    const checkForUpdate = () => {
      if (document.visibilityState === "visible") void registration?.update().catch(() => undefined);
    };
    const onOffline = () => setNotice({ kind: "offline" });
    const onOnline = () => setNotice((current) => (current?.kind === "offline" ? null : current));

    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);
    navigator.serviceWorker.addEventListener("message", onMessage);
    document.addEventListener("visibilitychange", checkForUpdate);
    window.addEventListener("offline", onOffline);
    window.addEventListener("online", onOnline);
    const timer = setInterval(checkForUpdate, UPDATE_CHECK_INTERVAL_MS);

    navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .then((reg) => {
        registration = reg;
      })
      .catch(() => {
        // A failed registration only means no offline/update support; the app works without it.
      });

    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
      navigator.serviceWorker.removeEventListener("message", onMessage);
      document.removeEventListener("visibilitychange", checkForUpdate);
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("online", onOnline);
      clearInterval(timer);
    };
  }, []);

  if (!notice) return null;

  return (
    <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
      <div className="pointer-events-auto flex items-center gap-3 rounded-full border border-border bg-popover px-4 py-2 text-sm text-popover-foreground shadow-lg">
        {notice.kind === "updated" ? (
          <>
            <RefreshCw className="h-4 w-4 text-primary" aria-hidden="true" />
            <span>
              Updated to v{notice.version} — refreshing
              <span className="sr-only"> when the current answer finishes</span>…
            </span>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Refresh now
            </button>
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <span>You&apos;re offline — answers need a connection.</span>
            <button type="button" onClick={() => setNotice(null)} aria-label="Dismiss" className="rounded-full p-1 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
