---
title: "DevOps & CI/CD"
slug: devops
type: devops
summary: "Anjo's DevOps experience: Docker-first development, GitHub Actions and Azure DevOps pipelines, CI quality gates, and reusable Docker starter templates."
tags: ["devops", "ci-cd", "docker", "github-actions", "azure-devops", "pipelines", "automation"]
technologies: ["Docker", "Docker Compose", "GitHub Actions", "Azure DevOps"]
related: ["skills", "cloud", "asterweave", "clifoundry"]
featured: false
visibility: public
updated: 2026-09-20
---

## Containers

Anjo uses Docker for both development and deployment. Several of his open-source projects are explicitly Docker-first: CLIFoundry is a Docker-first Python CLI starter template, Wordock is a containerised WordPress starter, and he maintains a Laravel Docker workflow template. This portfolio ships a multi-stage production Dockerfile with a non-root runtime user and a Docker Compose file for local PostgreSQL with pgvector.

## CI/CD pipelines

Anjo builds pipelines with GitHub Actions and Azure DevOps. His pipelines treat type checking, linting, tests, content validation, builds, and dependency audits as gates that must pass before a change can merge, and production deployments happen only from the configured production branch or release workflow. Continuous integration and delivery are, in his view, what make shipping changes routine, repeatable, and low-risk.

## Automation and agent-driven delivery

Asterweave extends DevOps practice into agent-driven delivery: it runs repository-native quality gates, monitors the CI pipeline after a pull request is opened, routes failures back to implementation, and handles review comments — without ever merging, self-approving, or bypassing branch protections. Pipeline troubleshooting is also one of the areas where Anjo applies AI assistance day to day.
