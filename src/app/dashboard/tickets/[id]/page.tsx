import { createClient } from '@/lib/supabase/server';
import { DEFAULT_LIST_LIMIT } from '@/lib/utils/constants';
import { redirect, notFound } from 'next/navigation';
import { TicketDetailClient } from './TicketDetailClient';

export default async function MyTicketDetailPage({
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

  const { data: ticket } = await supabase
    .from('support_tickets')
    .select('id, ticket_number, subject, status, inquiry_type, category, created_at, updated_at')
    .eq('id', id)
    .or(`submitter_user_id.eq.${user.id},submitter_email.eq.${user.email}`)
    .single();

  if (!ticket) {
    notFound();
  }

  const { data: messagesData } = await supabase
    .from('ticket_messages')
    .select('id, ticket_id, message, created_at, author_name, author_email, is_staff')
    .eq('ticket_id', id)
    .order('created_at', { ascending: true })
    .limit(DEFAULT_LIST_LIMIT);

  const messages = (messagesData ?? []).map((m) => ({
    id: m.id,
    author_name: m.author_name ?? null,
    author_email: m.author_email ?? null,
    is_staff: m.is_staff ?? false,
    message: m.message,
    created_at: m.created_at ?? new Date().toISOString(),
  }));

  return (
    <TicketDetailClient
      ticket={{
        id: ticket.id,
        ticket_number: ticket.ticket_number,
        subject: ticket.subject,
        status: ticket.status,
        inquiry_type: (ticket as any).inquiry_type ?? undefined,
        category: (ticket as any).category ?? undefined,
        created_at: ticket.created_at,
        updated_at: ticket.updated_at,
      }}
      messages={messages}
    />
  );
}
