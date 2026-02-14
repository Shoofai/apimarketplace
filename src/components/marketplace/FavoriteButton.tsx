'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';

interface FavoriteButtonProps {
  apiId: string;
  apiName: string;
  initialFavorited?: boolean;
  onToggle?: (favorited: boolean) => void;
}

export function FavoriteButton({ apiId, apiName, initialFavorited = false, onToggle }: FavoriteButtonProps) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    setLoading(true);
    try {
      if (favorited) {
        const res = await fetch(`/api/favorites?api_id=${encodeURIComponent(apiId)}`, { method: 'DELETE' });
        if (res.ok) {
          setFavorited(false);
          onToggle?.(false);
        }
      } else {
        const res = await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ api_id: apiId }),
        });
        if (res.ok) {
          setFavorited(true);
          onToggle?.(true);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={toggle}
      disabled={loading}
      title={favorited ? `Remove ${apiName} from favorites` : `Add ${apiName} to favorites`}
      aria-label={favorited ? `Remove from favorites` : `Add to favorites`}
      className="text-muted-foreground hover:text-red-500"
    >
      <Heart
        className={`h-4 w-4 ${favorited ? 'fill-red-500 text-red-500' : ''}`}
      />
    </Button>
  );
}
