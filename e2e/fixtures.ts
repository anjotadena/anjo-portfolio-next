import { test as base } from "@playwright/test";

/**
 * Shared test base: marks the start-up splash as already seen so specs
 * interact with the app immediately. `splash.spec.ts` uses the raw test to
 * exercise the splash itself.
 */
export const test = base.extend({
  page: async ({ page }, provide) => {
    await page.addInitScript(() => {
      try {
        sessionStorage.setItem("anjo-ai:splash-shown", "1");
      } catch {
        // ignore
      }
    });
    await provide(page);
  },
});

export { expect } from "@playwright/test";
