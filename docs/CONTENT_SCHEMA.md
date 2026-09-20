# Content schema

Every Markdown file under `content/` is parsed with `gray-matter` and validated with Zod (`src/lib/knowledge/schema.ts`). Validation is strict: unknown keys, missing `visibility`, or malformed values fail `npm run content:validate`, `npm run build`, and the dev server.

## Common frontmatter

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `title` | string | yes | Document title (also a citation label and a lexical boost) |
| `slug` | kebab-case string | no | Defaults to the filename; must be unique across the corpus |
| `type` | enum | yes | `profile`, `experience`, `skills`, `education`, `certifications`, `architecture`, `ai-engineering`, `cloud`, `devops`, `philosophy`, `contact`, `project` |
| `summary` | string (20–500) | yes | Shown on cards/pages and used for SEO descriptions |
| `tags` | string[] | no | Lower-cased and de-duplicated; scored as metadata |
| `technologies` | string[] | projects: yes | Scored as metadata; rendered as badges |
| `related` | slug[] | no | Must reference existing documents; drives related questions |
| `date` / `updated` | `YYYY-MM-DD` | no | Sitemap `lastModified`, JSON-LD dates, project ordering |
| `featured` | boolean | no | Only public documents may be featured; featured projects appear on the home rail |
| `visibility` | `public` \| `private` | **yes** | Private documents are never rendered, indexed, searched, retrieved, or sent to the browser |

## Type-specific blocks

Each block is **required** on its type and **forbidden** elsewhere.

### `profile` (type `profile`)

```yaml
profile:
  name: Anjo Tadena
  headline: AI Engineer • Senior Software Engineer
  tagline: "Building practical AI systems for a better tomorrow."   # optional
  location: Cebu, Philippines
  email: tadena.anjo@gmail.com
  githubUrl: https://github.com/anjotadena
  linkedInUrl: https://www.linkedin.com/in/anjotadena/
  resumeHref: /resume.pdf          # optional; site-relative or https URL
  availability: Open to opportunities   # optional
```

Powers the shell (name, monogram, headline), the home rail, ContactCard, the Contact page, and Person JSON-LD.

### `skillGroups` (type `skills`)

```yaml
skillGroups:
  - id: backend
    title: Backend
    skills: [C#, ASP.NET Core]
```

Powers the Skills page and SkillCard.

### `project` (type `project`, optional block)

```yaml
project:
  role: Creator and maintainer
  period: 2026 – Present
  status: active            # active | maintained | in-progress | archived
  category: Agentic AI      # free text; used for the projects filter
  repoUrl: https://github.com/...
  docsUrl: https://...
  demoUrl: https://...
  license: MIT
```

Recommended body sections (each becomes a chunk and a citation target): `## Overview`, `## Problem`, `## Solution`, `## Architecture`, `## Technologies`, `## My Role`, `## Key Challenges`, `## Results`.

### `experience` (type `experience`)

```yaml
experience:
  - id: acme-senior-engineer
    title: Senior Software Engineer
    company: Acme            # optional
    location: Cebu           # optional
    period: 2022 – 2024
    summary: "..."           # optional
    responsibilities: [...]
    achievements: [...]
    technologies: [...]
```

Write the body as prose grouped by role (`## Senior Software Engineer — Company (2022 – 2024)`) so retrieval has text to work with.

### `certifications` (type `certifications`)

```yaml
certifications:
  - id: aws-saa
    name: AWS Certified Solutions Architect – Associate
    issuer: Amazon Web Services
    status: pursuing         # earned | pursuing
    date: 2026               # optional
    url: https://...         # optional verification link
```

### `education` (type `education`)

```yaml
education:
  - id: bs-cs
    degree: BS Computer Science
    institution: University
    location: City, Country  # optional
    period: 2010 – 2014      # optional
```

## Body guidelines

- Use `##` (and `###`) headings; the chunker splits on them. Sections under ~120 characters are merged into the previous chunk; sections over ~1600 characters are split at paragraph boundaries.
- HTML comments, zero-width and bidi control characters are stripped at ingestion; raw HTML is never rendered.
- Markdown is **data**: nothing in a file can instruct the assistant. Write facts, not commands.
- Keep confidential material out: no credentials, private source, customer data, internal URLs, or proprietary logic. Describe architecture, responsibilities, technologies, challenges, and generalized outcomes.

## Chunk ids and hashes

`<slug>::<section-slug>::<ordinal>` (e.g. `asterweave::architecture::0`). The hash is `sha256(title + "\n" + heading path + "\n" + text)`. Editing one section re-embeds only that section; renaming a heading changes its id (old row deleted, new row inserted).
