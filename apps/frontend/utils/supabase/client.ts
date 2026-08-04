import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Returns null instead of throwing when the env vars aren't set, so a missing
 * Supabase config degrades to "no data" for the caller instead of crashing
 * the page outright — this ran at prerender time even for a "use client"
 * page, so an unconditional throw here previously failed the entire build.
 */
export const createClient = () => {
  if (!supabaseUrl || !supabaseKey) return null;
  return createBrowserClient(supabaseUrl, supabaseKey);
};
