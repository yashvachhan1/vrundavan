import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://efwumikkhktctpknulbh.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_GTFOQFpSV2wlb7RQtdbYBQ_5zTxfVv2';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn("VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY missing in environment; using default fallback.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
