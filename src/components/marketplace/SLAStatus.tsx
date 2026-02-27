'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface SLADef {
  uptime_target: number | null;
  latency_p95_target_ms: number | null;
  error_rate_target: number | null;
  measurement_window: string | null;
}

interface Measurement {
  uptime_percentage: number | null;
  latency_p95_ms: number | null;
  error_rate: number | null;
  is_within_sla: boolean | null;
  window_end: string;
}

export function SLAStatus({ apiId }: { apiId: string }) {
  const [def, setDef] = useState<SLADef | null>(null);
  const [last, setLast] = useState<Measurement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/apis/${apiId}/sla`)
      .then((r) => r.json())
      .then((data) => {
        setDef(data.definition ?? null);
        setLast(data.measurements?.[0] ?? null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [apiId]);

  if (loading) return <p className="text-sm text-muted-foreground">Loading SLA…</p>;
  if (!def) return <p className="text-sm text-muted-foreground">No SLA defined for this API.</p>;

  const row = (label: string, target: string, actual: string | null, ok: boolean | null) => (
    <div key={label} className="flex items-center justify-between py-2 border-b last:border-0">
      <div>
        <span className="text-sm font-medium">{label}</span>
        <span className="text-xs text-muted-foreground ml-2">Target: {target}</span>
      </div>
      <div className="flex items-center gap-2">
        {actual && <span className="text-sm font-mono">{actual}</span>}
        {ok === true ? <CheckCircle className="h-4 w-4 text-green-500" /> :
         ok === false ? <XCircle className="h-4 w-4 text-red-500" /> :
         <Clock className="h-4 w-4 text-muted-foreground" />}
      </div>
    </div>
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">SLA Commitments</h3>
        {last && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${last.is_within_sla ? 'bg-green-500/10 text-green-700 border-green-500/20' : 'bg-red-500/10 text-red-700 border-red-500/20'}`}>
            {last.is_within_sla ? 'Within SLA' : 'SLA Breached'}
          </span>
        )}
      </div>
      <div>
        {def.uptime_target != null && row(
          'Uptime',
          `≥ ${def.uptime_target}%`,
          last?.uptime_percentage != null ? `${last.uptime_percentage.toFixed(2)}%` : null,
          last ? (last.uptime_percentage ?? 0) >= def.uptime_target : null
        )}
        {def.latency_p95_target_ms != null && row(
          'P95 Latency',
          `≤ ${def.latency_p95_target_ms}ms`,
          last?.latency_p95_ms != null ? `${last.latency_p95_ms}ms` : null,
          last ? (last.latency_p95_ms ?? Infinity) <= def.latency_p95_target_ms : null
        )}
        {def.error_rate_target != null && row(
          'Error Rate',
          `≤ ${(def.error_rate_target * 100).toFixed(1)}%`,
          last?.error_rate != null ? `${(last.error_rate * 100).toFixed(2)}%` : null,
          last ? (last.error_rate ?? Infinity) <= def.error_rate_target : null
        )}
      </div>
      {last && (
        <p className="text-xs text-muted-foreground pt-1">
          Last measured: {new Date(last.window_end).toLocaleString()} · Window: {def.measurement_window ?? '1h'}
        </p>
      )}
    </div>
  );
}
