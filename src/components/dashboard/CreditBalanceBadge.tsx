'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Coins } from 'lucide-react';
import { cn } from '@/lib/utils';

export function CreditBalanceBadge({ className }: { className?: string }) {
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/credits')
      .then((r) => r.json())
      .then((d) => setBalance(d.balance ?? 0))
      .catch(() => {});
  }, []);

  if (balance === null) return null;

  return (
    <Link
      href="/dashboard/credits"
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
        'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20',
        'hover:bg-yellow-500/20 transition-colors',
        className
      )}
      title="API Credits balance"
    >
      <Coins className="h-3 w-3" />
      {balance.toLocaleString()}
    </Link>
  );
}
