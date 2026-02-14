import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getPlatformName } from '@/lib/settings/platform-name';
import { PlatformNameForm } from './PlatformNameForm';

export default async function PlatformSettingsPage() {
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
    .eq('id', user.id)
    .single();

  if (!userData?.is_platform_admin) {
    redirect('/dashboard');
  }

  const platformName = await getPlatformName();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Platform Settings</h1>
        <p className="text-muted-foreground">
          Branding and display name used across the application
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Platform name</CardTitle>
          <CardDescription>
            This name appears in the navbar, footer, emails, and metadata. Change it here to update
            the app name everywhere.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PlatformNameForm initialName={platformName} />
        </CardContent>
      </Card>
    </div>
  );
}
