import type { Page, Request } from "@playwright/test";
import { expect, test } from "./fixtures";

const launcher = (page: Page) => page.getByTestId("assistant-launcher");
const panel = (page: Page) => page.getByTestId("assistant-panel");
const composer = (page: Page) => panel(page).getByLabel("Your question");

async function openAssistant(page: Page) {
  // The launcher becomes interactive after hydration; retry the click briefly.
  await expect(async () => {
    await launcher(page).click();
    await expect(panel(page)).toBeVisible({ timeout: 1_000 });
  }).toPass({ timeout: 10_000 });
}

/** Minimise: the launcher on desktop; the sheet's own close control on phones (the sheet covers the launcher). */
async function minimise(page: Page) {
  await panel(page).getByRole("button", { name: /^(Minimize|Close) Anjo AI$/ }).click();
  await expect(panel(page)).toBeHidden();
}

/** Records every POST /api/chat so specs can assert exactly-once submission. */
function recordChatRequests(page: Page): Request[] {
  const requests: Request[] = [];
  page.on("request", (request) => {
    if (request.method() === "POST" && new URL(request.url()).pathname === "/api/chat") requests.push(request);
  });
  return requests;
}

test.describe("homepage", () => {
  test("leads with work and real problems, server-rendered, with the assistant closed", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("I build software that makes work easier.");
    const work = page.getByRole("region", { name: /Work/ });
    await expect(work.getByRole("article", { name: "Unexaro" })).toContainText("In development");
    await expect(work.getByRole("article", { name: "Asterweave" })).toContainText("Open source");
    await expect(work.getByRole("article", { name: "Anjo AI" })).toContainText("Live demo");
    await expect(page.getByRole("region", { name: /How I can help/ })).toContainText("Business owners");
    await expect(page.getByRole("heading", { name: "What are you working on?" })).toBeVisible();
    await expect(page.getByRole("link", { name: /tadena\.anjo@gmail\.com/ })).toHaveAttribute("href", "mailto:tadena.anjo@gmail.com");

    await expect(launcher(page)).toBeVisible();
    await expect(launcher(page)).toHaveAttribute("aria-expanded", "false");
    await expect(panel(page)).toBeHidden();
  });

  test("top navigation anchors scroll to homepage sections, including from another route", async ({ page, isMobile }) => {
    test.skip(isMobile, "desktop navigation");
    await page.goto("/projects");
    await page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "How I help" }).click();
    await expect(page).toHaveURL(/\/#help$/);
    await expect(page.getByRole("heading", { name: /How I can help/ })).toBeInViewport();
  });
});

