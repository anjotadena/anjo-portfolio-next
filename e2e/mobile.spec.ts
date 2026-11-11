import { expect, test } from "./fixtures";

/**
 * Mobile-only checks. Playwright cannot show a real on-screen keyboard, so
 * the keyboard case is simulated the way browsers report it: the viewport
 * shrinks and the assistant composer must still be inside the visible area.
 */
test.describe("mobile layout", () => {
  test.skip(({ isMobile }) => !isMobile, "mobile project only");

  const noHorizontalOverflow = () => document.documentElement.scrollWidth <= document.documentElement.clientWidth;

  test("the homepage has no horizontal overflow and the launcher is a ≥44px target", async ({ page }) => {
    await page.goto("/");
    expect(await page.evaluate(noHorizontalOverflow)).toBe(true);
    const box = await page.getByTestId("assistant-launcher").boundingBox();
    expect(box!.width).toBeGreaterThanOrEqual(44);
    expect(box!.height).toBeGreaterThanOrEqual(44);
    await expect(page.getByTestId("assistant-launcher")).toHaveAccessibleName("Ask Anjo AI");
  });

  test("the assistant opens as a full-screen sheet; the composer stays visible in a keyboard-sized viewport", async ({ page }) => {
    await page.goto("/");
    const launcher = page.getByTestId("assistant-launcher");
    const panel = page.getByTestId("assistant-panel");
    await expect(async () => {
      await launcher.click();
      await expect(panel).toBeVisible({ timeout: 1_000 });
    }).toPass({ timeout: 10_000 });

    const viewport = page.viewportSize()!;
    const sheet = await panel.boundingBox();
    expect(Math.round(sheet!.width)).toBe(viewport.width);
    await expect(panel.getByRole("button", { name: "Close Anjo AI" })).toBeInViewport();

    const input = panel.getByLabel("Your question");
    await expect(input).toBeInViewport();
    await page.setViewportSize({ width: viewport.width, height: 500 });
    await expect(input).toBeInViewport();
    await input.fill("What is Asterweave?");
    await panel.getByRole("button", { name: "Send question" }).click();
    await expect(panel.getByRole("list", { name: "Sources" })).toBeVisible({ timeout: 20_000 });
    await expect(input).toBeInViewport();

    // Answer content (cards, sources, code) stays inside the sheet.
    const overflow = await panel.evaluate((el) => [...el.querySelectorAll("*")].some((node) => node.getBoundingClientRect().right > el.getBoundingClientRect().right + 1 && getComputedStyle(node).position !== "fixed" && !node.closest("pre")));
    expect(overflow).toBe(false);
    expect(await page.evaluate(noHorizontalOverflow)).toBe(true);

    await panel.getByRole("button", { name: "Close Anjo AI" }).click();
    await expect(panel).toBeHidden();
    await expect(launcher).toBeFocused();
  });

  test("the mobile menu opens as an accessible dialog and navigates", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Open menu" }).click();
    const dialog = page.getByRole("dialog", { name: "Menu" });
    await expect(dialog).toBeVisible();
    const viewport = page.viewportSize()!;
    const box = await dialog.locator("div").first().boundingBox();
    expect(Math.round(box!.width)).toBe(viewport.width);
    await expect(dialog.getByRole("button", { name: "Close" })).toBeVisible();
    await dialog.getByRole("link", { name: "Projects" }).click();
    await expect(page).toHaveURL(/\/projects$/);
    await expect(page.getByRole("dialog", { name: "Menu" })).toBeHidden();
  });
});
