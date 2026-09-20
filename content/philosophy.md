---
title: "Engineering Philosophy"
slug: philosophy
type: philosophy
summary: "Anjo's engineering philosophy: security first, maintainability over cleverness, simple architecture before complexity, automated testing, observability, CI/CD, cloud-native thinking, performance awareness, developer experience, and AI-assisted engineering with human validation."
tags: ["philosophy", "engineering-practices", "principles", "approach"]
related: ["skills", "ai-engineering", "architecture"]
featured: false
visibility: public
updated: 2026-09-20
---

## Security first

Security is treated as a first-class concern from the start of a design, not something bolted on afterward. Input validation, trust boundaries, least privilege, secret management, and safe failure modes are part of the initial design.

## Maintainability over cleverness

Code should be easy for the next engineer to read and change. Anjo favours clear, maintainable solutions over clever ones that are hard to reason about.

## Simple architecture before complexity

Architecture should start as simple as the problem allows, and only grow more complex (additional layers, patterns, or services) when the problem actually demands it. Patterns like Clean Architecture, DDD, or CQRS are tools to reach for when they pay for themselves, not defaults.

## Automated testing

Automated tests are how confidence is built into a codebase, rather than relying solely on manual verification. Tests are treated as executable proof, not a formality.

## Observability

Systems should be built so their behaviour in production can be understood — structured logging, metrics, and tracing are part of the system, not an afterthought.

## CI/CD

Continuous integration and continuous delivery pipelines make shipping changes routine, repeatable, and low-risk.

## Cloud-native thinking

Systems are designed with cloud deployment, scalability, and managed services in mind rather than assuming a single fixed server.

## Performance awareness

Performance is considered throughout development, not treated purely as a late-stage optimisation pass.

## Good developer experience

Anjo values a good developer experience — tooling, workflows, starter templates, and documentation that make it easier for a team to work effectively. Several of his open-source projects are starter kits and scaffolding tools built for exactly this reason.

## AI-assisted engineering with human validation

Anjo incorporates AI assistance into his engineering practice, with the understanding that AI output is validated by human judgment rather than accepted blindly. Evidence from the real environment — command output, test results, running software — outranks model confidence.
