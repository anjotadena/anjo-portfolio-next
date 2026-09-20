# Architecture decisions

Short records of the trade-offs that shaped the implementation. Newest last.

## ADR-1 · Markdown at `/content` is the single source of truth

Pages, the retrieval index, chat cards, search, sitemap, and JSON-LD all read the same validated documents through `src/lib/knowledge/repository.ts`. Structured facts (profile, skill groups, project links, experience/certification/education entries) live in frontmatter so UI never scrapes prose; the body remains the retrieval text. Alternative — a CMS or database for content — rejected: it would add infrastructure and a second copy of the facts.

## ADR-2 · Retrieval behind `KnowledgeRetriever` + `VectorStore`, with a zero-infrastructure fallback

Two interfaces separate *what* the app needs (`search(query, options)`) from *how* vectors are stored. `PgVectorStore` is production; `InMemoryVectorStore` powers integration tests; `LexicalRetriever` (BM25) runs with no database. `RETRIEVAL_BACKEND=auto` picks pgvector when `DATABASE_URL` and `OPENAI_API_KEY` are present, otherwise lexical — and logs the choice. Forcing `pgvector` makes its dependencies mandatory. Consequence: dev, CI, tests, and evals never need a database or key, and a database outage degrades to lexical rather than downtime.

## ADR-3 · Hybrid retrieval (vector ⊕ BM25 via RRF) rather than vector-only

The corpus is small and terminology-heavy (".NET", "pgvector", "Angular"). Embeddings alone blur exact tokens; BM25 alone misses paraphrases. Reciprocal rank fusion of both legs gave the best precision in evaluation. The lexical leg carries most of the domain work (stemming, compound tokens, synonyms, metadata field, title boost) because it is also the offline fallback.

## ADR-4 · Extractive provider instead of "AI not configured"

Without an API key the assistant quotes the top retrieved sections verbatim with citations, streamed through the same protocol. The site stays useful and every UI path is exercised in tests without a model. The UI labels these answers clearly.

## ADR-5 · Rich cards are derived on the server, never emitted by the model

ProjectCard/SkillCard/ContactCard/ExperienceCard/CertificationCard payloads are built from intent + retrieved documents + frontmatter (`src/lib/ai/cards.ts`). The model produces prose and `[n]` citations only. This removes a whole class of injection/hallucination risk and avoids tool-calling latency and cost. Alternative — function calling to let the model choose cards — rejected as unnecessary for this content size.

## ADR-6 · Deterministic query understanding and context management

Intent classification, follow-up rewriting, related questions, and the conversation summary are all rule-based (no extra model calls). Cheaper, testable, and predictable; a model-based query rewriter can be added behind `understandQuery` later if evals show it is needed.

## ADR-7 · OpenAI via `fetch`, not the SDK

Two endpoints (`/v1/responses` streaming, `/v1/embeddings`), full control over timeouts/abort, no extra bundle weight, and upstream error bodies are deliberately not surfaced.

## ADR-8 · Native `<dialog>` and hand-rolled primitives instead of Radix/shadcn packages

The repo already had shadcn-style primitives without the dependency tree. Native `<dialog>` provides focus trapping, Escape, inert background, and top-layer rendering; adding Radix would bring several packages for the same result.

## ADR-9 · Static CSP with `'unsafe-inline'`

Keeps every page fully static (SSG) and lets the theme anti-flash script run. Mitigated by never rendering raw HTML from content or the model and by `connect-src 'self'` / `object-src 'none'` / `base-uri 'none'`. Revisit with nonces if dynamic rendering becomes acceptable.

## ADR-10 · Content grounding rules for authored Markdown

Only verifiable facts were written into `/content` (existing verified files, the public Asterweave repository and plugin, public GitHub repository descriptions). Experience, education, and certifications had no verifiable source, so they ship as `visibility: private` templates; the assistant honestly reports that the portfolio does not cover them until they are filled in. This mirrors the assistant's own rule: never invent employers, dates, metrics, or credentials.

## ADR-11 · In-memory rate limiting with a swappable interface

Adequate for a single Vercel/Docker instance and for damping abuse; documented as not globally enforced. `RateLimiter` is an interface so a Redis-backed implementation can replace it without touching routes.

## ADR-12 · A committed JSON vector index is the default; the database is optional

The knowledge base is a few dozen Markdown files in a public repository, so the vector index is derived data of the same nature. `npm run content:index` embeds chunks into `data/knowledge-index.json` (ids, hashes, vectors — no text) and the server loads it into memory; brute-force cosine over hundreds of vectors is sub-millisecond, and the file is incremental and diff-friendly (6-decimal floats, sorted by id). Deployments therefore need only Vercel + an OpenAI key. CI verifies the committed index matches the Markdown (`content:index --check`). pgvector remains available behind the same `VectorStore` interface for corpora that outgrow a file. Trade-off accepted: the index must be rebuilt and committed when content changes (guarded by CI and `/api/health`).
