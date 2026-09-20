import type { ContentDocument } from "@/types/content";
import { parseMarkdownDocument } from "@/lib/knowledge/markdown";

/** Minimal valid frontmatter + body helper for tests. */
export function md(frontmatter: Record<string, unknown>, body: string): string {
  const yaml = Object.entries(frontmatter)
    .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
    .join("\n");
  return `---\n${yaml}\n---\n\n${body.trim()}\n`;
}

export function doc(overrides: Partial<Record<string, unknown>> & { body?: string; path?: string } = {}): ContentDocument {
  const { body, path, ...fm } = overrides;
  const frontmatter = {
    title: "Fixture Document",
    type: "philosophy",
    summary: "A fixture document used in tests to exercise the pipeline.",
    visibility: "public",
    ...fm,
  };
  return parseMarkdownDocument(md(frontmatter, body ?? "## Intro\n\nSome fixture content about testing."), path ?? "content/fixture.md");
}

/** A small but realistic corpus: profile, skills, contact, two projects, one private doc. */
export function fixtureCorpus(): ContentDocument[] {
  return [
    doc({
      title: "About Jane Example",
      slug: "profile",
      type: "profile",
      summary: "Jane Example is a senior software engineer based in Cebu, Philippines.",
      related: ["skills", "contact"],
      profile: {
        name: "Jane Example",
        headline: "Senior Software Engineer",
        location: "Cebu, Philippines",
        email: "jane@example.com",
        githubUrl: "https://github.com/jane",
        linkedInUrl: "https://www.linkedin.com/in/jane/",
        resumeHref: "/resume.pdf",
        availability: "Open to opportunities",
      },
      body: `## Overview

Jane Example is a Senior Software Engineer based in Cebu, Philippines, building cloud systems and AI-powered products.

## Approach

Jane favours simple architecture, automated testing, and security first.`,
      path: "content/profile.md",
    }),
    doc({
      title: "Technical Skills",
      slug: "skills",
      type: "skills",
      summary: "Jane's technical skills grouped by capability: backend, frontend, cloud.",
      technologies: ["C#", "ASP.NET Core", "Angular", "AWS", "Azure"],
      related: ["profile"],
      skillGroups: [
        { id: "backend", title: "Backend", skills: ["C#", "ASP.NET Core"] },
        { id: "frontend", title: "Frontend", skills: ["Angular", "TypeScript"] },
        { id: "cloud", title: "Cloud", skills: ["AWS", "Azure"] },
      ],
      body: `## Backend

Jane's primary backend stack is C# with ASP.NET Core and Entity Framework Core.

## Frontend

On the frontend Jane works with Angular and TypeScript.

## Cloud

Jane has experience with AWS and Azure as cloud platforms.`,
      path: "content/skills.md",
    }),
    doc({
      title: "Contact",
      slug: "contact",
      type: "contact",
      summary: "How to reach Jane Example: email, LinkedIn, GitHub.",
      related: ["profile"],
      body: `## Get in touch

Jane can be reached by email at jane@example.com, on LinkedIn, or on GitHub.`,
      path: "content/contact.md",
    }),
    doc({
      title: "Starweave",
      slug: "starweave",
      type: "project",
      summary: "Starweave is an agentic software delivery framework for coding agents.",
      technologies: ["Node.js", "TypeScript"],
      tags: ["ai", "agentic-ai"],
      featured: true,
      related: ["skills"],
      project: { role: "Creator", status: "active", category: "AI", repoUrl: "https://github.com/jane/starweave" },
      body: `## Overview

Starweave is an agentic software delivery framework that coordinates specialist agents through a deterministic graph.

## Architecture

The delivery graph is a state machine with typed edges and an evidence contract. Workflow state lives in a JSON file and an append-only event ledger so sessions can resume.

## Results

Starweave is open source under the MIT license with published documentation, a plugin marketplace listing, and a getting-started guide.`,
      path: "content/projects/starweave.md",
    }),
    doc({
      title: "Ledger API",
      slug: "ledger-api",
      type: "project",
      summary: "Ledger API is a C# ASP.NET Core service for double-entry bookkeeping.",
      technologies: ["C#", "ASP.NET Core", "PostgreSQL"],
      tags: ["dotnet", "backend"],
      related: ["skills"],
      project: { role: "Lead engineer", status: "archived", category: "Backend" },
      body: `## Overview

Ledger API is a C# and ASP.NET Core service implementing double-entry bookkeeping on PostgreSQL.

## Technologies

The service is written in C# on ASP.NET Core with Entity Framework Core for data access and PostgreSQL as the relational database, deployed in Docker containers.`,
      path: "content/projects/ledger-api.md",
    }),
    doc({
      title: "Secret Plans",
      slug: "secret-plans",
      type: "experience",
      summary: "Private notes that must never be surfaced to visitors or the model.",
      visibility: "private",
      experience: [{ id: "acme", title: "Engineer", company: "Acme Secret Corp", period: "2020" }],
      body: `## Confidential

Jane worked at Acme Secret Corp on the top-secret Kubernetes migration and holds a CKA certification.`,
      path: "content/experience.md",
    }),
  ];
}
