'use client';

import { useEffect, useState } from 'react';
import { useSupabase } from './useSupabase';
import type { User } from '@supabase/supabase-js';
import type { Tables } from '@/types/database.types';

type UserProfile = Tables<'users'>;

interface UseUserReturn {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Hook to get the current authenticated user and their profile.
 * Automatically subscribes to auth state changes.
 * 
 * @returns Current user, profile, loading state, and error
 */
export function useUser(): UseUserReturn {
  const supabase = useSupabase();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Get initial user
    const initializeUser = async () => {
      try {
        const {
          data: { user: currentUser },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;

        setUser(currentUser);

        // Fetch user profile if authenticated
        if (currentUser) {
          const { data: profileData, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', currentUser.id)
            .single();

          if (profileError && profileError.code !== 'PGRST116') {
            // PGRST116 is "not found" - ignore it for new users
            throw profileError;
          }

          setProfile(profileData);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load user'));
      } finally {
        setLoading(false);
      }
    };

    initializeUser();

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        // Fetch updated profile
        const { data: profileData } = await supabase
          .from('users')
          .select('*')
          .eq('id', currentUser.id)
          .single();

        setProfile(profileData);
      } else {
        setProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  return { user, profile, loading, error };
}
