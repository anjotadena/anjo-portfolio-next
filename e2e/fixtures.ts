import { test as base } from "@playwright/test";

/** Shared test base (kept as an extension point for common page setup). */
export const test = base;

export { expect } from "@playwright/test";
