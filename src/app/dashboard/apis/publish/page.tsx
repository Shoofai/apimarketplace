import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { PublishWizard } from '@/components/apis/PublishWizard';

export const metadata = {
  title: 'Publish API | Dashboard',
  description: 'Publish a new API to the marketplace',
};

export default async function PublishAPIPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: userData } = await supabase
    .from('users')
    .select(`
      id,
      current_organization_id,
      organizations:current_organization_id ( id, name, type, slug )
    `)
    .eq('id', user.id)
    .single();

  if (!userData) {
    redirect('/login');
  }

  const orgRaw = Array.isArray(userData.organizations) ? userData.organizations[0] : userData.organizations;
  const org = orgRaw as { id: string; name: string; type: string; slug: string } | null;
  const isProvider = org?.type === 'provider' || org?.type === 'both';

  if (!isProvider) {
    redirect('/dashboard');
  }

  const { data: categories } = await supabase
    .from('api_categories')
    .select('id, name, slug')
    .order('name');

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Publish New API</h1>
        <p className="text-muted-foreground mt-1">
          Add your API to the marketplace in a few steps
        </p>
      </div>

      <PublishWizard categories={categories ?? []} />
    </div>
  );
}
