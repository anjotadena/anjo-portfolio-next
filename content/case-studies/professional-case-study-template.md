---
title: "Professional case study template"
slug: professional-case-study-template
type: case-study
summary: "A private template for writing up professional engagements (for example the Translation Platform or the Church Management System) without disclosing confidential information. Not indexed or displayed until copied and set to public."
tags: ["case-study", "template"]
technologies: ["C#", "ASP.NET Core"]
featured: false
visibility: private
updated: 2026-09-20
related: ["translation-platform", "church-management-system"]
caseStudy:
  outcome: "One sentence on the generalized outcome (no confidential metrics or client names)."
  role: "Your role, e.g. Senior Software Engineer"
  period: "2023 – 2024"
  industry: "e.g. Localization"
  highlights:
    - "A decision or result worth leading with"
    - "Another one — keep to 3–6"
  projectSlug: translation-platform
---

## How to use this template

Copy this file to `content/case-studies/<slug>.md`, fill in every section below, set `visibility: public`, run `npm run content:validate`, then `npm run content:index` and commit the index. Each `##` section becomes a retrievable chunk and a citation target, so keep sections focused.

Describe architecture, responsibilities, technologies, challenges, and generalized outcomes. Never include credentials, private source code, customer data, internal URLs, proprietary business logic, or confidential company information. Name the client only if you are allowed to; otherwise use the industry.

## Context

Who the work was for (or the industry), the team, and your role.

## Problem

What was broken, missing, or too slow — in business terms first, then technical terms.

## Constraints

Time, budget, legacy systems, compliance, team size, or technology mandates.

## Approach

How you tackled it and why that approach over the alternatives.

## Architecture

The shape of the system: services, data stores, integrations, deployment. A short list is fine.

## Key Decisions

Two to five decisions with the trade-off you accepted for each.

## Results

Generalized outcomes: what improved, what shipped, what changed for users or the team.

## Lessons Learned

What you would do again and what you would do differently.
