'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import { useSupabase } from '@/hooks/useSupabase';
import { formatDistanceToNow } from '@/lib/format-distance';
import Link from 'next/link';

interface Notification {
  id: string;
  title: string;
  body: string;
  link?: string;
  event_type: string;
  is_read: boolean;
  created_at: string;
}

export function NotificationsList({ initialNotifications }: { initialNotifications: Notification[] }) {
  const supabase = useSupabase();
  const [notifications, setNotifications] = useState(initialNotifications);

  async function markAsRead(id: string) {
    await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  }

  async function markAllAsRead() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('is_read', false);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  if (notifications.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <Bell className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
          <p className="font-medium mb-1">No notifications yet</p>
          <p className="text-sm text-muted-foreground max-w-sm">
            Notifications will appear here when you receive them
          </p>
          <Link href="/dashboard">
            <Button variant="outline" className="mt-4">
              Back to Dashboard
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        {unreadCount > 0 && (
          <div className="flex justify-end p-3 border-b">
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          </div>
        )}
        <div className="divide-y">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`px-4 py-3 hover:bg-accent/50 transition-colors ${
                !n.is_read ? 'bg-accent/30' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                {!n.is_read && (
                  <button
                    onClick={() => markAsRead(n.id)}
                    className="mt-2 h-2 w-2 rounded-full bg-primary flex-shrink-0"
                    title="Mark as read"
                    aria-label="Mark as read"
                  />
                )}
                <div className="flex-1 min-w-0">
                  {n.link ? (
                    <Link href={n.link} className="block hover:underline">
                      <p className="font-medium text-sm">{n.title}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {n.body}
                      </p>
                    </Link>
                  ) : (
                    <>
                      <p className="font-medium text-sm">{n.title}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {n.body}
                      </p>
                    </>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
