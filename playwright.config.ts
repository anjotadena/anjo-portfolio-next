import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
const BASE_URL = `http://127.0.0.1:${PORT}`;

/**
 * E2E runs against a PRODUCTION build (`next build` + `next start`): CSP
 * headers, static generation, and streaming behave differently in dev, so
 * dev-mode results would not be evidence of shippable behaviour.
 *
 * `e2e/serve.mjs` starts a mock OpenAI server, builds a throwaway vector
 * index against it, then starts `next start`, so the suite exercises the
 * real "live" path — file-backed hybrid retrieval + Responses API streaming
 * — with no database, no API key, and deterministic answers.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
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
      use: { ...devices["Pixel 7"] },
    },
  ],
  webServer: {
    command: "node e2e/serve.mjs",
    url: `${BASE_URL}/api/health`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      NODE_ENV: "production",
      NEXT_PUBLIC_SITE_URL: BASE_URL,
      E2E_PORT: String(PORT),
      CHAT_STREAM_DELAY_MS: "0",
      // Generous limits so parallel specs never trip the limiter.
      RATE_LIMIT_PER_MINUTE: "500",
      RATE_LIMIT_PER_HOUR: "5000",
      E2E_TEST_MODE: "1",
    },
  },
});
