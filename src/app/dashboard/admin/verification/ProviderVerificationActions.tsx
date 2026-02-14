'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface ProviderVerificationActionsProps {
  organizationId: string;
}

export function ProviderVerificationActions({ organizationId }: ProviderVerificationActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleVerify(verified: boolean) {
    setLoading(verified ? 'approve' : 'reject');
    setError(null);
    try {
      const res = await fetch(`/api/admin/organizations/${organizationId}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? `Request failed (${res.status})`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex items-center gap-2">
      {error && <p className="text-sm text-destructive mr-2">{error}</p>}
      <Button
        size="sm"
        variant="default"
        onClick={() => handleVerify(true)}
        disabled={!!loading}
      >
        {loading === 'approve' ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <CheckCircle className="w-4 h-4 mr-1" />}
        Approve
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => handleVerify(false)}
        disabled={!!loading}
      >
        {loading === 'reject' ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <XCircle className="w-4 h-4 mr-1" />}
        Reject
      </Button>
    </div>
  );
}
