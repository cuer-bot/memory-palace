const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres:dbjduzeunlfldquwwgsx@db.dbjduzeunlfldquwwgsx.supabase.co:5432/postgres'
});

async function run() {
    try {
        await client.connect();
        console.log('Connected to DB');

        // Add owner_id to palaces
        await client.query(`ALTER TABLE palaces ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES auth.users(id);`);
        console.log('Added owner_id to palaces');

        // Enable RLS
        await client.query(`ALTER TABLE palaces ENABLE ROW LEVEL SECURITY;`);
        await client.query(`ALTER TABLE memories ENABLE ROW LEVEL SECURITY;`);
        console.log('Enabled RLS on palaces and memories');

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
    `);

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
    `);

        console.log('Applied RLS Policies');

        // Notify postgREST to reload schema cache
        await client.query("NOTIFY pgrst, 'reload schema';");
        console.log('Reloaded PostgREST schema cache');

    } catch (err) {
        console.error('Error executing SQL', err);
    } finally {
        await client.end();
    }
}

run();
