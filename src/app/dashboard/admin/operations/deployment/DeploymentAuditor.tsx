'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { CodeSnapshot, DiagnosticReport } from '@/lib/deployment/types';

export function DeploymentAuditor() {
  const [snapshot, setSnapshot] = useState<CodeSnapshot | null>(null);
  const [report, setReport] = useState<DiagnosticReport | null>(null);
  const [discovering, setDiscovering] = useState(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  async function runAudit() {
    setError(null);
    setDiscovering(true);
    try {
      const discoverRes = await fetch('/api/admin/deployment/discover', {
        cache: 'no-store',
      });
      if (!discoverRes.ok) {
        const body = await discoverRes.json().catch(() => ({}));
        throw new Error(body.detail ?? body.error ?? `HTTP ${discoverRes.status}`);
      }
      const newSnapshot = (await discoverRes.json()) as CodeSnapshot;
      setSnapshot(newSnapshot);
      toast({
        title: 'Discovery complete',
        description: `${newSnapshot.services.database?.type ?? 'No DB'}, ${newSnapshot.risks.level} risk`,
      });

      setRunning(true);
      try {
        const checkRes = await fetch('/api/admin/deployment/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ snapshot: newSnapshot }),
        });
        if (!checkRes.ok) {
          const body = await checkRes.json().catch(() => ({}));
          throw new Error(body.detail ?? body.error ?? `HTTP ${checkRes.status}`);
        }
        const newReport = (await checkRes.json()) as DiagnosticReport;
        setReport(newReport);
        const s = newReport.summary;
        if (s.critical > 0 || s.high > 0) {
          toast({
            title: 'Issues found',
            variant: 'destructive',
            description: `${s.critical} critical, ${s.high} high`,
          });
        } else {
          toast({ title: 'All checks passed', description: `${s.passed}/${s.total} passed` });
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Checks failed';
        setError(msg);
        toast({ title: 'Checks failed', variant: 'destructive', description: msg });
      } finally {
        setRunning(false);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Discovery failed';
      setError(msg);
      toast({ title: 'Discovery failed', variant: 'destructive', description: msg });
    } finally {
      setDiscovering(false);
    }
  }

  const isBusy = discovering || running;
  const summary = report?.summary;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Adaptive Deployment Audit</h2>
          <p className="text-sm text-muted-foreground">
            Re-discovers the codebase and runs checks based on what exists
          </p>
        </div>
        <Button onClick={runAudit} disabled={isBusy}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isBusy ? 'animate-spin' : ''}`} />
          {discovering ? 'Discovering…' : running ? 'Running checks…' : 'Run audit'}
        </Button>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="py-4">
            <p className="text-destructive text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {snapshot && (
        <Card className="border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20">
          <CardHeader>
            <CardTitle className="text-base">Current codebase</CardTitle>
            <CardDescription>Discovered on this run</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
              <div>
                <span className="text-muted-foreground">Framework</span>
                <p className="font-medium">{snapshot.architecture.framework}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Database</span>
                <p className="font-medium">{snapshot.services.database?.type ?? 'None'}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Auth</span>
                <p className="font-medium">{snapshot.services.auth?.type ?? 'None'}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Risk</span>
                <p className="font-medium uppercase">{snapshot.risks.level}</p>
              </div>
            </div>
            {snapshot.changes && (snapshot.changes.filesChanged > 0 || snapshot.changes.newDependencies.length > 0) && (
              <div className="mt-3 pt-3 border-t text-sm text-muted-foreground">
                {snapshot.changes.filesChanged} files changed since last check
                {snapshot.changes.newDependencies.length > 0 &&
                  ` · ${snapshot.changes.newDependencies.length} new dependency(ies)`}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {summary && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Critical</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold text-destructive">{summary.critical}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">High</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold">{summary.high}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Medium</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold">{summary.medium}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Low</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold">{summary.low}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Passed</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                  {summary.passed}/{summary.total}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Check results</CardTitle>
              <CardDescription>Expand to see fix suggestions</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {report.results.map((r) => (
                  <li
                    key={r.id}
                    className="flex flex-wrap items-start gap-2 rounded-md border p-3 text-sm"
                  >
                    {r.passed ? (
                      <CheckCircle className="h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />
                    ) : (
                      <XCircle className="h-4 w-4 shrink-0 text-destructive" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">{r.name}</span>
                        <Badge variant={r.severity === 'critical' || r.severity === 'high' ? 'destructive' : 'secondary'}>
                          {r.severity}
                        </Badge>
                        <Badge variant="outline">{r.category}</Badge>
                      </div>
                      <p className="text-muted-foreground mt-1">{r.message ?? (r.passed ? 'Passed' : 'Failed')}</p>
                      {r.detail && <p className="mt-1 text-xs text-muted-foreground font-mono truncate">{r.detail}</p>}
                      {!r.passed && r.fixPromptTemplate && (
                        <p className="mt-2 text-xs border-l-2 border-muted pl-2 text-muted-foreground">
                          Fix: {r.fixPromptTemplate}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </>
      )}

      {!snapshot && !report && !error && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p className="mb-4">Click &quot;Run audit&quot; to discover the codebase and run adaptive checks.</p>
            <Button onClick={runAudit} disabled={isBusy}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Run audit
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
