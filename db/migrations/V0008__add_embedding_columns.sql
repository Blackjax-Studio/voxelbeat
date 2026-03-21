-- Enable the pgvector extension if not already enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column to tracks table
-- text-embedding-3-small uses 1536 dimensions
ALTER TABLE tracks
ADD COLUMN embedding vector(1536);

-- Add embedding column to users table
ALTER TABLE users
ADD COLUMN embedding vector(1536);
