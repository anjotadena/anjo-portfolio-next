/**
 * Tiny cross-component "is the app busy?" store. The chat marks itself busy
 * while an answer is streaming so the service-worker updater never reloads
 * the page mid-answer; it waits for the next idle moment instead.
 */
let busy = false;
const listeners = new Set<(busy: boolean) => void>();

export function setAppBusy(value: boolean): void {
  if (busy === value) return;
  busy = value;
  for (const listener of listeners) listener(busy);
}

export function isAppBusy(): boolean {
  return busy;
}

export function subscribeAppBusy(listener: (busy: boolean) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Resolves as soon as the app is idle (immediately if it already is). */
export function whenIdle(): Promise<void> {
  if (!busy) return Promise.resolve();
  return new Promise((resolve) => {
    const unsubscribe = subscribeAppBusy((value) => {
      if (!value) {
        unsubscribe();
        resolve();
      }
    });
  });
}
