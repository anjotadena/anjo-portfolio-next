# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and versions follow
[Semantic Versioning](https://semver.org/). The running app reports its version
at `/api/version` and in the sidebar.

## [Unreleased]

## [2.2.0] - 2026-09-20

### Added
- Case studies: `case-study` content type with structured facts, `/case-studies`
  and `/case-studies/[slug]` pages (facts sidebar, table of contents, related
  project, embedded "Ask AI"), a chat CaseStudyCard, and links from project
  pages. Two case studies written from verifiable sources (this portfolio and
  Asterweave) plus a private template for client work.
- Blog: `post` content type, `/blog` and `/blog/[slug]` pages, RSS feed at
  `/feed.xml`, BlogPosting JSON-LD, chat PostCard, an introductory post, and
  "How I built Asterweave". Two further technical posts ship as private drafts.
- Visitor analytics via Vercel Web Analytics (first-party script, no cookies,
  no dependency) with page views on route change and product events forwarded
  as custom events; first-party `page_view` events in the structured logs.
- Heading anchors in rendered Markdown; `-ed` stemming and domain synonyms in
  lexical retrieval.

### Changed
- `/blog` is a real route again (the old redirect to `/` was removed).

## [2.1.0] - 2026-09-20

### Added
- Start-up splash screen: a terminal-style boot log with real status (knowledge
  base size, retrieval mode, assistant status, build), skippable with any key or
  tap, shown once per session, reduced-motion aware.
- CLI-style thinking indicator while an answer is prepared (spinner, stage,
  elapsed time) and Escape to stop a streaming answer.
- Route-level loading state.

### Fixed
- Top bar safe-area inset in standalone/notched displays; sidebar brand row now
  aligns with the top bar.
- Unknown project/topic slugs return a real 404 instead of a streamed soft 404.

## [2.0.0] - 2026-09-20

Complete rebuild. v1.0.0 was the previous Vite-based static site; v2 replaces it with the AI-native portfolio below.

### Added
- Anjo AI: a RAG-grounded chat assistant over the Markdown knowledge base, with
  streaming answers, citations, source previews, typed portfolio cards, related
  questions, and Ctrl/Cmd+K semantic search.
- Portfolio pages generated from the same Markdown: about, experience, projects,
  project detail, skills, contact, topics; sitemap, robots, JSON-LD.
- Hybrid retrieval (vector + BM25) over a committed JSON index by default, with
  optional PostgreSQL + pgvector and a zero-configuration lexical fallback.
- Progressive web app: installable manifest with generated icons, versioned
  service worker that updates automatically when a new build is deployed
  (waiting for any in-progress answer, preserving the conversation), offline
  page, and build identity at `/api/version`.
- Security controls: validation on every boundary, rate limits, CSP/HSTS,
  sanitized Markdown rendering, private content isolation, secrets scanning in
  CI and a local pre-push hook.
- Tests: Vitest unit/integration/component suites, Playwright E2E on the live
  path via a mock OpenAI server, RAG evaluation suite.
- Docker image, Docker Compose for pgvector, GitHub Actions CI and release
  workflows.

[Unreleased]: https://github.com/anjotadena/anjo-portfolio-next/compare/v2.2.0...HEAD
[2.2.0]: https://github.com/anjotadena/anjo-portfolio-next/compare/v2.1.0...v2.2.0
[2.1.0]: https://github.com/anjotadena/anjo-portfolio-next/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/anjotadena/anjo-portfolio-next/compare/v1.0.0...v2.0.0
[1.0.0]: https://github.com/anjotadena/anjo-portfolio-next/releases/tag/v1.0.0
