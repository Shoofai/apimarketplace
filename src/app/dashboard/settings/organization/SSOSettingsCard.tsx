'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Lock, Copy, RefreshCw, CheckCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export function SSOSettingsCard() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [ssoEnabled, setSsoEnabled] = useState(false);
  const [providerId, setProviderId] = useState<string | null>(null);
  const [ssoDomain, setSsoDomain] = useState('');
  const [metadataUrl, setMetadataUrl] = useState('');
  const [scimToken, setScimToken] = useState('');

  useEffect(() => {
    fetch('/api/organizations/current/sso')
      .then((r) => r.json())
      .then((d) => {
        setSsoEnabled(d.sso_enabled ?? false);
        setProviderId(d.sso_provider_id ?? null);
        setSsoDomain(d.sso_domain ?? '');
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleConfigure() {
    if (!metadataUrl && !ssoDomain) {
      setError('Provide a SAML Metadata URL and claimed email domain.');
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch('/api/organizations/current/sso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metadata_url: metadataUrl, sso_domain: ssoDomain }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setProviderId(data.provider_id ?? null);
      setSsoEnabled(true);
      setSuccess(data.note ?? 'SSO configured successfully.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Configuration failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleDisable() {
    setSaving(true);
    try {
      await fetch('/api/organizations/current/sso', { method: 'DELETE' });
      setSsoEnabled(false);
      setProviderId(null);
      setSuccess('SSO disabled.');
    } catch {}
    finally { setSaving(false); }
  }

  async function handleTest() {
    if (!ssoDomain) {
      setError('Set a claimed email domain first.');
      return;
    }
    setTesting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithSSO({ domain: ssoDomain });
      if (error) setError(error.message);
      else setSuccess('SSO redirect initiated — check your browser.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'SSO test failed');
    } finally {
      setTesting(false);
    }
  }

  function generateToken() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    setScimToken(Array.from(array).map((b) => b.toString(16).padStart(2, '0')).join(''));
  }

  async function saveScimToken() {
    if (!scimToken) return;
    try {
      const res = await fetch('/api/organizations/current/portal');
      const data = await res.json();
      const settings = data.portal_settings ?? {};
      await fetch('/api/organizations/current/portal', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          portal_enabled: data.portal_enabled ?? false,
          portal_settings: { ...settings, scim_token: scimToken },
          custom_domain: data.custom_domain ?? null,
        }),
      });
      setSuccess('SCIM token saved. Store it securely — it will not be shown again.');
      setScimToken('');
    } catch {}
  }

  if (loading) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          SSO / SAML
          {ssoEnabled && <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-700 border-green-500/20">Active</Badge>}
        </CardTitle>
        <CardDescription>
          Configure SAML 2.0 single sign-on and SCIM provisioning for your organization. Requires a paid Supabase plan.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <p className="text-sm text-destructive">{error}</p>}
        {success && <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1"><CheckCircle className="h-4 w-4" />{success}</p>}

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">SAML Metadata URL</Label>
            <Input
              value={metadataUrl}
              onChange={(e) => setMetadataUrl(e.target.value)}
              placeholder="https://idp.example.com/metadata.xml"
            />
            <p className="text-xs text-muted-foreground">Provided by your Identity Provider (Okta, Azure AD, Google Workspace, etc.)</p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Claimed email domain</Label>
            <Input
              value={ssoDomain}
              onChange={(e) => setSsoDomain(e.target.value)}
              placeholder="acme.com"
            />
            <p className="text-xs text-muted-foreground">Users with this email domain will be auto-routed to your IdP.</p>
          </div>

          {providerId && (
            <p className="text-xs text-muted-foreground font-mono">
              Provider ID: {providerId}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={handleConfigure} disabled={saving} className="gap-1.5">
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Lock className="h-3.5 w-3.5" />}
              {ssoEnabled ? 'Update SSO' : 'Configure SSO'}
            </Button>
            {ssoEnabled && (
              <>
                <Button size="sm" variant="outline" onClick={handleTest} disabled={testing} className="gap-1.5">
                  {testing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                  Test SSO
                </Button>
                <Button size="sm" variant="destructive" onClick={handleDisable} disabled={saving}>
                  Disable SSO
                </Button>
              </>
            )}
          </div>
        </div>

        {/* SCIM Token */}
        <div className="pt-2 border-t space-y-3">
          <div>
            <p className="text-sm font-medium">SCIM Provisioning Token</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Use this bearer token to authenticate SCIM requests at <code className="font-mono bg-muted px-1 rounded">/api/scim/v2/Users</code>
            </p>
          </div>
          <div className="flex gap-2">
            <Input
              type="password"
              value={scimToken}
              onChange={(e) => setScimToken(e.target.value)}
              placeholder="Generate or paste token"
              className="font-mono text-xs flex-1"
            />
            <Button size="sm" variant="outline" onClick={generateToken} title="Generate token">
              <RefreshCw className="h-4 w-4" />
            </Button>
            {scimToken && (
              <Button size="sm" variant="outline" onClick={() => navigator.clipboard?.writeText(scimToken)} title="Copy">
                <Copy className="h-4 w-4" />
              </Button>
            )}
          </div>
          {scimToken && (
            <Button size="sm" onClick={saveScimToken} className="gap-1.5">
              Save SCIM token
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
