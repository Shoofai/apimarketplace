'use client';

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Download, RefreshCw, ChevronLeft, ChevronRight, Search } from 'lucide-react';

interface AuditLog {
  id: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  status: string;
  user_id: string | null;
  ip_address: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

const PAGE_SIZE = 50;

const STATUS_OPTIONS = ['', 'success', 'failed', 'error', 'pending'];
const RESOURCE_TYPES = ['', 'api', 'organization', 'user', 'subscription', 'payment', 'auth', 'webhook'];

function statusBadge(status: string) {
  const map: Record<string, string> = {
    success: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
    failed: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
    error: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
    pending: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20',
  };
  return (
    <span className={`inline-flex text-xs font-medium px-2 py-0.5 rounded-full border ${map[status] ?? 'bg-muted text-muted-foreground border-border'}`}>
      {status || '—'}
    </span>
  );
}

export function AuditLogClient() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [action, setAction] = useState('');
  const [resourceType, setResourceType] = useState('');
  const [status, setStatus] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const buildUrl = useCallback((offset: number, limit = PAGE_SIZE) => {
    const p = new URLSearchParams();
    p.set('limit', String(limit));
    p.set('offset', String(offset));
    if (action) p.set('action', action);
    if (resourceType) p.set('resource_type', resourceType);
    if (status) p.set('status', status);
    if (from) p.set('from', new Date(from).toISOString());
    if (to) p.set('to', new Date(to + 'T23:59:59').toISOString());
    return `/api/organizations/current/audit-log?${p.toString()}`;
  }, [action, resourceType, status, from, to]);

  const fetchLogs = useCallback(async (pageNum: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(buildUrl(pageNum * PAGE_SIZE));
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to load');
      setLogs(data.logs ?? []);
      setTotal(data.total ?? 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error loading logs');
    } finally {
      setLoading(false);
    }
  }, [buildUrl]);

  useEffect(() => {
    setPage(0);
    fetchLogs(0);
  }, [fetchLogs]);

  async function handleExport() {
    const res = await fetch(buildUrl(0, 1000));
    const data = await res.json();
    const rows: AuditLog[] = data.logs ?? [];
    const header = ['timestamp', 'action', 'resource_type', 'resource_id', 'status', 'user_id', 'ip_address'];
    const csv = [
      header.join(','),
      ...rows.map((r) =>
        [
          r.created_at,
          r.action,
          r.resource_type,
          r.resource_id ?? '',
          r.status,
          r.user_id ?? '',
          r.ip_address ?? '',
        ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <Card className="p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Input
            placeholder="Action (e.g. api.published)"
            value={action}
            onChange={(e) => setAction(e.target.value)}
            className="text-sm"
          />
          <Select value={resourceType} onValueChange={setResourceType}>
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="Resource type" />
            </SelectTrigger>
            <SelectContent>
              {RESOURCE_TYPES.map((r) => (
                <SelectItem key={r || '__all'} value={r}>{r || 'All types'}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s || '__all'} value={s}>{s || 'All statuses'}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="text-sm"
          />
          <Input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="text-sm"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={() => { setPage(0); fetchLogs(0); }} disabled={loading} className="gap-1.5 flex-1">
              {loading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
              Search
            </Button>
            <Button size="sm" variant="outline" onClick={handleExport} disabled={loading} title="Export CSV">
              <Download className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </Card>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Timestamp</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Action</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Resource</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">User</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">IP</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 && !loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    No audit log entries found.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-muted-foreground font-mono">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs">{log.action}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {log.resource_type}
                      {log.resource_id && (
                        <span className="ml-1 font-mono opacity-60">{log.resource_id.slice(0, 8)}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">{statusBadge(log.status)}</td>
                    <td className="px-4 py-3 text-xs font-mono text-muted-foreground">
                      {log.user_id ? log.user_id.slice(0, 8) + '…' : '—'}
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-muted-foreground">
                      {log.ip_address ?? '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <p className="text-xs text-muted-foreground">
              Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total.toLocaleString()}
            </p>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="outline"
                disabled={page === 0}
                onClick={() => { setPage(page - 1); fetchLogs(page - 1); }}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={page >= totalPages - 1}
                onClick={() => { setPage(page + 1); fetchLogs(page + 1); }}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Metadata drawer hint */}
      <p className="text-xs text-muted-foreground text-right">
        {total.toLocaleString()} total event{total !== 1 ? 's' : ''} · Export up to 1,000 rows as CSV
      </p>
    </div>
  );
}
