import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ChatMessageItem } from "@/components/chat/chat-message";
import { Markdown, linkifyCitations, safeUrlTransform } from "@/components/markdown/markdown";
import type { ChatUiMessage } from "@/components/chat/chat-types";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }), usePathname: () => "/" }));

const meta: ChatUiMessage["meta"] = {
  requestId: "r1",
  mode: "live",
  grounded: true,
  sources: [
    { index: 1, documentSlug: "asterweave", title: "Asterweave", section: "Overview", type: "project", href: "/projects/asterweave", excerpt: "Asterweave is…" },
    { index: 2, documentSlug: "skills", title: "Technical Skills", section: "Backend", type: "skills", href: "/skills", excerpt: "C# and ASP.NET Core" },
  ],
  cards: [
    {
      kind: "project",
      slug: "asterweave",
      title: "Asterweave",
      summary: "An agentic delivery framework.",
      technologies: ["Node.js"],
      tags: ["ai"],
      category: "Agentic AI",
      status: "active",
      href: "/projects/asterweave",
      repoUrl: "https://github.com/anjotadena/asterweave",
      demoUrl: null,
      featured: true,
    },
  ],
  followUps: ["What is his DevOps experience?"],
};

function assistant(overrides: Partial<ChatUiMessage> = {}): ChatUiMessage {
  return {
    id: "a1",
    role: "assistant",
    content: "Asterweave is an agentic framework [1]. He also uses ASP.NET Core [2].",
    status: "complete",
    createdAt: Date.now(),
    meta,
    question: "Tell me about Asterweave",
    ...overrides,
  };
}

const noop = () => {};

describe("ChatMessageItem", () => {
  it("renders citation chips that open the matching source", () => {
    const onOpenSource = vi.fn();
    render(
      <ol>
        <ChatMessageItem message={assistant()} assistantInitials="AT" isLast onFollowUp={noop} onRetry={noop} onOpenSource={onOpenSource} />
      </ol>,
    );
    const chip = screen.getByRole("button", { name: "Source 1: Asterweave — Overview" });
    fireEvent.click(chip);
    expect(onOpenSource).toHaveBeenCalledWith(expect.objectContaining({ id: "a1" }), 1);
  });

  it("renders the project card, sources, and follow-ups after completion", () => {
    const onFollowUp = vi.fn();
    render(
      <ol>
        <ChatMessageItem message={assistant()} assistantInitials="AT" isLast onFollowUp={onFollowUp} onRetry={noop} onOpenSource={noop} />
      </ol>,
    );
    expect(screen.getByRole("article", { name: "Project: Asterweave" })).toBeInTheDocument();
    expect(screen.getByRole("list", { name: "Sources" })).toHaveTextContent("Technical Skills");
    fireEvent.click(screen.getByRole("button", { name: "What is his DevOps experience?" }));
    expect(onFollowUp).toHaveBeenCalledWith("What is his DevOps experience?");
  });

  it("shows the typing indicator while streaming with no content, and no actions", () => {
    render(
      <ol>
        <ChatMessageItem message={assistant({ content: "", status: "streaming", meta: undefined })} assistantInitials="AT" isLast onFollowUp={noop} onRetry={noop} onOpenSource={noop} />
      </ol>,
    );
    expect(screen.queryByRole("button", { name: "Copy answer" })).not.toBeInTheDocument();
    expect(document.querySelector("[aria-busy='true']")).toBeInTheDocument();
  });

  it("offers a retry on error", () => {
    const onRetry = vi.fn();
    render(
      <ol>
        <ChatMessageItem message={assistant({ status: "error", errorMessage: "Boom", meta: undefined })} assistantInitials="AT" isLast onFollowUp={noop} onRetry={onRetry} onOpenSource={noop} />
      </ol>,
    );
    expect(screen.getByText("Boom")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(onRetry).toHaveBeenCalledWith("a1");
  });

  it("renders the visitor bubble as plain text", () => {
    render(
      <ol>
        <ChatMessageItem message={{ id: "u1", role: "user", content: "<b>hi</b> [1]", status: "complete", createdAt: 0 }} assistantInitials="AT" isLast={false} onFollowUp={noop} onRetry={noop} onOpenSource={noop} />
      </ol>,
    );
    expect(screen.getByText("<b>hi</b> [1]")).toBeInTheDocument();
    expect(document.querySelector("b")).toBeNull();
  });
});

describe("Markdown renderer security", () => {
  it("never renders raw HTML, images, or javascript: links", () => {
    const { container } = render(
      <Markdown
        content={[
          "<script>alert(1)</script>",
          "Inline <img src=x onerror=alert(1)> html",
          "![alt](https://x/y.png)",
          "[click](javascript:alert(1)) [ok](https://example.com) [rel](/projects)",
        ].join("\n\n")}
      />,
    );
    expect(container.querySelector("script")).toBeNull();
    expect(container.querySelector("img")).toBeNull();
    const links = Array.from(container.querySelectorAll("a")).map((a) => a.getAttribute("href"));
    expect(links).not.toContain("javascript:alert(1)");
    expect(links).toContain("https://example.com");
    expect(links).toContain("/projects");
    expect(container.textContent).toContain("alt");
  });

  it("only converts bare [n] markers into citation chips, not inside code", () => {
    expect(linkifyCitations("Fact [1]. `arr[2]` and [3](https://x.y)")).toBe("Fact [1](cite:1). `arr[2]` and [3](https://x.y)");
  });

  it("allows only http(s), mailto, relative, and cite: URLs", () => {
    expect(safeUrlTransform("javascript:alert(1)")).toBe("");
    expect(safeUrlTransform("JaVaScRiPt:alert(1)")).toBe("");
    expect(safeUrlTransform("data:text/html,hi")).toBe("");
    expect(safeUrlTransform("cite:3")).toBe("cite:3");
    expect(safeUrlTransform("cite:evil")).toBe("");
    expect(safeUrlTransform("mailto:a@b.co")).toBe("mailto:a@b.co");
    expect(safeUrlTransform("/about")).toBe("/about");
  });
});
