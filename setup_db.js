const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Minimal .env loader (no dotenv dependency for a one-off admin script).
// Never hardcode the connection string here — it was previously committed to
// disk in plaintext with the DB password embedded.
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
if (!connectionString) {
  console.error('Missing DATABASE_URL. Add it to a .env file at the repo root (never commit it).');
  process.exit(1);
}

const client = new Client({
  connectionString: connectionString,
});

async function run() {
  try {
    await client.connect();
    console.log("Connected to Supabase Database successfully.");
    
    const sql = fs.readFileSync(path.join(__dirname, 'supabase_schema.sql'), 'utf8');
    
    await client.query(sql);
    console.log("Tables created successfully and default data inserted.");
  } catch (error) {
    console.error("Error creating tables:", error);
  } finally {
    await client.end();
  }
}

run();
