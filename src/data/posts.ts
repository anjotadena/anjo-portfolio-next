export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  date: string; // ISO yyyy-mm-dd
};

export const posts: Post[] = [
  {
    slug: "boring-architecture-wins",
    title: "Boring Architecture Wins",
    excerpt:
      "Why explicit boundaries, predictable primitives, and observability outperform clever designs in real teams.",
    date: "2026-01-12",
  },
  {
    slug: "code-reviews-as-leadership",
    title: "Code Reviews as Leadership",
    excerpt:
      "A practical approach to reviews that improves quality without slowing teams down.",
    date: "2025-11-03",
  },
  {
    slug: "shipping-with-confidence",
    title: "Shipping With Confidence",
    excerpt:
      "A lightweight checklist for production readiness: failure modes, metrics, and operational ownership.",
    date: "2025-09-18",
  },
];

