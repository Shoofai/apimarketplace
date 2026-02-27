import { NextResponse } from 'next/server';

/**
 * GET /api/auth/cli-config
 * Returns the public Supabase project URL and anon key so that the CLI
 * can initialise its own Supabase client for email/password sign-in.
 * These values are already exposed client-side via NEXT_PUBLIC_ env vars,
 * so there is no security risk in returning them here.
 */
export async function GET() {
  const supabase_url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabase_anon_key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabase_url || !supabase_anon_key) {
    return NextResponse.json({ error: 'Platform misconfigured' }, { status: 500 });
  }

  return NextResponse.json({ supabase_url, supabase_anon_key });
}
