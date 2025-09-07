"use client";

import { useEffect } from "react";

/**
 * Component to handle browser extension attributes that cause hydration warnings
 * This suppresses hydration warnings for known browser extension attributes
 */
export default function HydrationProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Suppress hydration warnings in development for known browser extension attributes
    if (process.env.NODE_ENV === 'development') {
      const originalError = console.error;
      
      console.error = (...args) => {
        const errorMessage = args[0]?.toString?.() || '';
        
        // Only suppress specific hydration warnings for browser extensions
        // Do NOT suppress React warnings like missing keys, hooks rules, etc.
        if (
          errorMessage.includes('data-testim-main-word-scripts-loaded') ||
          (errorMessage.includes('Hydration failed') && errorMessage.includes('data-testim')) ||
          (errorMessage.includes('server rendered HTML didn\'t match the client') && 
           (errorMessage.includes('data-testim') || errorMessage.includes('browser extension')))
        ) {
          return;
        }
        
        // Pass through all other errors (including React warnings)
        originalError.call(console, ...args);
      };
      
      // Restore original console.error on cleanup
      return () => {
        console.error = originalError;
      };
    }
  }, []);

  return <>{children}</>;
}
