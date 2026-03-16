import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ProviderOnboardPageClient } from './ProviderOnboardPageClient';

export const metadata = {
  title: 'Provider onboarding | Dashboard',
  description: 'List your API and complete provider onboarding',
};

export default async function ProviderOnboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Provider onboarding</h1>
        <p className="text-muted-foreground mt-1">
          Complete these steps to list your API and start earning
        </p>
      </div>

      <ProviderOnboardPageClient />
    </div>
  );
}
