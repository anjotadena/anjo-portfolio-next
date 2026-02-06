export const architectureContent = {
  title: "Architecture",
  content: [
    "Architecture principles:",
    "- Stable primitives and explicit trade-offs",
    "- Scalable systems that are easy to operate, easy to change, and hard to misuse",
    "",
    "Design principles:",
    "- Boundaries first: clear ownership, clear contracts",
    "- Observability is a feature, not an afterthought",
    "- Prefer boring tech that scales with teams",
    "- Optimize for failure modes and recovery paths",
    "",
    "Common system patterns:",
    "- CQRS-style read models for search-heavy UX",
    "- Event-driven workflows for long-running processes",
    "- Idempotent handlers and retry-safe operations",
    "- Caching with explicit invalidation strategy",
  ].join("\n"),
} as const;

