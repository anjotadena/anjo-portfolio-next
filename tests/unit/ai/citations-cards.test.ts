import { describe, expect, it } from "vitest";
import { chunkDocument } from "@/lib/knowledge/chunker";
import { buildSources, extractCitedIndices, hrefForDocument, sanitizeCitations, toExcerpt } from "@/lib/ai/citations";
import { buildCards } from "@/lib/ai/cards";
import { buildFollowUps, buildSuggestedPrompts } from "@/lib/ai/follow-ups";
import { understandQuery } from "@/lib/ai/query";
import type { KnowledgeResult } from "@/lib/retrieval/types";
import { doc, fixtureCorpus } from "../../fixtures/docs";

const docs = fixtureCorpus();
function results(...slugs: string[]): KnowledgeResult[] {
  return slugs.flatMap((slug) =>
    docs
      .filter((d) => d.slug === slug)
      .flatMap((d) => chunkDocument(d).slice(0, 1))
      .map((chunk) => ({ chunk, score: 0.8, matchedBy: "lexical" as const })),
  );
}

describe("citations", () => {
  it("builds human-readable sources with 1-based indices and no internal ids", () => {
    const sources = buildSources(results("starweave", "skills"));
    expect(sources.map((s) => s.index)).toEqual([1, 2]);
    expect(sources[0]).toMatchObject({ title: "Starweave", section: "Overview", href: "/projects/starweave", type: "project" });
    expect(JSON.stringify(sources)).not.toContain("::");
    expect(sources[0]?.excerpt.length).toBeLessThanOrEqual(281);
  });

  it("maps every document type to a page", () => {
    expect(hrefForDocument("project", "x")).toBe("/projects/x");
    expect(hrefForDocument("skills", "skills")).toBe("/skills");
    expect(hrefForDocument("cloud", "cloud")).toBe("/topics/cloud");
    expect(hrefForDocument("contact", "contact")).toBe("/contact");
  });

  it("extracts distinct cited indices in order", () => {
    expect(extractCitedIndices("A [1] and B [2][1] and C [3].")).toEqual([1, 2, 3]);
  });

  it("removes citation markers that point at sources that were not provided", () => {
    expect(sanitizeCitations("Fact [1]. Fake [7]. Also [2].", 2)).toBe("Fact [1]. Fake . Also [2].");
  });

  it("flattens markdown into an excerpt cut at a word boundary", () => {
    const excerpt = toExcerpt(`## Heading\n\n**Bold** text with \`code\` and a list:\n- one\n- two ${"more ".repeat(100)}`, 80);
    expect(excerpt).not.toMatch(/[#*`]/);
    expect(excerpt.endsWith("…")).toBe(true);
    expect(excerpt.length).toBeLessThanOrEqual(81);
  });
});

describe("understandQuery", () => {
  it("classifies intents", () => {
    expect(understandQuery("How can I contact him?", []).intent).toBe("contact");
    expect(understandQuery("What certifications is he pursuing?", []).intent).toBe("certifications");
    expect(understandQuery("Show me his AI projects", []).intent).toBe("projects");
    expect(understandQuery("What technologies does he use?", []).intent).toBe("skills");
    expect(understandQuery("Who is Anjo?", []).intent).toBe("profile");
    expect(understandQuery("hi there", []).intent).toBe("greeting");
    expect(understandQuery("Tell me about Asterweave", []).intent).toBe("general");
  });

  it("rewrites referential follow-ups with the previous topic", () => {
    const history = [
      { role: "user" as const, content: "Tell me about Starweave" },
      { role: "assistant" as const, content: "Starweave is an agentic framework built on Node.js." },
    ];
    const understood = understandQuery("What were its results?", history);
    expect(understood.isFollowUp).toBe(true);
    expect(understood.retrievalQuery.toLowerCase()).toContain("starweave");
  });

  it("does not treat a fresh, specific question as a follow-up", () => {
    const history = [{ role: "user" as const, content: "Tell me about Starweave" }];
    const understood = understandQuery("What cloud platforms does he use for deployments?", history);
    expect(understood.isFollowUp).toBe(false);
    expect(understood.retrievalQuery).toBe("What cloud platforms does he use for deployments?");
  });
});

describe("buildCards (server-derived, typed)", () => {
  it("returns a ContactCard for contact intent using profile facts", () => {
    const cards = buildCards({ intent: "contact", results: results("contact"), documents: docs });
    expect(cards[0]).toMatchObject({ kind: "contact", email: "jane@example.com", linkedInUrl: "https://www.linkedin.com/in/jane/" });
  });

  it("returns ProjectCards when the top match is a project", () => {
    const cards = buildCards({ intent: "general", results: results("starweave", "skills"), documents: docs });
    expect(cards.map((c) => c.kind)).toEqual(["project"]);
    expect(cards[0]).toMatchObject({ slug: "starweave", href: "/projects/starweave", repoUrl: "https://github.com/jane/starweave" });
  });

  it("does not attach project cards just because a project was retrieved lower down", () => {
    const cards = buildCards({ intent: "general", results: results("skills", "starweave"), documents: docs });
    expect(cards.some((c) => c.kind === "project")).toBe(false);
  });

  it("falls back to featured projects for a projects question with no project hits", () => {
    const cards = buildCards({ intent: "projects", results: results("skills"), documents: docs });
    expect(cards.filter((c) => c.kind === "project").map((c) => (c.kind === "project" ? c.slug : ""))).toEqual(["starweave"]);
  });

  it("never builds a card from a private document", () => {
    const cards = buildCards({ intent: "experience", results: results("skills"), documents: docs });
    expect(cards.some((c) => c.kind === "experience")).toBe(false);
  });
});

describe("follow-ups", () => {
  it("derives related questions from `related` links, never for documents already used", () => {
    const followUps = buildFollowUps(results("starweave"), docs, "Tell me about Starweave");
    expect(followUps.length).toBeGreaterThan(0);
    expect(followUps.length).toBeLessThanOrEqual(3);
    expect(followUps).not.toContain("Tell me more about Starweave");
    expect(followUps).toContain("What are his strongest technical skills?");
  });

  it("generates suggested prompts only for content that exists", () => {
    const prompts = buildSuggestedPrompts(docs);
    expect(prompts).toContain("Tell me about Anjo");
    expect(prompts).toContain("What is Starweave?");
    expect(prompts).toContain("How can I contact him?");
    expect(prompts.some((p) => /Secret/.test(p))).toBe(false);
  });
});

describe("case studies", () => {
  const caseStudy = doc({
    title: "Making Starweave deterministic",
    slug: "starweave-case-study",
    type: "case-study",
    summary: "How Starweave turned a free-form agent into a gated delivery workflow.",
    technologies: ["Node.js"],
    featured: true,
    caseStudy: { outcome: "A gated, resumable delivery workflow.", role: "Creator", highlights: ["Typed graph edges", "Evidence contract"], projectSlug: "starweave" },
    body: "## Problem\n\nAutonomous coding is unreliable when requirements are ambiguous and tests are not gates.\n\n## Results\n\nPublished under MIT with documentation and a marketplace listing for the plugin.",
    path: "content/case-studies/starweave.md",
  });
  const corpus = [...docs, caseStudy];
  const caseStudyResults = () => chunkDocument(caseStudy).slice(0, 1).map((chunk) => ({ chunk, score: 0.9, matchedBy: "lexical" as const }));

  it("validates the caseStudy block and derives reading time", () => {
    expect(caseStudy.caseStudy?.readingMinutes).toBeGreaterThanOrEqual(1);
    expect(() => doc({ type: "case-study", body: "## A\n\nB" })).toThrow(/caseStudy/);
    expect(() => doc({ type: "project", technologies: ["x"], caseStudy: { outcome: "Long enough outcome", role: "r", highlights: ["a", "b"] } })).toThrow(/only allowed on case-study/);
  });

  it("maps case studies to their page and search group", () => {
    expect(hrefForDocument("case-study", "starweave-case-study")).toBe("/case-studies/starweave-case-study");
  });

  it("attaches a CaseStudyCard when a case study is the top match, and links it to the project", () => {
    const cards = buildCards({ intent: "general", results: caseStudyResults(), documents: corpus });
    expect(cards[0]).toMatchObject({ kind: "case-study", slug: "starweave-case-study", projectHref: "/projects/starweave", highlights: ["Typed graph edges", "Evidence contract"] });
  });

  it("adds the linked case study when the visitor asks about the project", () => {
    const cards = buildCards({ intent: "projects", results: results("starweave"), documents: corpus });
    expect(cards.map((card) => card.kind)).toEqual(["project", "case-study"]);
  });

  it("suggests the case study as a follow-up", () => {
    const prompts = buildSuggestedPrompts(corpus);
    expect(prompts.some((prompt) => /Starweave deterministic/.test(prompt))).toBe(true);
  });
});

describe("blog posts", () => {
  const post = doc({
    title: "Grounding a RAG assistant",
    slug: "grounding-rag",
    type: "post",
    summary: "What made retrieval work on a small, terminology-heavy corpus.",
    tags: ["rag", "retrieval"],
    date: "2026-09-21",
    post: { series: "Building" },
    body: "## The setup\n\nThe assistant answers from about eighty Markdown sections; retrieval is hybrid — cosine plus BM25 fused with reciprocal rank fusion.",
    path: "content/blog/grounding-rag.md",
  });
  const corpus = [...docs, post];

  it("requires a date on posts and derives reading time", () => {
    expect(post.post?.readingMinutes).toBe(1);
    expect(post.post?.series).toBe("Building");
    expect(() => doc({ type: "post", body: "## A\n\nB" })).toThrow(/date/);
    expect(() => doc({ type: "project", technologies: ["x"], post: { series: "s" } })).toThrow(/only allowed on post/);
  });

  it("maps posts to /blog and classifies blog questions", () => {
    expect(hrefForDocument("post", "grounding-rag")).toBe("/blog/grounding-rag");
    expect(understandQuery("What has he written about retrieval?", []).intent).toBe("blog");
  });

  it("attaches a PostCard when a post is the top match", () => {
    const results = chunkDocument(post).slice(0, 1).map((chunk) => ({ chunk, score: 0.9, matchedBy: "lexical" as const }));
    const cards = buildCards({ intent: "general", results, documents: corpus });
    expect(cards[0]).toMatchObject({ kind: "post", slug: "grounding-rag", href: "/blog/grounding-rag", date: "2026-09-21", readingMinutes: 1 });
  });
});
