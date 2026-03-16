import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Sparkles, TrendingUp, Database, Clock, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// ── Types ──────────────────────────────────────────────────────────────────

type AILogRow = {
  id: string;
  request_type: string;
  model_used: string;
  input_tokens: number | null;
  output_tokens: number | null;
  latency_ms: number | null;
  estimated_cost_usd: number | null;
  created_at: string;
  stakeholder_id: string | null;
};

type CacheRow = {
  id: string;
  cache_key: string;
  content_type: string;
  hit_count: number;
  expires_at: string | null;
  created_at: string;
};

// ── Page ───────────────────────────────────────────────────────────────────

export const dynamic = 'force-dynamic';

export default async function AdminAIMonitorPage() {
  const userClient = await createClient();
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await userClient
    .from('profiles')
    .select('is_platform_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_platform_admin) redirect('/dashboard');

  const supabase = createAdminClient();

  const now = new Date();
  const sevenDaysAgo  = new Date(now.getTime() - 7  * 24 * 3600 * 1000).toISOString();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 3600 * 1000).toISOString();

  // Fetch recent AI log rows (last 50)
  const { data: recentLogs } = await supabase
    .from('ai_request_log')
    .select('id, request_type, model_used, input_tokens, output_tokens, latency_ms, estimated_cost_usd, created_at, stakeholder_id')
    .order('created_at', { ascending: false })
    .limit(50);

  // Aggregate costs
  const { data: last7Rows } = await supabase
    .from('ai_request_log')
    .select('estimated_cost_usd, model_used, request_type')
    .gte('created_at', sevenDaysAgo);

  const { data: last30Rows } = await supabase
    .from('ai_request_log')
    .select('estimated_cost_usd')
    .gte('created_at', thirtyDaysAgo);

  const cost7  = (last7Rows  ?? []).reduce((s, r) => s + (r.estimated_cost_usd ?? 0), 0);
  const cost30 = (last30Rows ?? []).reduce((s, r) => s + (r.estimated_cost_usd ?? 0), 0);

  // Spend by model (last 7 days)
  const spendByModel: Record<string, number> = {};
  const spendByType:  Record<string, number> = {};
  for (const r of (last7Rows ?? [])) {
    const model = r.model_used ?? 'unknown';
    const type = r.request_type ?? 'unknown';
    spendByModel[model] = (spendByModel[model] ?? 0) + (r.estimated_cost_usd ?? 0);
    spendByType[type] = (spendByType[type] ?? 0) + (r.estimated_cost_usd ?? 0);
  }

  // Cache stats
  const { data: cacheRows } = await supabase
    .from('ai_content_cache')
    .select('id, cache_key, content_type, hit_count, expires_at, created_at')
    .order('hit_count', { ascending: false })
    .limit(20);

  const { count: totalCacheEntries } = await supabase
    .from('ai_content_cache')
    .select('*', { count: 'exact', head: true });

  const totalHits = (cacheRows ?? []).reduce((s, r) => s + (r.hit_count ?? 0), 0);

  const soonThreshold = new Date(now.getTime() + 24 * 3600 * 1000).toISOString();
  const { count: expiringSoon } = await supabase
    .from('ai_content_cache')
    .select('*', { count: 'exact', head: true })
    .lt('expires_at', soonThreshold)
    .gt('expires_at', now.toISOString());

  // Context profiles
  const { count: contextProfiles } = await supabase
    .from('stakeholder_ai_context')
    .select('*', { count: 'exact', head: true })
    .not('interest_summary', 'is', null);

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Sparkles className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">AI Monitor</h1>
          <p className="text-sm text-muted-foreground">
            Cost tracking, usage logs, cache stats, and context profiles
          </p>
        </div>
      </div>

      {/* Cost Summary */}
      <section>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-muted-foreground" />
          Cost Summary
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Last 7 days</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">${cost7.toFixed(4)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Last 30 days</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">${cost30.toFixed(4)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Context profiles</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{contextProfiles ?? 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Cache entries</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{totalCacheEntries ?? 0}</p>
              <p className="text-xs text-muted-foreground mt-1">{expiringSoon ?? 0} expiring in 24h</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Spend Breakdown (last 7d) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Spend by model (7d)</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.entries(spendByModel).length === 0 ? (
              <p className="text-sm text-muted-foreground">No data yet</p>
            ) : (
              <div className="space-y-2">
                {Object.entries(spendByModel)
                  .sort(([, a], [, b]) => b - a)
                  .map(([model, cost]) => (
                    <div key={model} className="flex justify-between text-sm">
                      <span className="font-mono text-xs truncate max-w-[200px]">{model}</span>
                      <span className="font-semibold tabular-nums">${cost.toFixed(5)}</span>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Spend by task type (7d)</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.entries(spendByType).length === 0 ? (
              <p className="text-sm text-muted-foreground">No data yet</p>
            ) : (
              <div className="space-y-2">
                {Object.entries(spendByType)
                  .sort(([, a], [, b]) => b - a)
                  .map(([type, cost]) => (
                    <div key={type} className="flex justify-between text-sm">
                      <span className="capitalize">{type.replace(/_/g, ' ')}</span>
                      <span className="font-semibold tabular-nums">${cost.toFixed(5)}</span>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Usage Log */}
      <section>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5 text-muted-foreground" />
          Recent Requests (last 50)
        </h2>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/40">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Task</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Model</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">Tokens in</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">Tokens out</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">Cost</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">Latency</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {(recentLogs as AILogRow[] ?? []).map((row) => (
                    <tr key={row.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-2.5 capitalize">{row.request_type.replace(/_/g, ' ')}</td>
                      <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{row.model_used.split('-').slice(0, 3).join('-')}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums">{row.input_tokens?.toLocaleString() ?? '—'}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums">{row.output_tokens?.toLocaleString() ?? '—'}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums font-medium">
                        {row.estimated_cost_usd != null ? `$${row.estimated_cost_usd.toFixed(5)}` : '—'}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
                        {row.latency_ms != null ? `${row.latency_ms.toLocaleString()}ms` : '—'}
                      </td>
                      <td className="px-4 py-2.5 text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(row.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {(recentLogs ?? []).length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                        No AI requests logged yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Cache Stats */}
      <section>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Database className="h-5 w-5 text-muted-foreground" />
          Cache — Top by Hits
        </h2>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/40">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Type</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Cache key (prefix)</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">Hits</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Expires</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {(cacheRows as CacheRow[] ?? []).map((row) => {
                    const isExpiringSoon = row.expires_at && new Date(row.expires_at) < new Date(now.getTime() + 24 * 3600 * 1000);
                    return (
                      <tr key={row.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-2.5 capitalize">{row.content_type.replace(/_/g, ' ')}</td>
                        <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{row.cache_key.slice(0, 16)}…</td>
                        <td className="px-4 py-2.5 text-right tabular-nums font-semibold">{row.hit_count}</td>
                        <td className={`px-4 py-2.5 text-xs ${isExpiringSoon ? 'text-amber-500' : 'text-muted-foreground'}`}>
                          {row.expires_at ? (
                            <span className="flex items-center gap-1">
                              {isExpiringSoon && <Clock className="h-3 w-3" />}
                              {new Date(row.expires_at).toLocaleDateString()}
                            </span>
                          ) : 'never'}
                        </td>
                        <td className="px-4 py-2.5 text-xs text-muted-foreground">
                          {new Date(row.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                  {(cacheRows ?? []).length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                        No cached entries yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t flex gap-6 text-sm text-muted-foreground">
              <span>Total entries: <strong className="text-foreground">{totalCacheEntries ?? 0}</strong></span>
              <span>Total hits (top 20): <strong className="text-foreground">{totalHits}</strong></span>
              <span>Expiring in 24h: <strong className="text-amber-500">{expiringSoon ?? 0}</strong></span>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
