import { describe, expect, it } from "vitest";
import { chunkDocument } from "@/lib/knowledge/chunker";
import { LexicalRetriever, expandTerms, rankLexically, requiredCoverage, substantiveTerms } from "@/lib/retrieval/lexical";
import { stem, tokenize } from "@/lib/retrieval/tokenize";
import { fixtureCorpus } from "../../fixtures/docs";

const chunks = fixtureCorpus().flatMap((doc) => chunkDocument(doc));
const retriever = new LexicalRetriever(() => chunks);

describe("tokenize / stem", () => {
  it("keeps compound tech tokens and emits their parts", () => {
    expect(tokenize("ASP.NET Core and Node.js")).toEqual(["asp.net", "asp", "net", "core", "and", "node.js", "node", "js"]);
    expect(tokenize("C# and C++")).toEqual(["c#", "and", "c++"]);
    expect(tokenize(".NET")).toEqual(["net"]);
  });

  it("stems plurals lightly", () => {
    expect(stem("projects")).toBe("project");
    expect(stem("technologies")).toBe("technology");
    expect(stem("kubernetes")).toBe("kubernete");
    expect(stem("class")).toBe("class");
    expect(stem("aws")).toBe("aws");
  });
});

describe("query terms", () => {
  it("drops generic question words and framing words", () => {
    expect(substantiveTerms("What is his experience with .NET?")).toEqual(["net"]);
    expect(substantiveTerms("Show me projects using Angular")).toEqual(["project", "angular"]);
    expect(substantiveTerms("Who is Anjo?")).toEqual([]);
  });

  it("expands synonyms at reduced weight", () => {
    const expanded = expandTerms(["net"]);
    expect(expanded[0]).toEqual({ term: "net", weight: 1 });
    expect(expanded.find((t) => t.term === "asp.net")?.weight).toBe(0.4);
  });

  it("requires two terms only for three-plus term queries", () => {
    expect(requiredCoverage(["a"])).toBe(1);
    expect(requiredCoverage(["a", "b"])).toBe(1);
    expect(requiredCoverage(["a", "b", "c"])).toBe(2);
  });
});

describe("LexicalRetriever", () => {
  it("finds the project by name and ranks its overview first", async () => {
    const results = await retriever.search("Tell me about Starweave");
    expect(results[0]?.chunk.documentSlug).toBe("starweave");
    expect(results[0]?.chunk.section).toBe("Overview");
  });

  it("matches .NET against ASP.NET content", async () => {
    const results = await retriever.search("What is her experience with .NET?");
    const slugs = results.map((r) => r.chunk.documentSlug);
    expect(slugs).toContain("skills");
    expect(slugs).toContain("ledger-api");
  });

  it("returns nothing for off-topic questions", async () => {
    expect(await retriever.search("What is the capital of France?")).toEqual([]);
  });

  it("never returns private chunks, even when they are the only match", async () => {
    const results = await retriever.search("Kubernetes CKA certification Acme");
    expect(results).toEqual([]);
    expect(chunks.some((c) => c.visibility === "private" && /Kubernetes/.test(c.text))).toBe(true);
  });

  it("returns profile chunks for greetings", async () => {
    const results = await retriever.search("hello!");
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((r) => r.chunk.type === "profile")).toBe(true);
  });

  it("honours type and slug filters", async () => {
    const byType = await retriever.search("ASP.NET", { types: ["project"] });
    expect(byType.every((r) => r.chunk.type === "project")).toBe(true);
    const bySlug = await retriever.search("ASP.NET", { slugs: ["skills"] });
    expect(bySlug.every((r) => r.chunk.documentSlug === "skills")).toBe(true);
  });

  it("respects the limit and returns normalized scores", async () => {
    expect((await retriever.search("ASP.NET Core", { limit: 10 })).length).toBeGreaterThan(1);
    const results = await retriever.search("ASP.NET Core", { limit: 1 });
    expect(results).toHaveLength(1);
    for (const r of results) {
      expect(r.score).toBeGreaterThan(0);
      expect(r.score).toBeLessThanOrEqual(1);
    }
  });

  it("is deterministic across runs", () => {
    const a = rankLexically("agentic delivery graph", chunks).map((r) => r.chunk.id);
    const b = rankLexically("agentic delivery graph", chunks).map((r) => r.chunk.id);
    expect(a).toEqual(b);
  });
});
