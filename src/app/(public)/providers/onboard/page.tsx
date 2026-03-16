import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getPlatformName } from '@/lib/settings/platform-name';
import { ProviderRevenueCalculator } from '@/components/growth/ProviderRevenueCalculator';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const name = await getPlatformName();
  return {
    title: `List Your API | ${name}`,
    description: 'See your revenue potential and list your API on the marketplace. Start earning in minutes.',
  };
}

export default async function ProvidersOnboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard/provider/onboard');
  }

  const platformName = await getPlatformName();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              List your API and start earning
            </h1>
            <p className="text-muted-foreground text-lg">
              See your revenue potential on {platformName}, then create an account to publish your API in minutes.
            </p>
          </div>

          <ProviderRevenueCalculator />

          <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-muted/30 p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account? Sign in to continue to the onboarding wizard.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild variant="default">
                <Link href="/login?redirect=/dashboard/provider/onboard">Sign in</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/signup?redirect=/dashboard/provider/onboard">Create account</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
