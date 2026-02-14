'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Flag, CheckCircle, XCircle, EyeOff } from 'lucide-react';

type Report = {
  id: string;
  resource_type: string;
  resource_id: string;
  reason: string | null;
  status: string;
  created_at: string;
  reviewed_at: string | null;
  reporter_name: string;
};

export function ModerationReportList() {
  const [reports, setReports] = useState<Report[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/moderation/reports?status=${statusFilter}`);
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setReports(data.reports ?? []);
    } catch {
      setReports([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [statusFilter]);

  async function handleAction(reportId: string, action: 'dismiss' | 'hide_content') {
    setActing(reportId);
    try {
      const res = await fetch(`/api/admin/moderation/reports/${reportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error('Action failed');
      await load();
    } finally {
      setActing(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Flag className="h-5 w-5" />
              Content reports
            </CardTitle>
            <CardDescription>Review and act on reported forum posts and API reviews</CardDescription>
          </div>
          <div className="flex gap-2">
            {['pending', 'dismissed', 'action_taken'].map((s) => (
              <Button
                key={s}
                variant={statusFilter === s ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(s)}
              >
                {s.replace('_', ' ')}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : reports.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No reports in this category.</p>
        ) : (
          <ul className="space-y-4">
            {reports.map((r) => (
              <li key={r.id} className="flex flex-wrap items-start justify-between gap-4 rounded-lg border p-4">
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{r.resource_type}</Badge>
                    <span className="text-sm text-muted-foreground">Reported by {r.reporter_name}</span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(r.created_at).toLocaleString()}
                    </span>
                  </div>
                  {r.reason && <p className="text-sm">{r.reason}</p>}
                  <p className="text-xs text-muted-foreground font-mono">Resource: {r.resource_id}</p>
                </div>
                {r.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAction(r.id, 'dismiss')}
                      disabled={acting === r.id}
                    >
                      {acting === r.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                      Dismiss
                    </Button>
                    {(r.resource_type === 'forum_post' || r.resource_type === 'api_review') && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleAction(r.id, 'hide_content')}
                        disabled={acting === r.id}
                      >
                        {acting === r.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                        Hide content
                      </Button>
                    )}
                  </div>
                )}
                {r.status !== 'pending' && (
                  <Badge variant={r.status === 'action_taken' ? 'default' : 'secondary'}>
                    {r.status === 'action_taken' ? <CheckCircle className="h-3 w-3 mr-1" /> : null}
                    {r.status.replace('_', ' ')}
                  </Badge>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
