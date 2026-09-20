import fs from "node:fs";
import path from "node:path";
import type { ContentType } from "@/types/content";
import type { VectorMatch, VectorRecord, VectorSearchOptions, VectorStore } from "../types";
import { cosineSimilarity } from "./memory";

export const DEFAULT_INDEX_PATH = "data/knowledge-index.json";
const FILE_VERSION = 1;

interface StoredRecord {
  chunkId: string;
  documentSlug: string;
  type: ContentType;
  visibility: "public" | "private";
  contentHash: string;
  embedding: number[];
}

interface IndexFile {
  version: number;
  embeddingModel: string;
  dimensions: number;
  generatedAt: string;
  records: StoredRecord[];
}

export interface FileVectorStoreOptions {
  /** Absolute or cwd-relative path to the JSON index. */
  filePath?: string;
  dimensions: number;
  embeddingModel: string;
}

/**
 * JSON-file-backed `VectorStore` — the default when no database is
 * configured. `content:index` embeds chunks and writes the file (which is
 * committed alongside the Markdown); at runtime the file is loaded once and
 * searched with brute-force cosine similarity. For a portfolio-sized corpus
 * (tens to a few hundred chunks) that is sub-millisecond, and it means the
 * only runtime dependency for semantic search is the embedding API for the
 * query itself.
 *
 * Only public rows are ever written (the indexer filters) and only public
 * rows are searched (checked again here). Text is NOT stored in the file —
 * chunks are hydrated from the Markdown corpus by id — so the index holds
 * nothing that is not already public.
 */
export class FileVectorStore implements VectorStore {
  readonly name = "file";
  readonly filePath: string;
  private readonly dimensions: number;
  private readonly embeddingModel: string;
  private records = new Map<string, StoredRecord>();
  private loaded = false;
  private dirty = false;

  constructor(options: FileVectorStoreOptions) {
    this.filePath = path.isAbsolute(options.filePath ?? DEFAULT_INDEX_PATH)
      ? (options.filePath ?? DEFAULT_INDEX_PATH)
      : path.join(process.cwd(), options.filePath ?? DEFAULT_INDEX_PATH);
    this.dimensions = options.dimensions;
    this.embeddingModel = options.embeddingModel;
  }

  static exists(filePath: string = DEFAULT_INDEX_PATH): boolean {
    return fs.existsSync(path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath));
  }

  private load(): void {
    if (this.loaded) return;
    this.loaded = true;
    if (!fs.existsSync(this.filePath)) return;
    const parsed = JSON.parse(fs.readFileSync(this.filePath, "utf8")) as Partial<IndexFile>;
    if (parsed.version !== FILE_VERSION || !Array.isArray(parsed.records)) {
      throw new Error(`Knowledge index at ${this.filePath} has an unsupported format; re-run \`npm run content:index -- --reset\`.`);
    }
    if (parsed.embeddingModel !== this.embeddingModel || parsed.dimensions !== this.dimensions) {
      throw new Error(
        `Knowledge index was built with ${parsed.embeddingModel} (${parsed.dimensions} dims) but the app is configured for ` +
          `${this.embeddingModel} (${this.dimensions} dims). Re-run \`npm run content:index -- --reset\`.`,
      );
    }
    for (const record of parsed.records) this.records.set(record.chunkId, record);
  }

  /** Writes the index to disk (atomic rename). Called by `close()` when there are changes. */
  save(): void {
    this.load();
    const file: IndexFile = {
      version: FILE_VERSION,
      embeddingModel: this.embeddingModel,
      dimensions: this.dimensions,
      generatedAt: new Date().toISOString(),
      records: Array.from(this.records.values())
        .sort((a, b) => a.chunkId.localeCompare(b.chunkId))
        // 6 decimals keeps cosine ranking intact and the file diff-friendly.
        .map((record) => ({ ...record, embedding: record.embedding.map((value) => Number(value.toFixed(6))) })),
    };
    fs.mkdirSync(path.dirname(this.filePath), { recursive: true });
    const tmp = `${this.filePath}.tmp`;
    fs.writeFileSync(tmp, `${JSON.stringify(file)}\n`, "utf8");
    fs.renameSync(tmp, this.filePath);
    this.dirty = false;
  }

  reset(): void {
    this.loaded = true;
    this.records.clear();
    this.dirty = true;
  }

  async listHashes(): Promise<Map<string, string>> {
    this.load();
    return new Map(Array.from(this.records.values(), (record) => [record.chunkId, record.contentHash]));
  }

  async upsert(records: readonly VectorRecord[]): Promise<void> {
    this.load();
    for (const record of records) {
      if (record.embedding.length !== this.dimensions) {
        throw new Error(`Embedding for ${record.chunkId} has ${record.embedding.length} dimensions; expected ${this.dimensions}`);
      }
      if (record.visibility !== "public") continue;
      this.records.set(record.chunkId, {
        chunkId: record.chunkId,
        documentSlug: record.documentSlug,
        type: record.type,
        visibility: record.visibility,
        contentHash: record.contentHash,
        embedding: record.embedding,
      });
    }
    this.dirty = true;
  }

  async delete(chunkIds: readonly string[]): Promise<void> {
    this.load();
    for (const id of chunkIds) this.records.delete(id);
    this.dirty = true;
  }

  async search(embedding: readonly number[], options: VectorSearchOptions): Promise<VectorMatch[]> {
    this.load();
    const matches: VectorMatch[] = [];
    for (const record of this.records.values()) {
      if (record.visibility !== "public") continue;
      if (options.types && !options.types.includes(record.type)) continue;
      matches.push({ chunkId: record.chunkId, similarity: cosineSimilarity(embedding, record.embedding) });
    }
    return matches.sort((a, b) => b.similarity - a.similarity || a.chunkId.localeCompare(b.chunkId)).slice(0, options.limit);
  }

  async healthCheck(): Promise<{ ok: boolean; detail?: string }> {
    try {
      this.load();
      return { ok: this.records.size > 0, detail: `${this.records.size} vectors in ${path.basename(this.filePath)}` };
    } catch (error) {
      return { ok: false, detail: error instanceof Error ? error.name : "unknown" };
    }
  }

  async close(): Promise<void> {
    if (this.dirty) this.save();
  }

  size(): number {
    this.load();
    return this.records.size;
  }
}
