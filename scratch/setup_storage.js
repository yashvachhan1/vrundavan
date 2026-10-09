const { Client } = require('pg');

const client = new Client({ connectionString: 'postgres://postgres.efwumikkhktctpknulbh:vrundavan%402004@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres' });

async function run() {
  await client.connect();
  
  console.log("Adding payment_screenshot_url column to orders...");
  await client.query(`ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_screenshot_url TEXT;`);
  
  console.log("Creating payment-screenshots bucket...");
  try {
    await client.query(`
      INSERT INTO storage.buckets (id, name, public) 
      VALUES ('payment-screenshots', 'payment-screenshots', true)
      ON CONFLICT (id) DO NOTHING;
    `);
    
    // Allow public insert/select to this bucket
    await client.query(`
      CREATE POLICY "Allow public uploads" ON storage.objects
      FOR INSERT TO public WITH CHECK (bucket_id = 'payment-screenshots');
      
      CREATE POLICY "Allow public read" ON storage.objects
      FOR SELECT TO public USING (bucket_id = 'payment-screenshots');
    `);
  } catch(e) {
    console.log("Storage bucket/policies may already exist, or error:", e.message);
  }
  
  console.log("Done.");
  await client.end();
}

run().catch(console.error);
