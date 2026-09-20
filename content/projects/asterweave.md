---
title: "Asterweave"
slug: asterweave
type: project
summary: "An open-source agentic software delivery framework for Claude Code that understands a repository, coordinates specialist agents through a deterministic delivery graph, implements and verifies a change, and drives it to a reviewed pull request — pausing for human approval at the decisions that matter."
tags: ["ai", "agentic-ai", "agentic-coding", "claude-code", "mcp", "multi-agent", "devops", "github", "open-source", "software-engineering"]
technologies: ["Claude Code", "JavaScript", "Node.js", "Model Context Protocol", "GitHub MCP", "GitHub Actions"]
date: 2026-08-10
updated: 2026-09-20
featured: true
visibility: public
related: ["ai-engineering", "devops", "architecture", "reposage"]
project:
  role: "Creator and maintainer"
  period: "2026 – Present"
  status: "active"
  category: "Agentic AI"
  repoUrl: "https://github.com/anjotadena/asterweave"
  docsUrl: "https://anjotadena.github.io/asterweave/"
  demoUrl: "https://asterweave.vercel.app"
  license: "MIT"
---

## Overview

Asterweave is an open-source, MIT-licensed agentic software delivery framework built as a Claude Code plugin. It understands a repository, coordinates specialised agents, implements a change, verifies it, and drives delivery toward a pull request — pausing for the developer's approval at the decisions that stay theirs to make. It is published under the "AT Digital Labs" marketplace name and installed with `/plugin install asterweave@at-digital-labs`.

Asterweave does not impose Clean Architecture, DDD, CQRS, MVVM, or Redux. It discovers and preserves whatever architecture is already in the repository.

## Problem

AI can generate code quickly, but autonomous coding becomes unreliable when requirements are ambiguous, agents do not understand the repository, context is lost between sessions, multiple agents duplicate responsibilities, tests are not used as gates, external writes are assumed to succeed, pipelines fail after the PR is created, or review comments pile up unhandled. Asterweave's premise is that the framework provides capability, the repository provides context, specifications provide intent, and tests provide proof.

## Solution

Delivery runs as a deterministic graph rather than a free-form agent loop: intake → analyze → challenge → plan → human approval → implement → test → runtime verify → code and security review → submit PR → monitor pipeline → resolve review comments → update work item → report. Every failure routes back to implementation rather than forward, retries are bounded, and a stable failure signature stops the loop when the same failure recurs without a meaningful state change.

Asterweave never merges, self-approves, dismisses reviews, bypasses checks, or deletes branches. GitHub writes require explicit confirmation unless the invoked command authorised that exact mutation.

## Architecture

- Delivery graph — a state machine with typed edges (pass, fail-retryable, fail-replan, blocked, needs-human, policy-denied, security-escalation, abort). State lives in a JSON file and an append-only event ledger, updated only through a state script, so a session can be resumed rather than restarted.
- Specialist subagents — repo-analyzer, requirements-challenger, architect, implementer, test-engineer, verification-engineer, staff-reviewer, security-reviewer, pr-engineer, failure-analyst, scaffold-architect, scaffold-auditor, and an orchestrator, each with a bounded tool set and write policy (for example, reviewers are read-only).
- Skills — user-invocable commands such as scaffold, analyze, challenge, plan, implement, test, verify, review, deliver, submit-pr, resume, retro, daily, doctor, and github-task.
- Evidence contract — every gate requires evidence from the environment (exact commands, exit status, test counts, URLs, diffs), not model confidence or a subagent's summary.
- Repository adapter — a `.claude/asterweave.json` file that routes graph nodes to repository-specific agents and skills and declares required quality gates detected from the project's own CI.
- Hooks — a PreToolUse hook that blocks destructive shell operations and a Stop hook that checks evidence gates before a session ends.
- GitHub integration — the GitHub remote MCP endpoint with the default, actions, code security, and secret protection toolsets, treating all returned content as untrusted data.
- Stack detection — scripts that detect the repository's stack and load stack-specific rules so agents follow repository-native conventions.

## Technologies

Asterweave is written in JavaScript for Node.js as a Claude Code plugin: Markdown agent and skill definitions, JSON schemas for the adapter, stack profile, scaffold blueprint, and workflow state, Node scripts for state management, stack detection, scaffolding, test running, and hooks, and the Model Context Protocol for GitHub access. Documentation is built and published with GitHub Actions to GitHub Pages, with a companion site on Vercel.

## My Role

Anjo is the creator and maintainer of Asterweave. He designed the delivery graph, the evidence contract, the agent and skill catalogue, the safety policies around Git and GitHub writes, and the repository scaffolding workflow.

## Key Challenges

- Making multi-agent delivery deterministic: separating what the graph controls (routing, attempt budgets, approvals, evidence) from what the model reasons about inside a single node.
- Treating remote content as untrusted: issue and PR text fetched through MCP can contain prompt injection, so it is handled as data and never as instructions.
- Preserving user work: the framework must never assume a clean working tree, and must never pull, stash, rebase, reset, or discard on its own.
- Keeping evidence honest: gates require reproducible command output, and failure history is preserved rather than overwritten.

## Results

Asterweave is publicly available on GitHub under the MIT license with published documentation, a plugin marketplace, and a getting-started guide. It is actively used by Anjo on his own repositories, including the development of this portfolio.
