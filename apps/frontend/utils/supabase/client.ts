import { createBrowserClient } from "@supabase/ssr";

const SUPABASE_DEFAULT_URL = 'https://efwumikkhktctpknulbh.supabase.co';
const SUPABASE_DEFAULT_KEY = 'sb_publishable_GTFOQFpSV2wlb7RQtdbYBQ_5zTxfVv2';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || SUPABASE_DEFAULT_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || SUPABASE_DEFAULT_KEY;

export const createClient = () => {
  if (!supabaseUrl || !supabaseKey) return null;
  return createBrowserClient(supabaseUrl, supabaseKey);
};