test.describe("floating Anjo AI assistant", () => {
  test("ask a question: stream, citations, preview; Escape closes only the preview, then minimises", async ({ page }) => {
    await page.goto("/");
    await openAssistant(page);
    await expect(panel(page)).toContainText("Hi! I'm Anjo's AI assistant.");
    await expect(composer(page)).toBeFocused();

    await composer(page).fill("Tell me about Asterweave");
    await composer(page).press("Enter");
    const conversation = panel(page).getByRole("list", { name: "Conversation" });
    await expect(conversation).toContainText("Tell me about Asterweave");
    await expect(composer(page)).toHaveValue("");
    await expect(panel(page).locator("[data-citation]").first()).toBeVisible({ timeout: 20_000 });
    await expect(panel(page).getByRole("list", { name: "Sources" })).toContainText("Asterweave");

    await panel(page).locator("[data-citation]").first().click();
    const preview = page.getByRole("dialog", { name: /Asterweave/ });
    await expect(preview.getByRole("link", { name: /Open full project page/ })).toHaveAttribute("href", "/projects/asterweave");
    await page.keyboard.press("Escape");
    await expect(preview).toBeHidden();
    await expect(panel(page)).toBeVisible();

    await composer(page).focus();
    await page.keyboard.press("Escape");
    await expect(panel(page)).toBeHidden();
    await expect(launcher(page)).toBeFocused();
  });

  test("a contact question returns a ContactCard and related questions", async ({ page }) => {
    await page.goto("/");
    await openAssistant(page);
    await composer(page).fill("How can I contact him?");
    await composer(page).press("Enter");
    await expect(panel(page).getByRole("region", { name: "Contact" })).toContainText("tadena.anjo@gmail.com", { timeout: 20_000 });
    await expect(panel(page).getByText("Related questions")).toBeVisible();
  });

  test("unanswerable questions get the honest fallback, never an invented answer", async ({ page }) => {
    await page.goto("/");
    await openAssistant(page);
    await composer(page).fill("Does Anjo have a Kubernetes certification?");
    await composer(page).press("Enter");
    await expect(panel(page).getByRole("list", { name: "Conversation" })).toContainText("I couldn't find enough information in Anjo's portfolio", { timeout: 20_000 });
    await expect(panel(page).getByRole("list", { name: "Sources" })).toHaveCount(0);
  });

  test("Shift+Enter inserts a newline instead of sending", async ({ page }) => {
    await page.goto("/");
    await openAssistant(page);
    await composer(page).fill("line one");
    await composer(page).press("Shift+Enter");
    await composer(page).pressSequentially("line two");
    await expect(composer(page)).toHaveValue("line one\nline two");
    await expect(panel(page).getByRole("list", { name: "Conversation" })).toHaveCount(0);
  });

  test("'Try Anjo AI' on the Anjo AI card opens the same widget without sending anything", async ({ page }) => {
    const requests = recordChatRequests(page);
    await page.goto("/");
    await expect(async () => {
      await page.getByRole("article", { name: "Anjo AI" }).getByRole("link", { name: /Try Anjo AI/ }).click();
      await expect(panel(page)).toBeVisible({ timeout: 1_000 });
    }).toPass({ timeout: 10_000 });
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByTestId("assistant-panel")).toHaveCount(1);
    expect(requests).toHaveLength(0);
  });

  test("a project CTA asks its explicit question with the project as context", async ({ page }) => {
    const requests = recordChatRequests(page);
    await page.goto("/projects/asterweave");
    await expect(async () => {
      await page.getByRole("link", { name: "What problem does Asterweave solve?" }).click();
      await expect(panel(page)).toBeVisible({ timeout: 1_000 });
    }).toPass({ timeout: 10_000 });
    await expect(page).toHaveURL(/\/projects\/asterweave$/);
    await expect(panel(page).getByRole("list", { name: "Sources" })).toBeVisible({ timeout: 20_000 });
    expect(requests).toHaveLength(1);
    expect(requests[0]!.postDataJSON()).toMatchObject({ message: "What problem does Asterweave solve?", contextSlug: "asterweave" });
  });

  test("browsing to a project page never submits anything on its own", async ({ page }) => {
    const requests = recordChatRequests(page);
    await page.goto("/projects/asterweave");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Asterweave");
    await page.waitForLoadState("networkidle");
    expect(requests).toHaveLength(0);
    await expect(panel(page)).toBeHidden();
  });

  test("the conversation survives client navigation with exactly one request", async ({ page }) => {
    const requests = recordChatRequests(page);
    await page.goto("/");
    await openAssistant(page);
    await composer(page).fill("What cloud platforms does he use?");
    await composer(page).press("Enter");
    await expect(panel(page).getByRole("list", { name: "Sources" })).toBeVisible({ timeout: 20_000 });
    await composer(page).fill("an unsent draft");

    await minimise(page);
    await page.getByRole("link", { name: "Read about Unexaro" }).click();
    await expect(page).toHaveURL(/\/projects\/unexaro$/);
    await openAssistant(page);
    await expect(panel(page).getByRole("list", { name: "Conversation" })).toContainText("What cloud platforms does he use?");
    await expect(composer(page)).toHaveValue("an unsent draft");
    expect(requests).toHaveLength(1);
  });

  test("minimising while streaming does not abort; the answer arrives in the background", async ({ page }) => {
    let release!: () => void;
    const held = new Promise<void>((resolve) => (release = resolve));
    await page.route("**/api/chat", async (route) => {
      await held;
      await route.continue();
    });
    const requests = recordChatRequests(page);
    await page.goto("/");
    await openAssistant(page);
    await composer(page).fill("Tell me about Asterweave");
    await composer(page).press("Enter");
    await expect(panel(page).getByRole("button", { name: "Stop generating" })).toBeVisible();

    await minimise(page); // mid-request
    release();
    await openAssistant(page);
    await expect(panel(page).getByRole("list", { name: "Sources" })).toBeVisible({ timeout: 20_000 });
    expect(requests).toHaveLength(1);
  });

  test("Stop cancels explicitly, and Ask again retries once", async ({ page }) => {
    let holdFirst = true;
    await page.route("**/api/chat", async (route) => {
      if (holdFirst) {
        holdFirst = false;
        await new Promise((resolve) => setTimeout(resolve, 5_000));
      }
      await route.continue().catch(() => {});
    });
    const requests = recordChatRequests(page);
    await page.goto("/");
    await openAssistant(page);
    await composer(page).fill("What cloud platforms does he use?");
    await composer(page).press("Enter");
    await panel(page).getByRole("button", { name: "Stop generating" }).click();
    await expect(panel(page)).toContainText("Stopped.");
    await panel(page).getByRole("button", { name: "Ask again" }).click();
    await expect(panel(page).getByRole("list", { name: "Sources" })).toBeVisible({ timeout: 20_000 });
    expect(requests).toHaveLength(2);
  });

  test("New chat clears the conversation and draft", async ({ page }) => {
    await page.goto("/");
    await openAssistant(page);
    await panel(page).getByRole("button", { name: "How can I contact Anjo?" }).click();
    await expect(panel(page).getByRole("button", { name: "Copy answer" })).toBeVisible({ timeout: 20_000 });
    await expect(panel(page).getByRole("button", { name: "Regenerate answer" })).toBeVisible();
    await composer(page).fill("draft");
    await panel(page).getByRole("button", { name: "New chat" }).click();
    await expect(panel(page).getByRole("list", { name: "Conversation" })).toHaveCount(0);
    await expect(composer(page)).toHaveValue("");
    await page.reload();
    await openAssistant(page);
    await expect(panel(page)).toContainText("Hi! I'm Anjo's AI assistant.");
  });
});

