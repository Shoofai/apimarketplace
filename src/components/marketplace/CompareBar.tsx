'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Scale } from 'lucide-react';

const STORAGE_KEY = 'api_compare';

function getStoredIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

export function CompareBar() {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    setIds(getStoredIds());
    const handler = () => setIds(getStoredIds());
    window.addEventListener('compare-update', handler);
    return () => window.removeEventListener('compare-update', handler);
  }, []);

  if (ids.length === 0) return null;

  const href = `/marketplace/compare?apis=${ids.join(',')}`;

  return (
    <div className="fixed left-1/2 -translate-x-1/2 z-50 bottom-[max(1.5rem,env(safe-area-inset-bottom))]">
      <Button asChild size="lg" className="shadow-lg">
        <Link href={href}>
          <Scale className="h-5 w-5 mr-2" />
          Compare ({ids.length})
        </Link>
      </Button>
    </div>
  );
}
