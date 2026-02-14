'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Star, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ReviewFormProps {
  apiId: string;
  onSuccess?: () => void;
}

export function ReviewForm({ apiId, onSuccess }: ReviewFormProps) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const displayRating = hoverRating || rating;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      setError('Please select a rating from 1 to 5 stars.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/apis/${apiId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          title: title.trim() || undefined,
          body: body.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error ?? `Request failed (${res.status})`);
      }
      if (onSuccess) onSuccess();
      else router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border bg-card p-6 space-y-4">
      <h4 className="font-semibold">Write a review</h4>
      <div>
        <label className="text-sm font-medium text-muted-foreground block mb-2">Rating *</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              className="p-1 rounded focus:outline-none focus:ring-2 focus:ring-primary"
              onMouseEnter={() => setHoverRating(value)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(value)}
              aria-label={`${value} star${value === 1 ? '' : 's'}`}
            >
              <Star
                className={`w-8 h-8 transition-colors ${
                  value <= displayRating
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-muted-foreground/40'
                }`}
              />
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-muted-foreground block mb-2">Title (optional)</label>
        <input
          type="text"
          className="w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="Short summary"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
        />
      </div>
      <div>
        <label className="text-sm font-medium text-muted-foreground block mb-2">Your review (optional)</label>
        <textarea
          className="w-full min-h-[100px] rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="Share your experience with this API..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={2000}
          rows={4}
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={loading}>
        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
        Submit review
      </Button>
    </form>
  );
}
