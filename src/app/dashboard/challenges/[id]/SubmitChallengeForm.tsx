'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function SubmitChallengeForm({ challengeId }: { challengeId: string }) {
  const router = useRouter();
  const [proofDescription, setProofDescription] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/challenges/${challengeId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proof_description: proofDescription.trim() || undefined,
          proof_url: proofUrl.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? 'Failed');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <Label htmlFor="proof">Proof / description</Label>
        <Textarea
          id="proof"
          value={proofDescription}
          onChange={(e) => setProofDescription(e.target.value)}
          placeholder="Describe your solution or paste a link to your project"
          rows={4}
        />
      </div>
      <div>
        <Label htmlFor="url">URL (optional)</Label>
        <Input
          id="url"
          type="url"
          value={proofUrl}
          onChange={(e) => setProofUrl(e.target.value)}
          placeholder="https://..."
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={loading}>{loading ? 'Submitting…' : 'Submit'}</Button>
    </form>
  );
}
