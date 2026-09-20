---
title: "Building Anjo AI: a portfolio that answers questions"
slug: building-anjo-ai
type: case-study
summary: "How this portfolio was designed as a retrieval-augmented AI assistant over Markdown — grounding rules, hybrid retrieval, a zero-infrastructure fallback, cost controls, and an evaluation suite — and what the trade-offs were."
tags: ["case-study", "ai", "rag", "llm", "next.js", "typescript", "architecture", "security", "vercel", "pwa"]
technologies: ["Next.js", "React", "TypeScript", "OpenAI API", "Zod", "Tailwind CSS", "Vitest", "Playwright", "Docker", "GitHub Actions"]
date: 2026-09-20
updated: 2026-09-20
featured: true
visibility: public
related: ["anjo-ai-portfolio", "ai-engineering", "architecture", "devops"]
caseStudy:
  outcome: "A grounded, cited AI assistant with no database, running on Vercel for well under a dollar a month."
  role: "Designer and developer"
  period: "September 2026"
  highlights:
    - "Markdown is the single source of truth: pages, search, chat cards, and the vector index all read the same validated files"
    - "Hybrid retrieval (vector + BM25, reciprocal-rank fusion) over a committed JSON index — no database in production"
    - "Every mode is grounded: retrieval finds nothing → the model is never called; answers cite numbered sources"
    - "28-case evaluation suite: 100% retrieval hit rate, 100% must-not-invent, run offline in CI"
    - "Roughly $0.001 per answer; static pages plus two serverless functions"
  projectSlug: anjo-ai-portfolio
---

## Context

Most developer portfolios are pages a recruiter scrolls through. The goal here was different: make the portfolio *itself* an assistant that a recruiter, engineer, or collaborator can simply ask — "What is his .NET experience?", "Tell me about Asterweave", "How can I contact him?" — and get a fast, honest answer with sources. It had to be production-grade (security, cost control, accessibility, mobile) rather than a chatbot widget bolted onto a static site, and it had to be honest: an assistant that invents an employer or a credential is worse than no assistant at all.

The project was delivered in a single, tightly scoped build on top of an existing Next.js 16 scaffold, with the Asterweave repository-analysis agents used for the initial codebase discovery.

## Problem

Three problems had to be solved at once.

1. **Grounding.** Large language models answer fluently whether or not they know the facts. The assistant had to answer *only* from the portfolio's content and say so plainly when the content does not cover a question.
2. **A single source of truth.** Portfolio facts tend to get duplicated across pages, résumé, and chatbot prompts, and then drift. There had to be exactly one place the facts live.
3. **Operating cost and abuse.** A public, unauthenticated chat endpoint in front of a metered API is an open wallet unless every request is bounded.

## Constraints

- Content is a few dozen Markdown files in a public repository; there is no CMS and no desire to run a database for it.
- Deployment target is Vercel (static pages plus serverless functions), with Docker as an alternative.
- Everything must work with zero configuration in development, tests, and CI — no API key, no database — and degrade gracefully in production if a dependency is unavailable.
- Node 22, TypeScript strict, no unnecessary dependencies.

## Approach

Markdown files under `/content` carry Zod-validated frontmatter (`type`, `visibility`, `featured`, structured facts such as profile identity, skill groups, and project links). A content pipeline normalises each file (line endings, NFKC, stripped zero-width and bidi control characters, stripped HTML comments), splits it into heading-aware chunks with deterministic ids (`slug::section::ordinal`) and SHA-256 hashes, and embeds only the chunks that changed.

At query time the request flows through validation → rate limiting → deterministic query understanding (intent classification and follow-up rewriting, no extra model call) → hybrid retrieval → a grounded prompt in which the retrieved sections are numbered and fenced as untrusted data → a streamed answer → server-derived citations, typed cards, and related questions.

Pages (`/about`, `/projects/[slug]`, `/skills`, `/case-studies/[slug]`, …) are prerendered from the same repository module, and a `visibility: private` document can never reach a page, the index, search, or the model.

## Architecture

