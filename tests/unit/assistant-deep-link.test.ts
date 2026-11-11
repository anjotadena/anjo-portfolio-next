import { describe, expect, it } from "vitest";
import { askHref, parseAssistantDeepLink } from "@/components/assistant/deep-link";

describe("assistant deep links", () => {
  it("returns null when no assistant parameter is present", () => {
    expect(parseAssistantDeepLink(new URLSearchParams("source=pwa"))).toBeNull();
  });

  it("decodes punctuation and non-ASCII characters exactly once", () => {
    const question = "What's Asterweave — and does it use C#/.NET? (100% honest) ¿Sí?";
    const link = parseAssistantDeepLink(new URLSearchParams(askHref(question).split("?")[1]));
    expect(link?.ask).toBe(question);
    expect(link?.open).toBe(true);
  });

  it("strips only the assistant parameters and keeps the rest", () => {
    const link = parseAssistantDeepLink(new URLSearchParams("source=pwa&ask=Hi%20there&utm=x"));
    expect(link?.ask).toBe("Hi there");
    expect(link?.remainingQuery).toBe("?source=pwa&utm=x");
  });

  it("opens without a question for ?assistant=open and blank questions", () => {
    expect(parseAssistantDeepLink(new URLSearchParams("assistant=open"))).toEqual({ ask: null, open: true, remainingQuery: "" });
    expect(parseAssistantDeepLink(new URLSearchParams("ask=%20%20"))?.ask).toBeNull();
  });
});
