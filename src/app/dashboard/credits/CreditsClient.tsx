'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Coins, ShoppingCart, ArrowUpCircle, ArrowDownCircle, Loader2, Star } from 'lucide-react';

interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  bonus_credits: number;
  price_usd: number;
}

interface LedgerEntry {
  id: string;
  amount: number;
  type: string;
  description: string;
  balance_after: number;
  created_at: string;
}

export function CreditsClient() {
  const searchParams = useSearchParams();
  const [balance, setBalance] = useState<number>(0);
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const purchased = searchParams.get('purchased') === '1';

  useEffect(() => {
    fetch('/api/credits')
      .then((r) => r.json())
      .then((d) => {
        setBalance(d.balance ?? 0);
        setPackages(d.packages ?? []);
        setLedger(d.ledger ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  const handlePurchase = async (pkg: CreditPackage) => {
    setPurchasing(pkg.id);
    try {
      const res = await fetch('/api/credits/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ package_id: pkg.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error ?? 'Failed to start checkout');
        return;
      }
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      }
    } finally {
      setPurchasing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Coins className="h-7 w-7 text-yellow-500" />
        <h1 className="text-2xl font-bold">API Credits</h1>
      </div>

      {purchased && (
        <div className="rounded-lg bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-300 p-4 text-sm font-medium">
          ✓ Your purchase is being processed. Your credit balance will update shortly.
        </div>
      )}

      {/* Balance widget */}
      <Card className="border-yellow-400/30 bg-yellow-50 dark:bg-yellow-950/20">
        <CardContent className="pt-6 flex items-center gap-6">
          <div className="flex items-center justify-center h-16 w-16 rounded-full bg-yellow-400/20 border border-yellow-400/30">
            <Coins className="h-8 w-8 text-yellow-500" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Available Balance</p>
            <p className="text-4xl font-bold text-yellow-600 dark:text-yellow-400">{balance.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-0.5">credits</p>
          </div>
        </CardContent>
      </Card>

      {/* Credit packages */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" /> Buy Credits
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {packages.map((pkg, idx) => {
            const totalCredits = pkg.credits + pkg.bonus_credits;
            const isPopular = idx === 1;
            return (
              <Card key={pkg.id} className={`relative ${isPopular ? 'border-primary ring-1 ring-primary' : ''}`}>
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="gap-1 bg-primary text-primary-foreground text-xs">
                      <Star className="h-2.5 w-2.5 fill-current" /> Most Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="pt-6 pb-2">
                  <CardTitle className="text-base">{pkg.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-3xl font-bold">{pkg.credits.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">credits</p>
                    {pkg.bonus_credits > 0 && (
                      <p className="text-sm text-green-600 font-medium mt-1">
                        + {pkg.bonus_credits.toLocaleString()} bonus = {totalCredits.toLocaleString()} total
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-xl font-bold">${Number(pkg.price_usd).toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">
                      ${(Number(pkg.price_usd) / totalCredits).toFixed(4)} per credit
                    </p>
                  </div>
                  <Button
                    className="w-full"
                    variant={isPopular ? 'default' : 'outline'}
                    onClick={() => handlePurchase(pkg)}
                    disabled={purchasing === pkg.id}
                  >
                    {purchasing === pkg.id ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processing…</>
                    ) : (
                      <>Buy for ${Number(pkg.price_usd).toFixed(2)}</>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Ledger */}
      {ledger.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Credit History</h2>
          <Card>
            <div className="divide-y">
              {ledger.map((entry) => (
                <div key={entry.id} className="flex items-center gap-3 px-4 py-3">
                  {entry.amount > 0 ? (
                    <ArrowUpCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  ) : (
                    <ArrowDownCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{entry.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(entry.created_at).toLocaleDateString()} · Balance after: {entry.balance_after.toLocaleString()}
                    </p>
                  </div>
                  <span className={`text-sm font-medium tabular-nums ${entry.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {entry.amount > 0 ? '+' : ''}{entry.amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {ledger.length === 0 && (
        <div className="text-center py-8 text-muted-foreground text-sm">
          No credit transactions yet. Buy your first credit pack to get started!
        </div>
      )}
    </div>
  );
}
