import { createClient } from '@/lib/supabase/server';
import { DEFAULT_LIST_LIMIT } from '@/lib/utils/constants';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { NOTIFICATION_EVENTS } from '@/lib/notifications/dispatcher';
import { Bell, Mail, Webhook } from 'lucide-react';

export default async function NotificationPreferencesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: userData } = await supabase
    .from('users')
    .select('id, current_organization_id')
    .eq('id', user.id)
    .single();

  if (!userData) {
    redirect('/dashboard');
  }

  // Get existing preferences
  const { data: preferences } = await supabase
    .from('notification_preferences')
    .select('id, event_type, user_id, organization_id, email_enabled, in_app_enabled, webhook_enabled, created_at, updated_at')
    .eq('user_id', userData.id)
    .eq('organization_id', userData.current_organization_id)
    .limit(DEFAULT_LIST_LIMIT);

  // Group events by category
  const eventsByCategory = {
    Billing: Object.entries(NOTIFICATION_EVENTS).filter(([key]) => key.startsWith('billing.')),
    Usage: Object.entries(NOTIFICATION_EVENTS).filter(([key]) => key.startsWith('usage.')),
    API: Object.entries(NOTIFICATION_EVENTS).filter(([key]) => key.startsWith('api.')),
    Team: Object.entries(NOTIFICATION_EVENTS).filter(([key]) => key.startsWith('team.')),
    Governance: Object.entries(NOTIFICATION_EVENTS).filter(([key]) =>
      key.startsWith('governance.')
    ),
    Cost: Object.entries(NOTIFICATION_EVENTS).filter(([key]) => key.startsWith('cost.')),
    System: Object.entries(NOTIFICATION_EVENTS).filter(([key]) => key.startsWith('system.')),
  };

  function getPreference(eventType: string, channel: 'email' | 'in_app' | 'webhook') {
    const pref = preferences?.find((p) => p.event_type === eventType);
    if (pref) {
      return channel === 'email'
        ? pref.email_enabled
        : channel === 'in_app'
          ? pref.in_app_enabled
          : pref.webhook_enabled;
    }
    // Default to enabled for email and in-app
    return channel !== 'webhook';
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Bell className="h-6 w-6" />
          Notification Preferences
        </h1>
        <p className="text-muted-foreground">
          Choose how you want to be notified about events
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Channel Preferences</CardTitle>
          <CardDescription>
            Configure notification channels for each event type
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {Object.entries(eventsByCategory).map(([category, events]) => (
              <div key={category}>
                <h3 className="font-semibold text-lg mb-4">{category}</h3>
                <div className="space-y-4">
                  {events.map(([eventType, config]) => (
                    <div
                      key={eventType}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <Label className="font-medium">{config.title}</Label>
                        <p className="text-sm text-muted-foreground">{eventType}</p>
                      </div>
                      <div className="flex items-center gap-8">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <Switch
                            defaultChecked={getPreference(eventType, 'email')}
                            aria-label={`Email notifications for ${eventType}`}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Bell className="h-4 w-4 text-muted-foreground" />
                          <Switch
                            defaultChecked={getPreference(eventType, 'in_app')}
                            aria-label={`In-app notifications for ${eventType}`}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Webhook className="h-4 w-4 text-muted-foreground" />
                          <Switch
                            defaultChecked={getPreference(eventType, 'webhook')}
                            aria-label={`Webhook notifications for ${eventType}`}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Channel Descriptions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <h4 className="font-medium">Email</h4>
              <p className="text-sm text-muted-foreground">
                Receive notifications via email to your registered address
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Bell className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <h4 className="font-medium">In-App</h4>
              <p className="text-sm text-muted-foreground">
                See notifications in the notification center when logged in
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Webhook className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <h4 className="font-medium">Webhook</h4>
              <p className="text-sm text-muted-foreground">
                Send notifications to your configured webhook endpoints
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
