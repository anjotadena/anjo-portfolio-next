/**
 * Service worker source, served by `src/app/sw.js/route.ts` with the build
 * label substituted for `__VERSION__`. Kept as a string so the worker is
 * generated at build time with no bundler involvement; a unit test
 * syntax-checks it.
 *
 * Strategy (deliberately conservative for an app whose answers must be
 * fresh):
 *   - /api/*                 network only (never cached)
 *   - /_next/static/*        cache first (content-hashed, immutable)
 *   - navigations (HTML)     network first, falling back to cache, then /offline
 *   - icons, fonts, manifest stale-while-revalidate
 * Anything else falls through to the network untouched.
 *
 * Updates: `skipWaiting()` on install + `clients.claim()` on activate make a
 * new worker take control immediately; old versioned caches are deleted;
 * clients are told the new version so the page can refresh when idle.
 */
export const SERVICE_WORKER_SOURCE = String.raw`/* Anjo AI service worker __VERSION__ */
const VERSION = "__VERSION__";
const CACHE = "anjo-ai-" + VERSION;
const OFFLINE_URL = "/offline";
const PRECACHE = [OFFLINE_URL, "/manifest.webmanifest", "/icons/icon-192", "/icons/icon-512"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .catch(() => undefined)
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(names.filter((name) => name.startsWith("anjo-ai-") && name !== CACHE).map((name) => caches.delete(name)));
      await self.clients.claim();
      const clients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const client of clients) client.postMessage({ type: "SW_ACTIVATED", version: VERSION });
    })(),
  );
});

self.addEventListener("message", (event) => {
  const data = event.data || {};
  if (data.type === "SKIP_WAITING") self.skipWaiting();
  if (data.type === "GET_VERSION" && event.source) event.source.postMessage({ type: "SW_VERSION", version: VERSION });
});

async function cacheFirst(request) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(request);
  if (hit) return hit;
  const response = await fetch(request);
  if (response.ok) cache.put(request, response.clone());
  return response;
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(request);
  const refresh = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => undefined);
  return hit || (await refresh) || Response.error();
}

async function networkFirstNavigation(request) {
  const cache = await caches.open(CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    const hit = await cache.match(request);
    if (hit) return hit;
    const offline = await cache.match(OFFLINE_URL);
    return offline || new Response("You are offline.", { status: 503, headers: { "Content-Type": "text/plain" } });
  }
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/_vercel/") || url.pathname === "/sw.js") return;

  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request));
    return;
  }
  if (request.mode === "navigate") {
    event.respondWith(networkFirstNavigation(request));
    return;
  }
  if (
    url.pathname.startsWith("/icons/") ||
    url.pathname === "/manifest.webmanifest" ||
    url.pathname === "/favicon.ico" ||
    request.destination === "font" ||
    request.destination === "image"
  ) {
    event.respondWith(staleWhileRevalidate(request));
  }
});
`;

export function buildServiceWorker(version: string): string {
  // The version is a semver+sha label; strip anything that could break out of the string literal.
  const safe = version.replace(/[^0-9A-Za-z.+-]/g, "");
  return SERVICE_WORKER_SOURCE.split("__VERSION__").join(safe);
}
