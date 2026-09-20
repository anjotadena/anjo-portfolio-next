#!/usr/bin/env node
/** `npm run hooks:install` — installs a local pre-push hook that blocks pushes containing secrets. */
import fs from "node:fs";
import path from "node:path";

const hooksDir = path.join(".git", "hooks");
if (!fs.existsSync(hooksDir)) {
  console.error("Not a git checkout; nothing installed.");
  process.exit(1);
}
const hook = path.join(hooksDir, "pre-push");
fs.writeFileSync(hook, "#!/bin/sh\n# Installed by `npm run hooks:install`. Blocks pushes that contain credential-looking strings.\nnode scripts/check-secrets.mjs || exit 1\n", { mode: 0o755 });
console.log(`✔ Installed ${hook}`);
