import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { DEFAULT_LIST_LIMIT } from '@/lib/utils/constants';
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
    .select('id, ticket_number, subject, status, message, submitter_email, submitter_name, created_at, updated_at, assigned_to_user_id, resolved_at, closed_at')
    .eq('id', id)
    .single();

  if (error || !ticket) {
    notFound();
  }

  const ticketForDetail = {
    ...ticket,
    submitter_company: null as string | null,
    priority: null as string | null,
    inquiry_type: 'general',
    category: 'support',
    urgency: 'normal',
    source_page: null as string | null,
  };

  const { data: messagesData } = await admin
    .from('ticket_messages')
    .select('id, ticket_id, message, created_at, author_user_id, author_name, author_email, is_staff, is_system')
    .eq('ticket_id', id)
    .order('created_at', { ascending: true })
    .limit(DEFAULT_LIST_LIMIT);

  const messages = (messagesData ?? []).map((m) => ({
    ...m,
    message_type: null as string | null,
  }));

  const { data: users } = await admin
    .from('users')
    .select('id, full_name, email')
    .eq('is_platform_admin', true)
    .limit(DEFAULT_LIST_LIMIT);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/admin/support/tickets"
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
        ticket={ticketForDetail}
        messages={messages}
        adminUsers={users ?? []}
      />
    </div>
  );
}
