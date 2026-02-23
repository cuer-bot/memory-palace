const { Client } = require('pg');
const regions = [
  'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
  'eu-central-1', 'eu-west-1', 'eu-west-2',
  'ap-southeast-1', 'ap-southeast-2',
  'ap-northeast-1', 'ap-northeast-2',
  'ap-south-1', 'sa-east-1', 'ca-central-1'
];

async function tryConnect() {
  for (const region of regions) {
    for (const port of [6543, 5432]) {
      const host = `aws-0-${region}.pooler.supabase.com`;
      console.log(`Trying ${host}:${port} ...`);
      const client = new Client({
        connectionString: `postgresql://postgres.dbjduzeunlfldquwwgsx:dbjduzeunlfldquwwgsx@${host}:${port}/postgres`,
        ssl: { rejectUnauthorized: false }
      });
      try {
        await client.connect();
        console.log('SUCCESS:', host, 'port:', port);
        await client.end();
        process.exit(0);
      } catch (err) {
        // Ignoring expected failures
      }
    }
  }
  console.log('All failed');
}
tryConnect();
