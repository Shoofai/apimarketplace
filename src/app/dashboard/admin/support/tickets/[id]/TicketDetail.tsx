'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Calendar, MessageSquare, Send, RefreshCw } from 'lucide-react';

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

const STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'waiting_customer', label: 'Waiting on Customer' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
] as const;

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
] as const;

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
  assigned: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  in_progress: 'bg-purple-500/10 text-purple-700 dark:text-purple-400',
  waiting_customer: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400',
  resolved: 'bg-green-500/10 text-green-700 dark:text-green-400',
  closed: 'bg-muted text-muted-foreground',
};

const PRIORITY_COLORS: Record<string, string> = {
  low: 'text-muted-foreground',
  normal: 'text-foreground',
  high: 'text-amber-700 dark:text-amber-400',
  urgent: 'text-destructive',
};

export function TicketDetail({
  ticket: initialTicket,
  messages: initialMessages,
  adminUsers,
}: {
  ticket: Ticket;
  messages: TicketMessage[];
  adminUsers: AdminUser[];
}) {
  const [ticket, setTicket] = useState(initialTicket);
  const [messages, setMessages] = useState(initialMessages);
  const [reply, setReply] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusDraft, setStatusDraft] = useState(initialTicket.status);
  const [priorityDraft, setPriorityDraft] = useState(initialTicket.priority ?? 'normal');
  const [statusError, setStatusError] = useState<string | null>(null);

  async function handleReply() {
    if (!reply.trim()) return;
    setSendingReply(true);
    try {
      const res = await fetch(`/api/admin/tickets/${ticket.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: reply.trim() }),
      });
      if (res.ok) {
        setReply('');
        setMessages((prev) => [
          ...prev,
          {
            id: `optimistic-${Date.now()}`,
            author_name: 'Support Team',
            author_email: null,
            is_staff: true,
            is_system: false,
            message: reply.trim(),
            message_type: 'reply',
            created_at: new Date().toISOString(),
          },
        ]);
        setTicket((t) => ({ ...t, status: 'waiting_customer' }));
        setStatusDraft('waiting_customer');
      }
    } finally {
      setSendingReply(false);
    }
  }

  async function handleStatusUpdate() {
    if (statusDraft === ticket.status && priorityDraft === (ticket.priority ?? 'normal')) return;
    setUpdatingStatus(true);
    setStatusError(null);
    try {
      const updates: Record<string, string> = {};
      if (statusDraft !== ticket.status) updates.status = statusDraft;
      if (priorityDraft !== (ticket.priority ?? 'normal')) updates.priority = priorityDraft;

      const res = await fetch(`/api/admin/tickets/${ticket.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        setTicket((t) => ({
          ...t,
          status: statusDraft,
          priority: priorityDraft,
        }));
      } else {
        const data = await res.json().catch(() => ({}));
        setStatusError(data.error ?? 'Failed to update');
      }
    } finally {
      setUpdatingStatus(false);
    }
  }

  const isDirty = statusDraft !== ticket.status || priorityDraft !== (ticket.priority ?? 'normal');

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
                  <span className="font-medium text-sm">
                    {m.is_system ? 'System' : m.author_name || m.author_email || 'Unknown'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {m.created_at ? new Date(m.created_at).toLocaleString() : '—'}
                  </span>
                </div>
                {m.is_staff === true && (
                  <Badge variant="secondary" className="mb-2 text-xs">Staff</Badge>
                )}
                <p className="text-sm whitespace-pre-wrap">{m.message}</p>
              </div>
            ))}

            <div className="pt-4 border-t space-y-2">
              <Label htmlFor="admin-reply">Reply to customer</Label>
              <Textarea
                id="admin-reply"
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Type your reply…"
                rows={4}
                className="mt-1"
              />
              <Button
                onClick={handleReply}
                disabled={sendingReply || !reply.trim()}
                className="gap-2"
              >
                <Send className="h-4 w-4" />
                {sendingReply ? 'Sending…' : 'Send reply'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {/* Status & Priority Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Status & Priority</span>
              <Badge className={STATUS_COLORS[ticket.status] || ''}>
                {ticket.status.replace(/_/g, ' ')}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={statusDraft} onValueChange={setStatusDraft}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select value={priorityDraft} onValueChange={setPriorityDraft}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <span className={PRIORITY_COLORS[opt.value]}>{opt.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {statusError && <p className="text-xs text-destructive">{statusError}</p>}

            <Button
              size="sm"
              variant={isDirty ? 'default' : 'outline'}
              className="w-full gap-2"
              onClick={handleStatusUpdate}
              disabled={updatingStatus || !isDirty}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${updatingStatus ? 'animate-spin' : ''}`} />
              {updatingStatus ? 'Saving…' : 'Apply changes'}
            </Button>
          </CardContent>
        </Card>

        {/* Ticket details */}
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="font-medium text-muted-foreground">Category</p>
              <p>{ticket.inquiry_type} / {ticket.category}</p>
            </div>
            <div>
              <p className="font-medium text-muted-foreground">Urgency</p>
              <p>{ticket.urgency}</p>
            </div>
            {ticket.source_page && (
              <div>
                <p className="font-medium text-muted-foreground">Source</p>
                <p>{ticket.source_page}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submitter */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Submitter
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p className="font-medium">{ticket.submitter_name || '—'}</p>
            <p className="text-muted-foreground">{ticket.submitter_email}</p>
            {ticket.submitter_company && (
              <p className="text-muted-foreground">{ticket.submitter_company}</p>
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
