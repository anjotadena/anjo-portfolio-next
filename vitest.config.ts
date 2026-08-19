import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    // jsdom still exposes Node built-ins, so filesystem-backed content/retrieval
    // modules and React component tests can share a single environment.
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.{ts,tsx}"],
    // Playwright specs live in e2e/ and are driven by playwright.config.ts.
    exclude: ["e2e/**", "node_modules/**", ".next/**"],
    restoreMocks: true,
    clearMocks: true,
    unstubEnvs: true,
  },
});
