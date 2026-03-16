import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

const STATUS_COLORS: Record<string, string> = {
  queued:     'bg-muted text-muted-foreground',
  processing: 'bg-yellow-100 text-yellow-700',
  sent:       'bg-blue-100 text-blue-700',
  delivered:  'bg-emerald-100 text-emerald-700',
  opened:     'bg-green-100 text-green-700',
  clicked:    'bg-primary/10 text-primary font-semibold',
  replied:    'bg-purple-100 text-purple-700',
  bounced:    'bg-orange-100 text-orange-700',
  failed:     'bg-destructive/10 text-destructive',
  skipped:    'bg-muted text-muted-foreground',
};

type QueueRow = {
  status: string;
  count: number;
};

type LogRow = {
  id: string;
  to_email: string;
  subject: string;
  status: string;
  opened: boolean;
  clicked: boolean;
  created_at: string;
  stakeholder_id: string;
};

type SequenceRow = {
  id: string;
  sequence_name: string;
  stakeholder_type: string;
  trigger_stage: string;
  total_enrolled: number;
  total_completed: number;
  avg_conversion_rate: number;
  is_active: boolean;
};

type FrequencyCapRow = {
  id: string;
  stakeholder_type: string;
  channel: string;
  max_per_day: number;
  max_per_week: number;
  max_per_month: number;
  is_active: boolean;
};

