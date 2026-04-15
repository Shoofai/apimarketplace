import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { FAQsAdminClient } from './FAQsAdminClient';

export const metadata = { title: 'FAQ Management' };

export default async function FAQsAdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: userData } = await supabase
    .from('users')
    .select('is_platform_admin')
    .eq('id', user.id)
    .single();
  if (!userData?.is_platform_admin) redirect('/dashboard');

  const admin = createAdminClient();
  const { data: faqs } = await admin
    .from('faqs')
    .select('*')
    .order('category')
    .order('sort_order');

  return <FAQsAdminClient initialFaqs={faqs ?? []} />;
}
