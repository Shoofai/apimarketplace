// Call sites: API_ROUTE_CALLSITES.md (UI-3)
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendTicketReplyNotification } from '@/lib/email/send-ticket-notification';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: userData } = await supabase
    .from('users')
    .select('is_platform_admin, full_name, email')
    .eq('id', user.id)
    .single();

  if (!userData?.is_platform_admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const message = typeof body.message === 'string' ? body.message.trim().slice(0, 5000) : '';

  if (!message) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: ticketData } = await admin
    .from('support_tickets')
    .select('id')
    .eq('id', id)
    .single();

  if (!ticketData) {
    return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
  }

  const { error: insertError } = await admin
    .from('ticket_messages')
    .insert({
      ticket_id: id,
      author_user_id: user.id,
      author_email: userData.email,
      author_name: userData.full_name,
      is_staff: true,
      is_system: false,
      message,
      message_type: 'reply',
    });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 400 });
  }

  await admin
    .from('support_tickets')
    .update({
      status: 'waiting_customer',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  await admin
    .from('ticket_activity_log')
    .insert({
      ticket_id: id,
      user_id: user.id,
      action: 'commented',
      details: { staff_reply: true },
    });

  const { data: fullTicket } = await admin
    .from('support_tickets')
    .select('ticket_number, subject, submitter_email')
    .eq('id', id)
    .single();

  if (fullTicket?.submitter_email) {
    sendTicketReplyNotification({
      to: fullTicket.submitter_email,
      ticketNumber: fullTicket.ticket_number,
      subject: fullTicket.subject,
      messagePreview: message,
    }).catch((err) => console.error('Ticket reply notification failed:', err));
  }

  return NextResponse.json({ success: true });
}
