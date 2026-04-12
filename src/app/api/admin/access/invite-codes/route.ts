import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from('users').select('is_platform_admin').eq('id', user.id).single();
  return data?.is_platform_admin ? user : null;
}

function generateCode(): string {
  // 8-char alphanumeric code, easy to type
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

// GET — list all invite codes
export async function GET() {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('prelaunch_invite_codes')
    .select('id, code, label, max_uses, uses_count, expires_at, is_active, created_at')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

// POST — generate a new invite code
export async function POST(request: NextRequest) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { label, max_uses = 1, expires_at, custom_code } = await request.json();
  const code = custom_code ? custom_code.trim().toUpperCase() : generateCode();

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('prelaunch_invite_codes')
    .insert({
      code,
      label: label || null,
      max_uses: Math.max(1, Number(max_uses) || 1),
      expires_at: expires_at || null,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'Code already exists' }, { status: 409 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}
