import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Flag, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default async function FeatureFlagsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: userData } = await supabase
    .from('users')
    .select('is_platform_admin')
    .eq('auth_id', user.id)
    .single();

  if (!userData?.is_platform_admin) {
    redirect('/dashboard');
  }

  // Get all feature flags
  const { data: flags } = await supabase
    .from('feature_flags')
    .select('*')
    .order('flag_name');

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Feature Flags</h1>
        <p className="text-muted-foreground">Control platform features and behavior</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5" />
            Global Feature Flags
          </CardTitle>
          <CardDescription>
            Toggle features on or off across the entire platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action="/api/admin/feature-flags/update" method="POST">
            <div className="space-y-6">
              {flags?.map((flag) => (
                <div
                  key={flag.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Label htmlFor={flag.flag_key} className="text-base font-medium">
                        {flag.flag_name}
                      </Label>
                      <Badge variant={flag.is_enabled ? 'default' : 'secondary'}>
                        {flag.is_enabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{flag.description}</p>
                    <code className="text-xs bg-muted px-2 py-1 rounded mt-2 inline-block">
                      {flag.flag_key}
                    </code>
                  </div>
                  <div className="ml-4">
                    <Switch
                      id={flag.flag_key}
                      name={flag.flag_key}
                      defaultChecked={flag.is_enabled}
                      data-flag-key={flag.flag_key}
                      onCheckedChange={async (checked) => {
                        // Update via API
                        await fetch(`/api/admin/feature-flags/${flag.flag_key}`, {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ is_enabled: checked }),
                        });
                        // Reload page to reflect changes
                        window.location.reload();
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </form>

          {flags?.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Flag className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No feature flags configured</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How Feature Flags Work</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Launch Page</h4>
            <p className="text-sm text-muted-foreground">
              When enabled, shows the marketing landing page to all visitors. When disabled,
              shows the main application home page.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Maintenance Mode</h4>
            <p className="text-sm text-muted-foreground">
              When enabled, shows a maintenance page to all non-admin users. Use this during
              deployments or database migrations.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">New Signups</h4>
            <p className="text-sm text-muted-foreground">
              When disabled, prevents new user registrations. Existing users can still log in.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">AI Playground</h4>
            <p className="text-sm text-muted-foreground">
              When enabled, allows users to access AI-powered code generation features.
              Requires valid Anthropic API key.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
