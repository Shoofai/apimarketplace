import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { sendTicketCreationConfirmation } from '@/lib/email/send-ticket-notification';

export async function POST(request: Request) {
  const rateLimited = rateLimit(request, RATE_LIMITS.forum);
  if (rateLimited) return rateLimited;

  try {
    const body = await request.json().catch(() => ({}));
    const name = typeof body.name === 'string' ? body.name.trim().slice(0, 200) : '';
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const company = typeof body.company === 'string' ? body.company.trim().slice(0, 200) : '';
    const subject = typeof body.subject === 'string' ? body.subject.trim().slice(0, 200) : 'Contact form';
    const message = typeof body.message === 'string' ? body.message.trim().slice(0, 5000) : '';
    const inquiry_type = typeof body.inquiry_type === 'string' ? body.inquiry_type.trim().slice(0, 100) : 'General';
    const category = typeof body.category === 'string' ? body.category.trim().slice(0, 100) : 'Other';
    const urgency = typeof body.urgency === 'string' ? body.urgency.trim().slice(0, 50) : 'General';
    const source_page = typeof body.source_page === 'string' ? body.source_page.trim().slice(0, 100) : null;
    const source_url = typeof body.source_url === 'string' ? body.source_url.trim().slice(0, 500) : null;
    const raw_report_type = typeof body.report_type === 'string' ? body.report_type.trim().slice(0, 50) : '';
    // Phone: E.164 format, max 20 chars
    const rawPhone = typeof body.phone === 'string' ? body.phone.trim() : '';
    const phone = rawPhone && /^\+[0-9]{10,15}$/.test(rawPhone) ? rawPhone.slice(0, 20) : null;

    const ALLOWED_REPORT_TYPES = ['contact_form', 'aup_violation', 'security_report', 'dmca_takedown', 'billing_dispute'] as const;
    let report_type: (typeof ALLOWED_REPORT_TYPES)[number] = 'contact_form';
    if (raw_report_type && ALLOWED_REPORT_TYPES.includes(raw_report_type as any)) {
      report_type = raw_report_type as (typeof ALLOWED_REPORT_TYPES)[number];
    } else {
      if (source_page === 'security-page' && category === 'security') report_type = 'security_report';
      else if (source_page === 'legal-acceptable-use' && category === 'abuse') report_type = 'aup_violation';
      else if (category === 'Billing Issue') report_type = 'billing_dispute';
    }

    const autoTags: string[] = [];
    if (report_type === 'security_report') autoTags.push('security');
    else if (report_type === 'aup_violation') autoTags.push('abuse');
    else if (report_type === 'dmca_takedown') autoTags.push('legal');
    const tags = [...new Set(autoTags)];

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: ticketNumberData, error: rpcError } = await supabase.rpc('generate_ticket_number');
    if (rpcError) {
      const fallbackNumber = `TKT-${new Date().getFullYear()}-${Date.now().toString().slice(-5)}`;
      const { data: ticket, error: insertError } = await supabase
        .from('support_tickets')
        .insert({
          ticket_number: fallbackNumber,
          submitter_email: email,
          submitter_name: name || null,
          submitter_company: company || null,
          inquiry_type,
          category,
          urgency,
          subject,
          message: message || null,
          source_page,
          source_url,
          report_type,
          tags,
          custom_fields: phone ? { phone } : null,
        })
        .select('id, ticket_number')
        .single();

      if (insertError) return NextResponse.json({ error: insertError.message }, { status: 400 });

      await supabase.from('ticket_messages').insert({
        ticket_id: ticket.id,
        author_email: email,
        author_name: name || null,
        is_staff: false,
        is_system: false,
        message: message || '(No message provided)',
        message_type: 'reply',
      });

      await supabase.from('ticket_activity_log').insert({
        ticket_id: ticket.id,
        action: 'created',
        details: { source_page, source_url },
      });

      sendTicketCreationConfirmation({
        to: email,
        ticketNumber: ticket.ticket_number,
        subject,
      }).catch((err) => console.error('Ticket confirmation email failed:', err));

      return NextResponse.json({ success: true, ticket_id: ticket.id, ticket_number: ticket.ticket_number }, { status: 201 });
    }

    const ticketNumber = ticketNumberData as string;
    const { data: ticket, error: insertError } = await supabase
      .from('support_tickets')
      .insert({
        ticket_number: ticketNumber,
        submitter_email: email,
        submitter_name: name || null,
        submitter_company: company || null,
        inquiry_type,
        category,
        urgency,
        subject,
        message: message || null,
        source_page,
        source_url,
        report_type,
        tags,
        custom_fields: phone ? { phone } : null,
      })
      .select('id, ticket_number')
      .single();

    if (insertError) return NextResponse.json({ error: insertError.message }, { status: 400 });

    await supabase.from('ticket_messages').insert({
      ticket_id: ticket.id,
      author_email: email,
      author_name: name || null,
      is_staff: false,
      is_system: false,
      message: message || '(No message provided)',
      message_type: 'reply',
    });

    await supabase.from('ticket_activity_log').insert({
      ticket_id: ticket.id,
      action: 'created',
      details: { source_page, source_url },
    });

    sendTicketCreationConfirmation({
      to: email,
      ticketNumber: ticket.ticket_number,
      subject,
    }).catch((err) => console.error('Ticket confirmation email failed:', err));

    return NextResponse.json({ success: true, ticket_id: ticket.id, ticket_number: ticket.ticket_number }, { status: 201 });
  } catch (err) {
    console.error('Contact form error:', err);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
