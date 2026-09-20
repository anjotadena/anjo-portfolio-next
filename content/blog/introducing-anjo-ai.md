---
title: "Introducing Anjo AI: this portfolio now answers questions"
slug: introducing-anjo-ai
type: post
summary: "The portfolio has been rebuilt as an AI assistant grounded in the Markdown files of its own repository. Here is what you can ask it, how it stays honest, and how it is put together."
tags: ["announcement", "ai", "rag", "portfolio", "next.js"]
technologies: ["Next.js", "TypeScript", "OpenAI API"]
date: 2026-09-20
updated: 2026-09-20
featured: false
visibility: public
related: ["anjo-ai-portfolio", "building-anjo-ai", "asterweave"]
post:
  series: "Building Anjo AI"
---

## What changed

This site used to be a set of pages. It is now an assistant. Type a question into the chat — *"What is his .NET experience?"*, *"Tell me about Asterweave"*, *"How can I contact him?"* — and Anjo AI answers from the Markdown files stored in this repository, streaming the reply and citing the sections it used. The traditional pages (About, Projects, Case Studies, Skills, Contact, and this blog) are generated from the same files, so there is never a second copy of the facts.

## What you can ask

- Experience with specific technologies: .NET and ASP.NET Core, Angular and React, PostgreSQL, AWS and Azure, Docker and CI/CD.
- Projects: what Asterweave is, how RepoSage works, what this portfolio is built with.
- Approach: architecture patterns, engineering philosophy, how AI is used in day-to-day engineering.
- Practicalities: how to get in touch, where the résumé is.

Every answer shows its sources. Click a citation to see the exact section it came from and jump to the full page.

## How it stays honest

The assistant is only allowed to answer from retrieved portfolio content. If nothing relevant is found, the model is never called; you get a plain "the portfolio doesn't cover that" instead of a guess. Retrieved Markdown is treated as untrusted data, never as instructions, and the assistant is told never to invent facts about work history, projects, skills, credentials, dates, or metrics. The same rule applied to writing the content: only verifiable facts went in, and sections without a verifiable source were left private until they can be filled in properly.

## How it is built

Next.js 16 on Vercel; Markdown with Zod-validated frontmatter as the single source of truth; heading-aware chunking with deterministic ids; hybrid retrieval (vector similarity over a committed JSON index plus BM25, fused with reciprocal rank fusion); the OpenAI Responses API for streamed answers with an extractive fallback when no model is configured; typed cards derived on the server; rate limits, strict validation, and structured logging throughout. It is also an installable progressive web app that updates itself when a new version is deployed.

The full write-up — problem, constraints, decisions, and trade-offs — is in the [Building Anjo AI](/case-studies/building-anjo-ai) case study, and the code is open on GitHub.

## What is next

More posts on the parts that turned out to be interesting: what actually made retrieval work on a small, terminology-heavy corpus, and how the self-updating service worker is put together. If you have a question the assistant could not answer, that is useful feedback — get in touch.
