import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { createAdminClient } from '@/lib/supabase/admin';
import { createHmac, timingSafeEqual } from 'crypto';

/**
 * Resend webhook handler.
 * Receives delivery, open, click, and bounce events from Resend
 * and updates email_send_log + nurture_queue accordingly.
 *
 * POST /api/webhooks/resend
 *
 * Configure in Resend dashboard: Settings → Webhooks → Add Endpoint
 * URL: https://yourdomain.com/api/webhooks/resend
 * Events: email.sent, email.delivered, email.opened, email.clicked, email.bounced
 */

const RESEND_WEBHOOK_SECRET = process.env.RESEND_WEBHOOK_SECRET ?? '';

interface ResendWebhookEvent {
  type: string;
  created_at: string;
  data: {
    email_id: string;
    from?: string;
    to?: string[];
    subject?: string;
    click?: { link: string };
    bounce?: { type: string; message: string };
  };
}

function verifyResendSignature(rawBody: string, svix_id: string, svix_timestamp: string, svix_signature: string): boolean {
  if (!RESEND_WEBHOOK_SECRET) return true; // Allow through if secret not configured (dev mode)
  try {
    const signedContent = `${svix_id}.${svix_timestamp}.${rawBody}`;
    const secret = RESEND_WEBHOOK_SECRET.startsWith('whsec_')
      ? Buffer.from(RESEND_WEBHOOK_SECRET.slice(6), 'base64')
      : Buffer.from(RESEND_WEBHOOK_SECRET, 'utf8');
    const expectedSig = createHmac('sha256', secret).update(signedContent).digest('base64');
    const receivedSigs = svix_signature.split(' ').map((s) => s.split(',')[1]).filter(Boolean);
    return receivedSigs.some((sig) => {
      try {
        return timingSafeEqual(Buffer.from(expectedSig), Buffer.from(sig));
      } catch {
        return false;
      }
    });
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();

  // Resend uses Svix for webhook signatures
  const svix_id        = headersList.get('svix-id') ?? '';
  const svix_timestamp = headersList.get('svix-timestamp') ?? '';
  const svix_signature = headersList.get('svix-signature') ?? '';

  if (RESEND_WEBHOOK_SECRET && svix_signature) {
    const valid = verifyResendSignature(body, svix_id, svix_timestamp, svix_signature);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
  }

  let event: ResendWebhookEvent;
  try {
    event = JSON.parse(body) as ResendWebhookEvent;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const admin = createAdminClient();
  const resendId = event.data?.email_id;

  if (!resendId) {
    return NextResponse.json({ ok: true, skipped: 'no email_id' });
  }

  // Look up the email_send_log row
  const { data: logRow } = await admin
    .from('email_send_log')
    .select('id, queue_id')
    .eq('resend_id', resendId)
    .maybeSingle();

  const now = new Date().toISOString();

  switch (event.type) {
    case 'email.delivered': {
      if (logRow) {
        await admin
          .from('email_send_log')
          .update({ status: 'delivered' })
          .eq('id', logRow.id);
        if (logRow.queue_id) {
          await admin
            .from('nurture_queue')
            .update({ delivered_at: now, status: 'delivered' })
            .eq('id', logRow.queue_id);
        }
      }
      break;
    }

    case 'email.opened': {
      if (logRow) {
        await admin
          .from('email_send_log')
          .update({ status: 'opened', opened: true, opened_at: now })
          .eq('id', logRow.id);
        if (logRow.queue_id) {
          await admin
            .from('nurture_queue')
            .update({ opened_at: now, status: 'opened' })
            .eq('id', logRow.queue_id);
        }
      }
      break;
    }

    case 'email.clicked': {
      const clickUrl = event.data?.click?.link ?? null;
      if (logRow) {
        await admin
          .from('email_send_log')
          .update({ status: 'clicked', clicked: true, clicked_at: now, click_url: clickUrl })
          .eq('id', logRow.id);
        if (logRow.queue_id) {
          await admin
            .from('nurture_queue')
            .update({ clicked_at: now, status: 'clicked' })
            .eq('id', logRow.queue_id);
        }
      }
      break;
    }

    case 'email.bounced': {
      const bounceType = event.data?.bounce?.type ?? 'hard';
      if (logRow) {
        await admin
          .from('email_send_log')
          .update({
            status: 'bounced',
            bounce_type: bounceType,
            error_message: event.data?.bounce?.message ?? null,
          })
          .eq('id', logRow.id);
        if (logRow.queue_id) {
          await admin.from('nurture_queue').update({ status: 'failed', last_error: `bounce:${bounceType}` }).eq('id', logRow.queue_id);
        }
      }
      // Opt out on hard bounce to respect deliverability
      if (bounceType === 'hard' && event.data?.to?.[0]) {
        await admin
          .from('stakeholders')
          .update({ nurture_opt_out: true })
          .eq('email', event.data.to[0]);
      }
      break;
    }

    default:
      // Unhandled event type — accept and ignore
      break;
  }

  return NextResponse.json({ ok: true, event: event.type });
}
