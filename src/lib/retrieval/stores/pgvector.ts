import { Pool, type PoolConfig } from "pg";
import type { ContentType } from "@/types/content";
import type { VectorMatch, VectorRecord, VectorSearchOptions, VectorStore } from "../types";

export interface PgVectorStoreOptions {
  connectionString: string;
  /** Must match the embedding provider's output size. */
  dimensions: number;
  /** Recorded in `knowledge_meta`; a mismatch on startup fails loudly. */
  embeddingModel: string;
  tableName?: string;
  poolConfig?: Omit<PoolConfig, "connectionString">;
  statementTimeoutMs?: number;
}

const TABLE_PATTERN = /^[a-z_][a-z0-9_]*$/;

/** pgvector expects `[x,y,z]` text for the `vector` type. */
export function toVectorLiteral(embedding: readonly number[]): string {
  return `[${embedding.map((value) => (Number.isFinite(value) ? value.toString() : "0")).join(",")}]`;
}

/**
 * PostgreSQL + pgvector implementation of `VectorStore`.
 *
 * Schema (see `db/migrations/001_knowledge_chunks.sql` for the reference
 * DDL — `ensureSchema()` applies the same statements idempotently):
 *
 *   knowledge_chunks(chunk_id PK, document_slug, title, section, type,
 *     tags text[], visibility, content, content_hash, embedding vector(N),
 *     metadata jsonb, created_at, updated_at)
 *   knowledge_meta(key PK, value)  -- embedding model/dimensions guard
 *
 * All queries are parameterized; the only interpolated identifier is the
 * table name, which is validated against a strict pattern.
 */
export class PgVectorStore implements VectorStore {
  readonly name = "pgvector";
  private readonly pool: Pool;
  private readonly table: string;
  private readonly dimensions: number;
  private readonly embeddingModel: string;
  private schemaReady: Promise<void> | null = null;

  constructor(options: PgVectorStoreOptions) {
    const table = options.tableName ?? "knowledge_chunks";
    if (!TABLE_PATTERN.test(table)) throw new Error("Invalid table name");
    this.table = table;
    this.dimensions = options.dimensions;
    this.embeddingModel = options.embeddingModel;
    this.pool = new Pool({
      connectionString: options.connectionString,
      max: 5,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
      statement_timeout: options.statementTimeoutMs ?? 10_000,
      ...options.poolConfig,
    });
    // A pool error (e.g. server restart) must not crash the process.
    this.pool.on("error", () => {});
  }

  /** Creates the extension, tables, and index if missing, and verifies the embedding config matches. */
  ensureSchema(): Promise<void> {
    this.schemaReady ??= this.createSchema();
    return this.schemaReady;
  }

  private async createSchema(): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query("CREATE EXTENSION IF NOT EXISTS vector");
      await client.query(`
        CREATE TABLE IF NOT EXISTS ${this.table} (
          chunk_id      text PRIMARY KEY,
          document_slug text NOT NULL,
          title         text NOT NULL,
          section       text,
          type          text NOT NULL,
          tags          text[] NOT NULL DEFAULT '{}',
          visibility    text NOT NULL DEFAULT 'public',
          content       text NOT NULL,
          content_hash  text NOT NULL,
          embedding     vector(${this.dimensions}) NOT NULL,
          metadata      jsonb NOT NULL DEFAULT '{}'::jsonb,
          created_at    timestamptz NOT NULL DEFAULT now(),
          updated_at    timestamptz NOT NULL DEFAULT now()
        )`);
      await client.query(`CREATE INDEX IF NOT EXISTS ${this.table}_document_slug_idx ON ${this.table} (document_slug)`);
      await client.query(`CREATE INDEX IF NOT EXISTS ${this.table}_type_idx ON ${this.table} (type)`);
      await client.query(
        `CREATE INDEX IF NOT EXISTS ${this.table}_embedding_idx ON ${this.table} USING hnsw (embedding vector_cosine_ops)`,
      );
      await client.query(`CREATE TABLE IF NOT EXISTS knowledge_meta (key text PRIMARY KEY, value text NOT NULL)`);

