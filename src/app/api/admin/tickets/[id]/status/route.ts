import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { logger } from '@/lib/utils/logger';

const VALID_STATUSES = ['new', 'assigned', 'in_progress', 'waiting_customer', 'resolved', 'closed'] as const;
const VALID_PRIORITIES = ['low', 'normal', 'high', 'urgent'] as const;

/**
 * PATCH /api/admin/tickets/[id]/status
 * Platform-admin only. Update ticket status and/or priority.
 * Body: { status?: string, priority?: string }
 */
export async function PATCH(
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
    .select('is_platform_admin')
    .eq('id', user.id)
    .single();

  if (!userData?.is_platform_admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const status = typeof body.status === 'string' ? body.status : undefined;
  const priority = typeof body.priority === 'string' ? body.priority : undefined;

  if (status && !VALID_STATUSES.includes(status as typeof VALID_STATUSES[number])) {
    return NextResponse.json({ error: `Invalid status. Valid values: ${VALID_STATUSES.join(', ')}` }, { status: 400 });
  }

  if (priority && !VALID_PRIORITIES.includes(priority as typeof VALID_PRIORITIES[number])) {
    return NextResponse.json({ error: `Invalid priority. Valid values: ${VALID_PRIORITIES.join(', ')}` }, { status: 400 });
  }

  if (!status && !priority) {
    return NextResponse.json({ error: 'Provide at least one of: status, priority' }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: ticket } = await admin
    .from('support_tickets')
    .select('id, status')
    .eq('id', id)
    .single();

  if (!ticket) {
    return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
  }

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (status) updates.status = status;
  if (priority) updates.priority = priority;
  if (status === 'resolved') updates.resolved_at = new Date().toISOString();
  if (status === 'closed') updates.closed_at = new Date().toISOString();

  const { error: updateError } = await admin
    .from('support_tickets')
    .update(updates as any)
    .eq('id', id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }

  await admin.from('ticket_activity_log').insert({
    ticket_id: id,
    user_id: user.id,
    action: 'status_changed',
    details: { from: ticket.status, to: status ?? ticket.status, priority },
  });

  logger.info('Admin updated ticket status', { ticketId: id, updates });

  return NextResponse.json({ ok: true });
}
