'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home, MessageSquare } from 'lucide-react';

export default function Error({
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
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-4 bg-background">
      {/* Icon */}
      <div className="relative flex items-center justify-center">
        <div className="absolute h-40 w-40 rounded-full bg-destructive/5 blur-3xl" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 shadow-sm">
          <AlertTriangle className="h-10 w-10 text-destructive/70" />
        </div>
      </div>

      {/* Text */}
      <div className="text-center space-y-3 max-w-md">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Unexpected error</p>
        <h1 className="text-3xl font-bold tracking-tight">Something went wrong</h1>
        <p className="text-muted-foreground">
          An error occurred while loading this page. The issue has been reported automatically.
        </p>
        {error.digest && (
          <p className="text-xs text-muted-foreground/60 font-mono">
            Error ID: {error.digest}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap justify-center gap-3">
        <Button onClick={reset} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Try again
        </Button>
        <Button variant="outline" asChild>
          <Link href="/dashboard" className="gap-2">
            <Home className="h-4 w-4" />
            Dashboard
          </Link>
        </Button>
        <Button variant="ghost" asChild>
          <Link href="/contact" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Report issue
          </Link>
        </Button>
      </div>
    </div>
  );
}
