'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function OrgForm({ initialName, initialSlug }: { initialName: string; initialSlug: string }) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [slug, setSlug] = useState(initialSlug);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/organizations/current', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, slug }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? 'Failed');
      setMessage('Saved.');
      router.refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={save} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="orgName">Organization Name</Label>
        <Input id="orgName" value={name} onChange={(e) => setName(e.target.value)} placeholder="Acme Inc" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="orgSlug">Organization Slug</Label>
        <Input id="orgSlug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="acme-inc" />
      </div>
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
      <Button type="submit" disabled={loading}>{loading ? 'Saving…' : 'Save'}</Button>
    </form>
  );
}
