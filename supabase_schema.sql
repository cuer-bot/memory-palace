-- Create Palaces table
CREATE TABLE palaces (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  uuid_api_key uuid DEFAULT gen_random_uuid() UNIQUE NOT NULL,
  public_key text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Memories table
CREATE TABLE memories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  short_id text UNIQUE NOT NULL,
  palace_id uuid REFERENCES palaces(id) ON DELETE CASCADE,
  agent text,
  image_url text,
  ciphertext text,
  signature text,
  algorithm text DEFAULT 'HMAC-SHA256',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for fast lookup by short_id
CREATE INDEX idx_memories_short_id ON memories(short_id);
-- Index for fetching recent palace memories
CREATE INDEX idx_memories_palace_id ON memories(palace_id);
