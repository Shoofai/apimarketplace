'use client';

import { useEffect } from 'react';

interface ViewTrackerProps {
  slug: string;
}

/**
 * Renders nothing — silently fires a view-count increment on mount.
 */
export function ViewTracker({ slug }: ViewTrackerProps) {
  useEffect(() => {
    fetch(`/api/blog/${encodeURIComponent(slug)}/view`, { method: 'POST' }).catch(() => {});
  }, [slug]);

  return null;
}
