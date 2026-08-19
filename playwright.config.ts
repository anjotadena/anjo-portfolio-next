import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
const BASE_URL = `http://127.0.0.1:${PORT}`;

/**
 * The full E2E suite runs against a PRODUCTION build (`next build` + `next start`),
 * not the dev server: CSP headers, static generation and streaming all behave
 * differently in dev, so dev-mode results would not be evidence of shippable behavior.
 *
 * `CONTACT_TRANSPORT=memory` + `E2E_TEST_MODE=1` activate the in-memory mail
 * transport so the contact success path is exercisable. The transport refuses to
 * activate in production without that explicit opt-in.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["list"], ["html", { open: "never" }]],
  timeout: 30_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "desktop-chromium",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } },
    },
    {
      name: "mobile-chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 375, height: 667 },
        isMobile: false,
        hasTouch: true,
      },
    },
  ],
  webServer: {
    command: `npx next start --port ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      CONTACT_TRANSPORT: "memory",
      E2E_TEST_MODE: "1",
      CHAT_STREAM_DELAY_MS: "0",
      NEXT_PUBLIC_SITE_URL: BASE_URL,
    },
  },
});
