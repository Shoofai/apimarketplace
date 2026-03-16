'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ProviderOnboardWizard } from '@/components/provider/ProviderOnboardWizard';
import { Loader2 } from 'lucide-react';

export function ProviderOnboardPageClient() {
  const [providerId, setProviderId] = useState<string | null>(null);
  const [initialProfile, setInitialProfile] = useState<{
    company_name?: string | null;
    api_name?: string | null;
    api_description?: string | null;
    api_category?: string[] | null;
    total_endpoints?: number | null;
    ai_enhanced_description?: string | null;
    ai_suggested_pricing?: { tiers?: unknown[] } | null;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const res = await fetch('/api/provider/onboard/ensure-profile');
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? 'Failed to load profile');
          return;
        }
        const id = data.provider_id as string;
        if (!id || cancelled) return;

        setProviderId(id);

        const supabase = createClient();
        const { data: profile, error: profileErr } = await supabase
          .from('provider_profiles')
          .select(
            'company_name, api_name, api_description, api_category, total_endpoints, ai_enhanced_description, ai_suggested_pricing'
          )
          .eq('id', id)
          .maybeSingle();

        if (cancelled) return;
        if (profileErr) {
          setError(profileErr.message);
          return;
        }
        setInitialProfile(profile ?? null);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Something went wrong');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !providerId) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
        {error ?? 'Missing provider profile'}
      </div>
    );
  }

  return (
    <ProviderOnboardWizard
      providerId={providerId}
      initialProfile={initialProfile as Parameters<typeof ProviderOnboardWizard>[0]['initialProfile']}
    />
  );
}
