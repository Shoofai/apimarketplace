'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  RefreshCw,
  Route,
  AlertTriangle,
  ClipboardCheck,
  CheckCircle,
  XCircle,
  MinusCircle,
  ChevronDown,
  ChevronUp,
  Code2,
  Copy,
  ExternalLink,
  FileCode,
  ShieldAlert,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type RouteItem = { path: string; method?: string; status?: string; description?: string };
type GapItem = {
  id: string;
  severity: string;
  category: string;
  message: string;
  fix?: string;
  filePath?: string;
  line?: number;
  ruleId?: string;
};
type ChecklistItem = {
  id: string;
  label: string;
  status: string;
  detail?: string | null;
};

type ReadinessData = {
  generatedAt?: string;
  scannerVersion?: string;
  schemaVersion?: string;
  routes?: RouteItem[];
  gaps?: GapItem[];
  shipChecklist?: ChecklistItem[];
  shipChecklistStatus?: 'ship' | 'no-ship' | 'needs-review';
  suppressedCount?: number;
};

const SEVERITY_ORDER = ['critical', 'high', 'medium', 'low'];

function sortGapsBySeverity(gaps: GapItem[]): GapItem[] {
  return [...gaps].sort((a, b) => {
    const ai = SEVERITY_ORDER.indexOf(a.severity.toLowerCase());
    const bi = SEVERITY_ORDER.indexOf(b.severity.toLowerCase());
    if (ai !== bi) return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    return (a.ruleId ?? '').localeCompare(b.ruleId ?? '');
  });
}

function countBySeverity(gaps: GapItem[]) {
  const c: Record<string, number> = { critical: 0, high: 0, medium: 0, low: 0 };
  gaps.forEach((g) => {
    const s = g.severity.toLowerCase();
    if (s in c) c[s]++;
  });
  return c;
}

function splitRoutes(routes: RouteItem[]) {
  const pages: RouteItem[] = [];
  const api: RouteItem[] = [];
  routes.forEach((r) => {
    if (r.path.startsWith('/api')) api.push(r);
    else pages.push(r);
  });
  return { pages, api };
}

