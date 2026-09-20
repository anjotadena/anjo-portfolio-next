#!/usr/bin/env node
/**
 * Playwright `webServer` launcher. Playwright starts the web server before
 * `globalSetup`, so everything the server needs is prepared here, in order:
 *   1. start the mock OpenAI server (embeddings + Responses API),
 *   2. build a throwaway vector index against it (data/knowledge-index.e2e.json),
 *   3. start `next start` on the E2E port.
 * The suite therefore exercises the real "live" path — file-backed hybrid
 * retrieval + streamed Responses API answers — with no database or API key.
 */
import { spawn, spawnSync } from "node:child_process";
import path from "node:path";

const PORT = process.env.E2E_PORT ?? "3100";
const MOCK_PORT = process.env.MOCK_OPENAI_PORT ?? "4010";
const MOCK_BASE_URL = `http://127.0.0.1:${MOCK_PORT}/v1`;
const INDEX_PATH = "data/knowledge-index.e2e.json";

const env = {
  ...process.env,
  OPENAI_API_KEY: "mock",
  OPENAI_BASE_URL: MOCK_BASE_URL,
  RETRIEVAL_BACKEND: "file",
  KNOWLEDGE_INDEX_PATH: INDEX_PATH,
};

const mock = spawn(process.execPath, [path.join("scripts", "mock-openai.mjs")], { stdio: "inherit", env: { ...env, MOCK_OPENAI_PORT: MOCK_PORT } });

async function waitForMock() {
  for (let i = 0; i < 50; i += 1) {
    try {
      await fetch(`${MOCK_BASE_URL}/embeddings`, { method: "POST", body: "{}" });
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
  throw new Error("mock-openai did not start");
}
await waitForMock();

const tsx = path.join("node_modules", "tsx", "dist", "cli.mjs");
const indexed = spawnSync(process.execPath, [tsx, "--conditions=react-server", "scripts/index-content.ts", "--reset"], { stdio: "inherit", env });
if (indexed.status !== 0) {
  mock.kill();
  process.exit(indexed.status ?? 1);
}

const nextBin = path.join("node_modules", "next", "dist", "bin", "next");
const server = spawn(process.execPath, [nextBin, "start", "--port", PORT], { stdio: "inherit", env });

function shutdown() {
  server.kill();
  mock.kill();
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
process.on("exit", shutdown);
server.on("exit", (code) => {
  mock.kill();
  process.exit(code ?? 0);
});
