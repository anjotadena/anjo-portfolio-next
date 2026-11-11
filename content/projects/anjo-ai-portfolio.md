---
title: "Anjo AI Portfolio"
slug: anjo-ai-portfolio
type: project
summary: "This portfolio and its Anjo AI assistant: a Next.js site that presents Anjo's work directly, with a floating AI assistant grounded in retrieval-augmented generation over the same Markdown files, streaming answers, citations, and rich portfolio cards."
tags: ["ai", "rag", "llm", "next.js", "react", "typescript", "pgvector", "postgresql", "openai", "full-stack", "open-source"]
technologies: ["Next.js", "React", "TypeScript", "Tailwind CSS", "PostgreSQL", "pgvector", "OpenAI API", "Zod", "Docker", "GitHub Actions", "Vitest", "Playwright"]
date: 2026-08-17
updated: 2026-11-11
featured: true
visibility: public
related: ["ai-engineering", "architecture", "devops", "asterweave"]
project:
  role: "Designer and developer"
  period: "2026 – Present"
  status: "active"
  category: "AI"
  repoUrl: "https://github.com/anjotadena/anjo-portfolio-next"
  audience: "Hiring teams, business owners, and founders who want to understand Anjo's work quickly."
  problem: "Finding one fact means reading many pages, and generic chatbots invent details instead of citing sources."
  built: "Anjo AI, a portfolio assistant that answers from this site's public content and cites the sections it used."
---

## Overview

Anjo's portfolio presents his work directly — selected projects, how he can help, background, and contact details — and includes Anjo AI, a floating assistant available in the bottom-right corner of every page. Visitors can ask it questions such as "What is Unexaro?", "How does Asterweave work?", or "How can I contact Anjo?", and it answers from Markdown files stored in the repository, streaming the response and citing the sections it used. The pages and the assistant are generated from the same Markdown, so there is never a second copy of the information.

## Problem

Recruiters and engineers do not want to navigate many pages to find one fact. A chatbot widget bolted onto a portfolio does not solve this either: it usually answers from the model's general knowledge and invents details. The goal was an assistant that is fast, grounded, and honest about what the portfolio does and does not say.

## Solution

Markdown is the single source of truth. A content pipeline parses frontmatter, validates it with Zod, chunks documents by heading, computes a SHA-256 hash per chunk for incremental re-indexing, generates embeddings, and stores them in PostgreSQL with pgvector. At query time the assistant validates input, rewrites follow-up questions using conversation context, retrieves relevant chunks with hybrid vector-plus-lexical search, filters by relevance, builds a grounded prompt in which retrieved content is untrusted data, streams the answer from the model, and attaches citations and typed portfolio cards.

## Architecture

- Next.js App Router with Server Components for pages and Route Handlers for the chat, search, and health APIs.
- A KnowledgeRetriever interface with a pgvector-backed hybrid retriever and an in-process lexical retriever, so the vector store can be swapped and the site still works with no database configured.
- An OpenAI provider using the Responses API with streaming, plus an extractive fallback provider that answers verbatim from retrieved content when no model is configured.
- Server-side rate limiting, request size limits, output caps, timeouts, and structured logs of latency, token usage, and estimated cost.
- Rich answers use typed card data (ProjectCard, SkillCard, ContactCard, ExperienceCard, CertificationCard) derived from frontmatter on the server — the model never emits HTML or UI.
- Only content marked public is indexed, searchable, or rendered; private Markdown never reaches the browser.

## Technologies

Next.js, React, TypeScript (strict), Tailwind CSS, Zod, PostgreSQL with pgvector, the OpenAI API for embeddings and chat, Docker and Docker Compose, GitHub Actions, Vitest and React Testing Library for unit and integration tests, and Playwright for end-to-end tests.

## My Role

Anjo designed and built the whole system: content schema, ingestion pipeline, retrieval layer, AI orchestration, chat UI, security controls, tests, evaluation suite, and deployment.

## Key Challenges

- Grounding: the system prompt, context wrapping, relevance thresholds, and an evaluation suite with "must not invent" cases keep the assistant from fabricating claims.
- Prompt injection: Markdown is data, never instructions; hidden characters and HTML comments are stripped during ingestion and retrieved content is fenced with unpredictable delimiters.
- Cost control: bounded context, token caps, rate limits, and incremental indexing keep API usage predictable.
- Mobile: the chat input must stay visible when the on-screen keyboard opens, which requires dynamic viewport units and safe-area handling.

## Results

The site works end to end with or without an OpenAI key and database, ships with automated unit, integration, and end-to-end tests, a RAG evaluation suite, a CI pipeline, and a production Dockerfile, and is deployed on Vercel.
