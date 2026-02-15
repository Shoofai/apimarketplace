'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Code2,
  Store,
  Building2,
  HelpCircle,
  User,
  Rocket,
  Building,
  Briefcase,
  Zap,
  Calendar,
  Mail,
  ArrowRight,
  CheckCircle2,
  Wrench,
  CreditCard,
  MessageSquare,
  Sparkles,
  BarChart3,
  DollarSign,
  Shield,
  Handshake,
  Newspaper,
  Scale,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const INQUIRY_STEP = {
  id: 'inquiry',
  title: 'What brings you here?',
  subtitle: "We'll route you to the right team",
  options: [
    { id: 'developer', label: 'I want to integrate APIs', icon: Code2, value: 'Developer' },
    { id: 'provider', label: 'I want to list my API', icon: Store, value: 'Provider' },
    { id: 'enterprise', label: 'Enterprise evaluation', icon: Building2, value: 'Enterprise' },
    { id: 'general', label: 'General inquiry', icon: HelpCircle, value: 'General' },
  ],
};

const CATEGORY_OPTIONS: Record<string, { id: string; label: string; icon: React.ElementType; value: string }[]> = {
  Developer: [
    { id: 'tech-support', label: 'Technical Support', icon: Wrench, value: 'Technical Support' },
    { id: 'billing', label: 'Billing Issue', icon: CreditCard, value: 'Billing Issue' },
    { id: 'api-question', label: 'API Question', icon: MessageSquare, value: 'API Question' },
    { id: 'feature', label: 'Feature Request', icon: Sparkles, value: 'Feature Request' },
  ],
  Provider: [
    { id: 'listing', label: 'Listing Help', icon: Store, value: 'Listing Help' },
    { id: 'payout', label: 'Payout Issue', icon: DollarSign, value: 'Payout Issue' },
    { id: 'analytics', label: 'Analytics Question', icon: BarChart3, value: 'Analytics Question' },
  ],
  Enterprise: [
    { id: 'demo', label: 'Schedule Demo', icon: Calendar, value: 'Schedule Demo' },
    { id: 'custom', label: 'Custom Plan', icon: Building2, value: 'Custom Plan' },
    { id: 'security', label: 'Security / Compliance', icon: Shield, value: 'Security / Compliance' },
  ],
  General: [
    { id: 'partnership', label: 'Partnership', icon: Handshake, value: 'Partnership' },
    { id: 'press', label: 'Press / Media', icon: Newspaper, value: 'Press / Media' },
    { id: 'legal', label: 'Legal', icon: Scale, value: 'Legal' },
    { id: 'other', label: 'Other', icon: HelpCircle, value: 'Other' },
  ],
};

const URGENCY_STEP = {
  id: 'urgency',
  title: 'How soon do you need a response?',
  subtitle: 'We typically respond within 24 hours',
  options: [
    { id: 'immediate', label: 'Today / urgent', icon: Zap, value: 'Urgent' },
    { id: 'week', label: 'This week', icon: Calendar, value: 'This week' },
    { id: 'general', label: 'No rush', icon: Mail, value: 'General' },
  ],
};

function getSteps(inquiryType: string | undefined) {
  const steps: { id: string; title: string; subtitle: string; options: { id: string; label: string; icon: React.ElementType; value: string }[] }[] = [
    INQUIRY_STEP,
  ];
  if (inquiryType && CATEGORY_OPTIONS[inquiryType]) {
    steps.push({
      id: 'category',
      title: 'What do you need help with?',
      subtitle: 'Helps us route to the right team',
      options: CATEGORY_OPTIONS[inquiryType],
    });
  }
  steps.push(URGENCY_STEP);
  return steps;
}

