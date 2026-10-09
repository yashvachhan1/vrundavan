const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2]?.replace(/^["']|["']$/g, '') ?? '';
    }
  }
}

const connectionString = process.env.DATABASE_URL.replace(':6543/', ':5432/');
if (!connectionString) {
  console.error('Missing DATABASE_URL');
  process.exit(1);
}

const client = new Client({ connectionString });

async function run() {
  try {
    await client.connect();
    const query = `
      CREATE TABLE IF NOT EXISTS public.instagram_reels (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          url TEXT NOT NULL,
          sort_order INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      -- Insert defaults if empty
      INSERT INTO public.instagram_reels (url, sort_order) 
      SELECT 'https://www.instagram.com/reel/DA29kPvyN_N/', 1
      WHERE NOT EXISTS (SELECT 1 FROM public.instagram_reels);

      INSERT INTO public.instagram_reels (url, sort_order) 
      SELECT 'https://www.instagram.com/reel/C_q8oG8S22y/', 2
      WHERE NOT EXISTS (SELECT 1 FROM public.instagram_reels WHERE sort_order = 2);

      INSERT INTO public.instagram_reels (url, sort_order) 
      SELECT 'https://www.instagram.com/reel/C_s5jUQS14t/', 3
      WHERE NOT EXISTS (SELECT 1 FROM public.instagram_reels WHERE sort_order = 3);
    `;
    await client.query(query);
    console.log("Reels table created and populated.");
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}
run();
