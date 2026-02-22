import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CreditCard, Download, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default async function BillingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: userData } = await supabase
    .from('users')
    .select(`
      id,
      organizations:current_organization_id (
        id,
        name,
        plan
      )
    `)
    .eq('id', user.id)
    .single();

  const org = userData?.organizations as any;

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <Link href="/dashboard/settings">
        <Button variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Settings
        </Button>
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <CreditCard className="h-6 w-6" />
          Billing & Subscription
        </h1>
        <p className="text-muted-foreground">
          Manage your subscription and payment methods
        </p>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>
                Your active subscription plan
              </CardDescription>
            </div>
            <Badge variant="default" className="text-sm">
              {org?.plan?.charAt(0).toUpperCase() + org?.plan?.slice(1)} Plan
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Monthly Cost</span>
              <span className="text-xl font-bold">
                ${org?.plan === 'enterprise' ? '499' : org?.plan === 'pro' ? '49' : '0'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Billing Cycle</span>
              <span className="font-medium">Monthly</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Next Billing Date</span>
              <span className="font-medium">
                {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
              </span>
            </div>
            <div className="pt-4 flex gap-2">
              <Link href="/pricing">
                <Button variant="default">Upgrade Plan</Button>
              </Link>
              {org?.plan !== 'free' && (
                <Button variant="outline">Cancel Subscription</Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
          <CardDescription>
            Manage your payment methods
          </CardDescription>
        </CardHeader>
        <CardContent>
          {org?.plan === 'free' ? (
            <div className="py-8 text-center text-muted-foreground">
              <p>No payment method required for free plan</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 border rounded-lg">
                <CreditCard className="h-8 w-8 text-muted-foreground" />
                <div className="flex-1">
                  <p className="font-medium">•••• •••• •••• 4242</p>
                  <p className="text-sm text-muted-foreground">Expires 12/2025</p>
                </div>
                <Badge variant="outline">Default</Badge>
              </div>
              <Button variant="outline">Add Payment Method</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoices */}
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>
            Download your past invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          {org?.plan === 'free' ? (
            <div className="py-8 text-center text-muted-foreground">
              <p>No invoices yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">
                      Invoice #{1000 + i}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(Date.now() - i * 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-medium">
                      ${org?.plan === 'enterprise' ? '499' : '49'}
                    </span>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
