'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Pencil, Trash2 } from 'lucide-react';

interface PricingPlan {
  id: string;
  name: string;
  slug?: string;
  included_calls: number | null;
  rate_limit_per_second: number | null;
  rate_limit_per_day: number | null;
  rate_limit_per_month: number | null;
  sort_order?: number | null;
}

interface ProviderApiPricingTabProps {
  apiId: string;
  initialPlans: PricingPlan[];
}

export function ProviderApiPricingTab({ apiId, initialPlans }: ProviderApiPricingTabProps) {
  const [plans, setPlans] = useState<PricingPlan[]>(initialPlans);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formIncludedCalls, setFormIncludedCalls] = useState<string>('');
  const [formRateSec, setFormRateSec] = useState<string>('');
  const [formRateDay, setFormRateDay] = useState<string>('');
  const [formRateMonth, setFormRateMonth] = useState<string>('');

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/apis/${apiId}/pricing-plans`);
      if (res.ok) {
        const data = await res.json();
        setPlans(data.plans ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, [apiId]);

  useEffect(() => {
    setPlans(initialPlans);
  }, [initialPlans]);

  const openCreate = () => {
    setEditingId(null);
    setFormName('');
    setFormIncludedCalls('');
    setFormRateSec('');
    setFormRateDay('');
    setFormRateMonth('');
    setDialogOpen(true);
  };

  const openEdit = (p: PricingPlan) => {
    setEditingId(p.id);
    setFormName(p.name);
    setFormIncludedCalls(p.included_calls != null ? String(p.included_calls) : '');
    setFormRateSec(p.rate_limit_per_second != null ? String(p.rate_limit_per_second) : '');
    setFormRateDay(p.rate_limit_per_day != null ? String(p.rate_limit_per_day) : '');
    setFormRateMonth(p.rate_limit_per_month != null ? String(p.rate_limit_per_month) : '');
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: formName.trim(),
      included_calls: formIncludedCalls ? parseInt(formIncludedCalls, 10) : undefined,
      rate_limit_per_second: formRateSec ? parseInt(formRateSec, 10) : undefined,
      rate_limit_per_day: formRateDay ? parseInt(formRateDay, 10) : undefined,
      rate_limit_per_month: formRateMonth ? parseInt(formRateMonth, 10) : undefined,
    };
    if (editingId) {
      const res = await fetch(`/api/apis/${apiId}/pricing-plans/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setDialogOpen(false);
        fetchPlans();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data?.error ?? 'Update failed');
      }
    } else {
      const res = await fetch(`/api/apis/${apiId}/pricing-plans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setDialogOpen(false);
        fetchPlans();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data?.error ?? 'Create failed');
      }
    }
  };

  const handleDelete = async (planId: string) => {
    if (!confirm('Deactivate this pricing plan? Existing subscriptions may be affected.')) return;
    const res = await fetch(`/api/apis/${apiId}/pricing-plans/${planId}`, { method: 'DELETE' });
    if (res.ok) {
      fetchPlans();
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data?.error ?? 'Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Pricing Tiers</CardTitle>
              <CardDescription>Manage subscription plans and rate limits</CardDescription>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add plan
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleSubmit}>
                  <DialogHeader>
                    <DialogTitle>{editingId ? 'Edit plan' : 'New plan'}</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="e.g. Pro"
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="included_calls">Included calls (optional)</Label>
                      <Input
                        id="included_calls"
                        type="number"
                        min={0}
                        value={formIncludedCalls}
                        onChange={(e) => setFormIncludedCalls(e.target.value)}
                        placeholder="e.g. 10000"
                        className="mt-1"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label htmlFor="rate_sec">Rate /sec</Label>
                        <Input
                          id="rate_sec"
                          type="number"
                          min={0}
                          value={formRateSec}
                          onChange={(e) => setFormRateSec(e.target.value)}
                          placeholder="—"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="rate_day">Rate /day</Label>
                        <Input
                          id="rate_day"
                          type="number"
                          min={0}
                          value={formRateDay}
                          onChange={(e) => setFormRateDay(e.target.value)}
                          placeholder="—"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="rate_month">Rate /month</Label>
                        <Input
                          id="rate_month"
                          type="number"
                          min={0}
                          value={formRateMonth}
                          onChange={(e) => setFormRateMonth(e.target.value)}
                          placeholder="—"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">{editingId ? 'Save' : 'Create'}</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {loading && plans.length === 0 ? (
            <p className="text-muted-foreground text-sm">Loading…</p>
          ) : plans.length === 0 ? (
            <p className="text-muted-foreground text-sm py-8 text-center">
              No pricing plans yet. Add one to define rate limits and quotas for subscribers.
            </p>
          ) : (
            <div className="rounded-md border">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50">
                  <tr className="text-left">
                    <th className="p-3 font-medium">Plan</th>
                    <th className="p-3 font-medium">Included calls</th>
                    <th className="p-3 font-medium">Rate limits</th>
                    <th className="p-3 w-24" />
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {plans.map((plan) => (
                    <tr key={plan.id}>
                      <td className="p-3 font-medium">{plan.name}</td>
                      <td className="p-3 text-muted-foreground">
                        {plan.included_calls != null ? plan.included_calls.toLocaleString() : '—'}
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {[
                          plan.rate_limit_per_second != null && `${plan.rate_limit_per_second}/s`,
                          plan.rate_limit_per_day != null && `${plan.rate_limit_per_day}/day`,
                          plan.rate_limit_per_month != null && `${plan.rate_limit_per_month}/mo`,
                        ]
                          .filter(Boolean)
                          .join(' · ') || '—'}
                      </td>
                      <td className="p-3 flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(plan)} aria-label="Edit">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(plan.id)} aria-label="Deactivate">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
