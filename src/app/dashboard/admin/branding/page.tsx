import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import BrandingSettings from './BrandingSettings';

export const metadata: Metadata = {
  title: 'Branding | Admin',
  description: 'Manage platform logo, favicon, and brand assets',
};

export const dynamic = 'force-dynamic';

export default async function BrandingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: userData } = await supabase
    .from('users')
    .select('is_platform_admin')
    .eq('id', user.id)
    .single();

  if (!userData?.is_platform_admin) redirect('/dashboard');

  return <BrandingSettings />;
}
