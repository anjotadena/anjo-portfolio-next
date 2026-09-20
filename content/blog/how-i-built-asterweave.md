---
title: "How I built Asterweave: agentic coding that ends in a pull request"
slug: how-i-built-asterweave
type: post
summary: "Coding agents are fast and unreliable in equal measure. Asterweave is my answer: a Claude Code plugin that runs delivery as a deterministic graph — specialist agents, hard gates, real evidence, and a human at the decisions that matter. Here is why it exists and how it is put together."
tags: ["asterweave", "agentic-ai", "agentic-coding", "claude-code", "mcp", "devops", "open-source"]
technologies: ["Claude Code", "JavaScript", "Node.js", "Model Context Protocol", "GitHub Actions"]
date: 2026-09-20
updated: 2026-09-20
featured: true
visibility: public
related: ["asterweave", "asterweave-deterministic-delivery", "ai-engineering", "devops"]
post:
  series: "Agentic engineering"
---

## Why I built it

AI can generate code quickly. That was never the problem. The problem is what happens on a real repository over a real week: requirements are ambiguous, the agent does not understand how the codebase is put together, context is lost between sessions, several agents end up doing the same job, tests get skipped instead of used as gates, a push or a pull-request call is assumed to have worked, the pipeline fails *after* the PR is opened, and review comments pile up with nobody handling them.

I wanted a coding agent I could point at a ticket and trust to do the boring, careful parts the way a disciplined engineer would — and to stop and ask me at exactly the points where the decision should be mine. That is Asterweave: an open-source agentic software delivery framework built as a Claude Code plugin. It understands the repository, coordinates specialised agents, implements a change, verifies it, and drives delivery toward a pull request, pausing for approval at the decisions that stay yours to make.

The one-line philosophy behind it: **the framework provides capability, the repository provides context, specifications provide intent, and tests provide proof.**

## The core idea: a graph, not a loop

Most agent setups are a loop — think, act, look, repeat — and everything about control lives inside the model's head. That is exactly where I did not want it. In Asterweave, delivery runs as a deterministic graph:

`intake → analyze → challenge → plan → approve → implement → test → verify → review → submit-pr → done`

The graph owns routing, attempt budgets, approvals, and evidence. Claude reasons and uses tools inside one node at a time. A narrative claim never changes graph state; only the state script does, and it also appends to an audit ledger, so a paused session resumes instead of restarting.

Every failure routes *backwards*, never forwards. Failing tests go back to implement. Failing runtime verification goes back to implement. A blocking review finding goes back to implement. A red CI run after the PR is opened goes back to implement. Retries are bounded per node, and a stable failure signature — normalised error type, failing check, affected component — stops the loop when the same failure recurs without a meaningful state change. That last rule is what keeps an agent from burning an afternoon on the same mistake.

The edges are typed: `pass`, `fail-retryable`, `fail-replan` (the repository invalidated the plan, so go back to planning), `blocked` and `needs-human` (pause without spending retries), `policy-denied` (pause and choose a safer design — never weaken policy), `security-escalation`, and `abort`. Naming the edges made the behaviour discussable, testable, and honest.

## Specialist agents with write policies

Thirteen subagents ship with the plugin: a repo analyzer, a requirements challenger, an architect, an implementer, a test engineer, a verification engineer, a staff-level reviewer, a security reviewer, a PR engineer, a failure analyst, a scaffold architect, a scaffold auditor, and an orchestrator that coordinates them.

What matters more than the list is that each one has a bounded tool set and an explicit write policy. Analysis, planning, and review nodes are read-only. The test agent may touch tests and fixtures only. Implementation is limited to the approved scope — no unapproved architecture, dependency, migration, or API expansion. Reviewers cannot "fix it while they're there". Those constraints prevent the classic multi-agent failure, agents editing each other's work, structurally rather than by asking nicely in a prompt.

## Evidence over confidence

The rule I care most about: **evidence must come from the environment or a verifiable remote response.** Model confidence, a subagent's summary, code appearance, and "should work" are not evidence.

