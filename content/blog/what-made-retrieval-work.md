---
title: "Grounding a RAG assistant: what actually made retrieval work"
slug: what-made-retrieval-work
type: post
summary: "Embeddings were not the hard part. On a small, terminology-heavy corpus the lexical leg carried most of the relevance work — here are the specific fixes, with the failures that motivated each one."
tags: ["rag", "retrieval", "bm25", "embeddings", "ai", "evaluation"]
technologies: ["TypeScript", "OpenAI API"]
date: 2026-09-21
updated: 2026-09-21
featured: false
visibility: private
related: ["building-anjo-ai", "ai-engineering"]
post:
  series: "Building Anjo AI"
---

> Draft — review before publishing (set `visibility: public`).

## The setup

The assistant answers from about eighty Markdown sections: a profile, a skills list, project write-ups, case studies, and topic pages. That is tiny by RAG standards, and it is heavy on exact terms — `.NET`, `ASP.NET Core`, `pgvector`, `Angular`, `Asterweave`. Two things followed from that: a nearest-neighbour search alone would not be precise enough, and I could afford to test every change by hand against the real questions recruiters ask.

Retrieval is hybrid: cosine similarity over embeddings, BM25 over the same chunks, fused with reciprocal rank fusion. This post is about the BM25 half, because that is where the surprises were.

## Failure 1: ".NET" found nothing

The tokenizer kept compound tech terms whole (`asp.net`, `node.js`, `c#`), which is right — but the query ".NET" tokenizes to `net`, and `net` is not `asp.net`. Fix: emit compound tokens *and* their parts, so `ASP.NET` yields `asp.net`, `asp`, `net`. A small synonym map (`net` → `asp.net`, `dotnet`, `c#`) at reduced weight catches the rest.

## Failure 2: "What technologies does he use?" was ungrounded

The skills document never says "technologies". Two fixes: light stemming so `technologies` matches `technology`, and — more importantly — intent-anchored retrieval. A question classified as a skills question runs a type-scoped search first, with the vocabulary that document actually uses ("skills capability technical stack") appended, then general results fill the remaining slots. A bias, never a hard filter.

## Failure 3: "Show me his cloud experience" matched one chunk

Term coverage required two matching terms, and "show" and "experience" counted as terms. Framing words carry no topic: *show me*, *tell me about*, *experience with*, *familiar with*, *does he know*. They are removed from queries only (documents keep them) so they never count toward coverage. Coverage now requires two terms only for three-plus-term queries.

## Failure 4: Asterweave's own page ranked below a page that mentions it

Plain BM25 has no notion of "this document is *about* the term". A title boost fixed it: when the query's own terms appear in a document's title, its chunks are lifted, and the first chunk (usually the overview) a little more.

## Failure 5: every skills section matched "AWS"

Document-level metadata (tags, technologies) had been folded into each chunk's text, so listing `AWS` in the skills frontmatter made all seven skills sections look like AWS matches. The fix is BM25F-style: metadata is a separate field weighted at 0.3, its occurrences add score but not *evidence* — a chunk only counts as a match if a query term appears in its prose — and document frequency is computed from prose only.

## Failure 6: "Which company does Anjo currently work for?" looked answerable

The private work-history file is excluded from retrieval, so this should have been ungrounded. It grounded on a cloud section because of the word *currently*. Temporal framing words — *currently*, *now*, *today*, *recently* — joined the query-stopword list. This one was caught by the evaluation suite's must-not-invent cases, which is the whole reason to have them.

## The vector leg's one important knob

A nearest-neighbour search always returns *something*. The similarity floor, not the search, is what keeps an off-topic question from looking grounded. With the mock embeddings used in tests it also exposed hash collisions at small dimensions — a reminder that test doubles need to be faithful in the property under test.

## What I would tell someone starting the same thing

Write the evaluation cases first, including the questions that must be refused. Probe retrieval with real questions before touching the prompt. And keep the lexical leg: it is cheap, explainable, works offline, and on a corpus like this it is most of the answer.
