import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendTicketReplyNotification } from '@/lib/email/send-ticket-notification';
import { logger } from '@/lib/utils/logger';

/**
 * POST /api/tickets/[id]/reply
 * Authenticated user replies to their own support ticket.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const context = await requireAuth();
    const { id } = await params;

    const body = await request.json().catch(() => ({}));
    const message = typeof body.message === 'string' ? body.message.trim().slice(0, 5000) : '';

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const adminSb = createAdminClient();

    // Verify ticket ownership
    const { data: ticket } = await adminSb
      .from('support_tickets')
      .select('id, ticket_number, subject, submitter_email, status')
      .eq('id', id)
      .or(
        `submitter_user_id.eq.${context.user.id},submitter_email.eq.${context.user.email}`
      )
      .maybeSingle();

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    if (ticket.status === 'closed') {
      return NextResponse.json({ error: 'This ticket is closed.' }, { status: 400 });
    }

    await adminSb.from('ticket_messages').insert({
      ticket_id: id,
      author_user_id: context.user.id,
      author_email: context.user.email,
      is_staff: false,
      is_system: false,
      message,
      message_type: 'reply',
    });

    // Reopen to in_progress if it was waiting_customer
    if (ticket.status === 'waiting_customer' || ticket.status === 'resolved') {
      await adminSb
        .from('support_tickets')
        .update({ status: 'in_progress', updated_at: new Date().toISOString() })
        .eq('id', id);
    } else {
      await adminSb
        .from('support_tickets')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', id);
    }

    await adminSb.from('ticket_activity_log').insert({
      ticket_id: id,
      user_id: context.user.id,
      action: 'commented',
      details: { customer_reply: true },
    });

    logger.info('User replied to ticket', { ticketId: id, userId: context.user.id });

    return NextResponse.json({ ok: true });
  } catch (error) {
    logger.error('User ticket reply failed', { error });
    return NextResponse.json({ error: 'Failed to send reply' }, { status: 500 });
  }
}
