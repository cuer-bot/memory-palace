ALTER TABLE palaces ADD COLUMN IF NOT EXISTS uuid_api_key uuid DEFAULT gen_random_uuid() UNIQUE;
