-- Add favorite_count to tracks table
ALTER TABLE tracks ADD COLUMN favorite_count BIGINT DEFAULT 0 NOT NULL;
