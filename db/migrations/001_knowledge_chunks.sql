-- Reference schema for the pgvector knowledge index.
-- `npm run db:migrate` (PgVectorStore.ensureSchema) applies the equivalent
-- statements idempotently, substituting the configured embedding dimensions
-- (EMBEDDING_DIMENSIONS, default 1536 for text-embedding-3-small).

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS knowledge_chunks (
  chunk_id      text PRIMARY KEY,               -- deterministic: <slug>::<section-slug>::<ordinal>
  document_slug text NOT NULL,
  title         text NOT NULL,
  section       text,
  type          text NOT NULL,                  -- ContentType (project, skills, ...)
  tags          text[] NOT NULL DEFAULT '{}',
  visibility    text NOT NULL DEFAULT 'public', -- only 'public' rows are ever written
  content       text NOT NULL,
  content_hash  text NOT NULL,                  -- sha256(title + heading path + text)
  embedding     vector(1536) NOT NULL,
  metadata      jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS knowledge_chunks_document_slug_idx ON knowledge_chunks (document_slug);
CREATE INDEX IF NOT EXISTS knowledge_chunks_type_idx ON knowledge_chunks (type);
CREATE INDEX IF NOT EXISTS knowledge_chunks_embedding_idx ON knowledge_chunks USING hnsw (embedding vector_cosine_ops);

-- Guards against querying an index built with a different model/dimension.
CREATE TABLE IF NOT EXISTS knowledge_meta (
  key   text PRIMARY KEY,   -- "<table>.embedding_model", "<table>.embedding_dimensions"
  value text NOT NULL
);
