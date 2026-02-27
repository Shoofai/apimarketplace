'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, XCircle, AlertTriangle, Loader2, Save } from 'lucide-react';

interface SLADefinition {
  id: string;
  uptime_target: number | null;
  latency_p50_target_ms: number | null;
  latency_p95_target_ms: number | null;
  error_rate_target: number | null;
  measurement_window: string | null;
}

interface Measurement {
  id: string;
  window_start: string;
  window_end: string;
  uptime_percentage: number | null;
  error_rate: number | null;
  latency_p50_ms: number | null;
  latency_p95_ms: number | null;
  total_requests: number | null;
  is_within_sla: boolean | null;
}

interface Violation {
  id: string;
  violation_type: string;
  severity: string | null;
  actual_value: number | null;
  target_value: number | null;
  acknowledged: boolean | null;
  created_at: string | null;
}

interface Props {
  apiId: string;
}

export function ProviderSLATab({ apiId }: Props) {
  const [definition, setDefinition] = useState<SLADefinition | null>(null);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [uptime, setUptime] = useState('99.9');
  const [p50, setP50] = useState('200');
  const [p95, setP95] = useState('1000');
  const [errorRate, setErrorRate] = useState('0.01');
  const [window, setWindow] = useState('1h');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/apis/${apiId}/sla`);
      const data = await res.json();
      setDefinition(data.definition ?? null);
      setMeasurements(data.measurements ?? []);
      setViolations(data.violations ?? []);
      if (data.definition) {
        setUptime(String(data.definition.uptime_target ?? '99.9'));
        setP50(String(data.definition.latency_p50_target_ms ?? '200'));
        setP95(String(data.definition.latency_p95_target_ms ?? '1000'));
        setErrorRate(String(data.definition.error_rate_target ?? '0.01'));
        setWindow(data.definition.measurement_window ?? '1h');
      }
    } catch (e) {
      setError('Failed to load SLA data');
    } finally {
      setLoading(false);
    }
  }, [apiId]);

  useEffect(() => { load(); }, [load]);

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/apis/${apiId}/sla`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uptime_target: parseFloat(uptime) || null,
          latency_p50_target_ms: parseInt(p50) || null,
          latency_p95_target_ms: parseInt(p95) || null,
          error_rate_target: parseFloat(errorRate) || null,
          measurement_window: window,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function acknowledge(vid: string) {
    await fetch(`/api/apis/${apiId}/sla/violations/${vid}`, { method: 'PATCH' });
    setViolations((v) => v.map((x) => x.id === vid ? { ...x, acknowledged: true } : x));
  }

  const slaHealthColor = (ok: boolean | null) =>
    ok === true ? 'text-green-600 dark:text-green-400' : ok === false ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground';

  if (loading) return <div className="text-muted-foreground text-sm p-4">Loading SLA data…</div>;

  return (
    <div className="space-y-6">
      {/* Definition form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">SLA Targets</CardTitle>
          <CardDescription>Define the service-level objectives for this API. These are measured every {window}.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Uptime target (%)</Label>
              <Input value={uptime} onChange={(e) => setUptime(e.target.value)} placeholder="99.9" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">P50 latency (ms)</Label>
              <Input value={p50} onChange={(e) => setP50(e.target.value)} placeholder="200" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">P95 latency (ms)</Label>
              <Input value={p95} onChange={(e) => setP95(e.target.value)} placeholder="1000" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Max error rate</Label>
              <Input value={errorRate} onChange={(e) => setErrorRate(e.target.value)} placeholder="0.01" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Measurement window</Label>
              <Select value={window} onValueChange={setWindow}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">1 hour</SelectItem>
                  <SelectItem value="6h">6 hours</SelectItem>
                  <SelectItem value="24h">24 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={save} disabled={saving} className="mt-5 gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save SLA
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent measurements */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Measurements</CardTitle>
        </CardHeader>
        <CardContent>
          {measurements.length === 0 ? (
            <p className="text-sm text-muted-foreground">No measurements yet. The SLA cron will populate this after the first window.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Window end</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Uptime</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">P50 ms</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">P95 ms</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Error rate</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Requests</th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-muted-foreground">SLA</th>
                  </tr>
                </thead>
                <tbody>
                  {measurements.map((m) => (
                    <tr key={m.id} className="border-b hover:bg-muted/30">
                      <td className="px-3 py-2 text-xs font-mono text-muted-foreground">
                        {new Date(m.window_end).toLocaleString()}
                      </td>
                      <td className={`px-3 py-2 text-right text-xs font-medium ${slaHealthColor(m.uptime_percentage != null && definition?.uptime_target != null ? m.uptime_percentage >= definition.uptime_target : null)}`}>
                        {m.uptime_percentage?.toFixed(2) ?? '—'}%
                      </td>
                      <td className="px-3 py-2 text-right text-xs">{m.latency_p50_ms ?? '—'}</td>
                      <td className="px-3 py-2 text-right text-xs">{m.latency_p95_ms ?? '—'}</td>
                      <td className="px-3 py-2 text-right text-xs">{m.error_rate != null ? (m.error_rate * 100).toFixed(2) + '%' : '—'}</td>
                      <td className="px-3 py-2 text-right text-xs">{m.total_requests?.toLocaleString() ?? '—'}</td>
                      <td className="px-3 py-2 text-center">
                        {m.is_within_sla === true
                          ? <CheckCircle className="h-4 w-4 text-green-500 mx-auto" />
                          : m.is_within_sla === false
                          ? <XCircle className="h-4 w-4 text-red-500 mx-auto" />
                          : <span className="text-muted-foreground">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Violations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            SLA Violations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {violations.length === 0 ? (
            <p className="text-sm text-muted-foreground">No violations — keep it up!</p>
          ) : (
            <ul className="space-y-2">
              {violations.map((v) => (
                <li key={v.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant={v.severity === 'critical' ? 'destructive' : 'secondary'} className="capitalize">
                      {v.severity ?? 'warning'}
                    </Badge>
                    <div>
                      <p className="text-sm font-medium capitalize">{(v.violation_type ?? '').replace('_', ' ')}</p>
                      <p className="text-xs text-muted-foreground">
                        Actual: {v.actual_value?.toFixed(3)} · Target: {v.target_value?.toFixed(3)}
                        {v.created_at && <span> · {new Date(v.created_at).toLocaleString()}</span>}
                      </p>
                    </div>
                  </div>
                  {!v.acknowledged && (
                    <Button size="sm" variant="outline" onClick={() => acknowledge(v.id)}>
                      Acknowledge
                    </Button>
                  )}
                  {v.acknowledged && <span className="text-xs text-muted-foreground">Acknowledged</span>}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
