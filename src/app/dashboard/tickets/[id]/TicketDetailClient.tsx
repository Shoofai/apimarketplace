'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Ticket, ArrowLeft, MessageSquare, Send } from 'lucide-react';

interface TicketMessage {
  id: string;
  author_name: string | null;
  author_email: string | null;
  is_staff: boolean;
  message: string;
  created_at: string;
}

interface TicketData {
  id: string;
  ticket_number: string;
  subject: string;
  status: string;
  inquiry_type?: string;
  category?: string;
  created_at: string;
  updated_at: string;
}

interface TicketDetailClientProps {
  ticket: TicketData;
  messages: TicketMessage[];
}

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
  assigned: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  in_progress: 'bg-purple-500/10 text-purple-700 dark:text-purple-400',
  waiting_customer: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400',
  resolved: 'bg-green-500/10 text-green-700 dark:text-green-400',
  closed: 'bg-muted text-muted-foreground',
};

export function TicketDetailClient({ ticket, messages: initialMessages }: TicketDetailClientProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isClosed = ticket.status === 'closed';

  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    if (!reply.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/tickets/${ticket.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: reply.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'Failed to send reply');
      }
      setMessages((prev) => [
        ...prev,
        {
          id: `optimistic-${Date.now()}`,
          author_name: 'You',
          author_email: null,
          is_staff: false,
          message: reply.trim(),
          created_at: new Date().toISOString(),
        },
      ]);
      setReply('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/tickets" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Ticket className="h-6 w-6" />
            {ticket.ticket_number}
          </h1>
          <p className="text-muted-foreground">{ticket.subject}</p>
        </div>
        <Badge className={STATUS_COLORS[ticket.status] || ''}>
          {ticket.status.replace(/_/g, ' ')}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="space-y-4">
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
                    m.is_staff ? 'border-primary/30 bg-primary/5' : 'border-border'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-medium text-sm">
                      {m.is_staff ? (
                        <span className="flex items-center gap-1.5">
                          Support Team
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Staff</Badge>
                        </span>
                      ) : (
                        m.author_name || m.author_email || 'You'
                      )}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(m.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap text-muted-foreground">{m.message}</p>
                </div>
              ))}

              {messages.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No messages yet.</p>
              )}
            </CardContent>
          </Card>

          {/* Reply form */}
          {!isClosed && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Reply</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleReply} className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="user-reply">Your message</Label>
                    <Textarea
                      id="user-reply"
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      placeholder="Add more context, answer a question, or follow up…"
                      rows={4}
                      maxLength={5000}
                      className="resize-y"
                    />
                  </div>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                  <Button type="submit" disabled={loading || !reply.trim()} className="gap-2">
                    {loading ? 'Sending…' : (
                      <>
                        <Send className="h-4 w-4" />
                        Send reply
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {isClosed && (
            <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
              This ticket is closed. <Link href="/contact" className="text-primary hover:underline">Open a new ticket</Link> if you need further help.
            </div>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <p className="font-medium text-muted-foreground">Category</p>
              <p className="capitalize">
                {String(ticket.inquiry_type || 'general')} / {String(ticket.category || 'support')}
              </p>
            </div>
            <div>
              <p className="font-medium text-muted-foreground">Opened</p>
              <p>{new Date(ticket.created_at).toLocaleString()}</p>
            </div>
            <div>
              <p className="font-medium text-muted-foreground">Last updated</p>
              <p>{new Date(ticket.updated_at).toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
