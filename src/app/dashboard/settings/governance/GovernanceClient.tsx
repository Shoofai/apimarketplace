'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Save, Loader2, DollarSign, ListChecks, Zap, X, Search } from 'lucide-react';

interface Policy {
  id: string;
  policy_type: string;
  config: Record<string, unknown>;
  is_active: boolean;
}

interface APIOption {
  id: string;
  name: string;
  slug: string;
  organization?: { slug?: string } | null;
}

function usePolicy(policies: Policy[], type: string) {
  const found = policies.find((p) => p.policy_type === type);
  return found ?? null;
}

export function GovernanceClient() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // spend_cap state
  const [spendCapEnabled, setSpendCapEnabled] = useState(false);
  const [spendCapAmount, setSpendCapAmount] = useState('500');
  const [savingSpend, setSavingSpend] = useState(false);

  // rate_limit_override state
  const [rlEnabled, setRlEnabled] = useState(false);
  const [rlValue, setRlValue] = useState('50');
  const [savingRl, setSavingRl] = useState(false);

  // approved_apis state
  const [approvedEnabled, setApprovedEnabled] = useState(false);
  const [approvedIds, setApprovedIds] = useState<string[]>([]);
  const [apiSearch, setApiSearch] = useState('');
  const [apiResults, setApiResults] = useState<APIOption[]>([]);
  const [searchingApis, setSearchingApis] = useState(false);
  const [savingApproved, setSavingApproved] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/organizations/current/governance');
      const data = await res.json();
      const list: Policy[] = data.policies ?? [];
      setPolicies(list);

      const spend = list.find((p) => p.policy_type === 'spend_cap');
      if (spend) {
        setSpendCapEnabled(spend.is_active);
        setSpendCapAmount(String((spend.config as any).monthly_cap ?? '500'));
      }

      const rl = list.find((p) => p.policy_type === 'rate_limit_override');
      if (rl) {
        setRlEnabled(rl.is_active);
        setRlValue(String((rl.config as any).requests_per_second ?? '50'));
      }

      const approved = list.find((p) => p.policy_type === 'approved_apis');
      if (approved) {
        setApprovedEnabled(approved.is_active);
        setApprovedIds((approved.config as any).api_ids ?? []);
      }
    } catch { setError('Failed to load governance policies'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function save(policy_type: string, config: Record<string, unknown>, is_active: boolean) {
    const res = await fetch('/api/organizations/current/governance', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ policy_type, config, is_active }),
    });
    if (!res.ok) throw new Error((await res.json()).error ?? 'Save failed');
  }

  async function handleSaveSpend() {
    setSavingSpend(true);
    setError(null);
    try {
      await save('spend_cap', { monthly_cap: parseFloat(spendCapAmount) || 0 }, spendCapEnabled);
    } catch (e) { setError(e instanceof Error ? e.message : 'Error'); }
    finally { setSavingSpend(false); }
  }

  async function handleSaveRl() {
    setSavingRl(true);
    setError(null);
    try {
      await save('rate_limit_override', { requests_per_second: parseInt(rlValue) || 50 }, rlEnabled);
    } catch (e) { setError(e instanceof Error ? e.message : 'Error'); }
    finally { setSavingRl(false); }
  }

  async function handleSaveApproved() {
    setSavingApproved(true);
    setError(null);
    try {
      await save('approved_apis', { api_ids: approvedIds }, approvedEnabled);
    } catch (e) { setError(e instanceof Error ? e.message : 'Error'); }
    finally { setSavingApproved(false); }
  }

  async function searchAPIs() {
    if (!apiSearch.trim()) return;
    setSearchingApis(true);
    try {
      const res = await fetch(`/marketplace?q=${encodeURIComponent(apiSearch)}&_json=1`);
      // Fallback: search using existing search API
      const sr = await fetch(`/api/marketplace/search?q=${encodeURIComponent(apiSearch)}&limit=10`);
      if (sr.ok) {
        const d = await sr.json();
        setApiResults(d.apis ?? []);
      }
    } catch {}
    finally { setSearchingApis(false); }
  }

  const toggleApproved = (id: string) => {
    setApprovedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  if (loading) return <p className="text-muted-foreground text-sm">Loading governance settings…</p>;

  return (
    <div className="space-y-6">
      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Spend Cap */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-amber-500" />
            Monthly Spend Cap
          </CardTitle>
          <CardDescription>
            Block new subscriptions and alert org members when monthly spend exceeds this limit.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Switch checked={spendCapEnabled} onCheckedChange={setSpendCapEnabled} id="spend-toggle" />
            <Label htmlFor="spend-toggle" className="text-sm">{spendCapEnabled ? 'Enforced' : 'Not enforced'}</Label>
          </div>
          {spendCapEnabled && (
            <div className="flex items-center gap-3">
              <div className="flex-1 max-w-xs">
                <Label className="text-xs mb-1.5 block">Monthly cap (USD)</Label>
                <Input
                  value={spendCapAmount}
                  onChange={(e) => setSpendCapAmount(e.target.value)}
                  placeholder="500"
                  type="number"
                />
              </div>
            </div>
          )}
          <Button size="sm" onClick={handleSaveSpend} disabled={savingSpend} className="gap-1.5">
            {savingSpend ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Save
          </Button>
        </CardContent>
      </Card>

      {/* Rate Limit Override */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="h-4 w-4 text-blue-500" />
            Rate Limit Override
          </CardTitle>
          <CardDescription>
            Cap your organization&apos;s request rate across all APIs, overriding plan defaults.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Switch checked={rlEnabled} onCheckedChange={setRlEnabled} id="rl-toggle" />
            <Label htmlFor="rl-toggle" className="text-sm">{rlEnabled ? 'Enforced' : 'Not enforced'}</Label>
          </div>
          {rlEnabled && (
            <div className="flex items-center gap-3">
              <div className="flex-1 max-w-xs">
                <Label className="text-xs mb-1.5 block">Max requests/second (org-wide)</Label>
                <Input
                  value={rlValue}
                  onChange={(e) => setRlValue(e.target.value)}
                  placeholder="50"
                  type="number"
                />
              </div>
            </div>
          )}
          <Button size="sm" onClick={handleSaveRl} disabled={savingRl} className="gap-1.5">
            {savingRl ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Save
          </Button>
        </CardContent>
      </Card>

      {/* Approved APIs Allowlist */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ListChecks className="h-4 w-4 text-green-500" />
            Approved API Allowlist
          </CardTitle>
          <CardDescription>
            When enforced, team members can only subscribe to APIs on this list.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Switch checked={approvedEnabled} onCheckedChange={setApprovedEnabled} id="approved-toggle" />
            <Label htmlFor="approved-toggle" className="text-sm">
              {approvedEnabled ? 'Enforced — only listed APIs are subscribable' : 'Not enforced'}
            </Label>
          </div>

          {/* Selected APIs */}
          {approvedIds.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {approvedIds.map((id) => (
                <Badge key={id} variant="secondary" className="gap-1.5">
                  {id.slice(0, 8)}…
                  <button onClick={() => toggleApproved(id)} className="ml-0.5">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {/* Search to add APIs */}
          <div className="flex gap-2">
            <Input
              placeholder="Search APIs by name…"
              value={apiSearch}
              onChange={(e) => setApiSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchAPIs()}
              className="text-sm"
            />
            <Button variant="outline" size="sm" onClick={searchAPIs} disabled={searchingApis}>
              {searchingApis ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>

          {apiResults.length > 0 && (
            <div className="border rounded-lg divide-y">
              {apiResults.map((a) => (
                <div key={a.id} className="flex items-center justify-between px-3 py-2">
                  <span className="text-sm">{a.name}</span>
                  <Button
                    size="sm"
                    variant={approvedIds.includes(a.id) ? 'default' : 'outline'}
                    onClick={() => toggleApproved(a.id)}
                  >
                    {approvedIds.includes(a.id) ? 'Remove' : 'Add'}
                  </Button>
                </div>
              ))}
            </div>
          )}

          <Button size="sm" onClick={handleSaveApproved} disabled={savingApproved} className="gap-1.5">
            {savingApproved ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Save ({approvedIds.length} API{approvedIds.length !== 1 ? 's' : ''})
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
