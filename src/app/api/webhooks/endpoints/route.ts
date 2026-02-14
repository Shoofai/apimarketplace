import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { randomBytes } from 'crypto';

/**
 * POST /api/webhooks/endpoints
 * Create a new webhook endpoint for the current organization
 */
export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: userData } = await supabase
      .from('users')
      .select('current_organization_id')
      .eq('id', user.id)
      .single();

    if (!userData?.current_organization_id) {
      return NextResponse.json({ error: 'No organization' }, { status: 400 });
    }

    const contentType = req.headers.get('content-type') ?? '';
    let url: string;
    let eventsRaw: string;

    if (contentType.includes('application/json')) {
      const body = await req.json();
      url = body.url;
      eventsRaw = body.events ?? (Array.isArray(body.events) ? body.events.join(', ') : '');
    } else {
      const formData = await req.formData();
      url = (formData.get('url') as string)?.trim() ?? '';
      eventsRaw = (formData.get('events') as string)?.trim() ?? '';
    }

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    if (!url.startsWith('https://')) {
      return NextResponse.json({ error: 'URL must use HTTPS' }, { status: 400 });
    }

    const events = eventsRaw
      ? eventsRaw.split(/[\n,]/).map((e) => e.trim()).filter(Boolean)
      : [];

    const secret = `whsec_${randomBytes(32).toString('hex')}`;

    const { data: endpoint, error } = await supabase
      .from('webhook_endpoints')
      .insert({
        organization_id: userData.current_organization_id,
        url,
        secret,
        events,
        is_active: true,
        failure_count: 0,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      id: endpoint.id,
      url: endpoint.url,
      message: 'Webhook endpoint added',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to add webhook endpoint';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
