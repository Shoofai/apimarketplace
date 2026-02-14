'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export function CancelDeletionButton({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/gdpr/delete/${requestId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to cancel');
      router.refresh();
    } catch {
      setLoading(false);
    }
  };

  return (
    <Button variant="destructive" onClick={handleCancel} disabled={loading}>
      {loading ? 'Cancelling...' : 'Cancel Deletion'}
    </Button>
  );
}
