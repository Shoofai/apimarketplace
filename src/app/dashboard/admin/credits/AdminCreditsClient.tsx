'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Coins, Plus, ToggleLeft, ToggleRight } from 'lucide-react';

interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  bonus_credits: number;
  price_usd: number;
  stripe_price_id: string | null;
  is_active: boolean;
}

interface AdminCreditsClientProps {
  initialPackages: CreditPackage[];
}

export function AdminCreditsClient({ initialPackages }: AdminCreditsClientProps) {
  const [packages, setPackages] = useState<CreditPackage[]>(initialPackages);

  const handleToggle = async (pkg: CreditPackage) => {
    // Direct DB update via admin API would be needed in production.
    // For now, show a toast that this requires a DB migration change.
    alert(`To toggle package "${pkg.name}", update is_active in the credit_packages table.`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Coins className="h-6 w-6 text-yellow-500" />
        <h1 className="text-2xl font-bold">Credit Packages</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {packages.map((pkg) => (
          <Card key={pkg.id} className={pkg.is_active ? '' : 'opacity-60'}>
            <CardContent className="pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold">{pkg.name}</span>
                <Badge variant={pkg.is_active ? 'default' : 'secondary'}>
                  {pkg.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div className="text-2xl font-bold">{pkg.credits.toLocaleString()} cr</div>
              {pkg.bonus_credits > 0 && (
                <p className="text-sm text-green-600">+ {pkg.bonus_credits} bonus</p>
              )}
              <p className="text-lg font-semibold">${Number(pkg.price_usd).toFixed(2)}</p>
              {pkg.stripe_price_id && (
                <p className="text-xs text-muted-foreground font-mono truncate">{pkg.stripe_price_id}</p>
              )}
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={() => handleToggle(pkg)}
              >
                {pkg.is_active ? (
                  <><ToggleLeft className="h-3.5 w-3.5 mr-1" /> Deactivate</>
                ) : (
                  <><ToggleRight className="h-3.5 w-3.5 mr-1" /> Activate</>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        <Plus className="h-5 w-5 mx-auto mb-2" />
        New credit packages can be added via a database migration or Supabase Studio.
        Set <code className="font-mono text-xs bg-muted px-1 rounded">stripe_price_id</code> to link to an existing Stripe price.
      </div>
    </div>
  );
}
