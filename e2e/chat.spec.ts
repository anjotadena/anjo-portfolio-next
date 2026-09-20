import { expect, test } from "@playwright/test";

test.describe("chat experience", () => {
  test("homepage loads as an AI assistant with grounded suggested prompts", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Anjo AI");
    await expect(page.getByRole("list", { name: "Suggested questions" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Tell me about Anjo" })).toBeVisible();
    await expect(page.getByLabel("Your question")).toBeVisible();
  });

  test("visitor asks a question: stream starts, answer appears, citations render and open a preview", async ({ page }) => {
    await page.goto("/");
    const input = page.getByLabel("Your question");
    await input.fill("Tell me about Asterweave");
    await input.press("Enter");

    // The visitor bubble appears immediately and the composer clears.
    await expect(page.getByRole("list", { name: "Conversation" })).toContainText("Tell me about Asterweave");
    await expect(input).toHaveValue("");

    // Answer streams in and cites its sources.
    await expect(page.locator("[data-citation]").first()).toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole("list", { name: "Sources" })).toBeVisible();
    await expect(page.getByRole("list", { name: "Sources" })).toContainText("Asterweave");

    // Citation opens the source preview with a link to the full page.
    await page.locator("[data-citation]").first().click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText("Asterweave");
    await expect(dialog.getByRole("link", { name: /Open full project page/ })).toHaveAttribute("href", "/projects/asterweave");
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();

    // A project card is attached and links to the project page.
    const card = page.getByRole("article", { name: "Project: Asterweave" });
    await expect(card).toBeVisible();
    await card.getByRole("link", { name: /View project/ }).click();
    await expect(page).toHaveURL(/\/projects\/asterweave$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Asterweave");
  });

  test("a contact question returns a ContactCard and related questions", async ({ page }) => {
    await page.goto("/");
    const input = page.getByLabel("Your question");
    await input.fill("How can I contact him?");
    await input.press("Enter");
    await expect(page.getByRole("region", { name: "Contact" })).toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole("region", { name: "Contact" })).toContainText("tadena.anjo@gmail.com");
    await expect(page.getByText("Related questions")).toBeVisible();
  });

  test("unanswerable questions get the honest fallback, never an invented answer", async ({ page }) => {
    await page.goto("/");
    const input = page.getByLabel("Your question");
    await input.fill("Does Anjo have a Kubernetes certification?");
    await input.press("Enter");
    await expect(page.getByRole("list", { name: "Conversation" })).toContainText("I couldn't find enough information in Anjo's portfolio", { timeout: 20_000 });
    await expect(page.getByRole("list", { name: "Sources" })).toHaveCount(0);
  });

  test("Shift+Enter inserts a newline instead of sending", async ({ page }) => {
    await page.goto("/");
    const input = page.getByLabel("Your question");
    await input.fill("line one");
    await input.press("Shift+Enter");
    await input.type("line two");
    await expect(input).toHaveValue("line one\nline two");
    await expect(page.getByRole("list", { name: "Conversation" })).toHaveCount(0);
  });

  test("?ask= deep link submits the question automatically", async ({ page }) => {
    await page.goto("/?ask=What%20cloud%20platforms%20does%20he%20use%3F");
    await expect(page.getByRole("list", { name: "Conversation" })).toContainText("What cloud platforms does he use?");
    await expect(page.getByRole("list", { name: "Sources" })).toBeVisible({ timeout: 20_000 });
  });

  test("copy answer and regenerate controls are available after an answer", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Tell me about Anjo" }).click();
    await expect(page.getByRole("button", { name: "Copy answer" })).toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole("button", { name: "Regenerate answer" })).toBeVisible();
    await expect(page.getByRole("button", { name: "New chat" })).toBeVisible();
  });
});
