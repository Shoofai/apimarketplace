import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AffiliatesClient } from './AffiliatesClient';

export const metadata = {
  title: 'Affiliate Program | Provider',
};

export default async function ProviderAffiliatesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: userData } = await supabase
    .from('users')
    .select('current_organization_id')
    .eq('id', user.id)
    .single();

  const orgId = (userData as { current_organization_id?: string } | null)?.current_organization_id;
  if (!orgId) redirect('/dashboard');

  // Fetch org's APIs for per-API link creation
  const { data: apis } = await supabase
    .from('apis')
    .select('id, name, slug, logo_url')
    .eq('organization_id', orgId)
    .eq('status', 'published')
    .order('name');

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.example.com';

  return (
    <AffiliatesClient
      orgId={orgId}
      apis={(apis ?? []) as any}
      siteUrl={siteUrl}
    />
  );
}
