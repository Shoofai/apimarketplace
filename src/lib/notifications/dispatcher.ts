import { createAdminClient } from '@/lib/supabase/admin';
import { logger } from '@/lib/utils/logger';
import { Resend } from 'resend';
import { resendBreaker } from '@/lib/resilience';

export interface NotificationEvent {
  type: string;
  userId: string;
  organizationId?: string;
  title: string;
  body: string;
  link?: string;
  metadata?: Record<string, any>;
}

/**
 * Event types with default channel preferences
 */
export const NOTIFICATION_EVENTS = {
  // Billing
  'billing.invoice_created': { title: 'New Invoice', channels: ['email', 'in_app'] },
  'billing.payment_failed': { title: 'Payment Failed', channels: ['email', 'in_app'] },
  'billing.payout_completed': { title: 'Payout Sent', channels: ['email', 'in_app'] },
  'billing.subscription_activated': { title: 'Subscription Activated', channels: ['email', 'in_app'] },
  'billing.abandoned_checkout': { title: 'Complete your upgrade', channels: ['email'] },

  // Usage
  'usage.quota_80': { title: 'Usage Alert: 80%', channels: ['email', 'in_app', 'webhook'] },
  'usage.quota_90': { title: 'Usage Alert: 90%', channels: ['email', 'in_app', 'webhook'] },
  'usage.quota_100': { title: 'Usage Limit Reached', channels: ['email', 'in_app', 'webhook'] },
  'usage.anomaly_detected': { title: 'Usage Anomaly', channels: ['email', 'in_app'] },

  // API
  'api.status_changed': { title: 'API Status Update', channels: ['email', 'in_app'] },
  'api.new_subscriber': { title: 'New Subscriber', channels: ['in_app'] },
  'api.subscriber_churned': { title: 'Subscriber Cancelled', channels: ['email', 'in_app'] },
  'api.breaking_change': { title: 'Breaking Change Detected', channels: ['email', 'in_app', 'webhook'] },
  'api.sla_violation': { title: 'SLA Violation', channels: ['email', 'in_app', 'webhook'] },
  'api.review_submitted': { title: 'New Review', channels: ['in_app'] },

  // Team
  'team.invitation_received': { title: 'Team Invitation', channels: ['email', 'in_app'] },
  'team.member_joined': { title: 'New Team Member', channels: ['in_app'] },
  'team.member_left': { title: 'Team Member Left', channels: ['in_app'] },
  'team.role_changed': { title: 'Role Updated', channels: ['email', 'in_app'] },

  // Governance
  'governance.approval_requested': { title: 'Approval Needed', channels: ['email', 'in_app'] },
  'governance.approval_decided': { title: 'Approval Decision', channels: ['email', 'in_app'] },
  'governance.policy_violation': { title: 'Policy Violation', channels: ['email', 'in_app'] },

  // Cost
  'cost.savings_found': { title: 'Savings Opportunity', channels: ['in_app'] },
  'cost.budget_alert': { title: 'Budget Alert', channels: ['email', 'in_app'] },

  // System
  'system.maintenance_scheduled': { title: 'Maintenance Scheduled', channels: ['email', 'in_app'] },
  'system.feature_released': { title: 'New Feature Available', channels: ['in_app'] },
} as const;

/**
 * Dispatches a notification to all configured channels
 */
export async function dispatchNotification(event: NotificationEvent): Promise<void> {
  const supabase = createAdminClient();

  try {
    // Get user's notification preferences
    const { data: preferences } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', event.userId)
      .eq('event_type', event.type)
      .maybeSingle();

    const defaultChannels: string[] = [...(NOTIFICATION_EVENTS[event.type as keyof typeof NOTIFICATION_EVENTS]?.channels ?? ['in_app'])];

    const emailEnabled = preferences?.email_enabled ?? defaultChannels.includes('email');
    const inAppEnabled = preferences?.in_app_enabled ?? defaultChannels.includes('in_app');
    const webhookEnabled = preferences?.webhook_enabled ?? defaultChannels.includes('webhook');

    // In-app notification
    if (inAppEnabled) {
      await supabase.from('notifications').insert({
        user_id: event.userId,
        organization_id: event.organizationId || null,
        event_type: event.type,
        title: event.title,
        body: event.body,
        link: event.link,
        metadata: event.metadata,
      });
    }

    // Email notification via Resend
    if (emailEnabled) {
      await sendEmailNotification(event, supabase);
    }

    // Webhook notifications
    if (webhookEnabled && event.organizationId) {
      await dispatchWebhook(event);
    }

    logger.info('Notification dispatched', {
      type: event.type,
      userId: event.userId,
      channels: { email: emailEnabled, inApp: inAppEnabled, webhook: webhookEnabled },
    });
  } catch (error) {
    logger.error('Failed to dispatch notification', { error, event });
    throw error;
  }
}

