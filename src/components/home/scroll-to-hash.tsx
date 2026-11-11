"use client";

import { useEffect } from "react";

/**
 * Homepage anchors (`/#work`, `/#help`, …) followed from another route: the
 * homepage streams in behind the route's loading boundary, so the router's
 * own hash scroll can run before the target section exists. Once the page
 * has mounted, scroll the target into view (instantly; sticky-header offset
 * comes from `scroll-padding-top`).
 */
export function ScrollToHash() {
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id) return;
    const target = document.getElementById(id);
    if (target) requestAnimationFrame(() => target.scrollIntoView({ block: "start" }));
  }, []);
  return null;
}
