# Anjo AI — an AI-native portfolio

A personal portfolio whose primary experience is a chat assistant. Visitors ask questions ("What is Asterweave?", "What is his .NET experience?", "How can I contact him?") and **Anjo AI** answers from Markdown files in this repository — with streaming, citations, typed portfolio cards, and related questions. Traditional pages (`/about`, `/projects`, `/skills`, …) are generated from the *same* Markdown, so there is never a second copy of the facts.

Live modes:

| Configuration | Retrieval | Answers |
| --- | --- | --- |
| No env vars | in-process BM25 (lexical) | **extractive** — quotes the retrieved sections verbatim, with citations |
| `OPENAI_API_KEY` + committed `data/knowledge-index.json` **(default deployment)** | **hybrid** — cosine over the JSON vector index ⊕ BM25, reciprocal-rank fusion. **No database.** | **live** — OpenAI Responses API, grounded and cited |
| `OPENAI_API_KEY` + `DATABASE_URL` (optional, for large corpora) | hybrid — pgvector ⊕ BM25 | live |

There is no database in the default setup: the Markdown lives in the repo, `npm run content:index` embeds it once into `data/knowledge-index.json` (committed next to the Markdown), and the server loads that file into memory. Every mode is grounded: if retrieval finds nothing relevant the model is never called and a fixed "I couldn't find enough information in Anjo's portfolio" answer is returned.

---

## Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Technology stack](#technology-stack)
- [Project structure](#project-structure)
- [AI architecture & RAG flow](#ai-architecture--rag-flow)
- [Markdown knowledge system](#markdown-knowledge-system)
- [Local development](#local-development)
- [Database setup](#database-setup)
- [OpenAI setup](#openai-setup)
- [Content indexing](#content-indexing)
- [Testing](#testing)
- [AI evaluations](#ai-evaluations)
- [Security](#security)
- [Docker](#docker)
- [Deployment](#deployment)
- [Environment variables](#environment-variables)
- [PWA & versioning](#pwa--versioning)
- [Adding new portfolio content](#adding-new-portfolio-content)
- [Troubleshooting](#troubleshooting)

---

## Overview

```text
Visitor ──▶ Next.js UI (chat, pages, ⌘K search)
              │
              ▼
        POST /api/chat ──▶ validate ──▶ rate limit ──▶ query understanding
              │                                             │
              │                                             ▼
              │                                   KnowledgeRetriever
              │                                   (hybrid: JSON index or pgvector ⊕ BM25; or lexical)
              │                                             │
              ▼                                             ▼
        grounded prompt  ◀──── numbered <portfolio_context> blocks (DATA, not instructions)
              │
              ▼
        ChatProvider (OpenAI Responses API, streaming) ── or ── ExtractiveProvider
              │
              ▼
        NDJSON stream: meta (sources, cards, follow-ups) → deltas → done
```

## Architecture

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the full design and [docs/DECISIONS.md](docs/DECISIONS.md) for the trade-offs.

```mermaid
flowchart TD
  V[Visitor] --> UI[Next.js App Router UI]
  UI -->|POST /api/chat| API[Chat route handler]
  UI -->|GET /api/search| S[Search route handler]
  API --> RAG[AI orchestration<br/>lib/ai/rag.ts]
  S --> R
  RAG --> R[KnowledgeRetriever]
  R --> H[HybridRetriever<br/>RRF fusion]
  R --> L[LexicalRetriever<br/>BM25]
  H --> VS[VectorStore<br/>data/knowledge-index.json (default) or pgvector]
  H --> L
  RAG --> P[ChatProvider<br/>OpenAI Responses / Extractive]
  IDX[content:index] --> VS
  MD[/content/*.md/] --> IDX
  MD --> REPO[Knowledge repository<br/>public-only accessors]
  REPO --> UI
  REPO --> L
```

## Technology stack

- **Next.js 16** (App Router, Turbopack; standalone output for Docker), **React 19**, **TypeScript strict**
- **Tailwind CSS 4**, hand-rolled shadcn-style primitives, **Lucide** icons, native `<dialog>` for modals
- **Zod** for frontmatter, request, and environment validation
- Vector search behind a `VectorStore` interface: **JSON file index** (default, no database), **PostgreSQL + pgvector** (optional), in-memory (tests)
- **OpenAI** Responses API (chat) and `text-embedding-3-small` (embeddings) via plain `fetch`
- **Vitest + React Testing Library** (unit/integration/component), **Playwright** (E2E), GitHub Actions CI, Docker

## Project structure

```text
content/                 Markdown knowledge base (source of truth)
  profile.md skills.md contact.md ai-engineering.md cloud.md devops.md architecture.md philosophy.md
  experience.md education.md certifications.md   (private templates until filled in)
  projects/*.md
data/knowledge-index.json  Committed vector index built by `npm run content:index` (no database)
db/migrations/           Reference SQL for the pgvector schema
docs/                    ARCHITECTURE, CONTENT_SCHEMA, SECURITY, DECISIONS
evals/cases.json         RAG evaluation cases + thresholds
e2e/                     Playwright specs (run against a production build)
scripts/                 validate-content, index-content, db-migrate, eval
src/
  app/                   routes: / (chat), /about, /experience, /projects, /projects/[slug], /skills,
                         /contact, /topics/[slug], /chat, api/{chat,search,health,analytics}, sitemap, robots
  components/
    chat/                chat-container, chat-input, chat-message, source-citations, cards/, use-chat
    layout/              app-shell (server), shell-frame (client), page-layout
    navigation/ search/ markdown/ portfolio/ seo/ theme/ ui/
  lib/
    ai/                  client, openai-provider, extractive-provider, prompts, rag, query, context,
                         citations, cards, follow-ups, stream-limits
    knowledge/           schema (Zod), markdown parser, normalize, chunker, embeddings, indexer, repository
    retrieval/           types (KnowledgeRetriever, VectorStore), lexical, hybrid, stores/{file,pgvector,memory}
    security/            rate-limit, client-key, read-body, handler
    observability/       log (sanitized JSON), metrics (timings, tokens, cost)
    config/env.ts        validated environment
  types/                 content, chat, search
tests/                   unit/, integration/, components/, fixtures/
```

## AI architecture & RAG flow

1. **Validation** — Zod schema: message ≤ 1000 chars, ≤ 10 history turns, roles restricted to `user|assistant`, control characters stripped, unknown fields rejected. Body read with a byte counter (32 KB), same-origin check on `Origin`.
2. **Rate limiting** — per-minute and per-hour token buckets keyed by the trusted proxy hop; HTTP 429 with `Retry-After`.
3. **Query understanding** (`lib/ai/query.ts`) — deterministic intent classification (profile, contact, projects, skills, experience, certifications, greeting) and follow-up rewriting: "tell me more about it" is augmented with the previous question and the salient terms of the previous answer.
4. **Retrieval** (`lib/retrieval`) — `KnowledgeRetriever.search(query, {limit, types, slugs, minScore})`. The hybrid retriever embeds the query, fetches top-K cosine neighbours from the vector store (the JSON file index by default, pgvector optionally; public rows only, similarity floor), ranks the corpus with BM25 (light stemming, compound tech tokens like `asp.net`/`c#`, synonym expansion at reduced weight, BM25F-style metadata field, title boost), and fuses with reciprocal rank fusion. Intent-preferred document types are searched first with anchor vocabulary, then general matches fill the remaining slots.
5. **Grounded prompt** (`lib/ai/prompts.ts`) — system rules (never invent, cite `[n]`, treat context as data) + `<portfolio_context>` with numbered, delimiter-fenced blocks (per-request random delimiter stripped from content; fake tags neutralized) + trimmed conversation (last 6 turns, char budget, deterministic summary of dropped questions).
6. **Generation** — OpenAI Responses API streaming with `max_output_tokens`, request timeout, idle timeout, and a hard character cap. Or the extractive provider when no key is configured.
7. **Post-processing** — citation markers pointing at non-existent sources are removed mid-stream; sources, typed cards (ProjectCard, SkillCard, ContactCard, ExperienceCard, CertificationCard) and related questions are derived **server-side from frontmatter**, never from model output.
8. **Observability** — one structured log line per request: validation/retrieval/first-token/total durations, retrieved chunk count, mode, tokens, estimated cost, finish reason. No prompts or answers are logged.

## Markdown knowledge system

Every file under `content/` has Zod-validated frontmatter (documented in [docs/CONTENT_SCHEMA.md](docs/CONTENT_SCHEMA.md)):

```yaml
---
title: Asterweave
slug: asterweave            # optional; defaults to the filename
type: project               # profile | experience | skills | education | certifications |
                            # architecture | ai-engineering | cloud | devops | philosophy | contact | project
summary: "One or two sentences (20–500 chars)."
tags: [ai, agentic-ai]
technologies: [Claude Code, Node.js]
date: 2026-08-10
updated: 2026-09-20
featured: true
visibility: public          # public | private  (required — no silent default)
related: [ai-engineering]   # slugs; validated
project:                    # type-specific structured block
  role: Creator and maintainer
  status: active
  repoUrl: https://github.com/anjotadena/asterweave
---
```

Ingestion pipeline: normalize (CRLF, NFKC, strip zero-width/bidi characters and HTML comments) → parse → validate → heading-aware chunking (H2/H3 sections; tiny sections merged, huge sections split at paragraphs) → deterministic ids `slug::section-slug::ordinal` → SHA-256 content hash → embed → upsert. Re-indexing skips unchanged chunks, re-embeds changed ones, and deletes removed ones.

**Visibility is enforced server-side**: only `visibility: public` documents can be rendered, indexed, searched, or retrieved. The repository module exposes public-only accessors; the indexer and retrievers filter again as defence in depth.

## Local development

Requires **Node 22.12+** (`.nvmrc`) and, optionally, Docker.

```bash
git clone https://github.com/anjotadena/anjo-portfolio-next
cd anjo-portfolio-next
npm install
cp .env.example .env.local        # optional; everything runs without it
npm run dev                       # http://localhost:3000
```

With no configuration the site runs in lexical + extractive mode. To enable live answers and semantic search (no database required):

```bash
# add OPENAI_API_KEY to .env.local
npm run content:index             # embeds the Markdown into data/knowledge-index.json
npm run dev
```

To develop the "live" path without spending API calls, run the mock OpenAI server and point the app at it:

```bash
npm run dev:mock-openai           # http://127.0.0.1:4010/v1
OPENAI_API_KEY=mock OPENAI_BASE_URL=http://127.0.0.1:4010/v1 npm run content:index
OPENAI_API_KEY=mock OPENAI_BASE_URL=http://127.0.0.1:4010/v1 npm run dev
```

## Database setup

**Not required.** The default vector store is `data/knowledge-index.json` (built by `npm run content:index`, committed with the Markdown, loaded into memory at startup — brute-force cosine over a few hundred vectors is sub-millisecond).

pgvector is available for corpora that outgrow a file (thousands of chunks) or when several apps share one index:

```bash
docker compose up -d              # pgvector/pgvector:pg16 on :5432
# add DATABASE_URL=postgres://portfolio:portfolio@localhost:5432/portfolio to .env.local
npm run db:migrate
npm run content:index             # RETRIEVAL_BACKEND resolves to pgvector when DATABASE_URL is set
```

`db:migrate` creates the `vector` extension, the `knowledge_chunks` table (`vector(EMBEDDING_DIMENSIONS)`), an HNSW cosine index, and a `knowledge_meta` guard that refuses to run against an index built with a different embedding model or dimension. Reference DDL: [db/migrations/001_knowledge_chunks.sql](db/migrations/001_knowledge_chunks.sql). Any managed Postgres with pgvector works (Neon, Supabase, RDS).

## OpenAI setup

Set `OPENAI_API_KEY`. Defaults: `AI_MODEL=gpt-4.1-mini`, `EMBEDDING_MODEL=text-embedding-3-small` (1536 dims). Any OpenAI-compatible endpoint that implements `/v1/responses` and `/v1/embeddings` can be used via `OPENAI_BASE_URL`. Changing the embedding model or dimensions requires `npm run content:index -- --reset`.

## Content indexing

```bash
npm run content:validate            # schema + cross-reference checks, chunk summary (also runs in `npm run build`)
npm run content:index               # incremental: unchanged → skip, changed → re-embed, new → insert, deleted → remove
npm run content:index -- --dry-run  # show the diff without calling the embedding API
npm run content:index -- --check    # exit 1 if data/knowledge-index.json is stale (no API key needed; CI runs this)
npm run content:index -- --reset    # rebuild from scratch (required after changing the embedding model/dimensions)
```

Workflow: edit Markdown → `npm run content:index` → commit both the `.md` change and `data/knowledge-index.json`. The index stores only chunk ids, hashes, and vectors (no text), so it never contains anything that is not already public. The lexical leg always reflects the deployed Markdown immediately; only the vector leg needs re-indexing, and CI fails if the committed index is stale.

## Testing

```bash
npm run check:secrets    # scans tracked files for credential patterns (first step in CI)
npm run hooks:install    # local pre-push hook that runs the same scan
npm run typecheck        # next typegen + tsc
npm test                 # Vitest: unit (knowledge, retrieval, AI, security), integration (RAG pipeline), components (RTL)
npm run test:coverage
npm run test:e2e         # Playwright against a production build (run `npx next build` first); desktop + mobile.
                         # e2e/serve.mjs starts a mock OpenAI server and builds a throwaway index, so the
                         # suite runs the real live path (file index + streamed Responses API) with no key.
TEST_DATABASE_URL=postgres://portfolio:portfolio@localhost:5432/portfolio npm test   # also runs the real pgvector test
```

## AI evaluations

```bash
npm run eval                       # offline: lexical retrieval, no API calls (what CI runs)
npm run eval -- --backend=env      # use the configured retriever (file index or pgvector + OpenAI embeddings)
npm run eval -- --backend=env --answers   # also generate answers and check citations / refusals
```

Cases live in [evals/cases.json](evals/cases.json): expected sources per question, expected cards, and `must_not_invent` questions (certifications, employer, salary, off-topic, prompt injection). Thresholds: retrieval hit rate ≥ 85 %, must-not-invent 100 %, citation validity 100 %. The run exits non-zero when a threshold is missed.

## Security

See [docs/SECURITY.md](docs/SECURITY.md). Highlights: Zod on every boundary; byte-counted body limits; same-origin enforcement; per-IP rate limits (trusted proxy hop, IPv6 /64 bucketing); CSP + HSTS + frame/MIME/referrer headers; Markdown rendered without raw HTML (URL allowlist, no `<img>`), `dangerouslySetInnerHTML` used exactly once (JSON-LD from validated frontmatter, `<` escaped); retrieved content fenced as untrusted data with unpredictable delimiters; hidden characters and HTML comments stripped at ingestion; private content never leaves the server; secrets only in env; sanitized structured logs; `npm audit --audit-level=high` in CI.

## Docker

```bash
docker build -t anjo-portfolio --build-arg NEXT_PUBLIC_SITE_URL=https://your-domain .
docker run -p 3000:3000 -e NEXT_PUBLIC_SITE_URL=https://your-domain -e OPENAI_API_KEY=... -e DATABASE_URL=... anjo-portfolio
```

Multi-stage build → Next standalone output → `node:22-alpine`, non-root `nextjs` user, no dev dependencies, `HEALTHCHECK` on `/api/health`, secrets excluded via `.dockerignore`. Image ≈ 236 MB.

## Deployment

### Vercel (primary, no database)

The site deploys as static pages plus two Node serverless functions (`/api/chat`, `/api/search`). No database, no cron, no external services beyond OpenAI.

1. Locally: `npm run content:index` with your `OPENAI_API_KEY`, then commit `data/knowledge-index.json`.
2. Import the repository in Vercel. `vercel.json` pins the Next.js preset and build/install commands, and `engines.node` pins Node 22.x — if the project previously hosted the old Vite site, clear any **Output Directory** override in Settings → Build & Deployment.
3. Environment variables: `NEXT_PUBLIC_SITE_URL=https://your-domain` (mandatory — the app refuses to start without it) and `OPENAI_API_KEY`. Everything else has defaults.
4. Deploy. Check `https://your-domain/api/health` — it should report `"retriever":"hybrid"`, `"backend":"file"`, and `"modelBacked":true`. If it says `lexical`, the index file was not committed.

Notes: `next.config.ts` uses `outputFileTracingIncludes` so `content/` and `data/` are bundled into the functions; `/api/chat` sets `maxDuration = 60` so streamed answers are not cut off by the 10 s default; the in-memory rate limiter is per function instance (see [docs/SECURITY.md](docs/SECURITY.md)), so also set a **hard monthly spending limit** on the OpenAI account — that is the real cost ceiling.

**Cost**: roughly ≈2,000 input + ≈200 output tokens per answer with `gpt-4.1-mini` ≈ $0.001, i.e. ~$1 per 1,000 questions; indexing the whole knowledge base is a fraction of a cent; a portfolio's traffic fits Vercel's Hobby tier. Every request logs `estimatedCostUsd` (rates configurable via `AI_INPUT_COST_PER_1M` / `AI_OUTPUT_COST_PER_1M`).

### Docker (anywhere else)

See [Docker](#docker). Production deploys should run only from the `master` branch after CI passes.

## Environment variables

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | production | `http://localhost:3000` | canonical URLs, sitemap, Open Graph |
| `OPENAI_API_KEY` | no | — | enables live answers and embeddings |
| `OPENAI_BASE_URL` | no | OpenAI | OpenAI-compatible endpoint |
| `AI_PROVIDER` | no | `auto` | `auto` / `openai` / `extractive` (forcing `openai` requires the key) |
| `AI_MODEL` | no | `gpt-4.1-mini` | chat model |
| `AI_MAX_OUTPUT_TOKENS` | no | `700` | output cap |
| `AI_REQUEST_TIMEOUT_MS` | no | `30000` | model request timeout |
| `AI_INPUT_COST_PER_1M` / `AI_OUTPUT_COST_PER_1M` | no | `0.40` / `1.60` | USD rates for the logged cost estimate |
| `EMBEDDING_MODEL` / `EMBEDDING_DIMENSIONS` | no | `text-embedding-3-small` / `1536` | embeddings |
| `DATABASE_URL` | no | — | PostgreSQL + pgvector (optional) |
| `RETRIEVAL_BACKEND` | no | `auto` | `auto` / `pgvector` / `file` / `lexical` — auto = pgvector if `DATABASE_URL`, else `file` if key + index file, else lexical |
| `KNOWLEDGE_INDEX_PATH` | no | `data/knowledge-index.json` | file index location |
| `RETRIEVAL_MAX_CHUNKS` | no | `6` | chunks per answer |
| `RETRIEVAL_MIN_SIMILARITY` | no | `0.3` | cosine floor for vector matches |
| `RATE_LIMIT_PER_MINUTE` / `RATE_LIMIT_PER_HOUR` | no | `10` / `50` | per-client chat budget (search gets 3×) |
| `CHAT_STREAM_DELAY_MS` | no | `12` | extractive streaming cadence |
| `LOG_LEVEL` | no | `info` | `debug` / `info` / `warn` / `error` |

Validation happens once at startup (`src/lib/config/env.ts`); misconfiguration fails fast with a readable message and `/api/health` reports 503.

## PWA & versioning

The site is an installable progressive web app that updates itself.

- **Manifest** (`src/app/manifest.ts`) with icons rendered at build time from the profile monogram (`/icons/icon-192`, `/icons/icon-512`, maskable and Apple variants) — no binary assets in the repo.
- **Versioned service worker** served from `/sw.js` (`src/app/sw.js/route.ts`) with the build label baked in. Every deploy produces a byte-different worker, so browsers install it on the next visit; it activates immediately (`skipWaiting` + `clients.claim`), deletes old caches, and the page reloads as soon as no answer is streaming. The conversation is kept in `sessionStorage`, so nothing is lost. Strategy: API never cached, `/_next/static` cache-first, navigations network-first with an `/offline` fallback, icons/fonts stale-while-revalidate. Registration is skipped in development.
- **Version identity**: `package.json` version + git SHA (`VERCEL_GIT_COMMIT_SHA` on Vercel) + build time, inlined at build (`src/lib/version.ts`), exposed at `/api/version`, shown in the sidebar (linked to the commit), and used as the cache name.
- **Releasing**: `npm run release:patch` (or `minor` / `major`) bumps `package.json`, commits `chore(release): vX.Y.Z`, tags, and pushes; the `Release` workflow verifies the tag, runs the quality gate, and publishes a GitHub Release with generated notes. Vercel deploys the tagged commit. Keep [CHANGELOG.md](CHANGELOG.md) current under *Unreleased* as you go.

## Adding new portfolio content

1. Create `content/<slug>.md` or `content/projects/<slug>.md` with valid frontmatter (see [docs/CONTENT_SCHEMA.md](docs/CONTENT_SCHEMA.md)). Use `## Heading` sections — each becomes a retrievable chunk and a citation target.
2. Keep it factual and non-confidential: architecture, responsibilities, technologies, challenges, generalized outcomes. No credentials, customer data, internal URLs, or proprietary logic.
3. Set `visibility: public` only when the content is ready to be quoted by the assistant.
4. `npm run content:validate`, then `npm run content:index` (if using pgvector).
5. Optionally add an eval case in `evals/cases.json` and run `npm run eval`.

To publish experience, education, or certifications, fill in the structured entries in the private template files and flip `visibility` to `public`; the Experience page, topic pages, chat cards, and retrieval pick them up automatically.

## Troubleshooting

| Symptom | Cause / fix |
| --- | --- |
| `Environment configuration error: NEXT_PUBLIC_SITE_URL is required in production` | Set it (Vercel env / `-e` for Docker). |
| `/api/health` shows `"retriever":"lexical"` in production | `OPENAI_API_KEY` missing, or `data/knowledge-index.json` was not committed (look for `knowledge_index_missing` in logs). Set `RETRIEVAL_BACKEND=file` to make it a hard error. |
| `Knowledge index was built with ... but the app is configured for ...` / `knowledge_meta ... configured for` | Embedding model/dimensions changed. `npm run content:index -- --reset` and commit. |
| CI fails with `Knowledge index is stale` | Markdown changed without re-indexing. `npm run content:index` and commit the JSON. |
| Answers say "no language model is connected" | `OPENAI_API_KEY` not set — extractive mode. |
| `content:validate` fails | The message names the file and field; frontmatter keys are strict and `visibility` is required. |
| `EPERM: operation not permitted, rename ... .next/dev/...` in `next dev` on Windows | File-lock race in Turbopack when many routes compile at once; retry, or use `next build && next start`. |
| Playwright cannot find the server | Run `npx next build` first; E2E uses `next start` on port 3100. |
