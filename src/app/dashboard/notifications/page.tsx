import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { NotificationsList } from './NotificationsList';
import { Bell } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Notifications | Dashboard',
  description: 'View your notifications',
};

export default async function NotificationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: notifications } = await supabase
    .from('notifications')
    .select('id, title, body, link, event_type, is_read, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(100);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Bell className="h-6 w-6" />
              Notifications
            </h1>
            <p className="text-muted-foreground">
              Your notifications across the platform
            </p>
          </div>
        </div>
      </div>

      <NotificationsList initialNotifications={notifications ?? []} />
    </div>
  );
}
