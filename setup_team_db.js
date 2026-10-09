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
if (!connectionString) {
  console.error('Missing DATABASE_URL.');
  process.exit(1);
}

const client = new Client({ connectionString });

async function run() {
  try {
    await client.connect();
    console.log("Connected to DB.");
    const sql = fs.readFileSync(path.join(__dirname, 'setup_team.sql'), 'utf8');
    await client.query(sql);
    console.log("Team tables created successfully.");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.end();
  }
}
run();
