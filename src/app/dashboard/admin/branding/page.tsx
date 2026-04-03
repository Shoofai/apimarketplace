import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import BrandingSettings from './BrandingSettings';
import { Breadcrumb } from '@/components/ui/breadcrumb';

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

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Admin', href: '/dashboard/admin' }, { label: 'Branding' }]} className="mb-6" />
      <BrandingSettings />
    </div>
  );
}
