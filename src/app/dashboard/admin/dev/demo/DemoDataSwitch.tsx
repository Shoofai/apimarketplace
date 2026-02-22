'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Database, Loader2 } from 'lucide-react';

export function DemoDataSwitch() {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [loadingSeed, setLoadingSeed] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/demo')
      .then((r) => r.json())
      .then((data) => {
        setEnabled(!!data.demo_mode_enabled);
      })
      .catch(() => setEnabled(false))
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = async () => {
    setToggling(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setEnabled(!!data.demo_mode_enabled);
      setMessage(data.demo_mode_enabled ? 'Demo mode enabled' : 'Demo mode disabled');
    } catch (e: unknown) {
      setMessage(e instanceof Error ? e.message : 'Failed to toggle');
    } finally {
      setToggling(false);
    }
  };

  const handleLoadDemoData = async () => {
    setLoadingSeed(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'load' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setMessage('Demo data loaded successfully. Refresh the marketplace and dashboard to see it.');
    } catch (e: unknown) {
      setMessage(e instanceof Error ? e.message : 'Failed to load demo data');
    } finally {
      setLoadingSeed(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Demo Mode
        </CardTitle>
        <CardDescription>
          Enable demo mode and load sample data: demo org with APIs, subscriptions, favorites, collections, forum topics, challenges, referrals, notifications, and audit logs. Data is seeded for your user and a Demo Consumer org.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div>
            <Label htmlFor="demo-mode" className="text-base font-medium">
              Enable demo data
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              Toggle demo mode on or off
            </p>
          </div>
          <Switch
            id="demo-mode"
            checked={enabled}
            onCheckedChange={handleToggle}
            disabled={toggling}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label className="text-base font-medium">Load demo data</Label>
          <p className="text-sm text-muted-foreground">
            Insert demo org, APIs, and full dashboard data: subscriptions, favorites, collections, forum, challenges, referrals, notifications, audit logs (idempotent).
          </p>
          <Button
            onClick={handleLoadDemoData}
            disabled={loadingSeed}
            variant="secondary"
            className="w-fit"
          >
            {loadingSeed ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              'Load demo data'
            )}
          </Button>
        </div>

        {message && (
          <p className="text-sm text-muted-foreground border-l-4 border-primary pl-3 py-1">
            {message}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
