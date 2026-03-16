import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';
import { StakeholdersClient } from './StakeholdersClient';

const PAGE_SIZE = 20;

export default async function AdminStakeholdersPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    type?: string;
    stage?: string;
    source?: string;
    from?: string;
    to?: string;
  }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: userData } = await supabase
    .from('users')
    .select('is_platform_admin')
    .eq('id', user.id)
    .single();

  if (!userData?.is_platform_admin) redirect('/dashboard');

  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || '1', 10));
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const admin = createAdminClient();

  let stakeholdersQuery = admin
    .from('stakeholders')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (params.type?.trim()) {
    stakeholdersQuery = stakeholdersQuery.eq('stakeholder_type', params.type.trim());
  }
  if (params.stage?.trim()) {
    stakeholdersQuery = stakeholdersQuery.eq('funnel_stage', params.stage.trim());
  }
  if (params.source?.trim()) {
    stakeholdersQuery = stakeholdersQuery.eq('capture_source', params.source.trim());
  }
  if (params.from?.trim()) {
    stakeholdersQuery = stakeholdersQuery.gte('created_at', params.from.trim());
  }
  if (params.to?.trim()) {
    stakeholdersQuery = stakeholdersQuery.lte(
      'created_at',
      params.to.trim() + 'T23:59:59.999Z'
    );
  }

  const { data: stakeholders, count: totalCount } = await stakeholdersQuery.range(
    from,
    to
  );

  const { count: totalCaptured } = await admin
    .from('stakeholders')
    .select('*', { count: 'exact', head: true });

  const types = ['investor', 'api_provider', 'developer', 'enterprise_buyer', 'unknown'] as const;
  const byType: Record<string, number> = {};
  await Promise.all(
    types.map(async (t) => {
      const { count } = await admin
        .from('stakeholders')
        .select('*', { count: 'exact', head: true })
        .eq('stakeholder_type', t);
      byType[t] = count ?? 0;
    })
  );

  const { data: engagementRows } = await admin
    .from('stakeholders')
    .select('engagement_score');
  const list = (engagementRows ?? []) as { engagement_score: number | null }[];
  const avgEngagement =
    list.length === 0
      ? 0
      : Math.round((list.reduce((a, b) => a + (b.engagement_score ?? 0), 0) / list.length) * 10) / 10;

  const stats = {
    totalCaptured: totalCaptured ?? 0,
    byType,
    avgEngagement,
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Stakeholders</h1>
        <p className="text-muted-foreground">
          Captured leads and auto-segmented stakeholder records
        </p>
      </div>
      <StakeholdersClient
        initialStakeholders={stakeholders ?? []}
        totalCount={totalCount ?? 0}
        page={page}
        pageSize={PAGE_SIZE}
        stats={stats}
        filters={{
          type: params.type ?? '',
          stage: params.stage ?? '',
          source: params.source ?? '',
          from: params.from ?? '',
          to: params.to ?? '',
        }}
      />
    </div>
  );
}