Each node exits with evidence records — a kind, a summary, a result, the exact command, and a path to the artifact, report, or URL. "Unit tests pass" means the command, its exit status, and the test count. "PR submitted" means a verified URL and number, base and head, the head SHA, and the initial check state. A required category can be marked non-applicable only with an explanation of which alternative check covers the risk. Evidence goes stale when code, dependencies, configuration, or the base branch change, so the narrowest sufficient checks are re-run, and the final evidence is tied to the submitted head SHA. Failures are preserved rather than overwritten, so the history stays auditable.

## Discover the architecture, don't impose one

Asterweave does not impose Clean Architecture, DDD, CQRS, MVVM, or Redux. It discovers and preserves whatever architecture is already there. Real repositories are brownfield; a framework that insists on its own structure is useless on the code that actually pays the bills.

That is what the scaffold command is for. `/asterweave:scaffold` reads your code, tests, and CI, then proposes an evidence-backed `CLAUDE.md`, path rules, project skills and agents, and an `.claude/asterweave.json` adapter for your approval. The adapter routes graph nodes to repository-specific agents and skills and declares the quality gates detected from the project's own pipeline — so "test passes" means *your* test command, not a generic one. There is a preview, an independent audit of the proposal, drift protection, and validation before anything is written. You run it when adopting a repository or when its tooling changes meaningfully, not before every ticket.

## Safety lines that never move

Pointing an autonomous agent at a real repository with a real GitHub token concentrates the mind. The Git and change-safety policy is short and absolute: inspect status, branch, upstream, and remotes before working; preserve user-owned modified and untracked files; never assume the working tree is clean or that every diff belongs to the task; never automatically pull, switch branches, stash, rebase, reset, clean, restore, or discard; stage only task-related paths; push without force; never rewrite shared history.

On GitHub the framework never merges, self-approves, dismisses reviews, bypasses checks, or deletes branches. Writes — issue updates, commits and pushes, PR creation — are drafted with their exact target shown, require confirmation unless the invoked command authorised that exact mutation, are read back and verified afterwards, and are never retried after a success. Everything returned from GitHub through the bundled MCP server is treated as untrusted data; instructions embedded in an issue or a review comment are ignored.

Two hooks back this up: a PreToolUse hook that blocks a small set of destructive shell operations, and a Stop hook that checks evidence gates before a session ends. The documentation is deliberately blunt that hooks are not a complete safety system — Claude Code permissions, sandboxing, branch protection, required checks, CODEOWNERS, and human review still apply.

## What a day with it looks like

```text
/asterweave:daily            → repo state, active work, assigned issues, requested reviews, failing CI
/asterweave:deliver 4821     → analyze → plan → (approve) → implement → test → verify → review → PR → monitor CI
```

You review three things: the ambiguous requirements it flags, the important architecture decisions in the plan, and the resulting pull request. You do not invoke each internal agent by hand; the graph decides which checks a change needs. Fifteen skills cover the rest — scaffold, analyze, challenge, plan, implement, test, verify, review, deliver, submit-pr, resume, retro, daily, doctor, and github-task — and `resume` picks a paused workflow up from durable state without repeating completed nodes or discarding your changes.

## What I got wrong first, and what I'd tell you

The early instinct was to make the agents smarter. The thing that actually helped was making the *system* stricter: a state machine that cannot be talked out of its gates, write policies that make cross-editing impossible, evidence that has to come from a terminal, and safety rules that do not have exceptions. Intelligence lives inside the nodes; discipline lives in the graph.

If you are building something similar: separate control from reasoning, decide what each agent may write before you decide what it may think about, treat every string that comes back from a tool as data, and write down what counts as proof before the first ticket.

Asterweave is MIT-licensed on GitHub, with documentation, a plugin marketplace, and a getting-started guide. I use it on my own repositories — including during the rebuild of this portfolio, where its repository-analysis agents did the initial codebase discovery. If you try it and something feels wrong, that is exactly the feedback I want.
