import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { User } from '@supabase/supabase-js';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Handle cookie setting errors
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // Handle cookie removal errors
          }
        },
      },
    }
  );
}

/** Returns the current user, or null if unauthenticated or if the session is invalid (e.g. expired refresh token). Clears invalid session cookies so the next request is clean. */
export async function getUserSafe(): Promise<{ data: { user: User | null }; error: unknown }> {
  const supabase = await createClient();
  try {
    const result = await supabase.auth.getUser();
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const isInvalidSession =
      /refresh.?token|Refresh Token|session.*expired|invalid.*session/i.test(message);
    if (isInvalidSession) {
      await supabase.auth.signOut();
      return { data: { user: null }, error };
    }
    throw error;
  }
}
