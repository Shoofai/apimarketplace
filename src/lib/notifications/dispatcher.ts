import { createAdminClient } from '@/lib/supabase/admin';
import { logger } from '@/lib/utils/logger';
import { Resend } from 'resend';

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
    const fromName = process.env.NEXT_PUBLIC_PLATFORM_NAME ?? 'APIMarketplace';
    const fromEmail = process.env.EMAIL_FROM ?? `notifications@${process.env.NEXT_PUBLIC_SITE_URL?.replace(/^https?:\/\//, '') ?? 'apimarketplace.pro'}`;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://apimarketplace.pro';

    const bodyHtml = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;">
        <h2 style="margin-top:0;">${event.title}</h2>
        <p style="color:#555;">${event.body}</p>
        ${event.link ? `<p><a href="${siteUrl}${event.link}" style="background:#6366f1;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;margin-top:8px;">View Details</a></p>` : ''}
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
        <p style="font-size:12px;color:#999;">You received this email because you have notifications enabled in your ${fromName} account. <a href="${siteUrl}/dashboard/settings/notifications">Manage preferences</a></p>
      </div>
    `;

    await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: userData.email,
      subject: event.title,
      html: bodyHtml,
    });

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
