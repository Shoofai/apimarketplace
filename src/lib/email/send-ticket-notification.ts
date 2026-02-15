/**
 * Send ticket notifications via Resend.
 * Set RESEND_API_KEY and EMAIL_FROM in env to enable.
 * No-op if not configured.
 */

const RESEND_API = 'https://api.resend.com/emails';

export async function sendTicketCreationConfirmation(params: {
  to: string;
  ticketNumber: string;
  subject: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? 'noreply@apimarketplace.pro';
  if (!apiKey) return;

  const res = await fetch(RESEND_API, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [params.to],
      subject: `[Ticket #${params.ticketNumber}] We received your message`,
      html: `
        <p>Thank you for contacting us. We've received your message and created a support ticket.</p>
        <p><strong>Ticket number:</strong> ${params.ticketNumber}</p>
        <p><strong>Subject:</strong> ${params.subject}</p>
        <p>We typically respond within 24 hours on business days. You can view your ticket and reply from your dashboard.</p>
        <p>— Support Team</p>
      `,
    }),
  });

  if (!res.ok) {
    console.error('Failed to send ticket confirmation email:', await res.text());
  }
}

export async function sendTicketReplyNotification(params: {
  to: string;
  ticketNumber: string;
  subject: string;
  messagePreview: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? 'noreply@apimarketplace.pro';
  if (!apiKey) return;

  const preview = params.messagePreview.slice(0, 200) + (params.messagePreview.length > 200 ? '...' : '');

  const res = await fetch(RESEND_API, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [params.to],
      subject: `[Ticket #${params.ticketNumber}] New reply from support`,
      html: `
        <p>You have a new reply on your support ticket.</p>
        <p><strong>Ticket:</strong> ${params.ticketNumber}</p>
        <p><strong>Subject:</strong> ${params.subject}</p>
        <p><strong>Reply preview:</strong></p>
        <p>${preview.replace(/\n/g, '<br>')}</p>
        <p>View the full thread and reply from your dashboard.</p>
        <p>— Support Team</p>
      `,
    }),
  });

  if (!res.ok) {
    console.error('Failed to send ticket reply notification:', await res.text());
  }
}
