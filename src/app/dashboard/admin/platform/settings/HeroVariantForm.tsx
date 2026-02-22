'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { HeroVariant } from '@/lib/settings/hero-variant';

const VARIANT_OPTIONS: { value: HeroVariant; label: string; description: string }[] = [
  {
    value: 'classic',
    label: 'Classic',
    description: 'Original hero with constellation, dual CTAs, and stats bar',
  },
  {
    value: 'developer',
    label: 'Developer',
    description: 'Developer-first hero with code block, value bullets, and trust strip',
  },
  {
    value: 'split',
    label: 'Split (Two-section)',
    description: 'Two-section hero: main hero above, stats + trust bar below (matches sample layout).',
  },
];

export function HeroVariantForm({ initialVariant }: { initialVariant: HeroVariant }) {
  const router = useRouter();
  const [variant, setVariant] = useState<HeroVariant>(initialVariant);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/settings/hero-variant', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variant }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage({ type: 'error', text: (data.error as string) || 'Failed to save' });
        return;
      }
      setMessage({
        type: 'success',
        text: 'Hero variant updated. Visit the homepage to see the change.',
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div className="space-y-2">
        <Label htmlFor="hero-variant">Hero variant</Label>
        <Select
          value={variant}
          onValueChange={(v) => setVariant(v as HeroVariant)}
          disabled={loading}
        >
          <SelectTrigger id="hero-variant">
            <SelectValue placeholder="Select variant" />
          </SelectTrigger>
          <SelectContent>
            {VARIANT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Choose which hero design is shown on the public landing page.
        </p>
      </div>
      {message && (
        <p
          className={
            message.type === 'error'
              ? 'text-destructive text-sm'
              : 'text-green-600 dark:text-green-400 text-sm'
          }
        >
          {message.text}
        </p>
      )}
      <Button type="submit" disabled={loading}>
        {loading ? 'Saving…' : 'Save'}
      </Button>
    </form>
  );
}