// ── Email template helpers ────────────────────────────────────────────────────

function emailShell(
  platformName: string,
  siteUrl: string,
  content: string,
  footerNote: string,
): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#4c1d95 100%);padding:28px 40px;text-align:center;">
            <p style="margin:0;font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">${platformName}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 40px 28px;">
            ${content}
          </td>
        </tr>
        <tr>
          <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:16px 40px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">
              ${footerNote}<br/>
              <a href="${siteUrl}/dashboard/settings/notifications" style="color:#6366f1;text-decoration:none;">Manage notification preferences</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function ctaButton(href: string, label: string, variant: 'primary' | 'danger' = 'primary'): string {
  const bg = variant === 'danger' ? '#dc2626' : 'linear-gradient(135deg,#4f46e5,#7c3aed)';
  return `<a href="${href}" style="display:inline-block;background:${bg};color:#ffffff;font-size:14px;font-weight:600;padding:12px 28px;border-radius:8px;text-decoration:none;">${label}</a>`;
}

/** Renders a usage progress bar (0–100 pct). */
function usageBar(pct: number): string {
  const color = pct >= 100 ? '#dc2626' : pct >= 90 ? '#f59e0b' : '#6366f1';
  return `
    <div style="background:#f3f4f6;border-radius:999px;height:10px;overflow:hidden;margin:12px 0 4px;">
      <div style="background:${color};height:10px;width:${Math.min(pct, 100)}%;border-radius:999px;"></div>
    </div>
    <p style="margin:0;font-size:12px;color:#6b7280;">${pct}% of monthly quota used</p>
  `;
}

/**
 * Builds a specialised HTML email body for a given notification event type.
 * Falls back to a generic template for unrecognised types.
 */
