'use client';

import { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check } from 'lucide-react';

type CaptureSource =
  | 'landing_page'
  | 'product_hunt'
  | 'linkedin'
  | 'twitter'
  | 'referral'
  | 'blog'
  | 'api_docs'
  | 'google_ads'
  | 'cold_outreach'
  | 'event'
  | 'organic_search'
  | 'direct'
  | 'other';

type StakeholderHint = 'investor' | 'api_provider' | 'developer' | 'enterprise_buyer';

type Variant = 'hero' | 'sidebar' | 'modal' | 'inline';

const I_AM_OPTIONS: { value: StakeholderHint; label: string }[] = [
  { value: 'developer', label: 'Finding APIs' },
  { value: 'api_provider', label: 'Publishing APIs' },
  { value: 'enterprise_buyer', label: 'API Governance' },
  { value: 'investor', label: 'Investing' },
];

function getUtmParams(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const u = new URL(window.location.href);
  const out: Record<string, string> = {};
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach((k) => {
    const v = u.searchParams.get(k);
    if (v) out[k] = v;
  });
  return out;
}

interface UniversalCaptureFormProps {
  source: CaptureSource;
  variant?: Variant;
  stakeholderHint?: StakeholderHint;
  onSuccess?: (result: { stakeholder_id: string; stakeholder_type: string; is_existing: boolean }) => void;
}

export function UniversalCaptureForm({
  source,
  variant = 'inline',
  stakeholderHint,
  onSuccess,
}: UniversalCaptureFormProps) {
  const [step, setStep] = useState<'email' | 'details' | 'done'>('email');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [iAm, setIAm] = useState<StakeholderHint | null>(stakeholderHint ?? null);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitEmail = useCallback(() => {
    const trimmed = email.trim();
    if (!trimmed) {
      setError('Please enter your email.');
      return;
    }
    setError(null);
    setStep('details');
  }, [email]);

  const submitDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const u = typeof window !== 'undefined' ? window.location : null;
      const utm = getUtmParams();
      const supabase = createClient();
      const { data, error: fnError } = await supabase.functions.invoke('classify-stakeholder', {
        body: {
          email: email.trim().toLowerCase(),
          full_name: fullName.trim() || undefined,
          company_name: companyName.trim() || undefined,
          job_title: jobTitle.trim() || undefined,
          capture_source: source,
          utm_source: utm.utm_source,
          utm_medium: utm.utm_medium,
          utm_campaign: utm.utm_campaign,
          utm_content: utm.utm_content,
          utm_term: utm.utm_term,
          referrer_url: u?.document?.referrer || undefined,
          landing_page_url: u?.href || undefined,
          i_am: iAm || undefined,
          marketing_consent: marketingConsent,
          privacy_accepted: privacyAccepted,
        },
      });
      if (fnError) throw new Error(fnError.message || 'Request failed');
      if (data?.error) throw new Error(data.error);
      setStep('done');
      onSuccess?.({
        stakeholder_id: data.stakeholder_id,
        stakeholder_type: data.stakeholder_type ?? 'unknown',
        is_existing: data.is_existing ?? false,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [email, fullName, companyName, jobTitle, iAm, marketingConsent, privacyAccepted, source, onSuccess]);

  const isNarrow = variant === 'sidebar' || variant === 'modal';
  const containerClass =
    variant === 'hero'
      ? 'mx-auto w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur dark:border-white/10 dark:bg-gray-900/80'
      : variant === 'inline'
        ? 'rounded-xl border border-gray-200 bg-gray-50/80 p-4 dark:border-white/10 dark:bg-gray-900/60'
        : 'rounded-xl border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-gray-900/80';

  if (step === 'done') {
    return (
      <div className={`${containerClass} text-center`}>
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary-500/20 text-primary-400">
          <Check className="h-6 w-6" />
        </div>
        <p className="font-medium text-gray-900 dark:text-white">You’re all set.</p>
        <p className="mt-1 text-sm text-gray-600 dark:text-primary-200/90">
          We’ll be in touch with relevant updates.
        </p>
      </div>
    );
  }

  return (
    <div className={containerClass}>
      {step === 'email' && (
        <>
          <Label htmlFor="capture-email" className="text-gray-700 dark:text-primary-100">
            Email
          </Label>
          <Input
            id="capture-email"
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submitEmail()}
            className="mt-2 border-gray-300 bg-white dark:border-white/20 dark:bg-gray-800 dark:text-white"
            autoComplete="email"
          />
          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
          <Button
            type="button"
            onClick={submitEmail}
            className="mt-4 w-full"
            variant="cta"
          >
            Continue
          </Button>
        </>
      )}

      {step === 'details' && (
        <>
          <p className="mb-3 text-sm font-medium text-gray-700 dark:text-primary-100">
            A few optional details
          </p>
          <div className="space-y-3">
            <div>
              <Label htmlFor="capture-name" className="text-gray-600 dark:text-primary-200/90">
                Full name
              </Label>
              <Input
                id="capture-name"
                type="text"
                placeholder="Jane Smith"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1 border-gray-300 bg-white dark:border-white/20 dark:bg-gray-800 dark:text-white"
                autoComplete="name"
              />
            </div>
            <div>
              <Label htmlFor="capture-company" className="text-gray-600 dark:text-primary-200/90">
                Company
              </Label>
              <Input
                id="capture-company"
                type="text"
                placeholder="Acme Inc"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="mt-1 border-gray-300 bg-white dark:border-white/20 dark:bg-gray-800 dark:text-white"
                autoComplete="organization"
              />
            </div>
            <div>
              <Label htmlFor="capture-title" className="text-gray-600 dark:text-primary-200/90">
                Job title
              </Label>
              <Input
                id="capture-title"
                type="text"
                placeholder="Developer, PM, CTO…"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="mt-1 border-gray-300 bg-white dark:border-white/20 dark:bg-gray-800 dark:text-white"
                autoComplete="job-title"
              />
            </div>
          </div>
          <div className="mt-4">
            <p className="mb-2 text-sm font-medium text-gray-700 dark:text-primary-100">
              I’m here to…
            </p>
            <div className={`grid gap-2 ${isNarrow ? 'grid-cols-1' : 'grid-cols-2'}`}>
              {I_AM_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setIAm(opt.value)}
                  className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                    iAm === opt.value
                      ? 'border-primary-500 bg-primary-500/20 text-primary-200'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 dark:border-white/20 dark:bg-gray-800 dark:text-primary-100 dark:hover:border-white/40'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-2">
            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-primary-200/90">
              <input
                type="checkbox"
                checked={privacyAccepted}
                onChange={(e) => setPrivacyAccepted(e.target.checked)}
                className="rounded border-gray-300"
              />
              I accept the privacy policy
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-primary-200/90">
              <input
                type="checkbox"
                checked={marketingConsent}
                onChange={(e) => setMarketingConsent(e.target.checked)}
                className="rounded border-gray-300"
              />
              Send me product updates and tips
            </label>
          </div>
          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
          <div className="mt-4 flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setStep('email')}
              disabled={loading}
            >
              Back
            </Button>
            <Button
              type="button"
              className="flex-1"
              variant="cta"
              onClick={submitDetails}
              disabled={loading}
            >
              {loading ? 'Submitting…' : 'Submit'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
