'use client';

import { useState, useCallback } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { API_CATEGORIES, type ApiCategory } from '@/components/growth/ProviderRevenueCalculator';
import { Loader2, ArrowRight, ArrowLeft, Check, FileJson, Sparkles, DollarSign, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';

const STEPS = [
  { id: 'info', label: 'Company & API', icon: FileJson },
  { id: 'import', label: 'Import OpenAPI', icon: FileJson },
  { id: 'endpoints', label: 'Review endpoints', icon: FileJson },
  { id: 'enhance', label: 'AI enhance docs', icon: Sparkles },
  { id: 'pricing', label: 'Pricing', icon: DollarSign },
  { id: 'stripe', label: 'Connect Stripe', icon: CreditCard },
] as const;

type StepId = (typeof STEPS)[number]['id'];

interface ProviderOnboardWizardProps {
  providerId: string;
  initialProfile?: {
    company_name?: string | null;
    api_name?: string | null;
    api_description?: string | null;
    api_category?: string[] | null;
    total_endpoints?: number | null;
    ai_enhanced_description?: string | null;
    ai_suggested_pricing?: { tiers?: Array<{ name?: string; price_per_month?: number; calls_per_month?: number }> } | null;
  } | null;
}

export function ProviderOnboardWizard({ providerId, initialProfile }: ProviderOnboardWizardProps) {
  const supabase = useSupabase();
  const [stepIndex, setStepIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [companyName, setCompanyName] = useState(initialProfile?.company_name ?? '');
  const [apiName, setApiName] = useState(initialProfile?.api_name ?? '');
  const [apiDescription, setApiDescription] = useState(initialProfile?.api_description ?? '');
  const [apiCategory, setApiCategory] = useState<ApiCategory>(
    (initialProfile?.api_category?.[0] as ApiCategory) ?? 'general'
  );

  const [specInput, setSpecInput] = useState('');
  const [specUrl, setSpecUrl] = useState('');
  const [importMethod, setImportMethod] = useState<'paste' | 'url'>('paste');
  const [importResult, setImportResult] = useState<{
    valid: boolean;
    endpoints?: Array<{ method: string; path: string; summary: string }>;
    info?: { title: string; description: string };
    errors?: string[];
  } | null>(null);

  const [enhancedDescription, setEnhancedDescription] = useState(initialProfile?.ai_enhanced_description ?? '');
  const [pricingSuggestion, setPricingSuggestion] = useState(initialProfile?.ai_suggested_pricing ?? null);

  const invokeOnboard = useCallback(
    async (action: string, data?: Record<string, unknown>) => {
      const { data: result, error: fnError } = await supabase.functions.invoke('provider-onboard', {
        body: { action, provider_id: providerId, data },
      });
      if (fnError) throw new Error(fnError.message ?? 'Request failed');
      if (result?.error) throw new Error(result.error);
      return result;
    },
    [providerId, supabase]
  );

  const updateProfile = useCallback(
    async (updates: Record<string, unknown>) => {
      const { error: updateErr } = await supabase
        .from('provider_profiles')
        .update(updates)
        .eq('id', providerId);
      if (updateErr) throw new Error(updateErr.message);
    },
    [providerId, supabase]
  );

  const handleStepNext = async () => {
    setError(null);
    const step = STEPS[stepIndex].id;

    if (step === 'info') {
      setLoading(true);
      try {
        await updateProfile({
          company_name: companyName || null,
          api_name: apiName || null,
          api_description: apiDescription || null,
          api_category: [apiCategory],
        });
        setStepIndex((i) => i + 1);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to save');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (step === 'import') {
      setLoading(true);
      try {
        const payload =
          importMethod === 'url'
            ? { spec_url: specUrl.trim(), import_method: 'openapi_url' }
            : { spec_content: specInput.trim() ? JSON.parse(specInput) : null, import_method: 'openapi_upload' };
        if (!payload.spec_url && !payload.spec_content) {
          setError('Enter a spec URL or paste JSON');
          setLoading(false);
          return;
        }
        const result = await invokeOnboard('import_spec', payload);
        setImportResult(result);
        if (result?.success) setStepIndex((i) => i + 1);
        else setError(result?.errors?.[0] ?? 'Invalid spec');
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Import failed');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (step === 'endpoints') {
      setStepIndex((i) => i + 1);
      return;
    }

    if (step === 'enhance') {
      setLoading(true);
      try {
        const result = await invokeOnboard('enhance_docs');
        if (result?.enhanced_description) {
          setEnhancedDescription(result.enhanced_description);
          setStepIndex((i) => i + 1);
        } else setError('Enhancement failed');
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Enhance failed');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (step === 'pricing') {
      setLoading(true);
      try {
        const result = await invokeOnboard('suggest_pricing');
        if (result?.tiers) setPricingSuggestion({ tiers: result.tiers });
        await invokeOnboard('calculate_projections');
        setStepIndex((i) => i + 1);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Pricing failed');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (step === 'stripe') {
      setLoading(true);
      try {
        const res = await fetch('/api/provider/connect/onboarding', { method: 'POST' });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? 'Failed to start Stripe');
        if (data.onboardingUrl) {
          window.location.href = data.onboardingUrl;
          return;
        }
        throw new Error('No onboarding URL');
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Stripe connect failed');
      } finally {
        setLoading(false);
      }
      return;
    }

    setStepIndex((i) => i + 1);
  };

  const currentStep = STEPS[stepIndex].id;
  const isLastStep = stepIndex === STEPS.length - 1;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          {STEPS.map((s, i) => (
            <div
              key={s.id}
              className={cn(
                'flex items-center gap-1 text-sm',
                i < stepIndex && 'text-muted-foreground',
                i === stepIndex && 'font-medium text-primary',
                i > stepIndex && 'text-muted-foreground'
              )}
            >
              {i > 0 && <span className="mr-1">→</span>}
              <s.icon className="h-4 w-4" />
              {s.label}
            </div>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="rounded-md bg-destructive/10 text-destructive text-sm p-3">{error}</div>
        )}

        {currentStep === 'info' && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="company">Company name</Label>
              <Input
                id="company"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Acme Inc"
              />
            </div>
            <div>
              <Label htmlFor="apiName">API name</Label>
              <Input
                id="apiName"
                value={apiName}
                onChange={(e) => setApiName(e.target.value)}
                placeholder="My API"
              />
            </div>
            <div>
              <Label htmlFor="apiDesc">Short description</Label>
              <Textarea
                id="apiDesc"
                value={apiDescription}
                onChange={(e) => setApiDescription(e.target.value)}
                placeholder="What your API does..."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={apiCategory}
                onChange={(e) => setApiCategory(e.target.value as ApiCategory)}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {API_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {currentStep === 'import' && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setImportMethod('paste')}
                className={cn(
                  'rounded-lg border px-3 py-2 text-sm font-medium',
                  importMethod === 'paste' ? 'border-primary bg-primary/10' : 'border-border'
                )}
              >
                Paste JSON
              </button>
              <button
                type="button"
                onClick={() => setImportMethod('url')}
                className={cn(
                  'rounded-lg border px-3 py-2 text-sm font-medium',
                  importMethod === 'url' ? 'border-primary bg-primary/10' : 'border-border'
                )}
              >
                Spec URL
              </button>
            </div>
            {importMethod === 'url' ? (
              <div>
                <Label htmlFor="specUrl">OpenAPI spec URL</Label>
                <Input
                  id="specUrl"
                  value={specUrl}
                  onChange={(e) => setSpecUrl(e.target.value)}
                  placeholder="https://api.example.com/openapi.json"
                />
              </div>
            ) : (
              <div>
                <Label htmlFor="specPaste">OpenAPI spec (JSON)</Label>
                <Textarea
                  id="specPaste"
                  value={specInput}
                  onChange={(e) => setSpecInput(e.target.value)}
                  placeholder='{"openapi":"3.0.0","info":{...},"paths":{...}}'
                  rows={10}
                  className="font-mono text-sm"
                />
              </div>
            )}
          </div>
        )}

        {currentStep === 'endpoints' && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {importResult?.endpoints?.length ?? 0} endpoints found. You can refine docs and pricing in the next steps.
            </p>
            {importResult?.endpoints && importResult.endpoints.length > 0 && (
              <ul className="max-h-60 overflow-y-auto rounded border border-border p-3 text-sm">
                {importResult.endpoints.slice(0, 20).map((ep, i) => (
                  <li key={i} className="flex gap-2 py-1">
                    <span className="font-mono text-muted-foreground">{ep.method}</span>
                    <span className="font-mono">{ep.path}</span>
                    {ep.summary && <span className="text-muted-foreground">{ep.summary}</span>}
                  </li>
                ))}
                {importResult.endpoints.length > 20 && (
                  <li className="text-muted-foreground">+{importResult.endpoints.length - 20} more</li>
                )}
              </ul>
            )}
          </div>
        )}

        {currentStep === 'enhance' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Use AI to improve your API description for the marketplace listing.
            </p>
            {enhancedDescription && (
              <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm whitespace-pre-wrap">
                {enhancedDescription}
              </div>
            )}
          </div>
        )}

        {currentStep === 'pricing' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              AI-suggested tiers based on your API. We’ll save them to your profile.
            </p>
            {pricingSuggestion?.tiers && pricingSuggestion.tiers.length > 0 ? (
              <ul className="space-y-2">
                {pricingSuggestion.tiers.map((tier: { name?: string; price_per_month?: number; calls_per_month?: number }, i: number) => (
                  <li key={i} className="flex justify-between rounded border border-border px-3 py-2">
                    <span className="font-medium">{tier.name ?? 'Tier'}</span>
                    <span>
                      ${tier.price_per_month ?? 0}/mo
                      {tier.calls_per_month != null && ` · ${Number(tier.calls_per_month).toLocaleString()} calls`}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Click Next to generate suggestions.</p>
            )}
          </div>
        )}

        {currentStep === 'stripe' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Connect your Stripe account to receive payouts when developers use your API.
            </p>
            <p className="text-sm">
              You’ll be redirected to Stripe to complete onboarding. Return here when done.
            </p>
          </div>
        )}

        <div className="flex justify-between pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
            disabled={stepIndex === 0 || loading}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <Button onClick={handleStepNext} disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : isLastStep && currentStep === 'stripe' ? (
              <CreditCard className="h-4 w-4 mr-1" />
            ) : (
              <ArrowRight className="h-4 w-4 mr-1" />
            )}
            {loading ? 'Saving...' : currentStep === 'stripe' ? 'Connect Stripe' : 'Next'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