function buildEmailHtml(
  event: NotificationEvent,
  userData: { email: string; full_name?: string | null },
  platformName: string,
  siteUrl: string,
): string {
  const firstName = userData.full_name?.split(' ')[0] ?? 'there';
  const meta = event.metadata ?? {};

  // ── Billing: payment failed / dunning ─────────────────────────────────────
  if (event.type === 'billing.payment_failed') {
    const action = meta.action as string | undefined;
    const isCancelled = action === 'cancelled';
    const isFinal = action === 'final_warning';
    const portalUrl = `${siteUrl}/api/billing/portal`;

    const headline = isCancelled
      ? 'Your subscription has been cancelled'
      : isFinal
      ? 'Final warning: subscription will be cancelled'
      : 'Action required: payment failed';

    const body = isCancelled
      ? `Hi ${firstName}, your API subscription was cancelled after 14 days without a successful payment. To restore access, please update your payment details and resubscribe.`
      : isFinal
      ? `Hi ${firstName}, your API subscription is still unpaid. We'll cancel access in 7 days unless payment is received. Update your card now to keep your integration running.`
      : `Hi ${firstName}, we weren't able to charge your payment method. To avoid service interruption, please update your billing details as soon as possible.`;

    const content = `
      <h2 style="margin:0 0 12px;font-size:20px;color:#111827;">${headline}</h2>
      <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.6;">${body}</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px;margin-bottom:24px;">
        <tr><td>
          <p style="margin:0;font-size:14px;color:#991b1b;font-weight:600;">What happens next?</p>
          <ul style="margin:8px 0 0;padding-left:20px;color:#991b1b;font-size:13px;line-height:1.8;">
            ${!isCancelled ? '<li>Stripe will retry your card automatically</li>' : ''}
            ${!isCancelled && !isFinal ? '<li>We\'ll send a final warning in 4 more days</li>' : ''}
            ${!isCancelled ? '<li>Access will be revoked after 14 days</li>' : '<li>Your API keys have been revoked</li>'}
          </ul>
        </td></tr>
      </table>
      <p style="margin:0 0 20px;">${ctaButton(`${siteUrl}/dashboard/settings/billing`, 'Update payment method', 'danger')}</p>
      <p style="margin:0;font-size:13px;color:#6b7280;">Questions? Reply to this email and we'll help sort it out.</p>
    `;
    return emailShell(platformName, siteUrl, content,
      `You received this because payment failed on your ${platformName} account.`);
  }

  // ── Usage quota alerts ────────────────────────────────────────────────────
  if (event.type === 'usage.quota_80' || event.type === 'usage.quota_90' || event.type === 'usage.quota_100') {
    const pct = event.type === 'usage.quota_100' ? 100 : event.type === 'usage.quota_90' ? 90 : 80;
    const isLimit = pct === 100;
    const upgradeUrl = `${siteUrl}/pricing`;

    const headline = isLimit
      ? 'Monthly API quota reached'
      : `You've used ${pct}% of your monthly quota`;

    const urgency = isLimit
      ? 'API calls are now being rejected. Upgrade immediately to restore service.'
      : pct === 90
      ? 'You\'re almost at the limit. Upgrade now to avoid disruption.'
      : 'You\'re making great use of the platform! Consider upgrading for higher limits.';

    const content = `
      <h2 style="margin:0 0 12px;font-size:20px;color:#111827;">${headline}</h2>
      <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.6;">Hi ${firstName}, ${urgency}</p>
      ${usageBar(pct)}
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;padding:16px;margin:20px 0;">
        <tr><td>
          <p style="margin:0 0 8px;font-size:14px;font-weight:600;color:#4c1d95;">Pro plan includes</p>
          <table cellpadding="0" cellspacing="0">
            ${[
              ['50,000 API calls/month', '50× more than free'],
              ['Priority support', 'Response within 4 hours'],
              ['Advanced analytics', 'Full usage breakdown'],
              ['Custom rate limits', 'Per-endpoint control'],
            ].map(([feature, detail]) => `
              <tr>
                <td style="font-size:13px;color:#374151;padding:3px 0;">✓&nbsp;&nbsp;<strong>${feature}</strong></td>
                <td style="font-size:12px;color:#6b7280;padding:3px 0 3px 12px;">${detail}</td>
              </tr>`).join('')}
          </table>
        </td></tr>
      </table>
      <p style="margin:0 0 20px;">${ctaButton(upgradeUrl, isLimit ? 'Restore access — Upgrade now →' : 'Upgrade to Pro →')}</p>
      <p style="margin:0;font-size:13px;color:#6b7280;">You can also <a href="${siteUrl}/dashboard/settings/billing" style="color:#6366f1;">view your current usage</a> in the dashboard.</p>
    `;
    return emailShell(platformName, siteUrl, content,
      `Quota alert for your ${platformName} account.`);
  }

  // ── Post-purchase welcome ─────────────────────────────────────────────────
  if (event.type === 'billing.subscription_activated') {
    const plan = (meta.plan as string | undefined) ?? 'Pro';
    const content = `
      <h2 style="margin:0 0 12px;font-size:20px;color:#111827;">Welcome to ${plan}! 🎉</h2>
      <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.6;">
        Hi ${firstName}, your ${platformName} ${plan} plan is now active. Here's how to make the most of it in the next 24 hours:
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
        ${[
          ['1', 'Browse the marketplace', 'Explore 500+ APIs across every category', '/marketplace'],
          ['2', 'Generate your first integration', 'AI-powered code generation from any spec', '/dashboard/developer/playground'],
          ['3', 'Set up analytics', 'Monitor usage and costs in real time', '/dashboard/analytics/usage'],
        ].map(([n, title, desc, href]) => `
          <tr>
            <td style="padding:10px 0;border-top:1px solid #f3f4f6;">
              <table cellpadding="0" cellspacing="0"><tr>
                <td style="width:32px;height:32px;background:#4f46e5;border-radius:50%;text-align:center;vertical-align:middle;font-size:14px;font-weight:700;color:#fff;">${n}</td>
                <td style="padding-left:12px;">
                  <p style="margin:0;font-size:14px;font-weight:600;color:#111827;"><a href="${siteUrl}${href}" style="color:#4f46e5;text-decoration:none;">${title}</a></p>
                  <p style="margin:2px 0 0;font-size:13px;color:#6b7280;">${desc}</p>
                </td>
              </tr></table>
            </td>
          </tr>`).join('')}
      </table>
      <p style="margin:0;">${ctaButton(`${siteUrl}/dashboard`, 'Go to your dashboard →')}</p>
    `;
    return emailShell(platformName, siteUrl, content,
      `You received this because you upgraded your ${platformName} account.`);
  }

  // ── Payout completed ──────────────────────────────────────────────────────
  if (event.type === 'billing.payout_completed') {
    const amount = meta.amount as number | undefined;
    const amountStr = amount != null
      ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
      : 'your earnings';
    const content = `
      <h2 style="margin:0 0 12px;font-size:20px;color:#111827;">Payout sent 💸</h2>
      <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.6;">
        Hi ${firstName}, <strong>${amountStr}</strong> has been sent to your connected bank account. It typically arrives within 2–5 business days.
      </p>
      <p style="margin:0 0 20px;">${ctaButton(`${siteUrl}/dashboard/analytics/provider`, 'View earnings dashboard →')}</p>
      <p style="margin:0;font-size:13px;color:#6b7280;">Keep publishing great APIs to grow your revenue further.</p>
    `;
    return emailShell(platformName, siteUrl, content,
      `Payout notification from ${platformName}.`);
  }

  // ── Generic fallback ──────────────────────────────────────────────────────
  const content = `
    <h2 style="margin:0 0 12px;font-size:20px;color:#111827;">${event.title}</h2>
    <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.6;">${event.body}</p>
    ${event.link ? `<p style="margin:0;">${ctaButton(`${siteUrl}${event.link}`, 'View details →')}</p>` : ''}
  `;
  return emailShell(platformName, siteUrl, content,
    `You received this because you have notifications enabled on your ${platformName} account.`);
}

