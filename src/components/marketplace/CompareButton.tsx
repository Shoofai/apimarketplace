'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CheckSquare, Square } from 'lucide-react';

const STORAGE_KEY = 'api_compare';
const MAX_COMPARE = 4;

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

function setStoredIds(ids: string[]) {
  if (typeof window === 'undefined') return;
  const trimmed = ids.slice(0, MAX_COMPARE);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  window.dispatchEvent(new CustomEvent('compare-update', { detail: trimmed }));
}

export function CompareButton({ apiId, apiName }: { apiId: string; apiName: string }) {
  const [inCompare, setInCompare] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const ids = getStoredIds();
    setInCompare(ids.includes(apiId));
    setCount(ids.length);
  }, [apiId]);

  useEffect(() => {
    const handler = () => {
      const ids = getStoredIds();
      setInCompare(ids.includes(apiId));
      setCount(ids.length);
    };
    window.addEventListener('compare-update', handler);
    return () => window.removeEventListener('compare-update', handler);
  }, [apiId]);

  const toggle = () => {
    const ids = getStoredIds();
    if (ids.includes(apiId)) {
      setStoredIds(ids.filter((id) => id !== apiId));
    } else if (ids.length < MAX_COMPARE) {
      setStoredIds([...ids, apiId]);
    }
  };

  const atMax = count >= MAX_COMPARE && !inCompare;

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={toggle}
      disabled={atMax}
      title={atMax ? `Maximum ${MAX_COMPARE} APIs can be compared` : inCompare ? 'Remove from comparison' : 'Add to comparison'}
      aria-label={inCompare ? `Remove ${apiName} from comparison` : `Add ${apiName} to comparison`}
      className="text-muted-foreground hover:text-foreground"
    >
      {inCompare ? (
        <CheckSquare className="h-4 w-4 fill-primary" />
      ) : (
        <Square className="h-4 w-4" />
      )}
      <span className="ml-1.5 sr-only sm:not-sr-only">{inCompare ? 'Comparing' : 'Compare'}</span>
    </Button>
  );
}

export function getCompareIds(): string[] {
  return getStoredIds();
}
