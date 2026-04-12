import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSiteMode } from '@/lib/settings/site-mode';
import { AccessSettings } from './AccessSettings';

export const dynamic = 'force-dynamic';

export default async function AccessPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: userData } = await supabase
    .from('users')
    .select('is_platform_admin')
    .eq('id', user.id)
    .single();
  if (!userData?.is_platform_admin) redirect('/dashboard');

  const admin = createAdminClient();

  const [siteMode, allowlistRes, codesRes, waitlistRes] = await Promise.all([
    getSiteMode(),
    admin.from('prelaunch_allowlist').select('id, email, note, added_at').order('added_at', { ascending: false }),
    admin.from('prelaunch_invite_codes').select('id, code, label, max_uses, uses_count, expires_at, is_active, created_at').order('created_at', { ascending: false }),
    admin.from('waitlist_signups').select('id, email, full_name, role, created_at').order('created_at', { ascending: false }).limit(200),
  ]);

  return (
    <AccessSettings
      initialMode={siteMode.mode}
      initialMessage={siteMode.message ?? ''}
      initialAllowlist={allowlistRes.data ?? []}
      initialCodes={codesRes.data ?? []}
      waitlist={waitlistRes.data ?? []}
    />
  );
}
