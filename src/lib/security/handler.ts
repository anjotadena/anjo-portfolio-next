import { NextResponse } from "next/server";
import type { ApiErrorBody } from "@/types/chat";
import { EnvValidationError } from "@/lib/config/env";
import { logEvent } from "@/lib/observability/log";

type Handler = (request: Request) => Promise<Response>;

/**
 * Wraps a route handler so that nothing unexpected can escape as a raw
 * 500 with internals: misconfiguration becomes a 503, everything else a
 * generic 500. Only the error *name* is logged — never the message, which
 * could contain request content.
 */
export function safeHandler(route: string, handler: Handler): Handler {
  return async (request) => {
    try {
      return await handler(request);
    } catch (error) {
      if (error instanceof EnvValidationError) {
        logEvent("error", { route, event: "misconfigured" });
        const body: ApiErrorBody = { code: "RETRIEVAL_ERROR", message: "The service is not configured correctly. Please try again later." };
        return NextResponse.json(body, { status: 503, headers: { "Cache-Control": "no-store" } });
      }
      logEvent("error", { route, event: "unhandled_error", errorName: error instanceof Error ? error.name : "unknown" });
      const body: ApiErrorBody = { code: "PROVIDER_ERROR", message: "Something went wrong. Please try again." };
      return NextResponse.json(body, { status: 500, headers: { "Cache-Control": "no-store" } });
    }
  };
}
