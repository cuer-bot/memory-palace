const { Client } = require('pg');
const dns = require('dns');

dns.lookup('db.dbjduzeunlfldquwwgsx.supabase.co', 4, async (err, address) => {
    if (err) {
        console.error('DNS lookup failed:', err);
        return;
    }
    console.log('Resolved to IPv4:', address);

    const client = new Client({
        host: address,
        port: 5432,
        user: 'postgres',
        password: 'dbjduzeunlfldquwwgsx',
        database: 'postgres',
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        await client.connect();
        console.log('Connected to DB');

        // Add public_key to palaces
        await client.query(`ALTER TABLE palaces ADD COLUMN IF NOT EXISTS public_key text;`);
        console.log('Added public_key to palaces');

        // Modify memories table
        await client.query(`
            ALTER TABLE memories 
            ADD COLUMN IF NOT EXISTS ciphertext text,
            ADD COLUMN IF NOT EXISTS signature text,
            ADD COLUMN IF NOT EXISTS algorithm text DEFAULT 'HMAC-SHA256';
        `);
        console.log('Added ciphertext, signature, algorithm to memories');

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
                console.log(`Dropped column ${col}`);
            } catch (e) {
                console.log(`Could not drop ${col}: ${e.message}`);
            }
        }

        console.log('Migration successful');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await client.end();
    }
});
