import { createClient } from '@/lib/supabase/server';
import { DEFAULT_LIST_LIMIT } from '@/lib/utils/constants';
import { redirect, notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Ticket, ArrowLeft, MessageSquare } from 'lucide-react';
import Link from 'next/link';

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
    .select('id, ticket_number, subject, status, message, created_at, updated_at')
    .eq('id', id)
    .or(`submitter_user_id.eq.${user.id},submitter_email.eq.${user.email}`)
    .single();

  if (!ticket) {
    notFound();
  }

  const { data: messages } = await supabase
    .from('ticket_messages')
    .select('id, ticket_id, message, created_at, author_user_id, author_name, author_email, is_staff')
    .eq('ticket_id', id)
    .order('created_at', { ascending: true })
    .limit(DEFAULT_LIST_LIMIT);

  const statusColors: Record<string, string> = {
    new: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
    assigned: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
    in_progress: 'bg-purple-500/10 text-purple-700 dark:text-purple-400',
    waiting_customer: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400',
    resolved: 'bg-green-500/10 text-green-700 dark:text-green-400',
    closed: 'bg-muted text-muted-foreground',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/tickets"
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Ticket className="h-6 w-6" />
            {ticket.ticket_number}
          </h1>
          <p className="text-muted-foreground">{ticket.subject}</p>
        </div>
        <Badge className={statusColors[ticket.status] || ''}>
          {ticket.status.replace('_', ' ')}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Message Thread
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(messages ?? []).map((m: { id: string; author_name: string | null; author_email: string | null; is_staff: boolean; message: string; created_at: string }) => (
              <div
                key={m.id}
                className={`rounded-lg border p-4 ${
                  m.is_staff ? 'border-primary/30 bg-primary/5' : 'border-border'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-medium">
                    {m.is_staff ? 'Support Team' : m.author_name || m.author_email || 'You'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(m.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{m.message}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Category</p>
              <p className="text-sm">
              {String((ticket as Record<string, unknown>).inquiry_type || 'general')} /{' '}
              {String((ticket as Record<string, unknown>).category || 'support')}
            </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Created</p>
              <p className="text-sm">{new Date(ticket.created_at).toLocaleString()}</p>
            </div>
            <p className="text-sm text-muted-foreground">
              We typically respond within 24 hours on business days. Need to add more info?{' '}
              <Link href="/contact" className="text-primary hover:underline">Submit a new message</Link> with your ticket number.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
