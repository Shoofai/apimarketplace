import { createAdminClient } from '@/lib/supabase/admin';
import { logger } from '@/lib/utils/logger';

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

    const defaultChannels = NOTIFICATION_EVENTS[event.type as keyof typeof NOTIFICATION_EVENTS]?.channels || ['in_app'];

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

    // Email notification (queue for Edge Function)
    if (emailEnabled) {
      // TODO: Queue email via Edge Function
      logger.info('Email notification queued', { type: event.type, userId: event.userId });
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
