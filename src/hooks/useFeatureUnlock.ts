'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'apimarketplace-feature-discoveries';
const TOTAL_FEATURES = 11;

export function useFeatureUnlock() {
  const [unlocked, setUnlocked] = useState<Set<number>>(() => new Set());

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const ids = JSON.parse(stored) as number[];
        setUnlocked(new Set(ids));
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  const unlock = useCallback((id: number) => {
    setUnlocked((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev).add(id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  }, []);

  const unlockRandom = useCallback((excludeIds: number[] = []) => {
    const available = Array.from({ length: TOTAL_FEATURES }, (_, i) => i + 1).filter(
      (id) => !excludeIds.includes(id)
    );
    if (available.length === 0) return null;
    const id = available[Math.floor(Math.random() * available.length)];
    unlock(id);
    return id;
  }, [unlock]);

  const reset = useCallback(() => {
    setUnlocked(new Set());
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const count = unlocked.size;
  const badge =
    count >= TOTAL_FEATURES
      ? 'Feature Master'
      : count >= 5
        ? 'Curious Explorer'
        : null;

  return {
    unlocked,
    isUnlocked: (id: number) => unlocked.has(id),
    unlock,
    unlockRandom,
    reset,
    count,
    total: TOTAL_FEATURES,
    badge,
  };
}
