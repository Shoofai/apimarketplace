import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/gdpr/export
 * Request data export (GDPR right to access)
 */
export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's current organization
    const { data: userData } = await supabase
      .from('users')
      .select('id, current_organization_id')
      .eq('id', user.id)
      .single();

    // Create export request
    const { data: request, error } = await supabase
      .from('data_export_requests')
      .insert({
        user_id: userData?.id,
        organization_id: userData?.current_organization_id,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Trigger Edge Function to process export
    const functionUrl = `${process.env.SUPABASE_URL}/functions/v1/export-user-data`;
    await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({
        user_id: userData?.id,
        organization_id: userData?.current_organization_id,
        request_id: request.id,
      }),
    });

    return NextResponse.json({
      message:
        'Data export requested. You will receive an email when your export is ready (usually within 24 hours).',
      request_id: request.id,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * GET /api/gdpr/export
 * Check status of export requests
 */
export async function GET() {
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
      .select('id')
      .eq('id', user.id)
      .single();

    const { data: requests } = await supabase
      .from('data_export_requests')
      .select('*')
      .eq('user_id', userData?.id)
      .order('created_at', { ascending: false })
      .limit(10);

    return NextResponse.json({ requests });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
