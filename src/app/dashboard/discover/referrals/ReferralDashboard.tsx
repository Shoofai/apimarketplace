'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ReferralDashboardProps {
  referrals: { id: string; referred_email: string; code: string; status: string; created_at: string }[];
  signedUpCount: number;
  shareCode: string;
}

export function ReferralDashboard({ referrals, signedUpCount, shareCode }: ReferralDashboardProps) {
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    setShareUrl(`${window.location.origin}/signup?ref=${shareCode}`);
  }, [shareCode]);

  function copyLink() {
    const url = `${window.location.origin}/signup?ref=${shareCode}`;
    navigator.clipboard.writeText(url);
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Your referral link</CardTitle>
            <CardDescription>Share this link. When someone signs up, you both earn rewards.</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Input readOnly value={shareUrl} placeholder="Loading..." className="font-mono text-sm" />
            <Button onClick={copyLink}>Copy</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Referred</CardTitle>
            <CardDescription>Sign-ups from your link</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">{signedUpCount}</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent referrals</CardTitle>
        </CardHeader>
        <CardContent>
          {referrals.length === 0 ? (
            <p className="text-muted-foreground text-sm">No referrals yet. Share your link to get started.</p>
          ) : (
            <ul className="space-y-2">
              {referrals.slice(0, 20).map((r) => (
                <li key={r.id} className="flex justify-between text-sm">
                  <span>{r.referred_email}</span>
                  <span className="text-muted-foreground">{r.status}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </>
  );
}
