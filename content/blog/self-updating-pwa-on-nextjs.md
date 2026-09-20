---
title: "A self-updating PWA on Next.js 16 without a service-worker library"
slug: self-updating-pwa-on-nextjs
type: post
summary: "How this site became an installable app that picks up every deploy automatically: a versioned service worker served from a route, conservative caching, and an update flow that never interrupts a streaming answer."
tags: ["pwa", "service-worker", "next.js", "vercel", "frontend"]
technologies: ["Next.js", "TypeScript"]
date: 2026-09-21
updated: 2026-09-21
featured: false
visibility: private
related: ["building-anjo-ai", "anjo-ai-portfolio"]
post:
  series: "Building Anjo AI"
---

> Draft — review before publishing (set `visibility: public`).

## The problem with a static `sw.js`

Browsers only install a new service worker when its bytes change. A hand-written `public/sw.js` never changes between deploys, so caches go stale and "auto-update" never happens. Libraries solve this by injecting a manifest at build time; I wanted the same effect with no build plugin and nothing that fights Turbopack.

## Serve the worker from a route

The worker source is a string template. A route handler at `/sw.js` (a directory literally named `sw.js`) is prerendered at build time with the build label — `package.json` version plus git SHA — substituted in. Every deploy therefore produces a byte-different worker. Headers set `Cache-Control: no-cache` and `Service-Worker-Allowed: /`. The same label names the cache, is exposed at `/api/version`, and is shown in the sidebar.

## Cache what is safe, nothing else

- `/api/*`: never cached. Answers must be fresh.
- `/_next/static/*`: cache-first. Content-hashed and immutable.
- Navigations: network-first, falling back to cache, then an `/offline` page precached at install.
- Icons, fonts, manifest: stale-while-revalidate.

Everything else passes through untouched.

## Update without interrupting anyone

The worker calls `skipWaiting()` on install and `clients.claim()` on activate, then deletes old caches and posts its version to open clients. In the page, a small manager registers the worker, checks for updates every thirty minutes and whenever the tab regains focus, and on `controllerchange` shows "Updated to v2.1.0 — refreshing…" and reloads — but only once the app is idle. The chat marks itself busy while an answer streams, so an update can never cut a reply in half. The conversation lives in `sessionStorage`, so the reload loses nothing. Registration is skipped in development to keep hot reload honest.

## Icons without image files

The manifest points at `/icons/icon-192`, `/icons/icon-512`, a maskable variant, and an Apple touch icon, all rendered at build time from the profile's monogram with `ImageResponse`. No binary assets in the repository, and the mark stays consistent with the rest of the UI.

## Testing it

Playwright drives the production build: it checks the manifest and icons, waits for `navigator.serviceWorker.ready`, confirms the page is controlled and a versioned cache exists, then simulates a new worker taking control and asserts the notice appears, the page reloads, and the conversation is still there. The mock OpenAI server used by the rest of the suite means all of this runs with no keys and no network.

## Two gotchas

Next.js 16 refuses `next start` with `output: "standalone"`, so standalone output is enabled only for the Docker build. And Playwright starts `webServer` *before* `globalSetup`, which matters when the server needs an artifact the setup was going to create — the fix was a launcher script that prepares everything, then starts the server.
