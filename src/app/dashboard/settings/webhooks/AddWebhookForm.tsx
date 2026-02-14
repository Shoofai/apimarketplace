'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export function AddWebhookForm() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [events, setEvents] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/webhooks/endpoints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), events: events.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || res.statusText || 'Failed to add endpoint');
        return;
      }
      setUrl('');
      setEvents('');
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="url">Endpoint URL</Label>
        <Input
          id="url"
          name="url"
          type="url"
          placeholder="https://your-domain.com/webhooks"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
        />
        <p className="text-xs text-muted-foreground mt-1">Must be HTTPS</p>
      </div>

      <div>
        <Label htmlFor="events">Events</Label>
        <Textarea
          id="events"
          name="events"
          placeholder="billing.invoice_created, usage.quota_80, api.status_changed"
          rows={3}
          value={events}
          onChange={(e) => setEvents(e.target.value)}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Comma-separated list of event types to subscribe to
        </p>
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <Button type="submit" disabled={loading}>
        {loading ? 'Adding…' : 'Add Endpoint'}
      </Button>
    </form>
  );
}
