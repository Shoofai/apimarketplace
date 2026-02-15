'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface ClaimButtonProps {
  apiId: string;
  apiName: string;
  redirectUrl?: string;
}

export function ClaimButton({ apiId, apiName, redirectUrl }: ClaimButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleClaim = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/apis/${apiId}/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 401) {
          const redirect = redirectUrl ?? (typeof window !== 'undefined' ? window.location.pathname : '/login');
          router.push(`/login?redirect=${encodeURIComponent(redirect)}`);
          return;
        }
        setError(data.error ?? 'Failed to submit claim');
        return;
      }
      router.refresh();
      router.push('/dashboard/apis');
    } catch {
      setError('Failed to submit claim');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Button size="lg" onClick={handleClaim} disabled={loading}>
        {loading ? 'Submitting...' : 'Claim this API'}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