/**
 * Sends an email notification via Resend.
 * Falls back gracefully if RESEND_API_KEY is not configured.
 */
async function sendEmailNotification(
  event: NotificationEvent,
  supabase: ReturnType<typeof createAdminClient>
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    logger.warn('RESEND_API_KEY not set — skipping email', { type: event.type });
    return;
  }

  try {
    // Fetch the user's email address
    const { data: userData } = await supabase
      .from('users')
      .select('email, full_name')
      .eq('id', event.userId)
      .maybeSingle();

    if (!userData?.email) {
      logger.warn('No email found for user — skipping email', { userId: event.userId });
      return;
    }

    const resend = new Resend(apiKey);
    const fromName = process.env.NEXT_PUBLIC_PLATFORM_NAME ?? 'LukeAPI';
    const fromEmail = process.env.EMAIL_FROM ?? `notifications@${process.env.NEXT_PUBLIC_SITE_URL?.replace(/^https?:\/\//, '') ?? 'lukeapi.com'}`;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://lukeapi.com';

    const bodyHtml = buildEmailHtml(event, userData, fromName, siteUrl);

    await resendBreaker.execute(() =>
      resend.emails.send({
        from: `${fromName} <${fromEmail}>`,
        to: userData.email,
        subject: event.title,
        html: bodyHtml,
      })
    );

    logger.info('Email notification sent', { type: event.type, userId: event.userId, email: userData.email });
  } catch (error) {
    logger.error('Failed to send email notification', { error, type: event.type, userId: event.userId });
    // Non-fatal: don't re-throw so other channels still dispatch
  }
}

/**
 * Dispatches webhook notification
 */
async function dispatchWebhook(event: NotificationEvent): Promise<void> {
  if (!event.organizationId) return;

  const supabase = createAdminClient();

  // Get active webhook endpoints for this event type
  const { data: endpoints } = await supabase
    .from('webhook_endpoints')
    .select('*')
    .eq('organization_id', event.organizationId)
    .eq('is_active', true)
    .contains('events', [event.type]);

  if (!endpoints || endpoints.length === 0) return;

  // Queue webhook deliveries
  for (const endpoint of endpoints) {
    await supabase.from('webhook_deliveries').insert({
      webhook_endpoint_id: endpoint.id,
      event_type: event.type,
      payload: {
        id: `evt_${Date.now()}`,
        type: event.type,
        created_at: new Date().toISOString(),
        data: event.metadata,
        organization_id: event.organizationId,
      },
      status: 'pending',
    });
  }

  logger.info('Webhook deliveries queued', {
    type: event.type,
    organizationId: event.organizationId,
    endpointCount: endpoints.length,
  });
}

/**
 * Gets unread notification count for a user
 */
export async function getUnreadCount(userId: string): Promise<number> {
  const supabase = createAdminClient();

  const { count } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false);

  return count || 0;
}

/**
 * Marks notification as read
 */
export async function markAsRead(notificationId: string, userId: string): Promise<void> {
  const supabase = createAdminClient();

  await supabase
    .from('notifications')
    .update({
      is_read: true,
      read_at: new Date().toISOString(),
    })
    .eq('id', notificationId)
    .eq('user_id', userId);
}

/**
 * Marks all notifications as read for a user
 */
export async function markAllAsRead(userId: string): Promise<void> {
  const supabase = createAdminClient();

  await supabase
    .from('notifications')
    .update({
      is_read: true,
      read_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('is_read', false);
}
