import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { redirect, notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Ticket, ArrowLeft, User, Calendar } from 'lucide-react';
import Link from 'next/link';
import { TicketDetail } from './TicketDetail';

export default async function AdminTicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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

  const admin = createAdminClient();
  const { data: ticket, error } = await admin
    .from('support_tickets')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !ticket) {
    notFound();
  }

  const { data: messages } = await admin
    .from('ticket_messages')
    .select('*')
    .eq('ticket_id', id)
    .order('created_at', { ascending: true });

  const { data: users } = await admin
    .from('users')
    .select('id, full_name, email')
    .eq('is_platform_admin', true);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/admin/tickets"
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Ticket className="h-6 w-6" />
            {ticket.ticket_number}
          </h1>
          <p className="text-muted-foreground truncate max-w-2xl">{ticket.subject}</p>
        </div>
      </div>

      <TicketDetail
        ticket={ticket}
        messages={messages ?? []}
        adminUsers={users ?? []}
      />
    </div>
  );
}
