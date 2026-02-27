import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AdminBundlesClient } from './AdminBundlesClient';

export const metadata = {
  title: 'API Bundles | Admin',
};

export default async function AdminBundlesPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (userData?.role !== 'admin') redirect('/dashboard');

  const { data: bundles } = await supabase
    .from('api_bundles')
    .select(`
      *,
      api_bundle_items (
        id, sort_order,
        api:apis(id, name, logo_url)
      )
    `)
    .order('created_at', { ascending: false });

  const { data: apis } = await supabase
    .from('apis')
    .select('id, name, slug, logo_url')
    .eq('status', 'published')
    .order('name');

  return (
    <AdminBundlesClient
      initialBundles={(bundles ?? []) as any}
      availableApis={(apis ?? []) as any}
    />
  );
}
