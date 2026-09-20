import { z } from "zod";

/**
 * Server-side environment configuration, validated once with Zod.
 *
 * Optional integrations (OpenAI, PostgreSQL) resolve to explicit modes so
 * nothing degrades silently:
 *   - AI_PROVIDER=auto        -> "openai" when OPENAI_API_KEY is set, else "extractive"
 *   - RETRIEVAL_BACKEND=auto  -> "pgvector" when DATABASE_URL + OPENAI_API_KEY are set,
 *                                "file" when only OPENAI_API_KEY is set (data/knowledge-index.json),
 *                                else "lexical"
 * Forcing a mode (`openai`, `pgvector`, `file`) makes its dependencies mandatory and
 * fails fast at startup if they are missing. Production additionally
 * requires NEXT_PUBLIC_SITE_URL.
 *
 * Secrets never leave this module except through the typed accessors used
 * by providers; nothing here is ever serialized to the client.
 */

const booleanish = z
  .string()
  .optional()
  .transform((value) => value === "1" || value === "true");

const positiveInt = (fallback: number) =>
  z
    .string()
    .optional()
    .transform((value) => (value === undefined || value === "" ? fallback : Number(value)))
    .pipe(z.number().int().positive());

const nonNegativeNumber = (fallback: number) =>
  z
    .string()
    .optional()
    .transform((value) => (value === undefined || value === "" ? fallback : Number(value)))
    .pipe(z.number().nonnegative());

const optionalString = z
  .string()
  .optional()
  .transform((value) => (value && value.trim().length > 0 ? value.trim() : undefined));

const rawSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXT_PUBLIC_SITE_URL: optionalString,
  /** Injected by Vercel (System Environment Variables); used when NEXT_PUBLIC_SITE_URL is not set. */
  VERCEL_PROJECT_PRODUCTION_URL: optionalString,

  OPENAI_API_KEY: optionalString,
  OPENAI_BASE_URL: optionalString,
  AI_PROVIDER: z.enum(["auto", "openai", "extractive"]).default("auto"),
  AI_MODEL: z.string().default("gpt-4.1-mini"),
  AI_MAX_OUTPUT_TOKENS: positiveInt(700),
  AI_REQUEST_TIMEOUT_MS: positiveInt(30_000),
  /** USD per 1M tokens, used only for the estimated-cost log field. */
  AI_INPUT_COST_PER_1M: nonNegativeNumber(0.4),
  AI_OUTPUT_COST_PER_1M: nonNegativeNumber(1.6),

  EMBEDDING_MODEL: z.string().default("text-embedding-3-small"),
  EMBEDDING_DIMENSIONS: positiveInt(1536),

  DATABASE_URL: optionalString,
  RETRIEVAL_BACKEND: z.enum(["auto", "pgvector", "file", "lexical"]).default("auto"),
  KNOWLEDGE_INDEX_PATH: z.string().default("data/knowledge-index.json"),
  RETRIEVAL_MAX_CHUNKS: positiveInt(6),
  RETRIEVAL_MIN_SIMILARITY: nonNegativeNumber(0.3),

  RATE_LIMIT_PER_MINUTE: positiveInt(10),
  RATE_LIMIT_PER_HOUR: positiveInt(50),

  CHAT_STREAM_DELAY_MS: nonNegativeNumber(12),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  E2E_TEST_MODE: booleanish,
});

export type AiProviderMode = "openai" | "extractive";
export type RetrievalBackendMode = "pgvector" | "file" | "lexical";

export interface AppEnv {
  nodeEnv: "development" | "test" | "production";
  isProduction: boolean;
  siteUrl: string;
  ai: {
    mode: AiProviderMode;
    apiKey: string | undefined;
    baseUrl: string | undefined;
    model: string;
    maxOutputTokens: number;
    requestTimeoutMs: number;
    inputCostPer1M: number;
    outputCostPer1M: number;
  };
  embeddings: { model: string; dimensions: number };
  retrieval: {
    backend: RetrievalBackendMode;
    /** True when RETRIEVAL_BACKEND was set explicitly (missing dependencies are then fatal, not a fallback). */
    forced: boolean;
    databaseUrl: string | undefined;
    indexPath: string;
    maxChunks: number;
    minSimilarity: number;
  };
  rateLimit: { perMinute: number; perHour: number };
  chat: { streamDelayMs: number };
  logLevel: "debug" | "info" | "warn" | "error";
  e2eTestMode: boolean;
}

