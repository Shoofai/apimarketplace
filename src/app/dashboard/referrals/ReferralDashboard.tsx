'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Check, Copy, Gift, Users, TrendingUp, Share2 } from 'lucide-react';

interface Referral {
  id: string;
  referred_email: string;
  code: string;
  status: string;
  created_at: string;
}

interface ReferralDashboardProps {
  referrals: Referral[];
  signedUpCount: number;
  shareCode: string;
}

const STATUS_LABELS: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  pending:   { label: 'Pending',   variant: 'secondary' },
  signed_up: { label: 'Signed up', variant: 'default' },
  converted: { label: 'Pro user',  variant: 'default' },
};

export function ReferralDashboard({ referrals, signedUpCount, shareCode }: ReferralDashboardProps) {
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setShareUrl(`${window.location.origin}/signup?ref=${shareCode}`);
  }, [shareCode]);

  function copyLink() {
    const url = `${window.location.origin}/signup?ref=${shareCode}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function shareNative() {
    if (navigator.share) {
      navigator.share({
        title: 'Join me on this API platform',
        text: 'I\'ve been using this API marketplace — come check it out.',
        url: shareUrl,
      }).catch(() => {});
    } else {
      copyLink();
    }
  }

  const convertedCount = referrals.filter((r) => r.status === 'converted').length;

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-l-4 border-l-violet-500 bg-gradient-to-br from-violet-500/5 to-transparent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total referrals</CardTitle>
            <div className="p-2 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{referrals.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Links clicked &amp; signed up</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500 bg-gradient-to-br from-emerald-500/5 to-transparent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Signed up</CardTitle>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{signedUpCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Created accounts via your link</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500 bg-gradient-to-br from-amber-500/5 to-transparent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pro conversions</CardTitle>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Gift className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{convertedCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Upgraded to a paid plan</p>
          </CardContent>
        </Card>
      </div>

      {/* Share link */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-primary" />
            Your referral link
          </CardTitle>
          <CardDescription>
            Share this link. When someone signs up through it, you both benefit — and you'll be credited for every conversion.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              readOnly
              value={shareUrl}
              placeholder="Loading…"
              className="font-mono text-sm bg-muted/50"
            />
            <Button variant="outline" onClick={copyLink} className="shrink-0 gap-2 min-w-[90px]">
              {copied ? <><Check className="h-4 w-4" />Copied</> : <><Copy className="h-4 w-4" />Copy</>}
            </Button>
            <Button onClick={shareNative} className="shrink-0 gap-2">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Twitter / X', href: `https://twitter.com/intent/tweet?text=Check+out+this+API+marketplace&url=${encodeURIComponent(shareUrl)}` },
              { label: 'LinkedIn',    href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}` },
              { label: 'Email',       href: `mailto:?subject=You+should+check+this+out&body=I've+been+using+this+API+marketplace+and+thought+you'd+find+it+useful:+${encodeURIComponent(shareUrl)}` },
            ].map(({ label, href }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="sm" className="text-xs border border-border/60">
                  Share on {label}
                </Button>
              </a>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Referral history */}
      <Card>
        <CardHeader>
          <CardTitle>Referral history</CardTitle>
          <CardDescription>People who joined using your link</CardDescription>
        </CardHeader>
        <CardContent>
          {referrals.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <div className="p-4 rounded-full bg-muted">
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">No referrals yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Share your link above — every sign-up counts.
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {referrals.map((r) => {
                const statusInfo = STATUS_LABELS[r.status] ?? { label: r.status, variant: 'outline' as const };
                return (
                  <div key={r.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium">{r.referred_email}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(r.created_at).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric',
                        })}
                      </p>
                    </div>
                    <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
