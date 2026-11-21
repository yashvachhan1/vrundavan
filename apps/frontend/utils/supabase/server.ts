import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const SUPABASE_DEFAULT_URL = 'https://efwumikkhktctpknulbh.supabase.co';
const SUPABASE_DEFAULT_KEY = 'sb_publishable_GTFOQFpSV2wlb7RQtdbYBQ_5zTxfVv2';

export async function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || SUPABASE_DEFAULT_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || SUPABASE_DEFAULT_KEY;
  if (!supabaseUrl || !supabaseKey) return null;

  try {
    const cookieStore = await cookies();

    return createServerClient(
      supabaseUrl,
      supabaseKey,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // The `setAll` method was called from a Server Component.
            }
          },
        },
      }
    );
  } catch (err) {
    // If cookies() cannot be read (e.g. in some API contexts), fallback to basic client
    return createServerClient(
      supabaseUrl,
      supabaseKey,
      {
        cookies: {
          getAll() { return []; },
          setAll() {},
        },
      }
    );
  }
}
