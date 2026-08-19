import "@testing-library/jest-dom/vitest";

/**
 * jsdom does not implement matchMedia, which next-themes and any
 * prefers-reduced-motion handling rely on.
 */
if (typeof window !== "undefined" && !window.matchMedia) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string): MediaQueryList =>
      ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }) as unknown as MediaQueryList,
  });
}

if (typeof window !== "undefined" && !window.scrollTo) {
  Object.defineProperty(window, "scrollTo", { writable: true, value: () => {} });
}
