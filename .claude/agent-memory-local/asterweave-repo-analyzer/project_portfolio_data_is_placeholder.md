---
name: project-portfolio-data-is-placeholder
description: src/app/data/portfolio-data.ts and experience-data.ts contain fabricated/generic content, not Anjo's real work history — critical for any "grounded AI" or content migration work
metadata:
  type: project
---

`src/app/data/portfolio-data.ts` (projects, services, blogPosts, techStack) and `src/app/data/experience-data.ts` (experiences, education, certifications) are template/placeholder content, not verified real facts about Anjo Tadena. Evidence:
- Employers "Tech Innovations Inc.", "Scale Systems", "DataFlow Solutions", "StartupHub" and institution "University of Technology" are generic/fabricated names.
- Every achievement uses round marketing-style metrics (100K+ users, 99.95% uptime, 70% faster deployments) repeated near-identically across projects and experience entries.
- `src/app/pages/BlogPost.tsx` (lines ~88-91) literally states in visible UI copy: "This is a sample blog post... This demonstrates the layout and styling for blog posts in your portfolio."
- `src/app/pages/Experience.tsx` "Download Resume" button (lines 7-16) is a mock: `link.href = "#"`, no real PDF.
- `src/app/components/Footer.tsx` has generic dead social links (`https://github.com`, `https://linkedin.com`, `https://twitter.com`) that contradict the real profile links used elsewhere.
- Only VERIFIED real facts found in the whole src tree: email `tadena.anjo@gmail.com` (Contact.tsx, Footer.tsx), LinkedIn `linkedin.com/in/anjotadena`, GitHub `github.com/anjotadena` (both in Home.tsx).
- ATTRIBUTIONS.md says the Figma Make export originally included Unsplash stock photos, but no image files besides two logo PNGs exist in the repo now.

**Why:** The user's stated goal is a server-side "grounded-retrieval AI chat" that must not launder fabricated employment/project history as fact. Any content migration or AI-grounding work must NOT copy this data forward as real biographical content.

**How to apply:** Before wiring any of this data into "Anjo AI" retrieval/grounding, flag to the user that real employment history, real project case studies, and real bio copy need to be supplied — do not treat portfolio-data.ts/experience-data.ts as ground truth. Services and Blog data can be dropped per the migration goal anyway.
