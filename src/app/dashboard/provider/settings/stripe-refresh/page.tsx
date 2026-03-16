'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function StripeRefreshPage() {
  const [loading, setLoading] = useState(false);

  const handleRetry = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/provider/connect/onboarding', { method: 'POST' });
      const data = await res.json();
      if (data.onboardingUrl) window.location.href = data.onboardingUrl;
      else setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Stripe session expired</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            The Stripe onboarding link has expired. Click below to get a new link.
          </p>
          <Button onClick={handleRetry} disabled={loading}>
            {loading ? 'Opening...' : 'Continue to Stripe'}
          </Button>
          <Button asChild variant="ghost">
            <Link href="/dashboard/provider/onboard">Back to onboarding</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
