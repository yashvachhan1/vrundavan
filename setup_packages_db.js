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

const sql = `
CREATE TABLE IF NOT EXISTS public.bundled_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    price TEXT NOT NULL,
    period TEXT NOT NULL,
    description TEXT,
    features JSONB NOT NULL DEFAULT '[]',
    is_popular BOOLEAN NOT NULL DEFAULT false,
    badge_text TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial mock data based on existing UI
INSERT INTO public.bundled_packages (name, price, period, description, features, is_popular, badge_text)
VALUES
(
  'Pre-Wedding Poetics',
  '₹55,000',
  'per shoot',
  'Capturing candid coupling stories in organic golden hour natural lighting.',
  '["1 Cinematographer", "1 Candid Photographer", "Drone coverage", "1 min teaser reel", "3 to 4 min cinematic song"]',
  false,
  null
),
(
  'The Masterpiece',
  '₹1,75,000',
  'per day',
  'Our signature offering. A complete cinematic storytelling of your big day.',
  '["2 Cinematographers", "2 Candid Photographers", "1 Traditional Photographer", "Drone coverage", "5 to 6 min cinematic highlight", "Full cinematic film (40+ mins)", "Premium Photo Album"]',
  true,
  'Most Chosen'
),
(
  'Intimate Elegance',
  '₹85,000',
  'per day',
  'Perfect for smaller, intimate gatherings without compromising on quality.',
  '["1 Cinematographer", "1 Candid Photographer", "1 Traditional Photographer", "3 to 4 min cinematic highlight", "Full event coverage video"]',
  false,
  null
);
`;

async function run() {
  try {
    await client.connect();
    console.log("Connected to Supabase Database successfully.");
    
    await client.query(sql);
    console.log("Bundled Packages table created successfully and default data inserted.");
  } catch (error) {
    console.error("Error creating tables:", error);
  } finally {
    await client.end();
  }
}

run();
