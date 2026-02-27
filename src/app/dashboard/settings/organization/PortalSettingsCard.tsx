'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, Loader2, Globe, ExternalLink } from 'lucide-react';

interface Props {
  orgSlug: string;
}

export function PortalSettingsCard({ orgSlug }: Props) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [enabled, setEnabled] = useState(false);
  const [title, setTitle] = useState('');
  const [accentColor, setAccentColor] = useState('#6366f1');
  const [visibility, setVisibility] = useState<'public' | 'members_only'>('public');
  const [customDomain, setCustomDomain] = useState('');

  useEffect(() => {
    fetch('/api/organizations/current/portal')
      .then((r) => r.json())
      .then((d) => {
        setEnabled(d.portal_enabled ?? false);
        setCustomDomain(d.custom_domain ?? '');
        const s = d.portal_settings ?? {};
        setTitle(s.title ?? '');
        setAccentColor(s.accent_color ?? '#6366f1');
        setVisibility(s.visibility ?? 'public');
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch('/api/organizations/current/portal', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          portal_enabled: enabled,
          portal_settings: { title, accent_color: accentColor, visibility },
          custom_domain: customDomain || null,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? 'Save failed');
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Internal Developer Portal
        </CardTitle>
        <CardDescription>
          Publish a branded, org-scoped API catalog for your internal teams. Enterprise feature.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <p className="text-sm text-destructive">{error}</p>}
        {saved && <p className="text-sm text-green-600 dark:text-green-400">Saved!</p>}

        <div className="flex items-center gap-3">
          <Switch checked={enabled} onCheckedChange={setEnabled} id="portal-toggle" />
          <Label htmlFor="portal-toggle" className="text-sm">{enabled ? 'Portal enabled' : 'Portal disabled'}</Label>
        </div>

        {enabled && (
          <>
            <div className="space-y-1.5">
              <Label className="text-xs">Portal title (leave blank to use org name)</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={`${orgSlug} Developer Portal`} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Accent color</Label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="h-9 w-14 cursor-pointer rounded border"
                  />
                  <Input value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="font-mono text-xs" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Visibility</Label>
                <Select value={visibility} onValueChange={(v) => setVisibility(v as 'public' | 'members_only')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public — anyone with the link</SelectItem>
                    <SelectItem value="members_only">Members only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Custom domain (optional)</Label>
              <Input
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                placeholder="portal.yourcompany.com"
              />
              <p className="text-xs text-muted-foreground">
                Add a CNAME record: <code className="font-mono bg-muted px-1 rounded">{customDomain || 'portal.yourcompany.com'} → {typeof window !== 'undefined' ? window.location.hostname : 'platform.example.com'}</code>
              </p>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <a
                href={`/portal/${orgSlug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                <ExternalLink className="h-3 w-3" />
                Preview portal
              </a>
            </div>
          </>
        )}

        <Button size="sm" onClick={handleSave} disabled={saving} className="gap-1.5">
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          Save portal settings
        </Button>
      </CardContent>
    </Card>
  );
}
