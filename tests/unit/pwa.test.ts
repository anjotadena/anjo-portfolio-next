import { describe, expect, it } from "vitest";
import { buildServiceWorker } from "@/lib/pwa/service-worker-source";
import { isAppBusy, setAppBusy, subscribeAppBusy, whenIdle } from "@/lib/pwa/activity";
import { commitUrl } from "@/lib/version";

describe("service worker source", () => {
  it("bakes the build label into the worker and produces valid JavaScript", () => {
    const source = buildServiceWorker("1.2.3+abc1234");
    expect(source).toContain('const VERSION = "1.2.3+abc1234";');
    expect(source).not.toContain("__VERSION__");
    // Syntax check only — a service worker cannot run in Node.
    expect(() => new Function(source)).not.toThrow();
  });

  it("strips characters that could break out of the version literal", () => {
    expect(buildServiceWorker('1.0.0"; alert(1); //')).toContain('const VERSION = "1.0.0alert1";');
  });

  it("never caches API responses and always revalidates itself", () => {
    const source = buildServiceWorker("1.0.0+x");
    expect(source).toMatch(/url\.pathname\.startsWith\("\/api\/"\)[^\n]*return;/);
    expect(source).toContain("self.skipWaiting()");
    expect(source).toContain("self.clients.claim()");
  });
});

describe("app activity store", () => {
  it("resolves whenIdle immediately when idle and after the app becomes idle", async () => {
    setAppBusy(false);
    await expect(whenIdle()).resolves.toBeUndefined();
    setAppBusy(true);
    expect(isAppBusy()).toBe(true);
    const seen: boolean[] = [];
    const unsubscribe = subscribeAppBusy((busy) => seen.push(busy));
    const idle = whenIdle();
    setAppBusy(false);
    await expect(idle).resolves.toBeUndefined();
    expect(seen).toEqual([false]);
    unsubscribe();
  });
});

describe("version helpers", () => {
  it("links to the commit only for real SHAs", () => {
    expect(commitUrl("https://github.com/anjotadena/anjo-portfolio-next/", "2938c3a")).toBe("https://github.com/anjotadena/anjo-portfolio-next/commit/2938c3a");
    expect(commitUrl("https://github.com/x/y", "dev")).toBeNull();
  });
});
