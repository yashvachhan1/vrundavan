const { Client } = require('pg');

const client = new Client({ connectionString: 'postgres://postgres.efwumikkhktctpknulbh:vrundavan%402004@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres' });

async function run() {
  await client.connect();
  console.log("Disabling RLS on orders table...");
  await client.query('ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;');
  
  // Just in case, let's also create a policy if they re-enable it
  try {
    await client.query('DROP POLICY IF EXISTS "Enable read access for all users" ON public.orders;');
    await client.query('CREATE POLICY "Enable read access for all users" ON public.orders FOR SELECT USING (true);');
  } catch(e) {
    console.log(e.message);
  }
  
  console.log("Done.");
  await client.end();
}

run().catch(console.error);
