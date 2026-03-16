'use client';

import { useState, useTransition, Fragment } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronDown, ChevronRight, Users, BarChart3, Target } from 'lucide-react';
import Link from 'next/link';

type StakeholderRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  company_name: string | null;
  stakeholder_type: string;
  funnel_stage: string | null;
  segmentation_confidence: number | null;
  engagement_score: number | null;
  capture_source: string | null;
  created_at: string | null;
  segmentation_signals: string[] | null;
};

type InteractionRow = {
  id: string;
  interaction_type: string;
  interaction_data: Record<string, unknown>;
  page_url: string | null;
  score_delta: number;
  created_at: string;
};

interface StakeholdersClientProps {
  initialStakeholders: StakeholderRow[];
  totalCount: number;
  page: number;
  pageSize: number;
  stats: {
    totalCaptured: number;
    byType: Record<string, number>;
    avgEngagement: number;
  };
  filters: {
    type: string;
    stage: string;
    source: string;
    from: string;
    to: string;
  };
}

export function StakeholdersClient({
  initialStakeholders,
  totalCount,
  page,
  pageSize,
  stats,
  filters,
}: StakeholdersClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [interactions, setInteractions] = useState<Record<string, InteractionRow[]>>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const totalPages = Math.ceil(totalCount / pageSize) || 1;
  const showFrom = initialStakeholders.length ? (page - 1) * pageSize + 1 : 0;
  const showTo = (page - 1) * pageSize + initialStakeholders.length;

  const setFilter = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    next.set('page', '1');
    startTransition(() => {
      router.push(`/dashboard/admin/stakeholders?${next.toString()}`);
    });
  };

  const fetchInteractions = async (id: string) => {
    if (interactions[id]) return;
    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/stakeholders/${id}/interactions`);
      const data = await res.json();
      if (Array.isArray(data)) setInteractions((prev) => ({ ...prev, [id]: data }));
    } finally {
      setLoadingId(null);
    }
  };

  const toggleExpand = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);
    fetchInteractions(id);
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total captured</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{stats.totalCaptured.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">By type</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1 text-sm">
              {Object.entries(stats.byType).map(([type, count]) => (
                <Badge key={type} variant="secondary" className="text-xs">
                  {type}: {count}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg engagement</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{stats.avgEngagement}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Narrow by type, stage, source, or date range</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={filters.type || 'all'} onValueChange={(v) => setFilter('type', v === 'all' ? '' : v)}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="investor">Investor</SelectItem>
                  <SelectItem value="api_provider">API Provider</SelectItem>
                  <SelectItem value="developer">Developer</SelectItem>
                  <SelectItem value="enterprise_buyer">Enterprise</SelectItem>
                  <SelectItem value="unknown">Unknown</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Stage</Label>
              <Select value={filters.stage || 'all'} onValueChange={(v) => setFilter('stage', v === 'all' ? '' : v)}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="All stages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All stages</SelectItem>
                  <SelectItem value="captured">Captured</SelectItem>
                  <SelectItem value="segmented">Segmented</SelectItem>
                  <SelectItem value="activated">Activated</SelectItem>
                  <SelectItem value="engaged">Engaged</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="converting">Converting</SelectItem>
                  <SelectItem value="converted">Converted</SelectItem>
                  <SelectItem value="churned">Churned</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Source</Label>
              <Select value={filters.source || 'all'} onValueChange={(v) => setFilter('source', v === 'all' ? '' : v)}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="All sources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All sources</SelectItem>
                  <SelectItem value="landing_page">Landing page</SelectItem>
                  <SelectItem value="direct">Direct</SelectItem>
                  <SelectItem value="organic_search">Organic</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>From date</Label>
              <Input
                type="date"
                value={filters.from}
                onChange={(e) => setFilter('from', e.target.value)}
                className="w-[160px]"
              />
            </div>
            <div className="space-y-2">
              <Label>To date</Label>
              <Input
                type="date"
                value={filters.to}
                onChange={(e) => setFilter('to', e.target.value)}
                className="w-[160px]"
              />
            </div>
            {(filters.type || filters.stage || filters.source || filters.from || filters.to) && (
              <Button
                variant="outline"
                onClick={() =>
                  startTransition(() => router.push('/dashboard/admin/stakeholders'))
                }
              >
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Stakeholders</CardTitle>
          <CardDescription>
            {totalCount > 0
              ? `Showing ${showFrom}–${showTo} of ${totalCount.toLocaleString()}`
              : 'No stakeholders match the filters'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!initialStakeholders.length ? (
            <div className="py-12 text-center text-muted-foreground">
              No stakeholders to display. Adjust filters or wait for new captures.
            </div>
          ) : (
            <>
              <div className="rounded-md border overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="w-8 p-2" />
                      <th className="text-left font-medium p-3">Email</th>
                      <th className="text-left font-medium p-3">Name</th>
                      <th className="text-left font-medium p-3">Company</th>
                      <th className="text-left font-medium p-3 w-24">Type</th>
                      <th className="text-left font-medium p-3 w-24">Stage</th>
                      <th className="text-right font-medium p-3 w-20">Conf.</th>
                      <th className="text-right font-medium p-3 w-20">Score</th>
                      <th className="text-left font-medium p-3 w-28">Source</th>
                      <th className="text-left font-medium p-3">Captured</th>
                    </tr>
                  </thead>
                  <tbody>
                    {initialStakeholders.map((row) => (
                      <Fragment key={row.id}>
                        <tr
                          key={row.id}
                          className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                        >
                          <td className="p-2">
                            <button
                              type="button"
                              onClick={() => toggleExpand(row.id)}
                              className="p-1 rounded hover:bg-muted"
                              aria-label={expandedId === row.id ? 'Collapse' : 'Expand'}
                            >
                              {expandedId === row.id ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </button>
                          </td>
                          <td className="p-3 font-medium">{row.email ?? '—'}</td>
                          <td className="p-3 text-muted-foreground">{row.full_name ?? '—'}</td>
                          <td className="p-3 text-muted-foreground">{row.company_name ?? '—'}</td>
                          <td className="p-3">
                            <Badge variant="secondary" className="text-xs">
                              {row.stakeholder_type}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <Badge variant="outline" className="text-xs">
                              {row.funnel_stage}
                            </Badge>
                          </td>
                          <td className="p-3 text-right">
                            {row.segmentation_confidence != null
                              ? `${Math.round(row.segmentation_confidence * 100)}%`
                              : '—'}
                          </td>
                          <td className="p-3 text-right">{row.engagement_score ?? 0}</td>
                          <td className="p-3 text-muted-foreground">{row.capture_source}</td>
                          <td className="p-3 text-muted-foreground">
                            {row.created_at
                              ? new Date(row.created_at).toLocaleDateString()
                              : '—'}
                          </td>
                        </tr>
                        {expandedId === row.id && (
                          <tr key={`${row.id}-exp`} className="border-b bg-muted/20">
                            <td colSpan={10} className="p-4">
                              <div className="space-y-4 text-sm">
                                <div>
                                  <p className="font-medium mb-1">Segmentation signals</p>
                                  <pre className="rounded bg-muted/50 p-2 overflow-x-auto text-xs">
                                    {Array.isArray(row.segmentation_signals) &&
                                    row.segmentation_signals.length > 0
                                      ? JSON.stringify(row.segmentation_signals, null, 2)
                                      : '[]'}
                                  </pre>
                                </div>
                                <div>
                                  <p className="font-medium mb-1">Last 5 interactions</p>
                                  {loadingId === row.id ? (
                                    <p className="text-muted-foreground">Loading…</p>
                                  ) : (interactions[row.id] ?? []).length === 0 ? (
                                    <p className="text-muted-foreground">None</p>
                                  ) : (
                                    <ul className="list-disc list-inside space-y-1">
                                      {(interactions[row.id] ?? []).map((i) => (
                                        <li key={i.id}>
                                          <span className="font-medium">{i.interaction_type}</span>
                                          {' +'}{i.score_delta}
                                          {' · '}
                                          {new Date(i.created_at).toLocaleString()}
                                          {i.page_url && (
                                            <span className="text-muted-foreground truncate block">
                                              {i.page_url}
                                            </span>
                                          )}
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Link
                      href={
                        page > 1
                          ? `/dashboard/admin/stakeholders?${new URLSearchParams({
                              ...(filters.type && { type: filters.type }),
                              ...(filters.stage && { stage: filters.stage }),
                              ...(filters.source && { source: filters.source }),
                              ...(filters.from && { from: filters.from }),
                              ...(filters.to && { to: filters.to }),
                              page: String(page - 1),
                            })}`
                          : '#'
                      }
                    >
                      <Button variant="outline" size="sm" disabled={page <= 1}>
                        Previous
                      </Button>
                    </Link>
                    <Link
                      href={
                        page < totalPages
                          ? `/dashboard/admin/stakeholders?${new URLSearchParams({
                              ...(filters.type && { type: filters.type }),
                              ...(filters.stage && { stage: filters.stage }),
                              ...(filters.source && { source: filters.source }),
                              ...(filters.from && { from: filters.from }),
                              ...(filters.to && { to: filters.to }),
                              page: String(page + 1),
                            })}`
                          : '#'
                      }
                    >
                      <Button variant="outline" size="sm" disabled={page >= totalPages}>
                        Next
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
