'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, RefreshCw, Trash2, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface SubscriptionKey {
  id: string;
  api_key_prefix: string | null;
  status: string;
  created_at: string;
  current_period_end: string | null;
  api: { id: string; name: string; slug: string; organization?: { slug: string } | null } | null;
  pricing_plan: { name: string } | null;
}

interface ApiKeyRowProps {
  sub: SubscriptionKey;
  onRevoke: (id: string) => Promise<void>;
  onRotate: (id: string) => Promise<string | null>;
}

function ApiKeyRow({ sub, onRevoke, onRotate }: ApiKeyRowProps) {
  const [copied, setCopied] = useState(false);
  const [revoking, setRevoking] = useState(false);
  const [rotating, setRotating] = useState(false);
  const [newKeyRevealed, setNewKeyRevealed] = useState<string | null>(null);

  const displayKey = newKeyRevealed
    ? newKeyRevealed
    : sub.api_key_prefix
      ? `${sub.api_key_prefix}${'•'.repeat(32)}`
      : '(key not available — subscribe again to generate)';

  const handleCopy = async () => {
    const keyToCopy = newKeyRevealed ?? sub.api_key_prefix;
    if (!keyToCopy) return;
    await navigator.clipboard.writeText(newKeyRevealed ?? `${sub.api_key_prefix}...`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRevoke = async () => {
    if (!confirm('Revoke this key? Your application will lose access immediately.')) return;
    setRevoking(true);
    try {
      await onRevoke(sub.id);
      toast.success('Subscription key revoked.');
    } catch {
      toast.error('Failed to revoke key.');
    } finally {
      setRevoking(false);
    }
  };

  const handleRotate = async () => {
    if (!confirm('Rotate this key? Your old key will stop working immediately. You\'ll need to update your application.')) return;
    setRotating(true);
    try {
      const newKey = await onRotate(sub.id);
      if (newKey) {
        setNewKeyRevealed(newKey);
        toast.success('Key rotated. Save your new key — it will only be shown once.');
      } else {
        toast.error('Failed to rotate key.');
      }
    } catch {
      toast.error('Failed to rotate key.');
    } finally {
      setRotating(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-medium truncate">
              {sub.api?.name ?? 'Unknown API'} — {sub.pricing_plan?.name ?? 'Plan'}
            </p>
            <Badge
              variant={sub.status === 'active' ? 'default' : 'secondary'}
              className="text-xs shrink-0"
            >
              {sub.status}
            </Badge>
            {newKeyRevealed && (
              <Badge variant="destructive" className="text-xs shrink-0 animate-pulse">
                Save now
              </Badge>
            )}
          </div>
          <code className="text-xs bg-muted px-2 py-1 rounded font-mono break-all">
            {displayKey}
          </code>
          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            <span>Created {new Date(sub.created_at).toLocaleDateString()}</span>
            {sub.current_period_end && (
              <span>Renews {new Date(sub.current_period_end).toLocaleDateString()}</span>
            )}
            {sub.api && sub.api.organization && (
              <Link
                href={`/marketplace/${sub.api.organization.slug}/${sub.api.slug}`}
                className="flex items-center gap-1 text-primary hover:underline"
              >
                <ExternalLink className="h-3 w-3" />
                View API
              </Link>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            title="Copy key"
            disabled={!sub.api_key_prefix && !newKeyRevealed}
          >
            {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRotate}
            disabled={rotating || sub.status !== 'active'}
            title="Rotate key"
          >
            <RefreshCw className={`h-4 w-4 ${rotating ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive"
            onClick={handleRevoke}
            disabled={revoking || sub.status !== 'active'}
            title="Revoke subscription"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ApiKeysClient({ subscriptions }: { subscriptions: SubscriptionKey[] }) {
  const [subs, setSubs] = useState(subscriptions);

  const handleRevoke = async (subscriptionId: string) => {
    const res = await fetch(`/api/subscriptions/${subscriptionId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to revoke');
    setSubs((prev) =>
      prev.map((s) => (s.id === subscriptionId ? { ...s, status: 'cancelled' } : s))
    );
  };

  const handleRotate = async (subscriptionId: string): Promise<string | null> => {
    const res = await fetch(`/api/subscriptions/${subscriptionId}/rotate-key`, { method: 'POST' });
    if (!res.ok) return null;
    const data = await res.json();
    return data.api_key ?? null;
  };

  const active = subs.filter((s) => s.status === 'active');
  const inactive = subs.filter((s) => s.status !== 'active');

  return (
    <div className="space-y-4">
      {active.length === 0 && inactive.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          <p>No subscriptions yet.</p>
          <p className="text-sm mt-1">
            <Link href="/marketplace" className="text-primary hover:underline">
              Browse APIs
            </Link>{' '}
            to get started.
          </p>
        </div>
      ) : (
        <>
          {active.map((sub) => (
            <ApiKeyRow
              key={sub.id}
              sub={sub}
              onRevoke={handleRevoke}
              onRotate={handleRotate}
            />
          ))}
          {inactive.length > 0 && (
            <>
              <p className="text-sm font-medium text-muted-foreground pt-2">Inactive / Cancelled</p>
              {inactive.map((sub) => (
                <ApiKeyRow
                  key={sub.id}
                  sub={sub}
                  onRevoke={handleRevoke}
                  onRotate={handleRotate}
                />
              ))}
            </>
          )}
        </>
      )}
    </div>
  );
}
