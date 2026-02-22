'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bell } from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useSupabase } from '@/hooks/useSupabase';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from '@/lib/format-distance';

interface Notification {
  id: string;
  title: string;
  body: string;
  link?: string;
  event_type: string;
  is_read: boolean;
  created_at: string;
}

export function NotificationCenter() {
  const supabase = useSupabase();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const fetchNotifications = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let query = supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (filter === 'unread') {
      query = query.eq('is_read', false);
    }

    const { data } = await query;
    if (data) {
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.is_read).length);
    }
  }, [filter, supabase]);

  const subscribeToNotifications = useCallback(() => {
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
        },
        (payload) => {
          setNotifications((prev) => [payload.new as Notification, ...prev.slice(0, 19)]);
          setUnreadCount((count) => count + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  useEffect(() => {
    fetchNotifications();
    subscribeToNotifications();
  }, [fetchNotifications, subscribeToNotifications]);

  async function markAsRead(notificationId: string) {
    await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', notificationId);

    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
    );
    setUnreadCount((count) => Math.max(0, count - 1));
  }

  async function markAllAsRead() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('is_read', false);

    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  }

  const filteredNotifications =
    filter === 'unread' ? notifications.filter((n) => !n.is_read) : notifications;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[380px] p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="font-semibold">Notifications</h3>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFilter(filter === 'all' ? 'unread' : 'all')}
            >
              {filter === 'all' ? 'Unread' : 'All'}
            </Button>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                Mark all read
              </Button>
            )}
          </div>
        </div>

        <ScrollArea className="h-[400px]">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Bell className="h-12 w-12 mb-4 opacity-20" />
              <p>No notifications</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onRead={markAsRead}
                  onClose={() => setIsOpen(false)}
                />
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="border-t p-2">
          <Link href="/dashboard/notifications">
            <Button variant="ghost" className="w-full" onClick={() => setIsOpen(false)}>
              View all notifications
            </Button>
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function NotificationItem({
  notification,
  onRead,
  onClose,
}: {
  notification: Notification;
  onRead: (id: string) => void;
  onClose: () => void;
}) {
  const handleClick = () => {
    if (!notification.is_read) {
      onRead(notification.id);
    }
    if (notification.link) {
      onClose();
    }
  };

  const content = (
    <div
      className={`px-4 py-3 hover:bg-accent cursor-pointer transition-colors ${
        !notification.is_read ? 'bg-accent/50' : ''
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        {!notification.is_read && (
          <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm">{notification.title}</p>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {notification.body}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
          </p>
        </div>
      </div>
    </div>
  );

  if (notification.link) {
    return <Link href={notification.link}>{content}</Link>;
  }

  return content;
}