- **Retrieval behind interfaces.** `KnowledgeRetriever` is what the app depends on; `VectorStore` is what a backend implements. Three stores exist: a JSON file index (the production default, loaded into memory), PostgreSQL + pgvector (optional, for larger corpora), and in-memory (tests).
- **Hybrid ranking.** The vector leg finds paraphrases; the BM25 leg — with light stemming, compound tech tokens such as `asp.net`/`c#`, synonym expansion at reduced weight, a BM25F-style metadata field, and a title boost — nails exact terms like ".NET" and "pgvector". Results are fused with reciprocal rank fusion (k = 60) and floored on relevance.
- **Two answer providers.** The OpenAI Responses API (streaming, via plain `fetch`) when a key is configured; otherwise an *extractive* provider that quotes the top retrieved sections verbatim with citations through the same wire protocol — so the site is useful with no key at all.
- **Cards are data, not model output.** Project, skill, contact, work-history, credential, and case-study cards are built on the server from frontmatter and retrieval metadata. The model only produces prose and `[n]` markers.
- **Context management.** The last six turns are kept verbatim under a character budget; dropped user questions are summarised deterministically; retrieved context is capped.

## Key Decisions

- **No database by default.** The corpus is derived data of a public repo, so the vector index is committed next to the Markdown (`data/knowledge-index.json`: ids, hashes, and vectors — no text). Brute-force cosine over a few hundred vectors is sub-millisecond, deployments need only an API key, and CI fails if the committed index is stale. pgvector remains one interface implementation away.
- **Deterministic query understanding.** Intent detection, follow-up rewriting, and related questions are rule-based. They are cheap, testable, and predictable; a model-based rewriter can be introduced later if evaluations show it is needed.
- **OpenAI via `fetch`, not an SDK.** Two endpoints, full control of timeouts and abort, no extra bundle weight, and upstream error bodies are never surfaced (they can echo prompt content).
- **Native `<dialog>` instead of a component library.** Focus trapping, Escape, inert background, and top-layer rendering come for free.
- **Honest content.** Only verifiable facts were written into the knowledge base. Work history, schooling, and credentials shipped as private templates; the assistant says the portfolio does not cover them yet rather than guessing.

## Security

Zod on every boundary (frontmatter, requests, environment); byte-counted body limits; same-origin enforcement on POST; per-minute and per-hour rate limits keyed by the trusted proxy hop; CSP, HSTS, and frame/MIME/referrer headers; Markdown rendered without raw HTML, with a URL allowlist and no images; `dangerouslySetInnerHTML` used exactly once, for JSON-LD from validated frontmatter; retrieved content fenced with unpredictable per-request delimiters; sanitised structured logs that never contain prompts, answers, or secrets; a secrets scanner as the first CI step and a local pre-push hook.

## Results

- The site works end to end with or without an OpenAI key and with or without a database, and is deployed on Vercel as static pages plus two serverless functions.
- Retrieval evaluation over 30+ cases: 100% retrieval hit rate, 100% on must-not-invent questions (unlisted credentials, personal details, off-topic requests, prompt injection), 100% citation validity, run offline in CI.
- Automated coverage: unit, integration, and component tests with Vitest and React Testing Library, and Playwright end-to-end tests on desktop and mobile that exercise the real live path through a mock OpenAI server — including the self-updating service worker of the installable PWA.
- Estimated cost per answer is on the order of a tenth of a cent with a small model; indexing the whole knowledge base costs a fraction of a cent. For a portfolio's traffic the monthly bill rounds to zero.
- A production Docker image (non-root, multi-stage, health-checked) at roughly 236 MB, a CI pipeline with quality gates and a Docker smoke test, and a tagged release workflow.

## Lessons Learned

- **Lexical retrieval earns its keep.** On a small, terminology-heavy corpus the BM25 leg carried most of the relevance work — stemming, compound tokens, framing-word stopwords ("show me", "experience with", "currently"), and prose-only coverage each fixed a concrete failure found while probing.
- **Nearest-neighbour search always returns *something*.** The similarity floor, not the search, is what stops an off-topic question from looking grounded.
- **Make the fallback real.** Streaming the extractive answer through the same protocol meant every UI path was exercised without a model, and the site stayed useful in every configuration.
- **Evaluate refusals, not just hits.** The must-not-invent cases caught a temporal framing word ("currently") that would have grounded an unanswerable question on an unrelated section.
