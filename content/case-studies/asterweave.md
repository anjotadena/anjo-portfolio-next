---
title: "Making agentic delivery deterministic with Asterweave"
slug: asterweave-deterministic-delivery
type: case-study
summary: "Why autonomous coding agents become unreliable on real repositories, and how Asterweave answers that with a deterministic delivery graph, specialist agents with bounded write policies, an evidence contract, and hard safety rules around Git and GitHub."
tags: ["case-study", "ai", "agentic-ai", "agentic-coding", "claude-code", "mcp", "devops", "open-source"]
technologies: ["Claude Code", "JavaScript", "Node.js", "Model Context Protocol", "GitHub Actions"]
date: 2026-08-10
updated: 2026-09-20
featured: true
visibility: public
related: ["asterweave", "ai-engineering", "devops"]
caseStudy:
  outcome: "An open-source framework that turns a free-form coding agent into a gated, resumable, evidence-backed delivery workflow."
  role: "Creator and maintainer"
  period: "2026 – present"
  highlights:
    - "A deterministic graph (intake → analyze → challenge → plan → approve → implement → test → verify → review → submit PR) owns routing, retries, approvals, and evidence"
    - "Thirteen specialist subagents with explicit tool sets and write policies; reviewers are read-only"
    - "An evidence contract: gates pass only on real command output, diffs, or verified remote responses — never on model confidence"
    - "Never merges, self-approves, dismisses reviews, bypasses checks, or deletes branches; GitHub writes require confirmation"
    - "Published under MIT with documentation, a plugin marketplace, and a scaffolding command that adopts a repository's own conventions"
  projectSlug: asterweave
---

## Context

Asterweave is an open-source agentic software delivery framework built as a Claude Code plugin and published under the "AT Digital Labs" marketplace name. It understands a repository, coordinates specialised agents, implements a change, verifies it, and drives delivery toward a pull request — pausing for the developer's approval at the decisions that stay theirs to make.

This case study is drawn from the project's public documentation and plugin sources; it describes the design problem and the choices made, not private customer work.

## Problem

AI can generate code quickly. Autonomous coding becomes unreliable when requirements are ambiguous, agents do not understand the repository, context is lost between sessions, multiple agents duplicate responsibilities, tests are not used as gates, external writes are assumed to succeed, pipelines fail after the pull request is created, or review comments pile up unhandled.

The framing Asterweave adopts is a division of responsibility: the framework provides capability, the repository provides context, specifications provide intent, and tests provide proof.

## Constraints

- It must not impose an architecture. Real repositories already have conventions — Clean Architecture, DDD, CQRS, MVVM, Redux, or none of them — and the framework has to discover and preserve what is there.
- It must be safe to point at a real repository with a developer's real GitHub token: no destructive Git operations, no unreviewed writes, no merges.
- Work must survive a session ending: a paused workflow should resume, not restart.
- Everything the agents claim must be checkable.

## Approach

Delivery runs as a deterministic graph rather than a free-form agent loop:

`intake → analyze → challenge → plan → approve → implement → test → verify → review → submit-pr → done`

The graph owns routing, attempt budgets, approvals, and evidence; the model reasons and uses tools inside one node at a time. A narrative claim never changes graph state — only the state script does, and it also appends to an audit ledger. Every failure routes back to implementation rather than forward: failing tests, failing runtime verification, blocking review findings, and failing CI all return to the implement node, with bounded retries and a stable failure signature that stops the loop when the same failure recurs without a meaningful state change.

Human approval is a first-class node. Delivery pauses after the plan, and again before push and pull-request creation unless the command was invoked with an explicit auto flag.

## Architecture

- **Typed edges.** `pass`, `fail-retryable`, `fail-replan`, `blocked`/`needs-human`, `policy-denied`, `security-escalation`, and `abort` each have defined routing; a policy denial never weakens policy, it pauses for a safer design or authorised human action.
- **Specialist subagents.** Repo analyzer, requirements challenger, architect, implementer, test engineer, verification engineer, staff reviewer, security reviewer, PR engineer, failure analyst, scaffold architect, scaffold auditor, and an orchestrator. Each has a bounded tool set and a write policy: analysis, planning, and review nodes are read-only; the test agent may touch tests and fixtures only; implementation is limited to the approved scope.
- **Evidence contract.** Each node exits with evidence records — kind, summary, result, exact command, and an artifact path — and a required category can be marked non-applicable only with an explanation of which alternative check covers the risk. Evidence goes stale when code, dependencies, configuration, or the base branch change, and final evidence is tied to the submitted head SHA.
- **Repository adapter and scaffolding.** A `.claude/asterweave.json` file routes graph nodes to repository-specific agents and skills and declares required quality gates detected from the project's own CI. The scaffold command reads code, tests, and CI, then proposes an evidence-backed `CLAUDE.md`, path rules, and adapter for approval, with drift protection and an independent audit step.
- **Hooks.** A PreToolUse hook blocks a set of destructive shell operations; a Stop hook checks evidence gates before a session ends. The documentation is explicit that hooks are not a complete safety system and that permissions, sandboxing, branch protection, required checks, CODEOWNERS, and human review still apply.
- **GitHub through MCP.** The bundled GitHub remote MCP endpoint is used with narrow toolsets; returned content is treated as untrusted data, writes are drafted and confirmed, mutations are read back and verified, and non-idempotent calls are never retried after success.

## Key Decisions

- **Discover, don't impose.** The framework adapts to the repository's architecture and tooling instead of prescribing them; that is what makes it usable on brownfield code.
- **The graph decides which checks a change needs.** Developers run a single delivery command and review three things: the ambiguities the framework flags, the important architecture decisions in the plan, and the resulting pull request — rather than invoking every internal agent by hand.
- **Evidence over confidence.** "Should work", code appearance, and subagent summaries are explicitly not evidence. This is the rule that keeps the retry loops honest.
- **Hard safety lines.** Never merge, self-approve, dismiss reviews, bypass checks, or delete branches; never pull, switch, stash, rebase, reset, clean, or discard on the developer's behalf; preserve user-owned modified files.

## Results

- Publicly available on GitHub under the MIT license, with a documentation site, a getting-started guide, a daily-workflow guide and cheat sheet, and a plugin marketplace installation path.
- Fifteen user-invocable skills (scaffold, analyze, challenge, plan, implement, test, verify, review, deliver, submit-pr, resume, retro, daily, doctor, github-task) and thirteen specialist agents ship with the plugin.
- Used by Anjo on his own repositories; its repository-analysis agents were used during the initial discovery for this portfolio's rebuild.

## Lessons Learned

- **Separate control from reasoning.** Letting a state machine own routing, budgets, and approvals — while the model reasons only inside a node — is what makes multi-agent delivery predictable and resumable.
- **Write policies matter as much as prompts.** Read-only reviewers and scope-limited implementers prevent the "agents editing each other's work" failure mode structurally rather than by instruction.
- **Treat every remote string as data.** Issue and pull-request text fetched through tools is a prompt-injection surface and is handled accordingly.
