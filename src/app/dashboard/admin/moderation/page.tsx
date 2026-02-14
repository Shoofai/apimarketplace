import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ModerationReportList } from './ModerationReportList';

export default async function ModerationPage() {
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
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Moderation</h1>
        <p className="text-muted-foreground">Content reports for forum posts and API reviews</p>
      </div>
      <ModerationReportList />
    </div>
  );
}
