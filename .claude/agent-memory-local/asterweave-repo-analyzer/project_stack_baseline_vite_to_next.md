---
name: project-stack-baseline-vite-to-next
description: Baseline stack facts for the anjo-portfolio-next Vite->Next.js migration as of 2026-08-19 — dual lockfiles, no node_modules installed, Figma Make origin
metadata:
  type: project
---

Repo root `C:\Users\Anjo\Project\anjo-portfolio-next` is a Vite 6 + React 18 + react-router 7 SPA exported from "Figma Make" (`package.json` name `@figma/my-make-file`), being migrated to Next.js App Router. Key baseline facts as of commit `f939771` (2026-08-19):

- **Lockfile ambiguity**: BOTH `package-lock.json` and `pnpm-lock.yaml` are committed and tracked in git, with matching dependency versions. Neither is gitignored. No `.npmrc`. `node_modules/` is absent (never installed in this checkout). `corepack --version` = 0.28.1 available but bare `pnpm` CLI is not on PATH. A prior stack detector guessed "pnpm" — this is unverified; both package managers are equally plausible from evidence alone.
- **No test setup, no CI**: no `.github/`, no CI YAML of any kind, no `*.test.*`/`*.spec.*`/playwright files anywhere, no ESLint/Prettier config files.
- **`dist/` is committed to git** (tracked: `dist/assets/index-*.js`, `dist/assets/index-*.css`, two logo PNGs, `dist/index.html`, `dist/favicon.ico`) — build output living in version control, will need a decision (remove + gitignore, or keep for now) during migration.
- Fonts load via Google Fonts CDN `@import` in `src/styles/fonts.css` (Inter), not self-hosted — no `.woff2`/`.ttf` files anywhere in repo.
- No `import.meta.env`, no `figma:asset` import specifiers, no `.svg` files, no `process.env` usage found anywhere in `src/` — the Figma Make export was already fairly clean of Figma-specific import aliases.
- Two ~2.1MB unoptimized logo PNGs (`src/assets/logo.png`, `src/assets/light_logo.png`, 1536x1024) are duplicated again inside committed `dist/assets/`.

**Why:** These are exactly the ambiguous/risky facts a migration plan would otherwise get wrong by assuming a stack detector's guess.

**How to apply:** When picking a package manager for the Next.js rewrite, don't assume pnpm from lockfile presence alone — ask or pick based on other signals (corepack is available if pnpm is chosen). Before running any typecheck/build, note node_modules must be installed first (never silently `npm install` without user confirmation, per read-only discovery rule). See [[project-portfolio-data-is-placeholder]] for the content-side risk in the same migration.
