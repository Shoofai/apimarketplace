'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { User, Calendar, MessageSquare, Send } from 'lucide-react';

interface TicketMessage {
  id: string;
  author_name: string | null;
  author_email: string | null;
  is_staff: boolean | null;
  is_system: boolean | null;
  message: string;
  message_type: string | null;
  created_at: string | null;
}

interface Ticket {
  id: string;
  ticket_number: string;
  submitter_email: string;
  submitter_name: string | null;
  submitter_company: string | null;
  subject: string;
  message: string | null;
  status: string;
  priority: string | null;
  inquiry_type: string;
  category: string;
  urgency: string;
  source_page: string | null;
  created_at: string | null;
  assigned_to_user_id: string | null;
}

interface AdminUser {
  id: string;
  full_name: string | null;
  email: string;
}

export function TicketDetail({
  ticket,
  messages,
  adminUsers,
}: {
  ticket: Ticket;
  messages: TicketMessage[];
  adminUsers: AdminUser[];
}) {
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleReply() {
    if (!reply.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/tickets/${ticket.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: reply.trim() }),
      });
      if (res.ok) {
        setReply('');
        window.location.reload();
      }
    } finally {
      setLoading(false);
    }
  }

  const statusColors: Record<string, string> = {
    new: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
    assigned: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
    in_progress: 'bg-purple-500/10 text-purple-700 dark:text-purple-400',
    waiting_customer: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400',
    resolved: 'bg-green-500/10 text-green-700 dark:text-green-400',
    closed: 'bg-muted text-muted-foreground',
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Message Thread
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`rounded-lg border p-4 ${
                  m.is_staff === true
                    ? 'border-primary/30 bg-primary/5'
                    : m.is_system === true
                      ? 'border-muted bg-muted/30'
                      : 'border-border'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-medium">
                    {m.is_system ? 'System' : m.author_name || m.author_email || 'Unknown'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {m.created_at ? new Date(m.created_at).toLocaleString() : '—'}
                  </span>
                </div>
                {m.is_staff === true && (
                  <Badge variant="secondary" className="mb-2 text-xs">
                    Staff
                  </Badge>
                )}
                <p className="text-sm whitespace-pre-wrap">{m.message}</p>
              </div>
            ))}

            <div className="pt-4 border-t">
              <Label htmlFor="reply">Reply to customer</Label>
              <Textarea
                id="reply"
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Type your reply..."
                rows={4}
                className="mt-2"
              />
              <Button
                onClick={handleReply}
                disabled={loading || !reply.trim()}
                className="mt-2 gap-2"
              >
                <Send className="h-4 w-4" />
                {loading ? 'Sending…' : 'Send reply'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <Badge className={statusColors[ticket.status] || ''}>
                {ticket.status.replace('_', ' ')}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Priority</p>
              <p className="text-sm">{ticket.priority ?? 'normal'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Category</p>
              <p className="text-sm">{ticket.inquiry_type} / {ticket.category}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Urgency</p>
              <p className="text-sm">{ticket.urgency}</p>
            </div>
            {ticket.source_page && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Source</p>
                <p className="text-sm">{ticket.source_page}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Submitter
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="font-medium">{ticket.submitter_name || '—'}</p>
            <p className="text-sm text-muted-foreground">{ticket.submitter_email}</p>
            {ticket.submitter_company && (
              <p className="text-sm text-muted-foreground">{ticket.submitter_company}</p>
            )}
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {ticket.created_at ? new Date(ticket.created_at).toLocaleString() : '—'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
