import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ClipboardCheck } from 'lucide-react';
import { ReadinessDashboard } from './ReadinessDashboard';

export default async function AdminReadinessPage() {
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

  return (
    <div className="space-y-8">
      <div className="flex gap-4">
        <Link href="/dashboard/admin">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardCheck className="h-6 w-6" />
            Production Readiness
          </h1>
          <p className="text-muted-foreground">
            Validation context: routes, gaps, and ship checklist
          </p>
        </div>
      </div>

      <ReadinessDashboard />
    </div>
  );
}
