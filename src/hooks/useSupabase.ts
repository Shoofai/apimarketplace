'use client';

import { createClient } from '@/lib/supabase/client';
import { useMemo } from 'react';

/**
 * Hook to get a memoized Supabase client for browser use.
 * The client is created once and reused across re-renders.
 * 
 * @returns Supabase client instance
 */
export function useSupabase() {
  return useMemo(() => createClient(), []);
}
