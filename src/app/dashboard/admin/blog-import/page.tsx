import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import BlogImporter from './BlogImporter';

export const metadata: Metadata = {
  title: 'Blog Import | Admin',
  description: 'Import blog articles from Google Drive',
};

export const dynamic = 'force-dynamic';

export default async function BlogImportPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: userData } = await supabase
    .from('users')
    .select('is_platform_admin')
    .eq('id', user.id)
    .single();

  if (!userData?.is_platform_admin) redirect('/dashboard');

  return <BlogImporter />;
}
