"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { LayoutProvider } from "./context/LayoutContext";

const HTML_STATIC_TIMEOUT = 4000;

/**
 * Change document title based on tab visibility
 */
const handleChangeTitle = () => {
  if (document.visibilityState === "hidden") {
    document.title = "Anjo Tadena";
  } else {
    document.title = "Portfolio";
  }
};

const AppProviderWrapper = ({
  children,
}: Readonly<{ children: React.ReactNode }>) => {
  const pathname = usePathname();

  useEffect(() => {
    // Ensure DOM manipulation only happens on client side after mount
    const splashScreen = document.querySelector("#splash-screen");
    const nextSplash = document.querySelector<HTMLDivElement>("#__next_splash");

    if (nextSplash?.hasChildNodes()) {
      splashScreen?.classList.add("remove");
    }

    const handleDOMNodeInserted = () => {
      splashScreen?.classList.add("remove");
    };

    // Use modern MutationObserver instead of deprecated DOMNodeInserted
    if (nextSplash) {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            handleDOMNodeInserted();
          }
        });
      });
      
      observer.observe(nextSplash, { childList: true });
      
      // Cleanup observer on unmount
      return () => observer.disconnect();
    }

    // Dynamic import to avoid SSR issues
    import("preline/preline").catch(console.error);

    document.addEventListener("visibilitychange", handleChangeTitle);

    return () => {
      document.removeEventListener("visibilitychange", handleChangeTitle);
    };
  }, []); // Empty dependency array to run only once

  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof window !== 'undefined' && window.HSStaticMethods) {
        window.HSStaticMethods.autoInit();
      }
    }, HTML_STATIC_TIMEOUT);

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <>
      <LayoutProvider>{children}</LayoutProvider>
    </>
  );
};

export default AppProviderWrapper;