export class EnvValidationError extends Error {
  constructor(message: string) {
    super(`Environment configuration error:\n${message}`);
    this.name = "EnvValidationError";
  }
}

export function parseEnv(source: NodeJS.ProcessEnv): AppEnv {
  const result = rawSchema.safeParse(source);
  if (!result.success) {
    throw new EnvValidationError(result.error.issues.map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`).join("\n"));
  }
  const raw = result.data;
  const problems: string[] = [];
  const isProduction = raw.NODE_ENV === "production";

  const siteUrlSource = raw.NEXT_PUBLIC_SITE_URL ?? (raw.VERCEL_PROJECT_PRODUCTION_URL ? `https://${raw.VERCEL_PROJECT_PRODUCTION_URL}` : undefined);
  if (isProduction && !siteUrlSource) {
    problems.push("NEXT_PUBLIC_SITE_URL is required in production (used for canonical URLs, sitemap, and Open Graph)");
  }

  const hasKey = raw.OPENAI_API_KEY !== undefined;
  const hasDb = raw.DATABASE_URL !== undefined;

  let aiMode: AiProviderMode;
  if (raw.AI_PROVIDER === "openai") {
    if (!hasKey) problems.push("AI_PROVIDER=openai requires OPENAI_API_KEY");
    aiMode = "openai";
  } else if (raw.AI_PROVIDER === "extractive") {
    aiMode = "extractive";
  } else {
    aiMode = hasKey ? "openai" : "extractive";
  }

  let backend: RetrievalBackendMode;
  const forced = raw.RETRIEVAL_BACKEND !== "auto";
  if (raw.RETRIEVAL_BACKEND === "pgvector") {
    if (!hasDb) problems.push("RETRIEVAL_BACKEND=pgvector requires DATABASE_URL");
    if (!hasKey) problems.push("RETRIEVAL_BACKEND=pgvector requires OPENAI_API_KEY (for query embeddings)");
    backend = "pgvector";
  } else if (raw.RETRIEVAL_BACKEND === "file") {
    if (!hasKey) problems.push("RETRIEVAL_BACKEND=file requires OPENAI_API_KEY (for query embeddings)");
    backend = "file";
  } else if (raw.RETRIEVAL_BACKEND === "lexical") {
    backend = "lexical";
  } else {
    backend = hasDb && hasKey ? "pgvector" : hasKey ? "file" : "lexical";
  }

  if (siteUrlSource) {
    try {
      new URL(siteUrlSource);
    } catch {
      problems.push("NEXT_PUBLIC_SITE_URL must be an absolute URL");
    }
  }

  if (problems.length > 0) throw new EnvValidationError(problems.map((p) => `  - ${p}`).join("\n"));

  return {
    nodeEnv: raw.NODE_ENV,
    isProduction,
    siteUrl: (siteUrlSource ?? "http://localhost:3000").replace(/\/+$/, ""),
    ai: {
      mode: aiMode,
      apiKey: raw.OPENAI_API_KEY,
      baseUrl: raw.OPENAI_BASE_URL,
      model: raw.AI_MODEL,
      maxOutputTokens: raw.AI_MAX_OUTPUT_TOKENS,
      requestTimeoutMs: raw.AI_REQUEST_TIMEOUT_MS,
      inputCostPer1M: raw.AI_INPUT_COST_PER_1M,
      outputCostPer1M: raw.AI_OUTPUT_COST_PER_1M,
    },
    embeddings: { model: raw.EMBEDDING_MODEL, dimensions: raw.EMBEDDING_DIMENSIONS },
    retrieval: {
      backend,
      forced,
      databaseUrl: raw.DATABASE_URL,
      indexPath: raw.KNOWLEDGE_INDEX_PATH,
      maxChunks: raw.RETRIEVAL_MAX_CHUNKS,
      minSimilarity: raw.RETRIEVAL_MIN_SIMILARITY,
    },
    rateLimit: { perMinute: raw.RATE_LIMIT_PER_MINUTE, perHour: raw.RATE_LIMIT_PER_HOUR },
    chat: { streamDelayMs: raw.CHAT_STREAM_DELAY_MS },
    logLevel: raw.LOG_LEVEL,
    e2eTestMode: raw.E2E_TEST_MODE,
  };
}

let cached: AppEnv | null = null;

/** Memoized, validated environment. Throws `EnvValidationError` on first use if misconfigured. */
export function getEnv(): AppEnv {
  cached ??= parseEnv(process.env);
  return cached;
}

/** Test hook. */
export function resetEnvCache(): void {
  cached = null;
}
