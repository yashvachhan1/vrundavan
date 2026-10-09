const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envPath = require('path').join(__dirname, '../apps/frontend/.env.local');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2]?.replace(/^["']|["']$/g, '') ?? '';
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log("No supabase config");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.from('custom_plan_items').select('*').limit(1);
  if (error) console.error("Error:", error.message);
  else console.log("Data:", data);
}
test();
