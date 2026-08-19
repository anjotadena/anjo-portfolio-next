import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

/** @type {import("eslint").Linter.Config[]} */
const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    // eslint-config-next ships `settings.react.version: "detect"`, which
    // makes eslint-plugin-react call the legacy `context.getFilename()`
    // API to locate the installed React package. That API was removed in
    // ESLint 10 and crashes the `react/display-name` rule. Pin the version
    // explicitly (matches the installed `react` dependency) to skip
    // detection entirely.
    settings: {
      react: { version: "19.2.8" },
    },
  },
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "dist/**",
      "coverage/**",
      "playwright-report/**",
      "test-results/**",
      "next-env.d.ts",
    ],
  },
];

export default eslintConfig;
