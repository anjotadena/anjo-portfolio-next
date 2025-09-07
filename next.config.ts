import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  
  // Add security headers including CSP
  async headers() {
    const isDev = process.env.NODE_ENV === 'development';
    
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              `script-src 'self'${isDev ? " 'unsafe-inline' 'unsafe-eval'" : ""} https://gql.hashnode.com https://vercel.live`,
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https: blob:",
              "connect-src 'self' https://gql.hashnode.com https://vercel.live wss://vercel.live wss://localhost:* ws://localhost:*",
              "frame-src 'self' https://vercel.live",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "upgrade-insecure-requests",
            ].join('; '),
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
  
  // Suppress hydration warnings for browser extensions
  onDemandEntries: {
    // period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },
  
  // Custom webpack config to handle hydration issues
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Suppress hydration warnings in development
      config.infrastructureLogging = {
        level: 'error',
      };
      
      // Add fallback for potential module resolution issues
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
  
  // Experimental features for better hydration handling
  experimental: {
    optimizePackageImports: ['react-icons'],
  },
};

export default nextConfig;
