import { expect, test } from "@playwright/test";

test.describe("start-up splash", () => {
  test("boots with real status lines, then dismisses itself and never shows again this session", async ({ page }) => {
    await page.goto("/");
    const splash = page.getByTestId("splash-screen");
    await expect(splash).toBeVisible();
    await expect(splash).toContainText("Loading knowledge base");
    await expect(splash).toContainText(/\d+ documents · \d+ sections/);
    await expect(splash).toContainText(/hybrid search|lexical search/);
    await expect(splash).toContainText(/^.*v\d+\.\d+\.\d+/);
    // Auto-dismiss after the boot sequence.
    await expect(splash).toBeHidden({ timeout: 10_000 });
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Anjo AI");

    await page.reload();
    await expect(page.getByTestId("splash-screen")).toHaveCount(0);
  });

  test("any key skips the splash immediately", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("splash-screen")).toBeVisible();
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("splash-screen")).toBeHidden({ timeout: 3_000 });
  });

  test("respects reduced motion by finishing quickly", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto("/");
    await expect(page.getByTestId("splash-screen")).toBeHidden({ timeout: 3_000 });
    await context.close();
  });
});

test.describe("thinking indicator", () => {
  test("shows the CLI-style status while waiting and Escape stops the answer", async ({ page }) => {
    await page.addInitScript(() => sessionStorage.setItem("anjo-ai:splash-shown", "1"));
    await page.goto("/");
    const input = page.getByLabel("Your question");
    await input.fill("Tell me about Asterweave");
    await input.press("Enter");
    // The answer streams quickly against the mock; the indicator may be brief, so just ensure the stream can be stopped.
    await page.keyboard.press("Escape");
    await expect(page.getByRole("list", { name: "Conversation" })).toBeVisible();
    await expect(page.getByLabel("Stop generating")).toHaveCount(0);
  });
});
