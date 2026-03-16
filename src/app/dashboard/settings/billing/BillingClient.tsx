'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CreditCard, Download, ExternalLink, Sparkles, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface Invoice {
  id: string;
  billing_period_start: string | null;
  billing_period_end: string | null;
  total: number | null;
  status: string;
  stripe_invoice_id: string | null;
  paid_at: string | null;
  due_date: string | null;
}

interface BillingClientProps {
  plan: string;
  orgId: string;
  invoices: Invoice[];
}

export function BillingClient({ plan, orgId, invoices }: BillingClientProps) {
  const [loading, setLoading] = useState<'checkout' | 'portal' | null>(null);

  const handleUpgrade = async () => {
    setLoading('checkout');
    try {
      const res = await fetch('/api/platform/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'pro' }),
      });
      const data = await res.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch {
      // Fail silently — user can try again
    } finally {
      setLoading(null);
    }
  };

  const handleManage = async () => {
    setLoading('portal');
    try {
      const res = await fetch('/api/platform/manage', { method: 'POST' });
      const data = await res.json();
      if (data.portalUrl) {
        window.location.href = data.portalUrl;
      }
    } catch {
      // Fail silently
    } finally {
      setLoading(null);
    }
  };

  const planLabel = plan?.charAt(0).toUpperCase() + plan?.slice(1);

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
              <CardDescription>Your active subscription plan</CardDescription>
            </div>
            <Badge variant="default" className="text-sm">
              {planLabel} Plan
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Monthly Cost</span>
              {plan === 'enterprise' ? (
                <Link href="/enterprise" className="text-xl font-bold text-primary hover:underline">
                  Custom
                </Link>
              ) : (
                <span className="text-xl font-bold">
                  ${plan === 'pro' ? '99' : '0'}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Billing Cycle</span>
              <span className="font-medium">Monthly</span>
            </div>

            <div className="pt-4 flex gap-2">
              {plan === 'free' && (
                <Button
                  variant="default"
                  onClick={handleUpgrade}
                  disabled={loading !== null}
                  className="gap-2"
                >
                  {loading === 'checkout' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  Upgrade to Pro — $99/mo
                </Button>
              )}
              {plan === 'pro' && (
                <Button
                  variant="outline"
                  onClick={handleManage}
                  disabled={loading !== null}
                  className="gap-2"
                >
                  {loading === 'portal' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ExternalLink className="h-4 w-4" />
                  )}
                  Manage Subscription
                </Button>
              )}
              {plan === 'enterprise' && (
                <Link href="/enterprise">
                  <Button variant="outline">Contact Account Manager</Button>
                </Link>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
          <CardDescription>Manage your payment methods</CardDescription>
        </CardHeader>
        <CardContent>
          {plan === 'free' ? (
            <div className="py-8 text-center text-muted-foreground">
              <p>No payment method required for free plan</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 border rounded-lg">
                <CreditCard className="h-8 w-8 text-muted-foreground" />
                <div className="flex-1">
                  <p className="font-medium">Payment method on file</p>
                  <p className="text-sm text-muted-foreground">Managed via Stripe</p>
                </div>
                <Badge variant="outline">Default</Badge>
              </div>
              <Button
                variant="outline"
                onClick={handleManage}
                disabled={loading !== null}
                className="gap-2"
              >
                {loading === 'portal' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ExternalLink className="h-4 w-4" />
                )}
                Manage in Stripe Portal
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoices */}
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>Your past invoices</CardDescription>
        </CardHeader>
        <CardContent>
          {(!invoices || invoices.length === 0) ? (
            <div className="py-8 text-center text-muted-foreground">
              <p>No invoices yet</p>
              {plan === 'free' && (
                <p className="text-sm mt-1">Invoices appear here once you subscribe to a paid plan.</p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">
                      {invoice.billing_period_start
                        ? new Date(invoice.billing_period_start).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                        : invoice.due_date
                          ? new Date(invoice.due_date).toLocaleDateString()
                          : 'Invoice'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {invoice.billing_period_start && invoice.billing_period_end
                        ? `${new Date(invoice.billing_period_start).toLocaleDateString()} – ${new Date(invoice.billing_period_end).toLocaleDateString()}`
                        : invoice.paid_at
                          ? `Paid ${new Date(invoice.paid_at).toLocaleDateString()}`
                          : 'Pending'}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge
                      variant={invoice.status === 'paid' ? 'default' : invoice.status === 'open' ? 'secondary' : 'destructive'}
                      className="text-xs"
                    >
                      {invoice.status}
                    </Badge>
                    <span className="font-medium">
                      {plan === 'enterprise'
                        ? 'Custom'
                        : invoice.total != null
                          ? `$${Number(invoice.total).toFixed(2)}`
                          : '—'}
                    </span>
                    {invoice.stripe_invoice_id && (
                      <a
                        href={`https://dashboard.stripe.com/invoices/${invoice.stripe_invoice_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="View invoice in Stripe"
                      >
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </a>
                    )}
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
