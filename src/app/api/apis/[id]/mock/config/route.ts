import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const mockConfigSchema = z.object({
  endpoint_path: z.string().min(1).startsWith('/'),
  http_method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']),
  response_status: z.number().int().min(100).max(599).default(200),
  response_body: z.any().optional(),
  response_headers: z.record(z.string()).optional().default({}),
  delay_ms: z.number().int().min(0).max(5000).default(0),
  is_active: z.boolean().default(true),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await requireAuth();
    const supabase = await createClient();

    const { data, error } = await (supabase as any)
      .from('api_mock_configs')
      .select('*')
      .eq('api_id', id)
      .order('endpoint_path');

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data ?? []);
  } catch (err) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const context = await requireAuth();
    const supabase = await createClient();

    // Verify ownership
    const { data: api } = await supabase
      .from('apis')
      .select('organization_id')
      .eq('id', id)
      .single();

    if (!api || api.organization_id !== context.organization_id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = mockConfigSchema.parse(body);

    const { data, error } = await (supabase as any)
      .from('api_mock_configs')
      .insert({ api_id: id, ...parsed })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: err.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create mock config' }, { status: 500 });
  }
}
