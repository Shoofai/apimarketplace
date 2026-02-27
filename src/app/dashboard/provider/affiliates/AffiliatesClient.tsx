'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DollarSign, Link2, MousePointerClick, TrendingUp, Plus,
  Copy, CheckCheck, Loader2, ArrowRight, Clock, Check, X
} from 'lucide-react';
import Image from 'next/image';

interface API {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
}

interface AffLink {
  id: string;
  code: string;
  commission_percent: number;
  api_id: string | null;
  landing_url: string | null;
  click_count: number;
  conversion_count: number;
  is_active: boolean;
  created_at: string;
  api?: API | null;
}

interface Commission {
  id: string;
  commission_amount: number;
  commission_percent: number;
  status: string;
  created_at: string;
  api_id: string | null;
}

interface Stats {
  total_links: number;
  total_clicks: number;
  total_conversions: number;
  pending_amount: number;
  approved_amount: number;
  paid_amount: number;
}

interface AffiliatesClientProps {
  orgId: string;
  apis: API[];
  siteUrl: string;
}

export function AffiliatesClient({ orgId, apis, siteUrl }: AffiliatesClientProps) {
  const [links, setLinks] = useState<AffLink[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Create form state
  const [newCode, setNewCode] = useState('');
  const [newCommission, setNewCommission] = useState('10');
  const [newApiId, setNewApiId] = useState('all');
  const [newLandingUrl, setNewLandingUrl] = useState('');

  useEffect(() => {
    fetch('/api/provider/affiliate')
      .then((r) => r.json())
      .then((d) => {
        setLinks(d.links ?? []);
        setCommissions(d.commissions ?? []);
        setStats(d.stats ?? null);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    if (!newCode.trim()) { setError('Code is required'); return; }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/provider/affiliate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: newCode.trim(),
          commission_percent: parseFloat(newCommission) || 10,
          api_id: newApiId === 'all' ? null : newApiId,
          landing_url: newLandingUrl.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Failed to create link'); return; }
      setLinks((prev) => [data.link, ...prev]);
      setCreating(false);
      setNewCode('');
      setNewCommission('10');
      setNewApiId('all');
      setNewLandingUrl('');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (link: AffLink) => {
    const res = await fetch(`/api/provider/affiliate/${link.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !link.is_active }),
    });
    const data = await res.json();
    if (res.ok) {
      setLinks((prev) => prev.map((l) => (l.id === link.id ? { ...l, is_active: !l.is_active } : l)));
    }
  };

  const copyLink = (code: string) => {
    const url = `${siteUrl}/marketplace?aff=${code}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(code);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  if (loading) {
    return <div className="flex items-center justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  const conversionRate = stats && stats.total_clicks > 0
    ? ((stats.total_conversions / stats.total_clicks) * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <DollarSign className="h-7 w-7 text-green-600" />
          <h1 className="text-2xl font-bold">Affiliate Program</h1>
        </div>
        <Button onClick={() => setCreating((v) => !v)}>
          <Plus className="h-4 w-4 mr-2" /> New Link
        </Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: 'Links', value: stats.total_links, icon: Link2 },
            { label: 'Clicks', value: stats.total_clicks.toLocaleString(), icon: MousePointerClick },
            { label: 'Conversions', value: stats.total_conversions.toLocaleString(), icon: TrendingUp },
            { label: 'Conv. Rate', value: `${conversionRate}%`, icon: ArrowRight },
            { label: 'Pending', value: `$${stats.pending_amount.toFixed(2)}`, icon: Clock },
            { label: 'Approved', value: `$${stats.approved_amount.toFixed(2)}`, icon: Check },
          ].map(({ label, value, icon: Icon }) => (
            <Card key={label}>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{label}</span>
                </div>
                <p className="text-xl font-bold">{value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create form */}
      {creating && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Create Affiliate Link</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Affiliate Code</Label>
                <Input
                  className="mt-1 font-mono"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))}
                  placeholder="my-code"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Subscribers visit: <span className="font-mono">{siteUrl}/marketplace?aff={newCode || '…'}</span>
                </p>
              </div>
              <div>
                <Label>Commission (%)</Label>
                <Input type="number" className="mt-1" value={newCommission} onChange={(e) => setNewCommission(e.target.value)} min="0" max="100" step="0.5" />
              </div>
              <div>
                <Label>Applies to</Label>
                <Select value={newApiId} onValueChange={setNewApiId}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="All APIs" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All APIs (org-wide)</SelectItem>
                    {apis.map((api) => (
                      <SelectItem key={api.id} value={api.id}>{api.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Landing URL (optional)</Label>
                <Input className="mt-1" value={newLandingUrl} onChange={(e) => setNewLandingUrl(e.target.value)} placeholder="https://…" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreate} disabled={saving}>
                {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating…</> : 'Create Link'}
              </Button>
              <Button variant="outline" onClick={() => setCreating(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Affiliate links table */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Link2 className="h-5 w-5" /> Your Affiliate Links
        </h2>
        {links.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8">No affiliate links yet. Create your first one!</p>
        ) : (
          <div className="space-y-3">
            {links.map((link) => {
              const fullUrl = `${siteUrl}/marketplace?aff=${link.code}`;
              return (
                <Card key={link.id} className={link.is_active ? '' : 'opacity-60'}>
                  <CardContent className="pt-4 flex items-start gap-4 flex-wrap">
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-semibold text-sm">{link.code}</span>
                        <Badge variant={link.is_active ? 'default' : 'secondary'} className="text-xs">
                          {link.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        {link.api && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            {link.api.logo_url && (
                              <Image src={link.api.logo_url} alt={link.api.name} width={12} height={12} className="rounded" />
                            )}
                            {link.api.name}
                          </span>
                        )}
                        {!link.api_id && <span className="text-xs text-muted-foreground">All APIs</span>}
                      </div>
                      <p className="text-xs text-muted-foreground font-mono truncate">{fullUrl}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span><MousePointerClick className="h-3 w-3 inline mr-0.5" />{link.click_count} clicks</span>
                        <span><TrendingUp className="h-3 w-3 inline mr-0.5" />{link.conversion_count} conversions</span>
                        <span><DollarSign className="h-3 w-3 inline mr-0.5" />{link.commission_percent}% commission</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => copyLink(link.code)}>
                        {copiedId === link.code ? <CheckCheck className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleToggle(link)}>
                        {link.is_active ? <X className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Commission ledger */}
      {commissions.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" /> Commission History
          </h2>
          <Card>
            <div className="divide-y">
              {commissions.map((c) => (
                <div key={c.id} className="flex items-center gap-3 px-4 py-3">
                  <Badge
                    variant={c.status === 'paid' ? 'default' : c.status === 'approved' ? 'secondary' : 'outline'}
                    className="text-xs flex-shrink-0"
                  >
                    {c.status}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className="text-sm font-medium text-green-600">
                    +${Number(c.commission_amount).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Payout info */}
      {stats && stats.approved_amount >= 50 && (
        <Card className="border-green-400/30 bg-green-50 dark:bg-green-950/20">
          <CardContent className="pt-4 flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-green-700 dark:text-green-300">
                ${stats.approved_amount.toFixed(2)} ready for payout
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Contact support to request a payout via bank transfer or credits.</p>
            </div>
            <Button variant="outline" size="sm">Request Payout</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
