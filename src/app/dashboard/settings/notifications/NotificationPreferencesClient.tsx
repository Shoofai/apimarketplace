'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Bell, Mail, Webhook, Save } from 'lucide-react';
import { NOTIFICATION_EVENTS } from '@/lib/notifications/dispatcher';
import { toast } from 'sonner';

type Channel = 'email' | 'in_app' | 'webhook';

interface Pref {
  event_type: string;
  email_enabled: boolean;
  in_app_enabled: boolean;
  webhook_enabled: boolean;
}

function buildDefaultPrefs(savedPrefs: Pref[]): Record<string, Pref> {
  const map: Record<string, Pref> = {};
  for (const [eventType, config] of Object.entries(NOTIFICATION_EVENTS)) {
    const saved = savedPrefs.find((p) => p.event_type === eventType);
    map[eventType] = saved ?? {
      event_type: eventType,
      email_enabled: config.channels.includes('email' as never),
      in_app_enabled: config.channels.includes('in_app' as never),
      webhook_enabled: false,
    };
  }
  return map;
}

export function NotificationPreferencesClient({ initialPrefs }: { initialPrefs: Pref[] }) {
  const [prefs, setPrefs] = useState(() => buildDefaultPrefs(initialPrefs));
  const [pending, startTransition] = useTransition();
  const [dirty, setDirty] = useState(false);

  const toggle = (eventType: string, channel: Channel) => {
    setPrefs((prev) => {
      const key = `${channel}_enabled` as const;
      return {
        ...prev,
        [eventType]: { ...prev[eventType], [key]: !prev[eventType][key] },
      };
    });
    setDirty(true);
  };

  const save = () => {
    startTransition(async () => {
      const res = await fetch('/api/settings/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences: Object.values(prefs) }),
      });
      if (res.ok) {
        toast.success('Notification preferences saved.');
        setDirty(false);
      } else {
        toast.error('Failed to save preferences. Try again.');
      }
    });
  };

  const eventsByCategory: [string, [string, typeof NOTIFICATION_EVENTS[keyof typeof NOTIFICATION_EVENTS]][]][] = [
    ['Billing', Object.entries(NOTIFICATION_EVENTS).filter(([k]) => k.startsWith('billing.'))],
    ['Usage', Object.entries(NOTIFICATION_EVENTS).filter(([k]) => k.startsWith('usage.'))],
    ['API', Object.entries(NOTIFICATION_EVENTS).filter(([k]) => k.startsWith('api.'))],
    ['Team', Object.entries(NOTIFICATION_EVENTS).filter(([k]) => k.startsWith('team.'))],
    ['Governance', Object.entries(NOTIFICATION_EVENTS).filter(([k]) => k.startsWith('governance.'))],
    ['Cost', Object.entries(NOTIFICATION_EVENTS).filter(([k]) => k.startsWith('cost.'))],
    ['System', Object.entries(NOTIFICATION_EVENTS).filter(([k]) => k.startsWith('system.'))],
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6" />
            Notification Preferences
          </h1>
          <p className="text-muted-foreground">Choose how you want to be notified about events</p>
        </div>
        <Button onClick={save} disabled={!dirty || pending} className="gap-2">
          <Save className="h-4 w-4" />
          {pending ? 'Saving…' : 'Save Changes'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Channel Preferences</CardTitle>
          <CardDescription>Configure notification channels for each event type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {eventsByCategory.map(([category, events]) => (
              <div key={category}>
                <h3 className="font-semibold text-lg mb-4">{category}</h3>
                <div className="space-y-4">
                  {events.map(([eventType, config]) => {
                    const pref = prefs[eventType];
                    return (
                      <div key={eventType} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <Label className="font-medium">{config.title}</Label>
                          <p className="text-sm text-muted-foreground">{eventType}</p>
                        </div>
                        <div className="flex items-center gap-8">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <Switch
                              checked={pref?.email_enabled ?? false}
                              onCheckedChange={() => toggle(eventType, 'email')}
                              aria-label={`Email for ${eventType}`}
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Bell className="h-4 w-4 text-muted-foreground" />
                            <Switch
                              checked={pref?.in_app_enabled ?? false}
                              onCheckedChange={() => toggle(eventType, 'in_app')}
                              aria-label={`In-app for ${eventType}`}
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Webhook className="h-4 w-4 text-muted-foreground" />
                            <Switch
                              checked={pref?.webhook_enabled ?? false}
                              onCheckedChange={() => toggle(eventType, 'webhook')}
                              aria-label={`Webhook for ${eventType}`}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Channel Descriptions</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div><h4 className="font-medium">Email</h4><p className="text-sm text-muted-foreground">Receive notifications via email to your registered address</p></div>
          </div>
          <div className="flex items-start gap-3">
            <Bell className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div><h4 className="font-medium">In-App</h4><p className="text-sm text-muted-foreground">See notifications in the notification center when logged in</p></div>
          </div>
          <div className="flex items-start gap-3">
            <Webhook className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div><h4 className="font-medium">Webhook</h4><p className="text-sm text-muted-foreground">Send notifications to your configured webhook endpoints</p></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
