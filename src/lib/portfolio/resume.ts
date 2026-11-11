import "server-only";
import { existsSync } from "node:fs";
import path from "node:path";
import { getProfile } from "@/lib/knowledge/repository";

/**
 * The profile's résumé link, but only when it actually resolves: a
 * site-relative path must exist under `public/`, so a missing file never
 * produces a broken download link. Absolute URLs are trusted as configured.
 */
export function getAvailableResumeHref(): string | null {
  const href = getProfile().profile.resumeHref;
  if (!href) return null;
  if (/^https?:\/\//i.test(href)) return href;
  const relative = href.split(/[?#]/)[0]?.replace(/^\/+/, "") ?? "";
  if (!relative || relative.includes("..")) return null;
  return existsSync(path.join(process.cwd(), "public", relative)) ? href : null;
}
