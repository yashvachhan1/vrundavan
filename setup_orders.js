const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2]?.replace(/^["']|["']$/g, '') ?? '';
    }
  }
}

const connectionString = process.env.DATABASE_URL;
const client = new Client({ connectionString: connectionString });

async function run() {
  try {
    await client.connect();
    const sql = `
      CREATE TABLE IF NOT EXISTS public.orders (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          customer TEXT NOT NULL,
          phone TEXT,
          email TEXT,
          package TEXT,
          date DATE,
          status TEXT DEFAULT 'pending',
          "amountPaid" TEXT,
          "assignedTeam" JSONB DEFAULT '[]'::jsonb,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
      );
      
      -- Reload schema cache in Supabase PostgREST (Optional, Supabase usually handles it within minutes)
      NOTIFY pgrst, 'reload schema';
    `;
    await client.query(sql);
    console.log("Orders table created successfully.");
  } catch (error) {
    console.error("Error creating tables:", error);
  } finally {
    await client.end();
  }
}
run();
