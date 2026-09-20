import fs from "node:fs";
import path from "node:path";

/**
 * Loads `.env.local` then `.env` (first definition wins, existing process
 * env always wins) for CLI scripts. Next.js does this automatically for
 * the app; scripts run outside Next so they need it explicitly. A ~30 line
 * parser beats a dependency for KEY=VALUE files.
 */
export function loadEnvFiles(cwd = process.cwd()): void {
  for (const file of [".env.local", ".env"]) {
    const filePath = path.join(cwd, file);
    if (!fs.existsSync(filePath)) continue;
    for (const rawLine of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
      const line = rawLine.trim();
      if (line.length === 0 || line.startsWith("#")) continue;
      const eq = line.indexOf("=");
      if (eq === -1) continue;
      const key = line.slice(0, eq).trim().replace(/^export\s+/, "");
      let value = line.slice(eq + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (process.env[key] === undefined) process.env[key] = value;
    }
  }
}
