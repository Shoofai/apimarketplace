import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Layout, Palette } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getPlatformName } from '@/lib/settings/platform-name';
import { getHeroVariant } from '@/lib/settings/hero-variant';
import { PlatformNameForm } from './PlatformNameForm';
import { HeroVariantForm } from './HeroVariantForm';

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

  const [platformName, heroVariant] = await Promise.all([
    getPlatformName(),
    getHeroVariant(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Palette className="h-6 w-6" />
          Platform Settings
        </h1>
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layout className="h-5 w-5" />
            Hero variant
          </CardTitle>
          <CardDescription>
            Choose which hero design is shown on the public landing page. Classic: original hero with
            constellation and dual CTAs. Developer: developer-first hero with code block and trust strip.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <HeroVariantForm initialVariant={heroVariant} />
        </CardContent>
      </Card>
    </div>
  );
}