export default async function AdminNurtureMonitorPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const admin = createAdminClient();

  // Queue status counts
  const { data: queueCounts } = await admin
    .from('nurture_queue')
    .select('status')
    .then(async ({ data }) => {
      if (!data) return { data: [] };
      const counts: Record<string, number> = {};
      for (const row of data) {
        const status = row.status ?? 'unknown';
        counts[status] = (counts[status] ?? 0) + 1;
      }
      return { data: Object.entries(counts).map(([status, count]) => ({ status, count })) };
    });

  // Total sent last 7 days
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { count: sentLast7Days } = await admin
    .from('email_send_log')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', sevenDaysAgo);

  const { count: openedLast7Days } = await admin
    .from('email_send_log')
    .select('*', { count: 'exact', head: true })
    .eq('opened', true)
    .gte('created_at', sevenDaysAgo);

  const { count: clickedLast7Days } = await admin
    .from('email_send_log')
    .select('*', { count: 'exact', head: true })
    .eq('clicked', true)
    .gte('created_at', sevenDaysAgo);

  // Recent 50 email_send_log rows
  const { data: recentLogs } = await admin
    .from('email_send_log')
    .select('id, to_email, subject, status, opened, clicked, created_at, stakeholder_id')
    .order('created_at', { ascending: false })
    .limit(50);

  // Top sequences by enrollment
  const { data: sequences } = await admin
    .from('nurture_sequences')
    .select('id, sequence_name, stakeholder_type, trigger_stage, total_enrolled, total_completed, avg_conversion_rate, is_active')
    .order('total_enrolled', { ascending: false });

  // Frequency caps
  const { data: freqCaps } = await admin
    .from('nurture_frequency_caps')
    .select('id, stakeholder_type, channel, max_per_day, max_per_week, max_per_month, is_active')
    .order('stakeholder_type');

  const openRate = sentLast7Days && sentLast7Days > 0
    ? Math.round(((openedLast7Days ?? 0) / sentLast7Days) * 100)
    : 0;

  const clickRate = sentLast7Days && sentLast7Days > 0
    ? Math.round(((clickedLast7Days ?? 0) / sentLast7Days) * 100)
    : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Nurture Engine</h1>
        <p className="text-muted-foreground mt-1">
          Central automation — one engine, four funnels. Runs every 30 minutes via pg_cron.
        </p>
      </div>

      {/* 7-day metrics */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Sent (7 days)', value: (sentLast7Days ?? 0).toLocaleString() },
          { label: 'Open rate', value: `${openRate}%` },
          { label: 'Click rate', value: `${clickRate}%` },
          { label: 'Active sequences', value: (sequences?.filter((s) => s.is_active).length ?? 0).toString() },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground mb-1">{label}</p>
            <p className="text-xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      {/* Queue status breakdown */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold mb-4">Queue Status</h2>
        <div className="flex flex-wrap gap-2">
          {(queueCounts as QueueRow[] ?? []).map(({ status, count }) => (
            <div
              key={status}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm ${STATUS_COLORS[status] ?? 'bg-muted text-muted-foreground'}`}
            >
              <span className="font-medium capitalize">{status}</span>
              <span className="font-bold">{count}</span>
            </div>
          ))}
          {(!queueCounts || queueCounts.length === 0) && (
            <p className="text-sm text-muted-foreground">No items in queue yet.</p>
          )}
        </div>
      </div>

      {/* Sequences table */}
      <div>
        <h2 className="text-sm font-semibold mb-3">Nurture Sequences ({sequences?.length ?? 0})</h2>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left py-2 px-4 font-medium text-muted-foreground">Sequence</th>
                <th className="text-left py-2 px-4 font-medium text-muted-foreground">Type</th>
                <th className="text-left py-2 px-4 font-medium text-muted-foreground">Trigger stage</th>
                <th className="text-right py-2 px-4 font-medium text-muted-foreground">Enrolled</th>
                <th className="text-right py-2 px-4 font-medium text-muted-foreground">Completed</th>
                <th className="text-center py-2 px-4 font-medium text-muted-foreground">Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(sequences as SequenceRow[] ?? []).map((seq) => (
                <tr key={seq.id} className="bg-card hover:bg-muted/30 transition-colors">
                  <td className="py-2.5 px-4 font-medium">{seq.sequence_name}</td>
                  <td className="py-2.5 px-4 text-muted-foreground capitalize">
                    {seq.stakeholder_type.replace(/_/g, ' ')}
                  </td>
                  <td className="py-2.5 px-4 text-muted-foreground font-mono text-xs">
                    {seq.trigger_stage}
                  </td>
                  <td className="py-2.5 px-4 text-right">{seq.total_enrolled}</td>
                  <td className="py-2.5 px-4 text-right">{seq.total_completed}</td>
                  <td className="py-2.5 px-4 text-center">
                    <span className={`inline-block rounded-full w-2 h-2 ${seq.is_active ? 'bg-green-500' : 'bg-muted-foreground'}`} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent email sends */}
      <div>
        <h2 className="text-sm font-semibold mb-3">Recent Sends (last 50)</h2>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left py-2 px-4 font-medium text-muted-foreground">To</th>
                <th className="text-left py-2 px-4 font-medium text-muted-foreground">Subject</th>
                <th className="text-center py-2 px-4 font-medium text-muted-foreground">Status</th>
                <th className="text-center py-2 px-4 font-medium text-muted-foreground">Opened</th>
                <th className="text-center py-2 px-4 font-medium text-muted-foreground">Clicked</th>
                <th className="text-right py-2 px-4 font-medium text-muted-foreground">Sent at</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(recentLogs as LogRow[] ?? []).map((log) => (
                <tr key={log.id} className="bg-card hover:bg-muted/30 transition-colors">
                  <td className="py-2 px-4 text-xs text-muted-foreground font-mono truncate max-w-[160px]">
                    {log.to_email}
                  </td>
                  <td className="py-2 px-4 text-xs truncate max-w-[220px]">{log.subject}</td>
                  <td className="py-2 px-4 text-center">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs capitalize ${STATUS_COLORS[log.status] ?? 'bg-muted text-muted-foreground'}`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="py-2 px-4 text-center text-sm">
                    {log.opened ? '✓' : <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="py-2 px-4 text-center text-sm">
                    {log.clicked ? '✓' : <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="py-2 px-4 text-right text-xs text-muted-foreground">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
              {(!recentLogs || recentLogs.length === 0) && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                    No emails sent yet. The processor runs every 30 minutes via pg_cron.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Frequency caps */}
      <div>
        <h2 className="text-sm font-semibold mb-3">Frequency Caps</h2>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left py-2 px-4 font-medium text-muted-foreground">Stakeholder type</th>
                <th className="text-left py-2 px-4 font-medium text-muted-foreground">Channel</th>
                <th className="text-right py-2 px-4 font-medium text-muted-foreground">Max/day</th>
                <th className="text-right py-2 px-4 font-medium text-muted-foreground">Max/week</th>
                <th className="text-right py-2 px-4 font-medium text-muted-foreground">Max/month</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(freqCaps as FrequencyCapRow[] ?? []).map((cap) => (
                <tr key={cap.id} className="bg-card">
                  <td className="py-2 px-4 capitalize">{cap.stakeholder_type.replace(/_/g, ' ')}</td>
                  <td className="py-2 px-4 capitalize">{cap.channel}</td>
                  <td className="py-2 px-4 text-right">{cap.max_per_day}</td>
                  <td className="py-2 px-4 text-right">{cap.max_per_week}</td>
                  <td className="py-2 px-4 text-right">{cap.max_per_month}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
