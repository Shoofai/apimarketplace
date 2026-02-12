import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

/**
 * Create a Supabase admin client with service role privileges.
 * 
 * WARNING: This client bypasses Row Level Security (RLS) policies.
 * Only use on the server side for administrative operations.
 * NEVER expose this client or service role key to the browser.
 * 
 * @returns Supabase client with admin privileges
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase environment variables for admin client');
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
