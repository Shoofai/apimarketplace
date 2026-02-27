'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Package } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface BundleSubscribeButtonProps {
  bundleId: string;
  bundleName: string;
}

export function BundleSubscribeButton({ bundleId, bundleName }: BundleSubscribeButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubscribe = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/bundles/${bundleId}/subscribe`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Failed to subscribe');
        return;
      }
      setSuccess(true);
      router.refresh();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Button className="w-full" disabled variant="outline">
        ✓ Subscribed to {bundleName}
      </Button>
    );
  }

  return (
    <div className="space-y-2">
      <Button className="w-full" onClick={handleSubscribe} disabled={loading}>
        {loading ? (
          <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Subscribing…</>
        ) : (
          <><Package className="h-4 w-4 mr-2" /> Subscribe to Bundle</>
        )}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
