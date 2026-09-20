import { expect, test } from "@playwright/test";

test.describe("progressive web app", () => {
  test("serves a manifest, generated icons, a versioned service worker, and the version endpoint", async ({ request }) => {
    const manifest = await request.get("/manifest.webmanifest");
    expect(manifest.status()).toBe(200);
    const body = (await manifest.json()) as { name: string; display: string; icons: Array<{ src: string; purpose?: string }> };
    expect(body.display).toBe("standalone");
    expect(body.icons.some((icon) => icon.purpose === "maskable")).toBe(true);
    for (const icon of body.icons) {
      const response = await request.get(icon.src);
      expect(response.status()).toBe(200);
      expect(response.headers()["content-type"]).toContain("image/png");
    }

    const version = await request.get("/api/version");
    const info = (await version.json()) as { version: string; buildId: string; label: string };
    expect(info.version).toMatch(/^\d+\.\d+\.\d+$/);
    expect(info.label).toBe(`${info.version}+${info.buildId}`);

    const sw = await request.get("/sw.js");
    expect(sw.status()).toBe(200);
    expect(sw.headers()["content-type"]).toContain("javascript");
    expect(sw.headers()["cache-control"]).toContain("no-cache");
    expect(sw.headers()["service-worker-allowed"]).toBe("/");
    expect(await sw.text()).toContain(`const VERSION = "${info.label}";`);
  });

  test("registers the service worker, takes control, and shows the version in the sidebar", async ({ page, browserName }) => {
    test.skip(browserName !== "chromium", "service workers are exercised in Chromium");
    await page.goto("/");
    const label = await page.evaluate(async () => {
      const registration = await navigator.serviceWorker.ready;
      return registration.active?.scriptURL ?? null;
    });
    expect(label).toContain("/sw.js");

    await page.reload();
    const state = await page.evaluate(async () => {
      await navigator.serviceWorker.ready;
      const names = await caches.keys();
      return { controlled: Boolean(navigator.serviceWorker.controller), caches: names };
    });
    expect(state.controlled).toBe(true);
    expect(state.caches.some((name) => name.startsWith("anjo-ai-"))).toBe(true);

    const version = (await (await page.request.get("/api/version")).json()) as { version: string };
    const menu = page.getByRole("button", { name: "Open menu" });
    if (await menu.isVisible()) await menu.click();
    await expect(page.getByTestId("app-version").filter({ visible: true })).toContainText(`v${version.version}`);
  });

  test("an update waits for the answer to finish, then reloads with the conversation preserved", async ({ page, browserName }) => {
    test.skip(browserName !== "chromium", "service workers are exercised in Chromium");
    await page.goto("/");
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.reload();
    await page.evaluate(() => navigator.serviceWorker.ready);

    // Ask something so there is a conversation to preserve.
    const input = page.getByLabel("Your question");
    await input.fill("What is Asterweave?");
    await input.press("Enter");
    await expect(page.getByRole("list", { name: "Sources" })).toBeVisible({ timeout: 20_000 });

    // Simulate a new worker taking control (what happens after a deploy).
    const reloaded = page.waitForEvent("load");
    await page.evaluate(() => navigator.serviceWorker.dispatchEvent(new Event("controllerchange")));
    await expect(page.getByRole("status").filter({ hasText: /Updated to v/ })).toBeVisible();
    await reloaded;

    // The conversation survived the reload.
    await expect(page.getByRole("list", { name: "Conversation" })).toContainText("What is Asterweave?");
  });

  test("the offline page is available", async ({ page }) => {
    await page.goto("/offline");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("offline");
  });
});