export function ReadinessDashboard() {
  const [data, setData] = useState<ReadinessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRaw, setShowRaw] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [gapFilter, setGapFilter] = useState<'all' | 'blocking'>('blocking');
  const [gapSeverity, setGapSeverity] = useState<string>('all');
  const [gapCategory, setGapCategory] = useState<string>('all');
  const [routeSearch, setRouteSearch] = useState('');
  const [routesExpanded, setRoutesExpanded] = useState(false);
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/readiness', { cache: 'no-store' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      const json = await res.json();
      setData(json);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to fetch readiness data');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const runScan = async () => {
    setScanning(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/readiness/scan', { method: 'POST' });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.detail ?? json.error ?? `HTTP ${res.status}`);
      }
      await fetchData();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Scan failed');
    } finally {
      setScanning(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const routes = useMemo(() => data?.routes ?? [], [data?.routes]);
  const gaps = useMemo(() => data?.gaps ?? [], [data?.gaps]);
  const shipChecklist = useMemo(() => data?.shipChecklist ?? [], [data?.shipChecklist]);
  const counts = useMemo(() => countBySeverity(gaps), [gaps]);
  const blockingCount = counts.critical + counts.high;
  const { pages, api } = useMemo(() => splitRoutes(routes), [routes]);

  const filteredGaps = useMemo(() => {
    let list = sortGapsBySeverity(gaps);
    if (gapFilter === 'blocking') {
      list = list.filter((g) => g.severity.toLowerCase() === 'critical' || g.severity.toLowerCase() === 'high');
    }
    if (gapSeverity !== 'all') {
      list = list.filter((g) => g.severity.toLowerCase() === gapSeverity);
    }
    if (gapCategory !== 'all') {
      list = list.filter((g) => g.category === gapCategory);
    }
    return list;
  }, [gaps, gapFilter, gapSeverity, gapCategory]);

  const categories = useMemo(() => Array.from(new Set(gaps.map((g) => g.category))).sort(), [gaps]);

  const filteredPages = useMemo(() => {
    if (!routeSearch.trim()) return pages;
    const q = routeSearch.trim().toLowerCase();
    return pages.filter((r) => r.path.toLowerCase().includes(q));
  }, [pages, routeSearch]);

  const filteredApi = useMemo(() => {
    if (!routeSearch.trim()) return api;
    const q = routeSearch.trim().toLowerCase();
    return api.filter((r) => r.path.toLowerCase().includes(q));
  }, [api, routeSearch]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(
      () => toast({ title: 'Copied', description: label, duration: 2000 }),
      () => toast({ title: 'Copy failed', variant: 'destructive' })
    );
  };

  const copyGapForCursor = (g: GapItem) => {
    const loc = g.filePath ? `${g.filePath}${g.line != null ? `:${g.line}` : ''}` : '';
    const line = `Fix ${g.ruleId ?? g.id} in ${loc || 'unknown'}: ${g.message}. ${g.fix ?? ''}`.trim();
    copyToClipboard(line, 'Copied gap for Cursor');
  };

  const openInEditor = (g: GapItem) => {
    if (!g.filePath) return;
    const line = g.line ?? 1;
    const url = `vscode://file${g.filePath}:${line}`;
    window.open(url, '_blank');
  };

  const exportForCursor = () => {
    const status = data?.shipChecklistStatus ?? 'needs-review';
    const lines = [
      `Production Readiness: ${status}`,
      `Gaps: ${gaps.length} (${counts.critical} critical, ${counts.high} high, ${counts.medium} medium, ${counts.low} low)`,
      '',
      ...sortGapsBySeverity(gaps).slice(0, 50).map((g) => {
        const loc = g.filePath ? `${g.filePath}${g.line != null ? `:${g.line}` : ''}` : '';
        return `[${(g.ruleId ?? g.id).toUpperCase()}] ${g.severity}: ${g.message} — ${loc || 'unknown'}. Fix: ${g.fix ?? 'See rulebook.'}`;
      }),
    ];
    copyToClipboard(lines.join('\n'), 'Exported report for Cursor');
  };

  const StatusBadge = ({ status }: { status?: string }) => {
    const s = (status ?? 'unknown').toLowerCase();
    if (s === 'ok' || s === 'pass')
      return (
        <Badge variant="default" className="gap-1">
          <CheckCircle className="h-3 w-3" /> {s}
        </Badge>
      );
    if (s === 'warning' || s === 'skip')
      return (
        <Badge variant="secondary" className="gap-1">
          <AlertTriangle className="h-3 w-3" /> {s}
        </Badge>
      );
    if (s === 'missing' || s === 'fail')
      return (
        <Badge variant="destructive" className="gap-1">
          <XCircle className="h-3 w-3" /> {s}
        </Badge>
      );
    return <Badge variant="outline">{s}</Badge>;
  };

  const SeverityBadge = ({ severity }: { severity: string }) => {
    const s = severity.toLowerCase();
    const variant =
      s === 'critical' ? 'destructive' : s === 'high' ? 'destructive' : s === 'medium' ? 'default' : 'secondary';
    return <Badge variant={variant}>{severity}</Badge>;
  };

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-5 w-24 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={fetchData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const shipStatus = data?.shipChecklistStatus ?? 'needs-review';
  const nextStep =
    shipStatus === 'no-ship'
      ? `Fix ${blockingCount} blocking finding(s) below or add to validation-baseline.json to ship.`
      : shipStatus === 'needs-review'
        ? 'Review high-priority findings before shipping.'
        : 'No blocking findings. Optionally review medium/low items.';

  return (
    <div className="space-y-6">
      {/* Header: ship status + actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <ShieldAlert className="h-5 w-5 text-muted-foreground" />
          <div>
            <h2 className="text-lg font-semibold">Production Readiness</h2>
            <p className="text-sm text-muted-foreground">
              {data?.generatedAt
                ? `Last scan: ${new Date(data.generatedAt).toLocaleString()}`
                : 'No scan data'}
            </p>
          </div>
          {data?.shipChecklistStatus && (
            <Badge
              variant={
                shipStatus === 'no-ship' ? 'destructive' : shipStatus === 'needs-review' ? 'secondary' : 'default'
              }
              className="text-sm"
            >
              {shipStatus}
            </Badge>
          )}
          {data?.scannerVersion && (
            <Badge variant="outline">v{data.scannerVersion}</Badge>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={runScan} disabled={scanning}>
            <RefreshCw className={`h-4 w-4 mr-2 ${scanning ? 'animate-spin' : ''}`} />
            {scanning ? 'Scanning…' : 'Run scan'}
          </Button>
          <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ship status</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium capitalize">{shipStatus}</p>
            <p className="text-xs text-muted-foreground mt-1">{nextStep}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Gaps</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium">
              {gaps.length} total
              {blockingCount > 0 && (
                <span className="text-destructive ml-1">({blockingCount} blocking)</span>
              )}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              C: {counts.critical} · H: {counts.high} · M: {counts.medium} · L: {counts.low}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Routes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium">{pages.length} pages · {api.length} API</p>
            <p className="text-xs text-muted-foreground mt-1">{routes.length} total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Suppressed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium">{data?.suppressedCount ?? 0}</p>
            <p className="text-xs text-muted-foreground mt-1">In baseline (don&apos;t affect ship)</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="gaps" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="gaps">
            Gaps {gaps.length > 0 && `(${gaps.length})`}
          </TabsTrigger>
          <TabsTrigger value="routes">Routes</TabsTrigger>
          <TabsTrigger value="checklist">Checklist</TabsTrigger>
          <TabsTrigger value="raw">Raw</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>What to do next</CardTitle>
              <CardDescription>{nextStep}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {gaps.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Quick actions</p>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={exportForCursor}>
                      <Copy className="h-4 w-4 mr-2" />
                      Export for Cursor
                    </Button>
                  </div>
                </div>
              )}
              {data?.suppressedCount && data.suppressedCount > 0 && (
                <p className="text-xs text-muted-foreground">
                  {data.suppressedCount} finding(s) are suppressed in validation-baseline.json and do not affect ship status.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gaps" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Gaps to fix
                  </CardTitle>
                  <CardDescription>
                    Findings sorted by severity. Copy path or open in editor to fix.
                  </CardDescription>
                </div>
                {gaps.length > 0 && (
                  <Button variant="outline" size="sm" onClick={exportForCursor}>
                    <Copy className="h-4 w-4 mr-2" />
                    Export for Cursor
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {gaps.length === 0 ? (
                <p className="text-sm text-muted-foreground">No gaps reported.</p>
              ) : (
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                      value={gapFilter}
                      onChange={(e) => setGapFilter(e.target.value as 'all' | 'blocking')}
                    >
                      <option value="blocking">Blocking (critical + high)</option>
                      <option value="all">All</option>
                    </select>
                    <select
                      className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                      value={gapSeverity}
                      onChange={(e) => setGapSeverity(e.target.value)}
                    >
                      <option value="all">Any severity</option>
                      {SEVERITY_ORDER.filter((s) => counts[s as keyof typeof counts] > 0).map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    {categories.length > 1 && (
                      <select
                        className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                        value={gapCategory}
                        onChange={(e) => setGapCategory(e.target.value)}
                      >
                        <option value="all">Any category</option>
                        {categories.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    )}
                  </div>
                  <ul className="space-y-3">
                    {filteredGaps.map((g) => (
                      <li
                        key={g.id}
                        className="flex flex-col gap-2 rounded-lg border p-3 text-sm"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <SeverityBadge severity={g.severity} />
                          <Badge variant="outline">{g.ruleId ?? g.category}</Badge>
                        </div>
                        <p className="text-sm">{g.message}</p>
                        {g.fix && (
                          <p className="text-xs text-muted-foreground">Fix: {g.fix}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          {g.filePath && (
                            <span className="font-mono text-xs text-muted-foreground">
                              <FileCode className="h-3 w-3 inline mr-1" />
                              {g.filePath}{g.line != null ? `:${g.line}` : ''}
                            </span>
                          )}
                          {g.filePath && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => copyToClipboard(`${g.filePath}${g.line != null ? `:${g.line}` : ''}`, 'Path copied')}
                              >
                                <Copy className="h-3 w-3 mr-1" />
                                Copy path
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => openInEditor(g)}
                              >
                                <ExternalLink className="h-3 w-3 mr-1" />
                                Open
                              </Button>
                            </>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => copyGapForCursor(g)}
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            Copy for Cursor
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                  {filteredGaps.length === 0 && (
                    <p className="text-sm text-muted-foreground">No gaps match the current filters.</p>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="routes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Route className="h-5 w-5" />
                Routes
              </CardTitle>
              <CardDescription>
                Pages and API routes validated by the scanner. Search to filter.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                type="search"
                placeholder={`Search ${routes.length} routes...`}
                value={routeSearch}
                onChange={(e) => setRouteSearch(e.target.value)}
                className="max-w-sm"
                aria-label="Search routes"
              />
              {routes.length === 0 ? (
                <p className="text-sm text-muted-foreground">No routes in validation context.</p>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setRoutesExpanded((x) => !x)}
                      className="flex items-center gap-2 text-sm font-medium"
                    >
                      {routesExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      {routesExpanded ? 'Collapse' : 'Expand'} all
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Pages ({filteredPages.length})</h4>
                      <div className="overflow-x-auto rounded-md border">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b bg-muted/50">
                              <th className="text-left py-2 px-3 font-medium">Path</th>
                              <th className="text-left py-2 px-3 font-medium">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(routesExpanded ? filteredPages : filteredPages.slice(0, 15)).map((r, i) => (
                              <tr key={r.path + i} className="border-b last:border-0">
                                <td className="py-2 px-3 font-mono text-xs">{r.path}</td>
                                <td className="py-2 px-3">
                                  <StatusBadge status={r.status} />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {!routesExpanded && filteredPages.length > 15 && (
                          <p className="text-xs text-muted-foreground py-2 px-3">
                            +{filteredPages.length - 15} more. Expand to see all.
                          </p>
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-2">API ({filteredApi.length})</h4>
                      <div className="overflow-x-auto rounded-md border">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b bg-muted/50">
                              <th className="text-left py-2 px-3 font-medium">Path</th>
                              <th className="text-left py-2 px-3 font-medium">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(routesExpanded ? filteredApi : filteredApi.slice(0, 15)).map((r, i) => (
                              <tr key={r.path + i} className="border-b last:border-0">
                                <td className="py-2 px-3 font-mono text-xs">{r.path}</td>
                                <td className="py-2 px-3">
                                  <StatusBadge status={r.status} />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {!routesExpanded && filteredApi.length > 15 && (
                          <p className="text-xs text-muted-foreground py-2 px-3">
                            +{filteredApi.length - 15} more. Expand to see all.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="checklist" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5" />
                Ship Checklist
              </CardTitle>
              <CardDescription>Pre-launch checklist items and their status</CardDescription>
            </CardHeader>
            <CardContent>
              {shipChecklist.length === 0 ? (
                <p className="text-sm text-muted-foreground">No checklist items.</p>
              ) : (
                <ul className="space-y-2">
                  {shipChecklist.map((c) => (
                    <li
                      key={c.id}
                      className="flex flex-wrap items-center gap-2 py-2 border-b last:border-0"
                    >
                      {c.status === 'pass' && (
                        <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                      )}
                      {c.status === 'fail' && (
                        <XCircle className="h-4 w-4 text-destructive shrink-0" />
                      )}
                      {c.status === 'skip' && (
                        <MinusCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                      )}
                      <span className="text-sm">{c.label}</span>
                      <StatusBadge status={c.status} />
                      {c.detail && (
                        <span className="text-xs text-muted-foreground">{c.detail}</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="raw" className="space-y-4">
          <Card>
            <CardHeader>
              <button
                type="button"
                onClick={() => setShowRaw((x) => !x)}
                className="flex items-center gap-2 text-left w-full"
              >
                <Code2 className="h-5 w-5" />
                <CardTitle>Raw JSON</CardTitle>
                {showRaw ? (
                  <ChevronUp className="h-4 w-4 ml-auto" />
                ) : (
                  <ChevronDown className="h-4 w-4 ml-auto" />
                )}
              </button>
            </CardHeader>
            {showRaw && (
              <CardContent>
                <pre className="text-xs overflow-auto max-h-96 rounded bg-muted p-4">
                  {JSON.stringify(data, null, 2)}
                </pre>
              </CardContent>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
