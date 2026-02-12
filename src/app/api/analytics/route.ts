import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { events } = body;

    if (!events || !Array.isArray(events) || events.length === 0) {
      return NextResponse.json({ error: 'No events provided' }, { status: 400 });
    }

    const supabase = await createClient();

    // Batch insert analytics events
    const insertPromises = events.map(async (event) => {
      const { type, data } = event;

      switch (type) {
        case 'page_view':
          return supabase.from('page_views').insert(data);
        case 'cta_click':
          return supabase.from('cta_clicks').insert(data);
        case 'feature_demo':
          return supabase.from('feature_demo_interactions').insert(data);
        default:
          return null;
      }
    });

    const results = await Promise.allSettled(insertPromises);

    // Check for errors
    const errors = results.filter((r) => r.status === 'rejected');
    if (errors.length > 0) {
      console.error('Analytics batch errors:', errors);
    }

    return NextResponse.json({
      success: true,
      processed: events.length,
      errors: errors.length,
    });
  } catch (error) {
    console.error('Analytics batch error:', error);
    return NextResponse.json(
      { error: 'Failed to process analytics batch' },
      { status: 500 }
    );
  }
}