      // Guard keys are namespaced by table so several indexes (e.g. a test
      // table) can coexist in one database with different embedding configs.
      const meta = await client.query<{ key: string; value: string }>("SELECT key, value FROM knowledge_meta WHERE key LIKE $1", [`${this.table}.%`]);
      const current = new Map(meta.rows.map((row) => [row.key, row.value]));
      const expected: Array<[string, string]> = [
        [`${this.table}.embedding_model`, this.embeddingModel],
        [`${this.table}.embedding_dimensions`, String(this.dimensions)],
      ];
      for (const [key, value] of expected) {
        const existing = current.get(key);
        if (existing !== undefined && existing !== value) {
          throw new Error(
            `knowledge_meta "${key}" is "${existing}" but the app is configured for "${value}". ` +
              `Re-index with \`npm run content:index -- --reset\` after changing the embedding model or dimensions.`,
          );
        }
        if (existing === undefined) {
          await client.query("INSERT INTO knowledge_meta (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING", [key, value]);
        }
      }
    } finally {
      client.release();
    }
  }

  /** Drops every stored chunk and the meta guard (used by `content:index --reset`). */
  async reset(): Promise<void> {
    await this.ensureSchema();
    await this.pool.query(`TRUNCATE ${this.table}`);
    await this.pool.query("DELETE FROM knowledge_meta WHERE key LIKE $1", [`${this.table}.%`]);
    this.schemaReady = null;
    await this.ensureSchema();
  }

  async listHashes(): Promise<Map<string, string>> {
    await this.ensureSchema();
    const result = await this.pool.query<{ chunk_id: string; content_hash: string }>(
      `SELECT chunk_id, content_hash FROM ${this.table}`,
    );
    return new Map(result.rows.map((row) => [row.chunk_id, row.content_hash]));
  }

  async upsert(records: readonly VectorRecord[]): Promise<void> {
    if (records.length === 0) return;
    await this.ensureSchema();
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      for (const record of records) {
        if (record.embedding.length !== this.dimensions) {
          throw new Error(`Embedding for ${record.chunkId} has ${record.embedding.length} dimensions; expected ${this.dimensions}`);
        }
        await client.query(
          `INSERT INTO ${this.table}
             (chunk_id, document_slug, title, section, type, tags, visibility, content, content_hash, embedding, metadata, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::vector, $11::jsonb, now(), now())
           ON CONFLICT (chunk_id) DO UPDATE SET
             document_slug = EXCLUDED.document_slug,
             title = EXCLUDED.title,
             section = EXCLUDED.section,
             type = EXCLUDED.type,
             tags = EXCLUDED.tags,
             visibility = EXCLUDED.visibility,
             content = EXCLUDED.content,
             content_hash = EXCLUDED.content_hash,
             embedding = EXCLUDED.embedding,
             metadata = EXCLUDED.metadata,
             updated_at = now()`,
          [
            record.chunkId,
            record.documentSlug,
            record.title,
            record.section,
            record.type,
            record.tags,
            record.visibility,
            record.content,
            record.contentHash,
            toVectorLiteral(record.embedding),
            JSON.stringify(record.metadata),
          ],
        );
      }
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async delete(chunkIds: readonly string[]): Promise<void> {
    if (chunkIds.length === 0) return;
    await this.ensureSchema();
    await this.pool.query(`DELETE FROM ${this.table} WHERE chunk_id = ANY($1::text[])`, [Array.from(chunkIds)]);
  }

  async search(embedding: readonly number[], options: VectorSearchOptions): Promise<VectorMatch[]> {
    await this.ensureSchema();
    const params: unknown[] = [toVectorLiteral(embedding), options.limit];
    let typeFilter = "";
    if (options.types && options.types.length > 0) {
      params.push(options.types satisfies ContentType[]);
      typeFilter = ` AND type = ANY($3::text[])`;
    }
    const result = await this.pool.query<{ chunk_id: string; similarity: number }>(
      `SELECT chunk_id, 1 - (embedding <=> $1::vector) AS similarity
         FROM ${this.table}
        WHERE visibility = 'public'${typeFilter}
        ORDER BY embedding <=> $1::vector
        LIMIT $2`,
      params,
    );
    return result.rows.map((row) => ({ chunkId: row.chunk_id, similarity: Number(row.similarity) }));
  }

  async healthCheck(): Promise<{ ok: boolean; detail?: string }> {
    try {
      await this.ensureSchema();
      const result = await this.pool.query<{ count: string }>(`SELECT count(*)::text AS count FROM ${this.table}`);
      return { ok: true, detail: `${result.rows[0]?.count ?? "0"} vectors in pgvector` };
    } catch (error) {
      return { ok: false, detail: error instanceof Error ? error.name : "unknown" };
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}
