const { Client } = require('pg');

const client = new Client({ connectionString: 'postgres://postgres.efwumikkhktctpknulbh:vrundavan%402004@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres' });

async function run() {
  await client.connect();
  const res = await client.query('SELECT * FROM orders');
  console.log(JSON.stringify(res.rows, null, 2));
  await client.end();
}

run().catch(console.error);
