'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils/formatting';
import { APIKeyReveal } from './APIKeyReveal';
import { Loader2 } from 'lucide-react';

export interface PricingPlan {
  id: string;
  name: string;
  price_monthly: number;
  included_calls?: number;
  rate_limit_per_minute?: number;
  description?: string | null;
  features?: string[] | null;
}

interface SubscribeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apiId: string;
  apiName: string;
  plans: PricingPlan[];
  defaultPlanId?: string | null;
}

type Step = 'plan' | 'success';

export function SubscribeModal({
  open,
  onOpenChange,
  apiId,
  apiName,
  plans,
  defaultPlanId,
}: SubscribeModalProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>('plan');
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(
    defaultPlanId && plans.some((p) => p.id === defaultPlanId) ? defaultPlanId : plans[0]?.id ?? null
  );

  useEffect(() => {
    if (open) {
      setSelectedPlanId(
        defaultPlanId && plans.some((p) => p.id === defaultPlanId)
          ? defaultPlanId
          : plans[0]?.id ?? null
      );
    }
  }, [open, defaultPlanId, plans]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);

  const handleSubscribe = async () => {
    if (!selectedPlanId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_id: apiId, pricing_plan_id: selectedPlanId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Failed to subscribe');
        setLoading(false);
        return;
      }
      setApiKey(data.api_key ?? null);
      setStep('success');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDone = () => {
    onOpenChange(false);
    setStep('plan');
    setApiKey(null);
    setError(null);
    router.push('/dashboard/subscriptions');
  };

  const handleClose = (next: boolean) => {
    if (!next && step === 'success') {
      handleDone();
      return;
    }
    onOpenChange(next);
    if (!next) {
      setStep('plan');
      setApiKey(null);
      setError(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === 'plan' ? `Subscribe to ${apiName}` : 'You\'re subscribed!'}
          </DialogTitle>
          <DialogDescription>
            {step === 'plan'
              ? 'Choose a plan to get your API key and start building.'
              : 'Save your API key below.'}
          </DialogDescription>
        </DialogHeader>

        {step === 'plan' && (
          <>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {plans.map((plan) => (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setSelectedPlanId(plan.id)}
                  className={`w-full rounded-lg border-2 p-4 text-left transition-colors ${
                    selectedPlanId === plan.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold">{plan.name}</div>
                      {plan.description && (
                        <p className="text-sm text-muted-foreground mt-0.5">{plan.description}</p>
                      )}
                    </div>
                    <div className="text-xl font-bold shrink-0 ml-2">
                      {plan.price_monthly === 0
                        ? 'Free'
                        : `${formatCurrency(plan.price_monthly)}/mo`}
                    </div>
                  </div>
                  <ul className="mt-2 text-sm text-muted-foreground space-y-1">
                    <li>
                      {plan.included_calls != null
                        ? `${plan.included_calls.toLocaleString()} API calls included`
                        : 'Unlimited API calls'}
                    </li>
                    <li>{plan.rate_limit_per_minute ?? 100} requests/min</li>
                    {plan.features?.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </button>
              ))}
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <Button
              className="w-full"
              onClick={handleSubscribe}
              disabled={!selectedPlanId || loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Subscribing...
                </>
              ) : (
                'Subscribe'
              )}
            </Button>
          </>
        )}

        {step === 'success' && apiKey && (
          <APIKeyReveal apiKey={apiKey} apiName={apiName} onDone={handleDone} />
        )}
      </DialogContent>
    </Dialog>
  );
}
