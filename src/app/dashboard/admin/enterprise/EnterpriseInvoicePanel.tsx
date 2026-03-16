'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ExternalLink, Loader2, Send } from 'lucide-react';

interface Org {
  id: string;
  name: string;
  plan: string;
}

interface EnterpriseInvoicePanelProps {
  orgs: Org[];
}

export function EnterpriseInvoicePanel({ orgs }: EnterpriseInvoicePanelProps) {
  const [orgId, setOrgId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [dueDays, setDueDays] = useState('30');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ stripe_invoice_id: string; hosted_invoice_url?: string } | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);

    const amount_usd = parseFloat(amount);
    if (!orgId || !amount_usd || !description) {
      setError('All fields are required.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/enterprise/invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organization_id: orgId,
          amount_usd,
          description,
          due_days: parseInt(dueDays, 10) || 30,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Failed to send invoice.');
      } else {
        setResult(data);
        setOrgId('');
        setAmount('');
        setDescription('');
      }
    } catch {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Send Enterprise Invoice
        </CardTitle>
        <CardDescription>
          Create and send a custom Stripe invoice. Payment automatically sets the org plan to Enterprise.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="org">Organization</Label>
              <Select value={orgId} onValueChange={setOrgId}>
                <SelectTrigger id="org">
                  <SelectValue placeholder="Select organization" />
                </SelectTrigger>
                <SelectContent>
                  {orgs.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                      {org.plan !== 'free' && (
                        <span className="ml-2 text-xs text-muted-foreground capitalize">
                          ({org.plan})
                        </span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="amount">Amount (USD)</Label>
              <Input
                id="amount"
                type="number"
                min="1"
                step="0.01"
                placeholder="e.g. 5000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enterprise Annual License — Acme Corp, Jan 2026"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-1.5 sm:w-48">
            <Label htmlFor="due-days">Payment due (days)</Label>
            <Input
              id="due-days"
              type="number"
              min="1"
              max="90"
              value={dueDays}
              onChange={(e) => setDueDays(e.target.value)}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          {result && (
            <div className="rounded-lg border border-green-200 bg-green-50 dark:bg-green-950/30 p-3 text-sm text-green-800 dark:text-green-200 flex items-center gap-2">
              Invoice sent!
              {result.hosted_invoice_url && (
                <a
                  href={result.hosted_invoice_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 underline"
                >
                  View in Stripe <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          )}

          <Button type="submit" disabled={loading} className="gap-2">
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Send Invoice
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
