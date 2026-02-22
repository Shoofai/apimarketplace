'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ClipboardCheck, Loader2, AlertCircle } from 'lucide-react';

type ReportSummary = { id: string; api_id: string; scope: string; score: number | null; created_at: string };
type Gap = { id: string; severity: string; category: string; message: string; fix: string };
type ReportDetail = {
  id: string;
  api_id: string;
  scope: string;
  payload: { gaps?: Gap[]; shipChecklist?: { id: string; label: string; status: string; detail: string | null }[]; shipChecklistStatus?: string };
  score: number | null;
  created_at: string;
};

export function ReadinessSection({ apiId, orgPlan }: { apiId: string; orgPlan?: string | null }) {
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [reportDetail, setReportDetail] = useState<ReportDetail | null>(null);

  const isPaid = orgPlan && orgPlan !== 'free';

  const fetchReports = useCallback(async () => {
    try {
      const res = await fetch(`/api/readiness/reports?api_id=${encodeURIComponent(apiId)}`);
      const data = await res.json().catch(() => ({}));
      if (res.ok && Array.isArray(data.reports)) {
        setReports(data.reports);
      }
    } catch {
      setError('Failed to load reports');
    } finally {
      setLoading(false);
    }
  }, [apiId]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const fetchReportDetail = async (reportId: string) => {
    try {
      const res = await fetch(`/api/readiness/reports/${reportId}`);
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.id) {
        setReportDetail(data as ReportDetail);
      }
    } catch {
      setError('Failed to load report');
    }
  };

  useEffect(() => {
    if (selectedReportId) {
      fetchReportDetail(selectedReportId);
    } else {
      setReportDetail(null);
    }
  }, [selectedReportId]);

  const runFullAudit = async () => {
    setError(null);
    setRunning(true);
    try {
      const res = await fetch('/api/readiness/full', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_id: apiId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Failed to run audit');
        return;
      }
      await fetchReports();
      if (data.id) {
        setSelectedReportId(data.id);
      }
    } catch {
      setError('Failed to run audit');
    } finally {
      setRunning(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!isPaid) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5" />
            Production Readiness
          </CardTitle>
          <CardDescription>
            Run a full audit on your API spec and get a detailed report with gaps and a ship checklist.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Upgrade to Pro or Enterprise to run full Production Readiness audits and store reports here.
          </p>
          <div className="flex gap-2">
            <Link href="/audit">
              <Button variant="outline">Run free quick audit</Button>
            </Link>
            <Link href="/dashboard/settings/billing">
              <Button>Upgrade plan</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5" />
            Production Readiness
          </CardTitle>
          <CardDescription>
            Run a full spec audit and view past reports.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}
          <Button onClick={runFullAudit} disabled={running}>
            {running ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Running audit…
              </>
            ) : (
              <>
                <ClipboardCheck className="h-4 w-4" />
                Run full audit
              </>
            )}
          </Button>
          {reports.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Past reports</p>
              <ul className="space-y-1">
                {reports.map((r) => (
                  <li key={r.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedReportId(selectedReportId === r.id ? null : r.id)}
                      className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted w-full"
                    >
                      <span className="text-muted-foreground">
                        {new Date(r.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {r.score != null && (
                        <Badge variant="secondary">{r.score}/100</Badge>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {reportDetail && (
        <Card>
          <CardHeader>
            <CardTitle>Report details</CardTitle>
            <CardDescription>
              {new Date(reportDetail.created_at).toLocaleString()} · Score: {reportDetail.score ?? '—'}/100
              {reportDetail.payload?.shipChecklistStatus && (
                <> · Status: {reportDetail.payload.shipChecklistStatus}</>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {reportDetail.payload?.shipChecklist && reportDetail.payload.shipChecklist.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Checklist</p>
                <ul className="space-y-1">
                  {reportDetail.payload.shipChecklist.map((item) => (
                    <li key={item.id} className="flex items-center gap-2 text-sm">
                      <Badge variant={item.status === 'pass' ? 'default' : 'secondary'}>
                        {item.status}
                      </Badge>
                      {item.label}
                      {item.detail && <span className="text-muted-foreground">· {item.detail}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {reportDetail.payload?.gaps && reportDetail.payload.gaps.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Gaps ({reportDetail.payload.gaps.length})</p>
                <ul className="space-y-2 max-h-96 overflow-y-auto">
                  {reportDetail.payload.gaps.map((g) => (
                    <li
                      key={g.id}
                      className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm"
                    >
                      <span className="font-medium capitalize text-foreground">{g.severity}</span>
                      <span className="text-muted-foreground"> · {g.message}</span>
                      <p className="mt-1 text-muted-foreground">{g.fix}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