export function ContactQuiz() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sourcePage = searchParams?.get('source') ?? '';
  const urlCategory = searchParams?.get('category') ?? '';
  const reportType = searchParams?.get('report_type') ?? '';

  const inquiryType = answers.inquiry;
  const steps = useMemo(() => getSteps(inquiryType), [inquiryType]);
  const totalSteps = steps.length + 1;
  const progress = ((step + 1) / totalSteps) * 100;
  const isFormStep = step === steps.length;
  const currentStepData = steps[step];

  useEffect(() => {
    if (urlCategory && !answers.category) {
      setAnswers((prev) => ({ ...prev, category: urlCategory }));
    }
  }, [urlCategory, answers.category]);

  function handleSelect(stepId: string, value: string) {
    setAnswers((prev) => {
      const next = { ...prev, [stepId]: value };
      if (stepId === 'inquiry') {
        delete next.category;
      }
      return next;
    });
  }

  function handleNext() {
    if (isFormStep) {
      handleSubmit();
    } else {
      setStep((s) => Math.min(s + 1, steps.length));
    }
  }

  function handleBack() {
    setStep((s) => Math.max(s - 1, 0));
    setError(null);
  }

  async function handleSubmit() {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const inquiryTypeVal = answers.inquiry || 'General';
      const categoryVal = answers.category || (urlCategory || 'Other');
      const urgencyVal = answers.urgency || 'General';
      const subject = [inquiryTypeVal, categoryVal, urgencyVal].filter(Boolean).join(' | ');

      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim() || undefined,
          email: email.trim(),
          company: company.trim() || undefined,
          message: message.trim() || undefined,
          inquiry_type: inquiryTypeVal,
          category: categoryVal,
          urgency: urgencyVal,
          subject: subject || 'Contact form',
          source_page: sourcePage || undefined,
          source_url: typeof window !== 'undefined' ? window.location.href : undefined,
          report_type: reportType || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? 'Failed to send');
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="mx-auto max-w-md text-center">
        <div className="rounded-2xl border border-green-500/30 bg-green-500/5 dark:bg-green-500/10 p-8 sm:p-12">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-500/20">
            <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-xl font-semibold text-foreground">Thank you!</h3>
          <p className="mt-2 text-muted-foreground">
            We&apos;ve received your message and will get back to you within 24 hours on business days.
          </p>
        </div>
      </div>
    );
  }

  const canProceed = isFormStep
    ? email?.includes('@')
    : answers[currentStepData?.id ?? ''] != null;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-10">
        <div className="flex justify-between text-xs font-medium text-muted-foreground mb-2">
          <span>Step {step + 1} of {totalSteps}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="min-h-[320px]">
        {!isFormStep && currentStepData && (
          <div className="text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {currentStepData.title}
            </h2>
            <p className="mt-2 text-muted-foreground">{currentStepData.subtitle}</p>
            <div
              className={cn(
                'mt-8 grid gap-4 sm:gap-6',
                currentStepData.options.length === 3
                  ? 'grid-cols-1 sm:grid-cols-3'
                  : currentStepData.options.length === 4
                    ? 'grid-cols-2 sm:grid-cols-4'
                    : 'grid-cols-2 sm:grid-cols-4'
              )}
            >
              {currentStepData.options.map((opt) => {
                const Icon = opt.icon;
                const selected = answers[currentStepData.id] === opt.value;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelect(currentStepData.id, opt.value)}
                    className={cn(
                      'group flex flex-col items-center gap-3 rounded-xl border-2 p-6 transition-all duration-200',
                      'hover:border-primary/50 hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                      selected
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-card'
                    )}
                  >
                    <div
                      className={cn(
                        'flex h-12 w-12 items-center justify-center rounded-full transition-colors',
                        selected ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
                      )}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <span
                      className={cn(
                        'text-center text-sm font-medium',
                        selected ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'
                      )}
                    >
                      {opt.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {isFormStep && (
          <div className="text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Almost there
            </h2>
            <p className="mt-2 text-muted-foreground">
              Leave your details and we&apos;ll reach out shortly.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleNext();
              }}
              className="mx-auto mt-8 max-w-md space-y-5"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 text-left">
                  <Label htmlFor="quiz-name">Name</Label>
                  <Input
                    id="quiz-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    maxLength={200}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2 text-left">
                  <Label htmlFor="quiz-email">Email *</Label>
                  <Input
                    id="quiz-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="h-11"
                  />
                </div>
              </div>
              <div className="space-y-2 text-left">
                <Label htmlFor="quiz-company">Company (optional)</Label>
                <Input
                  id="quiz-company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Your company"
                  maxLength={200}
                  className="h-11"
                />
              </div>
              <div className="space-y-2 text-left">
                <Label htmlFor="quiz-message">Message (optional)</Label>
                <Textarea
                  id="quiz-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Anything else we should know?"
                  rows={3}
                  maxLength={5000}
                  className="resize-y"
                />
              </div>
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
            </form>
          </div>
        )}
      </div>

      <div className="mt-10 flex items-center justify-between gap-4">
        <Button
          type="button"
          variant="ghost"
          onClick={handleBack}
          disabled={step === 0}
          className="gap-2"
        >
          Back
        </Button>
        <Button
          type="button"
          onClick={handleNext}
          disabled={!canProceed || loading}
          className="gap-2 min-w-[140px]"
        >
          {loading ? 'Sending…' : isFormStep ? 'Send message' : 'Continue'}
          {!isFormStep && <ArrowRight className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
