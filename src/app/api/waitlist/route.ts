// Call sites: API_ROUTE_CALLSITES.md (UI-3)
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

async function sendWaitlistConfirmation(email: string, name: string | null) {
  if (!resend) return; // silently skip if Resend not configured

  const platformName = process.env.NEXT_PUBLIC_PLATFORM_NAME ?? 'LukeAPI';
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://apimarketplace.pro').replace(/\/$/, '');
  const fromEmail = process.env.EMAIL_FROM ?? `hello@${siteUrl.replace(/^https?:\/\//, '')}`;
  const greeting = name ? `Hi ${name.split(' ')[0]}` : 'Hi there';

  const featureRows = [
    ['⚡', 'AI-generated integration code', 'Go from API spec to working code in under 2 minutes'],
    ['💰', 'One-click monetization', 'Publish and get paid for your APIs instantly'],
    ['🛡️', 'Enterprise governance', 'Rate limiting, RBAC, and compliance built in'],
    ['📊', 'Real-time monitoring', 'SLA tracking and usage analytics out of the box'],
  ].map(([icon, title, desc]) => `
    <tr>
      <td style="padding:10px 0;border-top:1px solid #f3f4f6;">
        <table cellpadding="0" cellspacing="0"><tr>
          <td style="width:32px;font-size:18px;vertical-align:top;">${icon}</td>
          <td style="padding-left:12px;">
            <p style="margin:0;font-size:14px;font-weight:600;color:#111827;">${title}</p>
            <p style="margin:2px 0 0;font-size:13px;color:#6b7280;">${desc}</p>
          </td>
        </tr></table>
      </td>
    </tr>`).join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#4c1d95 100%);padding:32px 40px;text-align:center;">
            <p style="margin:0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">${platformName}</p>
            <p style="margin:8px 0 0;font-size:13px;color:rgba(199,210,254,0.8);">The API Platform Built for the AI Era</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px 40px 32px;">
            <p style="margin:0 0 16px;font-size:16px;color:#111827;font-weight:600;">${greeting} — you're on the list! 🎉</p>
            <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.6;">
              Thanks for joining the <strong>${platformName}</strong> waitlist. We're in private beta and opening access gradually — you'll hear from us as soon as your spot is ready.
            </p>
            <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.6;">Here's what you'll get access to:</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
              ${featureRows}
            </table>
            <p style="margin:0 0 8px;font-size:14px;color:#374151;">Already have an invite code? Jump straight in:</p>
            <a href="${siteUrl}/early-access"
               style="display:inline-block;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#ffffff;font-size:14px;font-weight:600;padding:12px 28px;border-radius:8px;text-decoration:none;">
              Redeem invite code →
            </a>
          </td>
        </tr>
        <tr>
          <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:20px 40px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">
              You're receiving this because you joined the ${platformName} waitlist.<br/>
              <a href="${siteUrl}" style="color:#6366f1;text-decoration:none;">${siteUrl.replace(/^https?:\/\//, '')}</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    await resend.emails.send({
      from: `${platformName} <${fromEmail}>`,
      to: email,
      subject: `You're on the ${platformName} waitlist 🎉`,
      html,
    });
  } catch (err) {
    // Don't fail the signup if email send fails — log and continue
    console.error('[waitlist] Failed to send confirmation email:', err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, full_name, company, role, referral_source } = body;

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Insert into waitlist_signups table
    const { data, error } = await supabase.from('waitlist_signups').insert({
      email,
      full_name: full_name || null,
      company: company || null,
      role: role || null,
      referral_source: referral_source || null,
    }).select();

    if (error) {
      // Check if it's a duplicate email error
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Email already registered on waitlist' },
          { status: 409 }
        );
      }
      throw error;
    }

    // Fire-and-forget: send confirmation email (failure doesn't affect the response)
    sendWaitlistConfirmation(email, full_name ?? null);

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    console.error('Waitlist signup error:', error);
    return NextResponse.json(
      { error: 'Failed to process waitlist signup' },
      { status: 500 }
    );
  }
}
