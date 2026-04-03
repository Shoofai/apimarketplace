'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home, MessageSquare } from 'lucide-react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-8 px-4 text-center">
      <div className="relative flex items-center justify-center">
        <div className="absolute h-32 w-32 rounded-full bg-destructive/5 blur-2xl" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5">
          <AlertTriangle className="h-8 w-8 text-destructive/70" />
        </div>
      </div>

      <div className="space-y-2 max-w-sm">
        <h2 className="text-xl font-bold">Something went wrong</h2>
        <p className="text-sm text-muted-foreground">
          An error occurred loading this section. The issue has been reported.
        </p>
        {error.digest && (
          <p className="text-xs text-muted-foreground/60 font-mono">ID: {error.digest}</p>
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <Button onClick={reset} size="sm" className="gap-2">
          <RefreshCw className="h-3.5 w-3.5" />
          Try again
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard" className="gap-2">
            <Home className="h-3.5 w-3.5" />
            Dashboard
          </Link>
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/contact" className="gap-2">
            <MessageSquare className="h-3.5 w-3.5" />
            Report
          </Link>
        </Button>
      </div>
    </div>
  );
}
