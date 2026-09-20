import type { Metadata } from "next";
import { WifiOff } from "lucide-react";

export const metadata: Metadata = { title: "Offline", robots: { index: false } };

/** Served by the service worker when a navigation fails without a connection. */
export default function OfflinePage() {
  return (
    <div className="flex min-h-0 flex-1 items-center justify-center p-6">
      <div className="max-w-md text-center">
        <WifiOff className="mx-auto h-8 w-8 text-muted-foreground" aria-hidden="true" />
        <h1 className="mt-3 text-xl font-semibold text-foreground">You&apos;re offline</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Anjo AI needs a connection to answer questions. Pages you have already visited may still be available; this page will work again as soon as you are back online.
        </p>
      </div>
    </div>
  );
}
