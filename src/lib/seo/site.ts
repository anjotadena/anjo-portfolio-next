/**
 * Site URL for canonical links, sitemap, and Open Graph. Read directly from
 * `NEXT_PUBLIC_SITE_URL` (with a dev fallback) so it is usable during
 * `next build` prerendering without pulling in the full env validation.
 */
export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  return (raw && raw.length > 0 ? raw : "http://localhost:3000").replace(/\/+$/, "");
}

export function absoluteUrl(path: string): string {
  return `${getSiteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}