test.describe("legacy links", () => {
  test("?ask= submits the question once, strips it, and a reload does not replay it", async ({ page }) => {
    const requests = recordChatRequests(page);
    await page.goto("/?ask=What%20cloud%20platforms%20does%20he%20use%3F");
    await expect(panel(page)).toBeVisible();
    await expect(panel(page).getByRole("list", { name: "Conversation" })).toContainText("What cloud platforms does he use?");
    await expect(panel(page).getByRole("list", { name: "Sources" })).toBeVisible({ timeout: 20_000 });
    await expect(page).toHaveURL(/\/$/);
    expect(requests).toHaveLength(1);

    await page.reload();
    await openAssistant(page);
    const userMessages = panel(page).getByRole("listitem").filter({ hasText: "You said:" });
    await expect(userMessages).toHaveCount(1);
    expect(requests).toHaveLength(1);
  });

  test("/chat?ask= keeps punctuation and encoded characters and reaches the same widget", async ({ page }) => {
    const question = "What's Asterweave — and how does it work?";
    const requests = recordChatRequests(page);
    await page.goto(`/chat?ask=${encodeURIComponent(question)}`);
    await expect(panel(page).getByRole("list", { name: "Conversation" })).toContainText(question);
    await expect(page).toHaveURL(/\/$/);
    await expect.poll(() => requests.length).toBe(1);
    expect(requests[0]!.postDataJSON()).toMatchObject({ message: question });
    await expect(page.getByTestId("assistant-panel")).toHaveCount(1);
  });

  test("bare /chat opens the widget without sending anything", async ({ page }) => {
    const requests = recordChatRequests(page);
    await page.goto("/chat");
    await expect(panel(page)).toBeVisible();
    await expect(page).toHaveURL(/\/$/);
    expect(requests).toHaveLength(0);
  });
});
