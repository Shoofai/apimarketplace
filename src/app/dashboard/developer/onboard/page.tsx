import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DeveloperOnboardWizard } from '@/components/growth/DeveloperOnboardWizard';

export const metadata = {
  title: 'Developer Setup | Dashboard',
  description: 'Set your language preferences and get personalised API recommendations',
};

export default async function DeveloperOnboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold">Set up your developer profile</h1>
        <p className="text-muted-foreground mt-2">
          Takes 30 seconds — helps us show you the right APIs and generate better code for you.
        </p>
      </div>
      <DeveloperOnboardWizard />
    </div>
  );
}
