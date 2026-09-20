/**
 * Application version identity, inlined at build time by `next.config.ts`
 * (`NEXT_PUBLIC_APP_VERSION` from package.json, `NEXT_PUBLIC_BUILD_ID` from
 * the git commit — `VERCEL_GIT_COMMIT_SHA` on Vercel — and
 * `NEXT_PUBLIC_BUILD_TIME`). Safe for both server and client bundles.
 *
 * The same string is baked into the service worker, so every deploy yields
 * a byte-different worker and browsers pick up the update automatically.
 */
export const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? "0.0.0";
export const BUILD_ID = process.env.NEXT_PUBLIC_BUILD_ID ?? "dev";
export const BUILD_TIME = process.env.NEXT_PUBLIC_BUILD_TIME ?? "";

/** e.g. `1.0.0+a3143d3` — semver build metadata form. */
export const BUILD_LABEL = `${APP_VERSION}+${BUILD_ID}`;

export interface VersionInfo {
  version: string;
  buildId: string;
  buildTime: string;
  label: string;
}

export function getVersionInfo(): VersionInfo {
  return { version: APP_VERSION, buildId: BUILD_ID, buildTime: BUILD_TIME, label: BUILD_LABEL };
}

/** Link to the exact commit when the build id is a real SHA. */
export function commitUrl(repoUrl: string, buildId: string = BUILD_ID): string | null {
  return /^[0-9a-f]{7,40}$/i.test(buildId) ? `${repoUrl.replace(/\/+$/, "")}/commit/${buildId}` : null;
}
