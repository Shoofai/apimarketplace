import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

async function handleMock(
  request: Request,
  { params }: { params: Promise<{ id: string; path: string[] }> }
) {
  const { id, path } = await params;
  const endpointPath = '/' + path.join('/');
  const method = request.method;

  const supabase = await createClient();

  // Verify API exists and is published
  const { data: api } = await supabase
    .from('apis')
    .select('id, status')
    .eq('id', id)
    .single();

  if (!api || api.status !== 'published') {
    return NextResponse.json({ error: 'API not found' }, { status: 404 });
  }

  // Look up mock config
  const { data: mock } = await (supabase as any)
    .from('api_mock_configs')
    .select('*')
    .eq('api_id', id)
    .eq('endpoint_path', endpointPath)
    .eq('http_method', method)
    .eq('is_active', true)
    .maybeSingle();

  if (!mock) {
    return NextResponse.json(
      { error: 'No mock configured for this endpoint', path: endpointPath, method },
      { status: 404 }
    );
  }

  // Apply configured delay
  if (mock.delay_ms > 0) {
    await new Promise((resolve) => setTimeout(resolve, Math.min(mock.delay_ms, 5000)));
  }

  const responseHeaders = new Headers({
    'Content-Type': 'application/json',
    'X-Mock-Server': 'true',
    ...(mock.response_headers as Record<string, string> || {}),
  });

  return new Response(
    JSON.stringify(mock.response_body),
    { status: mock.response_status, headers: responseHeaders }
  );
}

export const GET = handleMock;
export const POST = handleMock;
export const PUT = handleMock;
export const PATCH = handleMock;
export const DELETE = handleMock;
