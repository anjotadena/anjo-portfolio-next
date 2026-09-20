---
title: "AI Engineering & LLMs"
slug: ai-engineering
type: ai-engineering
summary: "How Anjo builds with AI: agentic coding frameworks (Asterweave), Claude Code plugins, retrieval-augmented generation, LLM integration, and AI-assisted development with human validation."
tags: ["ai", "ai-engineering", "llm", "rag", "agentic-ai", "agentic-coding", "claude-code", "openai", "embeddings", "vector-search"]
technologies: ["Claude Code", "OpenAI API", "pgvector", "PostgreSQL", "Node.js", "TypeScript", "Next.js"]
related: ["asterweave", "anjo-ai-portfolio", "reposage", "skills", "philosophy"]
featured: false
visibility: public
updated: 2026-09-20
---

## Positioning

Anjo's position on AI in software engineering is that AI amplifies engineering capability — it does not blindly generate code. AI-assisted output is applied with human validation, not accepted uncritically. He treats requirements, repository context, and tests as the things that make autonomous coding reliable: the model provides capability, the repository provides context, specifications provide intent, and tests provide proof.

## Agentic AI and agentic coding

Anjo's main agentic AI work is Asterweave, an open-source agentic software delivery framework for Claude Code. Asterweave coordinates specialist subagents (repository analysis, requirements challenge, architecture planning, implementation, testing, runtime verification, staff-level code review, security review, and pull-request engineering) through a deterministic delivery graph with human approval gates, bounded retry loops, and an evidence contract that requires real command output rather than model confidence.

Through Asterweave he has worked hands-on with the building blocks of agentic systems: multi-agent orchestration, tool use through the Model Context Protocol (MCP), prompt-injection-safe handling of untrusted remote content, hooks that enforce policy around destructive operations, durable workflow state so sessions can be resumed, and stack detection so agents follow repository-native conventions.

## Retrieval-augmented generation

This portfolio is a working RAG system that Anjo designed and built. Markdown files in the repository are the source of truth; they are parsed, chunked by heading, hashed for incremental re-indexing, embedded with OpenAI embeddings, and stored in PostgreSQL with pgvector. Questions are answered by retrieving the most relevant chunks (hybrid vector and lexical search), building a grounded prompt in which retrieved content is treated strictly as data, streaming the answer from the model, and attaching citations back to the source sections. The assistant is instructed never to invent employers, projects, skills, or dates that are not in the retrieved content.

## LLM integration

Anjo integrates large language models into products through provider APIs (including the OpenAI API), with attention to the production concerns around them: streaming responses, token and cost limits, request timeouts, rate limiting, relevance thresholds, conversation context trimming, structured logging of latency and token usage, and safe failure modes when a provider is unavailable.

## AI-assisted development

Day to day, Anjo uses AI across his engineering workflow: agentic coding, automated code review, user story and architecture analysis, testing assistance, pull request review, pipeline troubleshooting, and developer productivity tooling. His RepoSage project applies the same idea to onboarding — it analyses a repository and generates AI-ready developer context (rules, commands, prompts, and documentation) for codebases that lack documentation.

## Guardrails and evaluation

Anjo's AI work consistently applies guardrails: untrusted content is wrapped and labelled as data rather than instructions, retrieved context is bounded and filtered by relevance, outputs are capped, and grounded behaviour is checked with evaluation cases (retrieval relevance, citation correctness, and "must not invent" scenarios) rather than assumed.
