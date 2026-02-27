'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ClipboardCheck, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Props {
  apiId: string;
  currentStatus: string;
}

export function SubmitForReviewButton({ apiId, currentStatus }: Props) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(currentStatus === 'in_review');
  const router = useRouter();

  if (!['draft', 'in_review'].includes(currentStatus)) return null;

  async function handleSubmit() {
    setLoading(true);
    try {
      const res = await fetch(`/api/apis/${apiId}/submit-review`, { method: 'PATCH' });
      if (res.ok) {
        setDone(true);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <Button variant="outline" disabled className="gap-2">
        <ClipboardCheck className="h-4 w-4 text-green-500" />
        Submitted for Review
      </Button>
    );
  }

  return (
    <Button variant="outline" onClick={handleSubmit} disabled={loading} className="gap-2">
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ClipboardCheck className="h-4 w-4" />}
      Submit for Review
    </Button>
  );
}
