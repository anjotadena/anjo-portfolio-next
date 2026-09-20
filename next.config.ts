import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";

// Build identity, inlined into both bundles and the service worker so every
// deploy is distinguishable (see src/lib/version.ts).
const packageVersion = (JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8")) as { version: string }).version;
function resolveBuildId(): string {
  const fromVercel = process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.GITHUB_SHA;
  if (fromVercel) return fromVercel.slice(0, 7);
  try {
    return execSync("git rev-parse --short HEAD", { stdio: ["ignore", "pipe", "ignore"] }).toString().trim() || "dev";
  } catch {
    return "dev";
  }
}
const buildId = resolveBuildId();
const buildTime = new Date().toISOString();

// Static (non-nonce) Content-Security-Policy, applied via next.config's
// headers() rather than per-request middleware.
//
// Trade-off: `'unsafe-inline'` is accepted for script-src to preserve fully
// static generation and to allow next-themes' anti-flash inline script
// (which sets the `class` attribute before paint) to run without a nonce.
// The resulting XSS surface is kept small because AI-generated markdown is
// rendered through react-markdown without raw HTML support (no
// `dangerouslySetInnerHTML`), so untrusted content can't inject <script>
// tags in the first place. `img-src`, `connect-src`, `object-src`, and
// `base-uri` are all locked down to same-origin (plus `data:` for images),
// which kills the corpus-injection -> exfiltration chain even if an inline
// script were ever influenced by untrusted content: there is nowhere for
// stolen data to be sent and no plugin/base-tag vector to redirect it
// through.
const cspDirectives = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isProduction ? "" : " 'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline'",
  "style-src-attr 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "base-uri 'none'",
  "object-src 'none'",
  "frame-src 'none'",
  "worker-src 'self' blob:",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  { key: "Content-Security-Policy", value: cspDirectives },
  ...(isProduction
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]
    : []),
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  env: {
    NEXT_PUBLIC_APP_VERSION: packageVersion,
    NEXT_PUBLIC_BUILD_ID: buildId,
    NEXT_PUBLIC_BUILD_TIME: buildTime,
  },
  generateBuildId: () => `${packageVersion}-${buildId}`,
  // Standalone output is only for the Docker image (set by the Dockerfile).
  // Vercel and `next start` use the default output.
  ...(process.env.DOCKER_BUILD === "1" ? { output: "standalone" as const } : {}),
  // `pg` is loaded at runtime (native/optional deps); keep it out of the server bundle.
  serverExternalPackages: ["pg"],
  // The knowledge base and the vector index are read from disk at request
  // time by the API routes; make sure serverless bundles include them.
  outputFileTracingIncludes: {
    "/*": ["./content/**/*", "./data/**/*"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        // The service worker must always be revalidated so a new deploy is
        // picked up on the next visit, and may control the whole origin.
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, max-age=0, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
      {
        source: "/api/version",
        headers: [{ key: "Cache-Control", value: "no-cache, max-age=0, must-revalidate" }],
      },
    ];
  },
  // The previous site served /services and /blog routes. That content was
  // retired; redirect permanently so inbound links and search indexes don't 404.
  async redirects() {
    return [
      { source: "/services", destination: "/", permanent: true },
      { source: "/blog", destination: "/", permanent: true },
      { source: "/blog/:id", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
