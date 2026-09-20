import { buildServiceWorker } from "@/lib/pwa/service-worker-source";
import { BUILD_LABEL } from "@/lib/version";

// Prerendered at build time with the build label baked in, so each deploy
// serves a byte-different worker and browsers install the update.
export const dynamic = "force-static";

export function GET(): Response {
  return new Response(buildServiceWorker(BUILD_LABEL), {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "no-cache, max-age=0, must-revalidate",
      "Service-Worker-Allowed": "/",
    },
  });
}
