import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AdminCreditsClient } from './AdminCreditsClient';

export const metadata = { title: 'Credit Packages | Admin' };

export default async function AdminCreditsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single();
  if (userData?.role !== 'admin') redirect('/dashboard');

  const { data: packages } = await supabase
    .from('credit_packages')
    .select('*')
    .order('credits', { ascending: true });

  return <AdminCreditsClient initialPackages={(packages ?? []) as any} />;
}
