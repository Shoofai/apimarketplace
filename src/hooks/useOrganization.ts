'use client';

import { useEffect, useState } from 'react';
import { useSupabase } from './useSupabase';
import type { Tables } from '@/types/database.types';
import type { UserRole } from '@/lib/utils/constants';

type Organization = Tables<'organizations'>;

interface UseOrganizationReturn {
  organization: Organization | null;
  role: UserRole | null;
  loading: boolean;
  error: Error | null;
  switchOrganization: (organizationId: string) => Promise<void>;
}

/**
 * Hook to get the current user's active organization and role.
 * Provides function to switch between organizations.
 * 
 * @returns Current organization, role, loading state, error, and switch function
 */
export function useOrganization(): UseOrganizationReturn {
  const supabase = useSupabase();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadOrganization = async () => {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setOrganization(null);
        setRole(null);
        setLoading(false);
        return;
      }

      // Fetch user's current organization
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('current_organization_id')
        .eq('id', user.id)
        .single();

      if (userError) throw userError;

      if (userData?.current_organization_id) {
        // Fetch organization details
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', userData.current_organization_id)
          .single();

        if (orgError) throw orgError;

        // Fetch user's role in the organization
        const { data: memberData, error: memberError } = await supabase
          .from('organization_members')
          .select('role')
          .eq('organization_id', userData.current_organization_id)
          .eq('user_id', user.id)
          .single();

        if (memberError) throw memberError;

        setOrganization(orgData);
        setRole((memberData?.role as UserRole) ?? null);
      } else {
        setOrganization(null);
        setRole(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load organization'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrganization();

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadOrganization();
      } else {
        setOrganization(null);
        setRole(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const switchOrganization = async (organizationId: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error('Not authenticated');

      // Update user's current organization
      const { error: updateError } = await supabase
        .from('users')
        .update({ current_organization_id: organizationId })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Reload organization data
      await loadOrganization();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to switch organization'));
      throw err;
    }
  };

  return { organization, role, loading, error, switchOrganization };
}
