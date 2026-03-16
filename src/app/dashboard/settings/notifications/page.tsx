import { createClient } from '@/lib/supabase/server';
import { DEFAULT_LIST_LIMIT } from '@/lib/utils/constants';
import { redirect } from 'next/navigation';
import { NotificationPreferencesClient } from './NotificationPreferencesClient';

export default async function NotificationPreferencesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: userData } = await supabase
    .from('users')
    .select('id, current_organization_id')
    .eq('id', user.id)
    .single();

  if (!userData) redirect('/dashboard');

  const { data: preferences } = await supabase
    .from('notification_preferences')
    .select('event_type, email_enabled, in_app_enabled, webhook_enabled')
    .eq('user_id', userData.id)
    .eq('organization_id', userData.current_organization_id)
    .limit(DEFAULT_LIST_LIMIT);

  return <NotificationPreferencesClient initialPrefs={(preferences ?? []) as any} />;
}
