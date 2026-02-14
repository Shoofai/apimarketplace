'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface APIReviewActionsProps {
  apiId: string;
  apiName: string;
}

export function APIReviewActions({ apiId, apiName }: APIReviewActionsProps) {
  const router = useRouter();
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectOpen, setRejectOpen] = useState(false);

  async function handleApprove() {
    setApproving(true);
    try {
      const res = await fetch(`/api/admin/apis/${apiId}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        router.push('/dashboard/admin/apis/review');
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Failed to approve');
      }
    } finally {
      setApproving(false);
    }
  }

  async function handleReject() {
    if (!rejectReason.trim()) {
      alert('Please provide a reason for rejection.');
      return;
    }
    setRejecting(true);
    try {
      const res = await fetch(`/api/admin/apis/${apiId}/reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectReason.trim() }),
      });
      if (res.ok) {
        setRejectOpen(false);
        setRejectReason('');
        router.push('/dashboard/admin/apis/review');
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Failed to reject');
      }
    } finally {
      setRejecting(false);
    }
  }

  return (
    <div className="flex gap-2">
      <Button onClick={handleApprove} disabled={approving}>
        <CheckCircle className="h-4 w-4 mr-2" />
        {approving ? 'Approving…' : 'Approve'}
      </Button>
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogTrigger asChild>
          <Button variant="destructive" disabled={rejecting}>
            <XCircle className="h-4 w-4 mr-2" />
            Reject
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject API</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting &quot;{apiName}&quot;. The provider will see this message.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="reason">Reason (required)</Label>
            <Textarea
              id="reason"
              placeholder="e.g. Documentation incomplete, security concerns..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="mt-2 min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={rejecting || !rejectReason.trim()}
            >
              {rejecting ? 'Rejecting…' : 'Reject API'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
