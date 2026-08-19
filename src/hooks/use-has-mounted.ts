import { useSyncExternalStore } from "react";

function subscribe() {
  // No client-side updates to subscribe to; this hook only distinguishes
  // the server snapshot from the client snapshot to detect hydration.
  return () => {};
}

/**
 * Returns `false` during server rendering and the initial client render
 * (before hydration), then `true` afterward. Use to gate rendering of
 * client-only or theme-dependent UI without causing a hydration mismatch.
 *
 * Implemented with `useSyncExternalStore` instead of `useEffect` + `setState`
 * so React can resolve the value during hydration itself, rather than
 * scheduling a separate cascading render.
 */
export function useHasMounted(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
