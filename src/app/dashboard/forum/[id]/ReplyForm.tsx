'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export function ReplyForm({ topicId }: { topicId: string }) {
  const router = useRouter();
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/forum/topics/${topicId}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: body.trim() }),
      });
      if (!res.ok) throw new Error('Failed');
      setBody('');
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-2 pt-4 border-t">
      <Label>Reply</Label>
      <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} placeholder="Write your reply..." />
      <Button type="submit" disabled={loading}>{loading ? 'Posting…' : 'Post reply'}</Button>
    </form>
  );
}
