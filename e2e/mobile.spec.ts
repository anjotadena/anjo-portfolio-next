import { expect, test } from "@playwright/test";

/**
 * Mobile-only checks. Playwright cannot show a real on-screen keyboard, so
 * the keyboard case is simulated the way browsers report it: the visual
 * viewport shrinks (100dvh follows it) and the composer must still be
 * inside the visible area.
 */
test.describe("mobile layout", () => {
  test.skip(({ isMobile }) => !isMobile, "mobile project only");

  test("the composer stays visible and usable in a keyboard-sized viewport", async ({ page }) => {
    await page.goto("/");
    const input = page.getByLabel("Your question");
    await expect(input).toBeInViewport();

    // Simulate the keyboard taking ~45% of the screen.
    await page.setViewportSize({ width: 412, height: 500 });
    await expect(input).toBeInViewport();
    await input.fill("What is Asterweave?");
    await page.getByRole("button", { name: "Send question" }).click();
    await expect(page.getByRole("list", { name: "Sources" })).toBeVisible({ timeout: 20_000 });
    await expect(input).toBeInViewport();
    // No horizontal overflow.
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(overflow).toBe(false);
  });

  test("the mobile menu opens as an accessible dialog and navigates", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Open menu" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByRole("link", { name: "Projects" }).click();
    await expect(page).toHaveURL(/\/projects$/);
    await expect(page.getByRole("dialog")).toBeHidden();
  });
});
