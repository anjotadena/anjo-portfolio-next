import { NextResponse } from "next/server";
import { getEnv } from "@/lib/config/env";
import { getPublicChunks, getPublicDocuments } from "@/lib/knowledge/repository";
import { getRetriever } from "@/lib/retrieval";
import { getChatProvider } from "@/lib/ai/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/health — liveness and dependency status for load balancers and
 * the Docker HEALTHCHECK. Reports modes and counts only, never
 * configuration values or secrets.
 */
export async function GET(): Promise<Response> {
  const started = Date.now();
  try {
    const env = getEnv();
    const retriever = getRetriever();
    const retrieval = await retriever.healthCheck();
    const body = {
      status: retrieval.ok ? "ok" : "degraded",
      uptimeSeconds: Math.round(process.uptime()),
      content: { documents: getPublicDocuments().length, chunks: getPublicChunks().length },
      retrieval: { retriever: retriever.name, backend: env.retrieval.backend, ok: retrieval.ok, detail: retrieval.detail ?? null },
      ai: { provider: getChatProvider().name, modelBacked: env.ai.mode === "openai" },
      checkedInMs: Date.now() - started,
    };
    return NextResponse.json(body, { status: retrieval.ok ? 200 : 503, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return NextResponse.json(
      { status: "error", errorName: error instanceof Error ? error.name : "unknown" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
