# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and versions follow
[Semantic Versioning](https://semver.org/). The running app reports its version
at `/api/version` and in the sidebar.

## [Unreleased]

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

[Unreleased]: https://github.com/anjotadena/anjo-portfolio-next/compare/v2.0.0...HEAD
[2.0.0]: https://github.com/anjotadena/anjo-portfolio-next/compare/v1.0.0...v2.0.0
[1.0.0]: https://github.com/anjotadena/anjo-portfolio-next/releases/tag/v1.0.0
