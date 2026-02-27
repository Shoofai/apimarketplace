'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Plus, Pencil, Globe, EyeOff, Trash2 } from 'lucide-react';
import Image from 'next/image';

interface BundleAPI {
  id: string;
  name: string;
  logo_url: string | null;
}

interface BundleItem {
  id: string;
  api: BundleAPI | null;
}

interface Bundle {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  price_monthly: number;
  discount_percent: number;
  status: string;
  tags: string[] | null;
  api_bundle_items: BundleItem[];
}

interface AdminBundlesClientProps {
  initialBundles: Bundle[];
  availableApis: BundleAPI[];
}

export function AdminBundlesClient({ initialBundles, availableApis }: AdminBundlesClientProps) {
  const [bundles, setBundles] = useState<Bundle[]>(initialBundles);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [priceMonthly, setPriceMonthly] = useState('');
  const [discountPercent, setDiscountPercent] = useState('0');
  const [tags, setTags] = useState('');
  const [selectedApiIds, setSelectedApiIds] = useState<string[]>([]);

  const handleNameChange = (v: string) => {
    setName(v);
    setSlug(v.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
  };

  const toggleApi = (apiId: string) => {
    setSelectedApiIds((prev) =>
      prev.includes(apiId) ? prev.filter((id) => id !== apiId) : [...prev, apiId]
    );
  };

  const handleCreate = async () => {
    if (!name || !slug || !priceMonthly) {
      setError('Name, slug, and price are required.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/bundles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          slug: slug.trim(),
          description: description.trim() || null,
          price_monthly: parseFloat(priceMonthly),
          discount_percent: parseInt(discountPercent) || 0,
          tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
          api_ids: selectedApiIds,
          is_platform_curated: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Failed to create bundle');
        return;
      }
      window.location.reload();
    } catch {
      setError('Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (bundle: Bundle) => {
    const newStatus = bundle.status === 'published' ? 'draft' : 'published';
    const res = await fetch(`/api/bundles/${bundle.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      setBundles((prev) =>
        prev.map((b) => (b.id === bundle.id ? { ...b, status: newStatus } : b))
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Package className="h-6 w-6" />
          <h1 className="text-2xl font-bold">API Bundles</h1>
        </div>
        <Button onClick={() => setCreating((v) => !v)}>
          <Plus className="h-4 w-4 mr-2" />
          New Bundle
        </Button>
      </div>

      {creating && (
        <Card>
          <CardHeader>
            <CardTitle>Create Bundle</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Bundle Name</Label>
                <Input className="mt-1" value={name} onChange={(e) => handleNameChange(e.target.value)} placeholder="AI APIs Starter Pack" />
              </div>
              <div>
                <Label>Slug</Label>
                <Input className="mt-1" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="ai-apis-starter-pack" />
              </div>
              <div>
                <Label>Price ($/mo)</Label>
                <Input type="number" className="mt-1" value={priceMonthly} onChange={(e) => setPriceMonthly(e.target.value)} placeholder="49.00" />
              </div>
              <div>
                <Label>Discount (%)</Label>
                <Input type="number" className="mt-1" value={discountPercent} onChange={(e) => setDiscountPercent(e.target.value)} placeholder="20" />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea className="mt-1" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
            </div>
            <div>
              <Label>Tags (comma-separated)</Label>
              <Input className="mt-1" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="ai, nlp, starter" />
            </div>
            <div>
              <Label className="mb-2 block">Select APIs to include</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 max-h-64 overflow-y-auto border rounded-lg p-3">
                {availableApis.map((api) => (
                  <button
                    key={api.id}
                    type="button"
                    onClick={() => toggleApi(api.id)}
                    className={`flex items-center gap-2 p-2 rounded-md text-sm border transition-colors text-left ${
                      selectedApiIds.includes(api.id)
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:bg-accent'
                    }`}
                  >
                    {api.logo_url ? (
                      <div className="relative h-5 w-5 flex-shrink-0 rounded overflow-hidden">
                        <Image src={api.logo_url} alt={api.name} fill className="object-contain" />
                      </div>
                    ) : (
                      <span className="h-5 w-5 flex-shrink-0 text-center text-xs font-bold text-muted-foreground">{api.name.charAt(0)}</span>
                    )}
                    <span className="truncate">{api.name}</span>
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{selectedApiIds.length} selected</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreate} disabled={saving}>{saving ? 'Creating…' : 'Create Bundle'}</Button>
              <Button variant="outline" onClick={() => setCreating(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {bundles.length === 0 && (
          <p className="text-muted-foreground text-center py-12">No bundles created yet.</p>
        )}
        {bundles.map((bundle) => (
          <Card key={bundle.id}>
            <CardContent className="pt-4 flex items-start gap-4">
              <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-muted flex-shrink-0 border">
                {bundle.logo_url ? (
                  <Image src={bundle.logo_url} alt={bundle.name} fill className="object-contain p-1" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Package className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold">{bundle.name}</span>
                  <Badge variant={bundle.status === 'published' ? 'default' : 'secondary'} className="text-xs">
                    {bundle.status}
                  </Badge>
                  {bundle.discount_percent > 0 && (
                    <Badge className="bg-orange-500 text-white text-xs">{bundle.discount_percent}% off</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">{bundle.description}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span>${Number(bundle.price_monthly).toFixed(2)}/mo</span>
                  <span>{bundle.api_bundle_items?.length ?? 0} APIs</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleToggleStatus(bundle)}
                >
                  {bundle.status === 'published' ? (
                    <><EyeOff className="h-3.5 w-3.5 mr-1" /> Unpublish</>
                  ) : (
                    <><Globe className="h-3.5 w-3.5 mr-1" /> Publish</>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
