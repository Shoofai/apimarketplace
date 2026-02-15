'use client';

import { useEffect } from 'react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="text-muted-foreground text-center text-sm max-w-md">
        An error occurred in the dashboard. You can try again or return to the dashboard home.
      </p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Try again
        </button>
        <a
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
        >
          Dashboard home
        </a>
      </div>
    </div>
  );
}
