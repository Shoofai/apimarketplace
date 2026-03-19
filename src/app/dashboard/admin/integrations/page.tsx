import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import IntegrationHub from './IntegrationHub';

export const metadata: Metadata = {
  title: 'Integration Hub | Admin',
  description: 'Manage third-party service integrations and API keys',
};

export const dynamic = 'force-dynamic';

export default async function IntegrationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: userData } = await supabase
    .from('users')
    .select('is_platform_admin')
    .eq('id', user.id)
    .single();

  if (!userData?.is_platform_admin) redirect('/dashboard');

  return <IntegrationHub />;
}
