# Security

Threat model: a public, unauthenticated chat endpoint in front of a metered LLM API, plus a Markdown corpus that is rendered on pages and injected into prompts. The controls below map to those risks.

## Trust boundaries

| Boundary | Untrusted input | Control |
| --- | --- | --- |
| Browser → `/api/chat`, `/api/search`, `/api/analytics` | JSON body, query string, headers | Zod schemas (strict objects, length limits, role enum, control-char stripping); byte-counted body limit (32 KB chat, 4 KB analytics); `Origin` must match `Host` on POST; rate limits; generic error bodies |
| Markdown → prompt | Repository content (could be edited maliciously or contain pasted text) | Normalization at ingestion (HTML comments, zero-width/bidi chars removed); rendered inside `<portfolio_context>` with per-request random delimiters that are stripped from content; fake `<portfolio_context>` tags neutralized; system prompt states the block is untrusted reference material |
| Markdown → browser | Same | `react-markdown` without `rehype-raw` (no raw HTML), URL allowlist (`http`, `https`, `mailto`, relative, internal `cite:n`), `<img>` never rendered, external links `rel="noopener noreferrer"` |
| Model → browser | Answer text | Rendered through the same sanitized Markdown pipeline; citation markers to non-existent sources removed server-side; cards/links come from frontmatter, never from the model |
| Env → app | Configuration | Validated once at startup; forced modes fail fast; secrets read only by providers; never serialized to the client |

## Controls checklist

- **Input validation**: `src/lib/validation/chat.ts` (chat, search), `src/app/api/analytics/route.ts` (closed event list), `src/lib/knowledge/schema.ts` (content).
- **Payload limits**: `readBodyWithLimit` counts bytes rather than trusting `Content-Length`.
- **Rate limiting**: `MultiWindowRateLimiter` (per-minute + per-hour token buckets) keyed by `deriveClientKey` (last `X-Forwarded-For` hop = the trusted proxy's view; IPv6 bucketed by /64; bounded key space). In-memory per instance — see Limitations.
- **CSRF**: state-changing routes are same-origin only (`Origin` check); no cookies are used, so cross-site requests carry no ambient authority anyway.
- **Headers** (`next.config.ts`): CSP (`default-src 'self'`, `frame-ancestors 'none'`, `object-src 'none'`, `base-uri 'none'`, `connect-src 'self'`, `img-src 'self' data:`), HSTS (production), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`. `'unsafe-inline'` for scripts/styles is accepted to keep pages fully static and allow the theme anti-flash script; the Markdown renderer never emits scripts or raw HTML, and `connect-src 'self'` closes exfiltration paths.
- **`dangerouslySetInnerHTML`**: used once, in `src/components/seo/json-ld.tsx`, with data built only from validated frontmatter and `<`, U+2028, U+2029 escaped.
- **Prompt injection**: see boundary table; additionally, the user's own message and history are declared as data in the system prompt; history roles are restricted to `user|assistant` at the schema level so a client cannot inject a `system` turn.
- **Vector index file**: `data/knowledge-index.json` holds chunk ids, content hashes, and vectors only — never text — and only for public chunks, so committing it to a public repository exposes nothing beyond the Markdown itself.
- **Private knowledge**: `visibility` is required on every document; only public documents pass through `getPublicDocuments()`/`getPublicChunks()`; the indexer refuses private chunks; pgvector queries filter `visibility = 'public'`; pages return 404 for private slugs; tests assert private text never appears in retrieval results or API responses.
- **Secrets**: `scripts/check-secrets.mjs` scans every tracked file for credential patterns (OpenAI/GitHub/AWS/Vercel tokens, private keys, database URLs with passwords, tracked `.env` files) as the first CI step and as a local pre-push hook (`npm run hooks:install`); `.env*` is git-ignored and Docker-ignored; the image contains no secrets; `/api/health` reports modes and counts only; error responses never include messages or stacks; logs drop fields named `message`, `email`, `body`, `content`, `query`, `prompt`, `answer`, `apiKey`, `token`, `secret`, `databaseUrl`, etc.
- **Upstream errors**: OpenAI response bodies are never surfaced (they can echo prompt content); only the status code is logged.
- **Cost controls**: `max_output_tokens`, request timeout, idle timeout, hard character cap on the stream, bounded retrieved context, trimmed conversation history, rate limits, and the ungrounded short-circuit (no model call when retrieval finds nothing).
- **Dependencies**: `npm audit --audit-level=high` in CI; Next.js pinned above the 16.3.1 RCE advisories; minimal dependency set (no LLM SDK, no Radix, no clsx/tailwind-merge).
- **Safe failure**: every API handler is wrapped by `safeHandler` (misconfiguration → 503, unexpected → generic 500); the chat route returns a clean 502 if the provider fails before the first byte and an in-band `error` frame after it.

## Limitations and follow-ups

- The rate limiter is per-process. On a multi-instance deployment a client can obtain `instances × budget`. Swap in a Redis/Upstash-backed `RateLimiter` (the interface is in `src/lib/security/rate-limit.ts`) for a hard global limit.
- CSP uses `'unsafe-inline'`; a nonce-based CSP would require dynamic rendering of every page. Revisit if pages ever render user-controlled content.
- `deriveClientKey` assumes exactly one trusted proxy. Behind multiple proxies, configure the platform to normalize `X-Forwarded-For` or adapt the hop selection.
- Analytics are structured logs; if a third-party analytics provider is added, extend `connect-src` deliberately.
