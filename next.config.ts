import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";

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
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  // The previous Vite site served /services and /blog routes. That content
  // is being retired for the Next rebuild; redirect permanently to the home
  // page so existing inbound links and search indexes don't 404.
  async redirects() {
    return [
      { source: "/services", destination: "/", permanent: true },
      { source: "/blog", destination: "/", permanent: true },
      { source: "/blog/:id", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
