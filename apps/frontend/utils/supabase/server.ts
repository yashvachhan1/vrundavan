import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Returns null instead of throwing when the env vars aren't set. Callers on
 * the home page currently avoid a build-time crash only because reading
 * cookies() here makes that route dynamic (so this never runs until a real
 * request) — but a real visitor would still hit the same crash at runtime if
 * the env vars are missing in the deploy target. Degrading to "no data" here
 * keeps the page rendering instead of 500ing for every visitor.
 */
export async function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) return null;

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
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
      },
    }
  );
}
