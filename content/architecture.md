---
title: "Software Architecture"
slug: architecture
type: architecture
summary: "Architecture patterns Anjo uses: Clean Architecture, Vertical Slice Architecture, Domain-Driven Design, CQRS, and event-driven systems — applied pragmatically, starting simple and adding structure only when the problem demands it."
tags: ["architecture", "clean-architecture", "vertical-slice", "ddd", "cqrs", "event-driven", "solid", "patterns", "design"]
technologies: ["ASP.NET Core", ".NET", "C#", "PostgreSQL"]
related: ["skills", "philosophy", "nova-starter-kit"]
featured: false
visibility: public
updated: 2026-09-20
---

## Approach to architecture

Anjo's approach starts from the principle that architecture should be as simple as the problem allows and only grow more complex when the problem demands it. He is explicit that patterns are not imposed by default: his Asterweave framework, for example, is designed to discover and preserve whatever architecture a repository already has rather than impose Clean Architecture, DDD, CQRS, MVVM, or Redux on it.

## Patterns he uses

- Clean Architecture — separating domain, application, infrastructure, and presentation concerns with dependencies pointing inward. His NovaStarterKit is a .NET 9 Web API starter built around Clean Architecture, CQRS, SOLID, and modular design, and his AlgoJourney and DailyCodeGrind projects apply Clean Architecture and SOLID to C# console applications.
- Vertical Slice Architecture — organising code by feature rather than by technical layer when that keeps changes local and the codebase easy to navigate.
- Domain-Driven Design (DDD) — modelling the core domain explicitly and keeping business rules in the domain layer.
- CQRS — separating command and query responsibilities where read and write models diverge.
- Event-driven systems — decoupling components through events when asynchronous, loosely coupled workflows are a better fit than direct calls.

## Design principles

Across these patterns Anjo applies SOLID principles, dependency inversion, interface-driven design, and loose coupling. Reusable concerns are placed behind interfaces so implementations can be swapped — for instance, this portfolio's retrieval layer is defined by a KnowledgeRetriever interface so the pgvector store can be replaced without rewriting application logic.

## Security and operability in the design

Security, observability, and deployability are treated as architectural concerns from the beginning: trust boundaries are made explicit, secrets are isolated, and systems are built to be deployed to the cloud, containerised with Docker, and monitored in production.
