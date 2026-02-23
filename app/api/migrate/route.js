import { NextResponse } from 'next/server'
import { Client } from 'pg'

export async function POST(req) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const client = new Client({
    connectionString: 'postgresql://postgres:dbjduzeunlfldquwwgsx@db.dbjduzeunlfldquwwgsx.supabase.co:5432/postgres'
  })

  try {
    await client.connect()

    // Add owner_id to palaces
    await client.query(`ALTER TABLE palaces ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES auth.users(id);`)

    // Enable RLS
    await client.query(`ALTER TABLE palaces ENABLE ROW LEVEL SECURITY;`)
    await client.query(`ALTER TABLE memories ENABLE ROW LEVEL SECURITY;`)

    // Create Policies for palaces
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies WHERE tablename = 'palaces' AND policyname = 'Users can manage their own palaces'
        ) THEN
            CREATE POLICY "Users can manage their own palaces"
            ON palaces FOR ALL
            TO authenticated
            USING (auth.uid() = owner_id)
            WITH CHECK (auth.uid() = owner_id);
        END IF;
      END
      $$;
    `)

    // Create Policies for memories
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies WHERE tablename = 'memories' AND policyname = 'Users can manage memories in their own palaces'
        ) THEN
            CREATE POLICY "Users can manage memories in their own palaces"
            ON memories FOR ALL
            TO authenticated
            USING (
              EXISTS (
                SELECT 1 FROM palaces WHERE palaces.id = memories.palace_id AND palaces.owner_id = auth.uid()
              )
            )
            WITH CHECK (
              EXISTS (
                SELECT 1 FROM palaces WHERE palaces.id = memories.palace_id AND palaces.owner_id = auth.uid()
              )
            );
        END IF;
      END
      $$;
    `)

    // Add public_key to palaces
    await client.query(`ALTER TABLE palaces ADD COLUMN IF NOT EXISTS public_key text;`);

    // Modify memories table
    await client.query(`
            ALTER TABLE memories 
            ADD COLUMN IF NOT EXISTS ciphertext text,
            ADD COLUMN IF NOT EXISTS signature text,
            ADD COLUMN IF NOT EXISTS algorithm text DEFAULT 'HMAC-SHA256';
        `);

    // Drop old columns from memories
    const dropCols = [
      'built', 'decisions', 'next_steps', 'files', 'blockers',
      'conversation_context', 'roster', 'metadata', 'version',
      'character', 'session', 'status', 'outcome', 'prev', 'next',
      'skill_url', 'image_prompt'
    ];

    for (const col of dropCols) {
      try {
        await client.query(`ALTER TABLE memories DROP COLUMN IF EXISTS ${col};`);
      } catch (e) { }
    }

    await client.query("NOTIFY pgrst, 'reload schema';")

    return NextResponse.json({ success: true, message: 'Migrations applied successfully' })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  } finally {
    await client.end()
  }
}
