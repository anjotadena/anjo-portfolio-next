import type { ContentChunk } from "@/types/content";
import type { EmbeddingProvider, VectorRecord, VectorStore } from "@/lib/retrieval/types";
import { chunkEmbeddingText } from "./chunker";

export interface IndexStats {
  total: number;
  unchanged: number;
  inserted: number;
  updated: number;
  deleted: number;
  embeddedTexts: number;
  durationMs: number;
}

export interface IndexOptions {
  store: VectorStore;
  embeddings: EmbeddingProvider;
  /** Only public chunks should ever be passed in; the indexer enforces it again. */
  chunks: readonly ContentChunk[];
  /** Embedding batch size. */
  batchSize?: number;
  log?: (message: string) => void;
}

/**
 * Incremental indexing:
 *
 *   unchanged (same id, same hash)  -> skip
 *   changed   (same id, new hash)   -> re-embed + upsert
 *   new       (id not in store)     -> embed + insert
 *   deleted   (id no longer exists) -> remove
 *
 * Because chunk ids are deterministic (`slug::section::ordinal`) and the
 * hash covers title + heading path + text, editing one section of one
 * file re-embeds exactly that section. Private chunks are refused here as
 * a second line of defence behind `getPublicChunks()`.
 */
export async function indexContent(options: IndexOptions): Promise<IndexStats> {
  const started = Date.now();
  const log = options.log ?? (() => {});
  const batchSize = options.batchSize ?? 32;

  const chunks = options.chunks.filter((chunk) => chunk.visibility === "public");
  const existing = await options.store.listHashes();
  const currentIds = new Set(chunks.map((chunk) => chunk.id));

  const toEmbed: ContentChunk[] = [];
  let unchanged = 0;
  let inserted = 0;
  let updated = 0;
  for (const chunk of chunks) {
    const storedHash = existing.get(chunk.id);
    if (storedHash === chunk.contentHash) {
      unchanged += 1;
      continue;
    }
    if (storedHash === undefined) inserted += 1;
    else updated += 1;
    toEmbed.push(chunk);
  }
  const toDelete = Array.from(existing.keys()).filter((id) => !currentIds.has(id));

  log(`${chunks.length} public chunks: ${unchanged} unchanged, ${inserted} new, ${updated} changed, ${toDelete.length} to delete`);

  for (let i = 0; i < toEmbed.length; i += batchSize) {
    const batch = toEmbed.slice(i, i + batchSize);
    const vectors = await options.embeddings.embed(batch.map(chunkEmbeddingText));
    const records: VectorRecord[] = batch.map((chunk, index) => ({
      chunkId: chunk.id,
      documentSlug: chunk.documentSlug,
      title: chunk.documentTitle,
      section: chunk.section,
      type: chunk.type,
      tags: chunk.tags,
      visibility: chunk.visibility,
      content: chunk.text,
      contentHash: chunk.contentHash,
      embedding: vectors[index] ?? [],
      metadata: {
        headingPath: chunk.headingPath,
        chunkIndex: chunk.chunkIndex,
        technologies: chunk.technologies,
        related: chunk.related,
        featured: chunk.featured,
        embeddingModel: options.embeddings.model,
      },
    }));
    await options.store.upsert(records);
    log(`embedded ${Math.min(i + batchSize, toEmbed.length)}/${toEmbed.length}`);
  }

  if (toDelete.length > 0) {
    await options.store.delete(toDelete);
    log(`deleted ${toDelete.length} stale chunk(s)`);
  }

  return {
    total: chunks.length,
    unchanged,
    inserted,
    updated,
    deleted: toDelete.length,
    embeddedTexts: toEmbed.length,
    durationMs: Date.now() - started,
  };
}
