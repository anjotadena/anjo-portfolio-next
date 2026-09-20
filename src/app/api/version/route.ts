import { NextResponse } from "next/server";
import { getVersionInfo } from "@/lib/version";

export const dynamic = "force-static";

/** GET /api/version — build identity for the update checker and support/debugging. */
export function GET(): Response {
  return NextResponse.json(getVersionInfo(), { headers: { "Cache-Control": "no-cache, max-age=0, must-revalidate" } });
}
