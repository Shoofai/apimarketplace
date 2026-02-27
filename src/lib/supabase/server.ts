import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import type { User } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

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

/**
 * Creates a Supabase client pre-authenticated with a JWT bearer token.
 * Used by CLI and VS Code extension to make authenticated API calls
 * without browser cookies.
 */
export function createClientWithToken(accessToken: string) {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

/** Returns the current user, or null if unauthenticated or if the session is invalid (e.g. expired refresh token). Clears invalid session cookies when getUser() fails. Never throws so the homepage and other callers can safely show logged-out UI. */
export async function getUserSafe(): Promise<{ data: { user: User | null }; error: unknown }> {
  const supabase = await createClient();
  try {
    const result = await supabase.auth.getUser();
    return result;
  } catch (error) {
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignore signOut errors (e.g. no session to clear)
    }
    return { data: { user: null }, error };
  }
}
