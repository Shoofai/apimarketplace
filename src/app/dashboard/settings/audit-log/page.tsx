import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Shield } from 'lucide-react';
import { AuditLogClient } from './AuditLogClient';

export const metadata = { title: 'Audit Log | Settings' };

export default async function AuditLogPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="h-6 w-6" />
          Audit Log
        </h1>
        <p className="text-muted-foreground mt-1">
          Complete record of all actions in your organization — for compliance and security review.
        </p>
      </div>
      <AuditLogClient />
    </div>
  );
}
