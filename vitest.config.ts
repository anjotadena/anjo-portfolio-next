import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const alias = {
  "@": fileURLToPath(new URL("./src", import.meta.url)),
  // `server-only` throws outside Next's react-server condition; tests import
  // server modules directly, so it is aliased to an empty module here.
  "server-only": fileURLToPath(new URL("./tests/stubs/server-only.ts", import.meta.url)),
};

const shared = {
  globals: true,
  restoreMocks: true,
  clearMocks: true,
  unstubEnvs: true,
  exclude: ["e2e/**", "node_modules/**", ".next/**"],
};

export default defineConfig({
  plugins: [react()],
  resolve: { alias },
  test: {
    ...shared,
    coverage: {
      provider: "v8",
      include: ["src/lib/**", "src/components/chat/**"],
      reporter: ["text", "html"],
    },
    projects: [
      {
        resolve: { alias },
        test: {
          ...shared,
          name: "unit",
          environment: "node",
          include: ["tests/unit/**/*.test.ts"],
        },
      },
      {
        resolve: { alias },
        test: {
          ...shared,
          name: "integration",
          environment: "node",
          include: ["tests/integration/**/*.test.ts"],
          testTimeout: 20_000,
        },
      },
      {
        plugins: [react()],
        resolve: { alias },
        test: {
          ...shared,
          name: "components",
          environment: "jsdom",
          setupFiles: ["./tests/setup.ts"],
          include: ["tests/components/**/*.test.tsx"],
        },
      },
    ],
  },
});
