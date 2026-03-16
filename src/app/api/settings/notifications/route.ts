import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';

/**
 * Save notification preferences for the current user.
 * POST /api/settings/notifications
 */
export async function POST(request: Request) {
  try {
    const context = await requireAuth();
    const { preferences } = await request.json();

    if (!Array.isArray(preferences)) {
      return NextResponse.json({ error: 'preferences must be an array' }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: userData } = await supabase
      .from('users')
      .select('current_organization_id')
      .eq('id', context.user.id)
      .single();

    if (!userData) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Upsert each preference row
    for (const pref of preferences) {
      if (!pref.event_type) continue;
      await supabase.from('notification_preferences').upsert(
        {
          user_id: context.user.id,
          organization_id: userData.current_organization_id,
          event_type: pref.event_type,
          email_enabled: pref.email_enabled ?? true,
          in_app_enabled: pref.in_app_enabled ?? true,
          webhook_enabled: pref.webhook_enabled ?? false,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,organization_id,event_type' }
      );
    }

    logger.info('Notification preferences saved', { userId: context.user.id, count: preferences.length });
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error saving notification preferences', { error });
    return NextResponse.json({ error: 'Failed to save preferences' }, { status: 500 });
  }
}
