-- Run once against your database:
--   psql -U postgres -d ai_code_review -f enable-pgvector.sql

CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pgcrypto; -- needed for gen_random_uuid()

-- If TypeORM's synchronize already created code_chunks with a plain type
-- for `embedding`, convert it. If the table doesn't exist yet, TypeORM will
-- create it correctly from the entity on next boot (skip this block then).
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'code_chunks') THEN
    ALTER TABLE code_chunks
      ALTER COLUMN embedding TYPE vector(1536)
      USING embedding::vector;
  END IF;
END $$;

-- Approximate nearest-neighbor index for fast cosine search at scale.
-- Safe to (re)run.
CREATE INDEX IF NOT EXISTS code_chunks_embedding_idx
  ON code_chunks USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

CREATE INDEX IF NOT EXISTS code_chunks_project_idx ON code_chunks ("projectId");
CREATE INDEX IF NOT EXISTS code_chunks_file_idx ON code_chunks ("fileId");
