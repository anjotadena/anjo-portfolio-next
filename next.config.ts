import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  
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
    }
    return config;
  },
  
  // Experimental features for better hydration handling
  experimental: {
    optimizePackageImports: ['react-icons'],
  },
};

export default nextConfig;
