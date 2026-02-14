'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function PlatformNameForm({ initialName }: { initialName: string }) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/settings/platform-name', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage({ type: 'error', text: (data.error as string) || 'Failed to save' });
        return;
      }
      setMessage({ type: 'success', text: 'Platform name updated. Refresh the site to see it everywhere.' });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div className="space-y-2">
        <Label htmlFor="platform-name">Display name</Label>
        <Input
          id="platform-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. apinergy"
          disabled={loading}
        />
      </div>
      {message && (
        <p className={message.type === 'error' ? 'text-destructive text-sm' : 'text-green-600 dark:text-green-400 text-sm'}>
          {message.text}
        </p>
      )}
      <Button type="submit" disabled={loading || !name.trim()}>
        {loading ? 'Saving…' : 'Save'}
      </Button>
    </form>
  );
}
