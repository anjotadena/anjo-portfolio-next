"use client";

import { useEffect } from "react";

/**
 * Component to handle browser extension attributes that cause hydration warnings
 * This suppresses hydration warnings for known browser extension attributes
 */
export default function HydrationProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Only run in development and client-side
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
      const originalError = console.error;
      
      console.error = (...args) => {
        const errorMessage = args[0]?.toString?.() || '';
        
        // Only suppress specific hydration warnings for browser extensions
        // Do NOT suppress React warnings like missing keys, hooks rules, etc.
        const isBrowserExtensionHydrationError = 
          errorMessage.includes('data-testim-main-word-scripts-loaded') ||
          errorMessage.includes('data-testim-') ||
          (errorMessage.includes('Hydration failed') && 
           (errorMessage.includes('data-testim') || 
            errorMessage.includes('browser extension') ||
            errorMessage.includes('extension') && errorMessage.includes('attribute'))) ||
          (errorMessage.includes('server rendered HTML didn\'t match the client') && 
           errorMessage.includes('data-testim'));
        
        if (isBrowserExtensionHydrationError) {
          // Optionally log a simplified message for debugging
          console.info('Browser extension hydration warning suppressed');
          return;
        }
        
        // Pass through all other errors (including React warnings)
        originalError.call(console, ...args);
      };
      
      // Also handle React's hydration warnings at the root level
      const originalWarn = console.warn;
      console.warn = (...args) => {
        const warningMessage = args[0]?.toString?.() || '';
        
        if (warningMessage.includes('data-testim') && 
            (warningMessage.includes('hydration') || warningMessage.includes('mismatch'))) {
          return;
        }
        
        originalWarn.call(console, ...args);
      };
      
      // Restore original console methods on cleanup
      return () => {
        console.error = originalError;
        console.warn = originalWarn;
      };
    }
  }, []);

  return <>{children}</>;
}
