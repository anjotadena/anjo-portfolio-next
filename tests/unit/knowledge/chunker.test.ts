import { describe, expect, it } from "vitest";
import { chunkDocument, chunkEmbeddingText, hashChunkPayload, slugifyHeading } from "@/lib/knowledge/chunker";
import { doc } from "../../fixtures/docs";

const body = `Intro paragraph before any heading, long enough to be its own chunk because it says useful things.

## Overview

Asterweave is an agentic software delivery framework. It coordinates specialist agents through a deterministic graph and pauses for approval.

## Architecture

### Delivery graph

A state machine with typed edges. Failures route back to implementation rather than forward, and retries are bounded by per-node attempt budgets.

### Agents

Thirteen specialist subagents, each with a bounded tool set and an explicit write policy, cover analysis, planning, implementation, testing, and review.

## Technologies

JS, Node.

## Results

Open source under the MIT license with published documentation, a plugin marketplace listing, and a getting-started guide for installation.`;

describe("chunkDocument", () => {
  it("creates heading-aware chunks with breadcrumbs and deterministic ids", () => {
    const chunks = chunkDocument(doc({ slug: "asterweave", title: "Asterweave", body }));
    const ids = chunks.map((chunk) => chunk.id);
    expect(ids).toEqual([
      "asterweave::intro::0",
      "asterweave::overview::0",
      "asterweave::architecture-delivery-graph::0",
      "asterweave::architecture-agents::0",
      "asterweave::results::0",
    ]);
    expect(chunks[2]?.headingPath).toEqual(["Architecture", "Delivery graph"]);
    expect(chunks[2]?.section).toBe("Delivery graph");
    expect(chunks.map((chunk) => chunk.chunkIndex)).toEqual([0, 1, 2, 3, 4]);
  });

  it("merges tiny sections into the preceding chunk instead of embedding fragments", () => {
    const chunks = chunkDocument(doc({ slug: "asterweave", title: "Asterweave", body }));
    const agents = chunks.find((chunk) => chunk.section === "Agents");
    expect(agents?.text).toContain("**Technologies**\nJS, Node.");
    expect(chunks.some((chunk) => chunk.section === "Technologies")).toBe(false);
    for (const chunk of chunks) expect(chunk.text.length).toBeGreaterThanOrEqual(60);
  });

  it("is deterministic: identical input yields identical ids and hashes", () => {
    const a = chunkDocument(doc({ slug: "x", body }));
    const b = chunkDocument(doc({ slug: "x", body }));
    expect(a.map((c) => [c.id, c.contentHash])).toEqual(b.map((c) => [c.id, c.contentHash]));
  });

  it("changes only the edited chunk's hash", () => {
    const before = chunkDocument(doc({ slug: "x", body }));
    const after = chunkDocument(doc({ slug: "x", body: body.replace("under the MIT license", "under the Apache license") }));
    expect(after.map((c) => c.id)).toEqual(before.map((c) => c.id));
    const changed = after.filter((chunk, i) => chunk.contentHash !== before[i]?.contentHash);
    expect(changed.map((c) => c.id)).toEqual(["x::results::0"]);
  });

  it("splits oversized sections at paragraph boundaries without dropping text", () => {
    const paragraphs = Array.from({ length: 12 }, (_, i) => `Paragraph ${i} ${"lorem ipsum dolor sit amet ".repeat(12)}`.trim());
    const longBody = `## Big\n\n${paragraphs.join("\n\n")}`;
    const chunks = chunkDocument(doc({ slug: "big", body: longBody }), { maxChars: 900 });
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.map((c) => c.id)).toEqual(chunks.map((_, i) => `big::big::${i}`));
    for (const chunk of chunks) expect(chunk.text.length).toBeLessThanOrEqual(900);
    const joined = chunks.map((c) => c.text).join("\n\n");
    for (const paragraph of paragraphs) expect(joined).toContain(paragraph);
  });

  it("ignores headings inside fenced code blocks", () => {
    const codeBody = "## Real\n\nText before code that is long enough to stand alone as a chunk of content.\n\n```md\n## Not a heading\n```\n\nAfter.";
    const chunks = chunkDocument(doc({ slug: "code", body: codeBody }));
    expect(chunks).toHaveLength(1);
    expect(chunks[0]?.text).toContain("## Not a heading");
  });

  it("carries document metadata (type, tags, visibility) onto every chunk", () => {
    const chunks = chunkDocument(doc({ slug: "p", type: "project", technologies: ["C#"], tags: ["ai"], visibility: "private", body }));
    for (const chunk of chunks) {
      expect(chunk.type).toBe("project");
      expect(chunk.tags).toEqual(["ai"]);
      expect(chunk.visibility).toBe("private");
    }
  });
});

describe("helpers", () => {
  it("slugifies headings", () => {
    expect(slugifyHeading("Key Challenges & Results")).toBe("key-challenges-and-results");
    expect(slugifyHeading("!!!")).toBe("section");
  });

  it("hashes title + heading path + text with SHA-256", () => {
    const hash = hashChunkPayload("T", ["A", "B"], "text");
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
    expect(hashChunkPayload("T", ["A"], "text")).not.toBe(hash);
  });

  it("prefixes embedding text with the breadcrumb", () => {
    const [chunk] = chunkDocument(doc({ slug: "x", title: "Doc", body: "## Section\n\nBody text that is long enough to count as a chunk on its own." }));
    expect(chunkEmbeddingText(chunk!)).toMatch(/^Doc > Section\n\n/);
  });
});
