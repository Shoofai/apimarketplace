'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plus, Play, ChevronDown, ChevronRight } from 'lucide-react';

interface EndpointOption {
  id: string;
  method: string;
  path: string;
  summary: string | null;
}

interface Contract {
  id: string;
  api_id: string;
  endpoint_id: string;
  expected_status_codes: number[] | null;
  max_latency_ms: number | null;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

interface TestRun {
  id: string;
  api_id: string;
  started_at: string | null;
  completed_at: string | null;
  status: string | null;
  total_tests: number | null;
  passed_tests: number | null;
  failed_tests: number | null;
}

interface TestResult {
  id: string;
  contract_id: string;
  endpoint_id: string;
  status: string | null;
  actual_status_code: number | null;
  actual_latency_ms: number | null;
  failure_reason: string | null;
  actual_response_sample: unknown;
}

interface ProviderApiContractsTabProps {
  apiId: string;
  endpoints: EndpointOption[];
  initialContracts?: Contract[];
}

export function ProviderApiContractsTab({
  apiId,
  endpoints,
  initialContracts = [],
}: ProviderApiContractsTabProps) {
  const [contracts, setContracts] = useState<Contract[]>(initialContracts);
  const [runs, setRuns] = useState<TestRun[]>([]);
  const [runResults, setRunResults] = useState<Record<string, TestResult[]>>({});
  const [expandedRunId, setExpandedRunId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [runLoading, setRunLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formEndpointId, setFormEndpointId] = useState('');
  const [formStatusCodes, setFormStatusCodes] = useState('200');
  const [formMaxLatency, setFormMaxLatency] = useState('');

  const fetchContracts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/apis/${apiId}/contracts`);
      if (res.ok) {
        const data = await res.json();
        setContracts(data.contracts ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, [apiId]);

  const fetchRuns = useCallback(async () => {
    const res = await fetch(`/api/contracts/runs?api_id=${apiId}`);
    if (res.ok) {
      const data = await res.json();
      setRuns(data.runs ?? []);
    }
  }, [apiId]);

  useEffect(() => {
    setContracts(initialContracts);
  }, [initialContracts]);

  useEffect(() => {
    fetchContracts();
    fetchRuns();
  }, [fetchContracts, fetchRuns]);

  const loadRunResults = useCallback(async (runId: string) => {
    const res = await fetch(`/api/contracts/runs/${runId}/results`);
    if (res.ok) {
      const data = await res.json();
      setRunResults((prev) => ({ ...prev, [runId]: data.results ?? [] }));
    }
  }, []);

  const handleRunAll = async () => {
    setRunLoading(true);
    try {
      const res = await fetch(`/api/apis/${apiId}/contracts/run`, { method: 'POST' });
      if (res.ok) {
        await fetchRuns();
        const data = await res.json();
        if (data.run?.id) {
          setExpandedRunId(data.run.id);
          await loadRunResults(data.run.id);
        }
      }
    } finally {
      setRunLoading(false);
    }
  };

  const toggleRunExpand = (runId: string) => {
    if (expandedRunId === runId) {
      setExpandedRunId(null);
      return;
    }
    setExpandedRunId(runId);
    if (!runResults[runId]) loadRunResults(runId);
  };

  const openAdd = () => {
    setFormEndpointId(endpoints[0]?.id ?? '');
    setFormStatusCodes('200');
    setFormMaxLatency('');
    setDialogOpen(true);
  };

  const handleAddContract = async () => {
    const statusCodes = formStatusCodes
      .split(/[\s,]+/)
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !Number.isNaN(n));
    if (!formEndpointId || statusCodes.length === 0) return;
    const res = await fetch(`/api/apis/${apiId}/contracts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpoint_id: formEndpointId,
        expected_status_codes: statusCodes,
        max_latency_ms: formMaxLatency ? parseInt(formMaxLatency, 10) : undefined,
      }),
    });
    if (res.ok) {
      setDialogOpen(false);
      fetchContracts();
    }
  };

  const deleteContract = async (contractId: string) => {
    if (!confirm('Deactivate this contract?')) return;
    const res = await fetch(`/api/contracts/${contractId}`, { method: 'DELETE' });
    if (res.ok) fetchContracts();
  };

  const endpointLabel = (endpointId: string) => {
    const e = endpoints.find((x) => x.id === endpointId);
    return e ? `${e.method} ${e.path}` : endpointId;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <CardTitle>Contract tests</CardTitle>
          <CardDescription>Define expected behavior and run tests against your API.</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={openAdd} disabled={!endpoints.length}>
            <Plus className="h-4 w-4 mr-2" />
            Add contract
          </Button>
          <Button onClick={handleRunAll} disabled={runLoading || !contracts.filter((c) => c.is_active !== false).length}>
            <Play className="h-4 w-4 mr-2" />
            {runLoading ? 'Running…' : 'Run all'}
          </Button>
        </div>
      </div>

      {!endpoints.length && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Add endpoints to your API first (e.g. from OpenAPI) to define contracts.
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contracts</CardTitle>
          <CardDescription>{contracts.length} contract(s)</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : contracts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No contracts yet. Add one to get started.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-medium">Endpoint</th>
                    <th className="text-left py-2 font-medium">Expected status</th>
                    <th className="text-left py-2 font-medium">Max latency</th>
                    <th className="text-left py-2 font-medium">Active</th>
                    <th className="text-right py-2" />
                  </tr>
                </thead>
                <tbody>
                  {contracts.map((c) => (
                    <tr key={c.id} className="border-b">
                      <td className="py-2 font-mono">{endpointLabel(c.endpoint_id)}</td>
                      <td className="py-2">{Array.isArray(c.expected_status_codes) ? c.expected_status_codes.join(', ') : '—'}</td>
                      <td className="py-2">{c.max_latency_ms != null ? `${c.max_latency_ms}ms` : '—'}</td>
                      <td className="py-2">{c.is_active !== false ? 'Yes' : 'No'}</td>
                      <td className="py-2 text-right">
                        <Button variant="ghost" size="sm" onClick={() => deleteContract(c.id)}>
                          Deactivate
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Test runs</CardTitle>
          <CardDescription>Latest runs and per-contract results.</CardDescription>
        </CardHeader>
        <CardContent>
          {runs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No runs yet. Click &quot;Run all&quot; to run contract tests.</p>
          ) : (
            <div className="space-y-2">
              {runs.map((run) => (
                <div key={run.id} className="border rounded-lg">
                  <button
                    type="button"
                    className="w-full flex items-center justify-between p-3 text-left hover:bg-muted/50"
                    onClick={() => toggleRunExpand(run.id)}
                  >
                    <span className="flex items-center gap-2">
                      {expandedRunId === run.id ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      <span className="text-sm font-medium">
                        {run.completed_at
                          ? new Date(run.completed_at).toLocaleString()
                          : run.started_at
                            ? new Date(run.started_at).toLocaleString()
                            : run.id}
                      </span>
                    </span>
                    <span className="flex items-center gap-2">
                      <Badge variant={run.failed_tests ? 'destructive' : 'default'}>
                        {run.passed_tests ?? 0} passed
                      </Badge>
                      {(run.failed_tests ?? 0) > 0 && (
                        <Badge variant="destructive">{run.failed_tests} failed</Badge>
                      )}
                    </span>
                  </button>
                  {expandedRunId === run.id && (
                    <div className="border-t p-3 bg-muted/30">
                      {(runResults[run.id] ?? []).length === 0 ? (
                        <p className="text-xs text-muted-foreground">Loading results…</p>
                      ) : (
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-1 font-medium">Contract / Endpoint</th>
                              <th className="text-left py-1 font-medium">Status</th>
                              <th className="text-left py-1 font-medium">Actual</th>
                              <th className="text-left py-1 font-medium">Reason</th>
                            </tr>
                          </thead>
                          <tbody>
                            {runResults[run.id].map((r) => (
                              <tr key={r.id} className="border-b">
                                <td className="py-1 font-mono">{r.contract_id.slice(0, 8)}…</td>
                                <td className="py-1">
                                  <Badge variant={r.status === 'passed' ? 'default' : 'destructive'}>{r.status}</Badge>
                                </td>
                                <td className="py-1">{r.actual_status_code ?? '—'} {r.actual_latency_ms != null ? `(${r.actual_latency_ms}ms)` : ''}</td>
                                <td className="py-1 text-muted-foreground">{r.failure_reason ?? '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add contract</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Endpoint</Label>
              <select
                className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formEndpointId}
                onChange={(e) => setFormEndpointId(e.target.value)}
              >
                {endpoints.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.method} {e.path}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Expected status codes (comma-separated)</Label>
              <Input
                value={formStatusCodes}
                onChange={(e) => setFormStatusCodes(e.target.value)}
                placeholder="200, 201"
              />
            </div>
            <div>
              <Label>Max latency (ms, optional)</Label>
              <Input
                type="number"
                value={formMaxLatency}
                onChange={(e) => setFormMaxLatency(e.target.value)}
                placeholder="500"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddContract}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
