/**
 * Site URL for canonical links, sitemap, and Open Graph. Read directly from
 * `NEXT_PUBLIC_SITE_URL` (with a dev fallback) so it is usable during
 * `next build` prerendering without pulling in the full env validation.
 */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");
  // Vercel injects the production hostname; use it so a zero-config deploy has correct absolute URLs.
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}

export function absoluteUrl(path: string): string {
  return `${getSiteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}
