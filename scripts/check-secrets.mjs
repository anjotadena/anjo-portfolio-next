#!/usr/bin/env node
/**
 * `npm run check:secrets`
 *
 * Scans every git-tracked (or staged) file for credential-looking strings
 * and fails if any are found. Runs first in CI and from the local pre-push
 * hook (`npm run hooks:install`), so a key can never reach the remote.
 *
 * Patterns are deliberately broad; add an entry to ALLOWLIST for known-fake
 * fixtures rather than weakening a pattern.
 */
import { execSync } from "node:child_process";
import fs from "node:fs";

const PATTERNS = [
  { name: "OpenAI key", regex: /\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}\b/ },
  { name: "GitHub token", regex: /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{30,}\b/ },
  { name: "GitHub fine-grained token", regex: /\bgithub_pat_[A-Za-z0-9_]{40,}\b/ },
  { name: "AWS access key", regex: /\bAKIA[0-9A-Z]{16}\b/ },
  { name: "Vercel token", regex: /\bvercel_[A-Za-z0-9]{24,}\b/ },
  { name: "Private key block", regex: /-----BEGIN (?:RSA |EC |OPENSSH |PGP )?PRIVATE KEY-----/ },
  { name: "Slack token", regex: /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/ },
  { name: "Database URL with password", regex: /\b(?:postgres(?:ql)?|mysql|mongodb(?:\+srv)?|redis):\/\/[^\s:@/]+:[^\s@/]+@/ },
  { name: "Generic assignment", regex: /\b(?:OPENAI_API_KEY|DATABASE_URL|API_KEY|SECRET|TOKEN|PASSWORD)\s*[=:]\s*["']?[A-Za-z0-9_\-./+]{16,}/ },
];

/** Known-fake values used by tests, docs, and local compose. */
const ALLOWLIST = [
  /postgres:\/\/portfolio:portfolio@(?:localhost|db|127\.0\.0\.1):5432\/portfolio/,
  /sk-secret\b/,
  /OPENAI_API_KEY=mock/,
  /OPENAI_API_KEY: "mock"/,
];

const SKIP = [/^node_modules\//, /^\.next\//, /^package-lock\.json$/, /\.(png|jpg|jpeg|gif|ico|woff2?|pdf)$/i, /^data\/knowledge-index.*\.json$/];

const staged = process.argv.includes("--staged");
const files = execSync(staged ? "git diff --cached --name-only --diff-filter=ACMR" : "git ls-files", { encoding: "utf8" })
  .split(/\r?\n/)
  .filter((file) => file.length > 0 && !SKIP.some((pattern) => pattern.test(file)) && fs.existsSync(file));

const findings = [];
for (const file of files) {
  const text = fs.readFileSync(file, "utf8");
  const lines = text.split(/\r?\n/);
  lines.forEach((line, index) => {
    if (ALLOWLIST.some((pattern) => pattern.test(line))) return;
    for (const { name, regex } of PATTERNS) {
      if (regex.test(line)) findings.push({ file, line: index + 1, name });
    }
  });
}

// Tracked env files are always a failure, whatever they contain.
for (const file of files) {
  if (/(^|\/)\.env(\..+)?$/.test(file) && !file.endsWith(".env.example")) findings.push({ file, line: 0, name: "environment file is tracked" });
}

if (findings.length > 0) {
  console.error(`✖ ${findings.length} possible secret(s) found:`);
  for (const finding of findings) console.error(`  ${finding.file}${finding.line ? `:${finding.line}` : ""}  ${finding.name}`);
  console.error("\nRemove the value, move it to .env.local (git-ignored), or add a known-fake fixture to ALLOWLIST in scripts/check-secrets.mjs.");
  process.exit(1);
}
console.log(`✔ No secrets found in ${files.length} ${staged ? "staged" : "tracked"} files.`);
