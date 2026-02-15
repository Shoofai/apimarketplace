'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Code2, Store, Zap, Rocket, Briefcase, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const STEPS = [
  {
    id: 'role',
    title: 'Are you a Provider or Developer?',
    subtitle: 'We\'ll personalize your onboarding',
    options: [
      { id: 'developer', label: 'Developer', icon: Code2, value: 'developer' },
      { id: 'provider', label: 'API Provider', icon: Store, value: 'provider' },
    ],
  },
  {
    id: 'useCase',
    title: "What's your use case?",
    subtitle: 'Helps us show you the right features',
    options: [
      { id: 'integrate', label: 'Integrate APIs', icon: Zap, value: 'integrate' },
      { id: 'startup', label: 'Startup / side project', icon: Rocket, value: 'startup' },
      { id: 'enterprise', label: 'Enterprise / team', icon: Briefcase, value: 'enterprise' },
    ],
  },
];

interface HeroQuizProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HeroQuiz({ open, onOpenChange }: HeroQuizProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalSteps = STEPS.length + 1;
  const progress = ((step + 1) / totalSteps) * 100;
  const isFormStep = step === STEPS.length;

  function handleSelect(stepId: string, value: string) {
    setAnswers((prev) => ({ ...prev, [stepId]: value }));
  }

  function handleNext() {
    if (isFormStep) {
      handleSubmit();
    } else {
      setStep((s) => Math.min(s + 1, STEPS.length));
    }
  }

  function handleBack() {
    setStep((s) => Math.max(s - 1, 0));
    setError(null);
  }

  function handleClose() {
    onOpenChange(false);
    setStep(0);
    setAnswers({});
    setEmail('');
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
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          subject: `Hero Quiz: ${answers.role || 'user'} | ${answers.useCase || 'signup'}`,
          message: `Quiz answers: role=${answers.role}, useCase=${answers.useCase}`,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? 'Failed');
      handleClose();
      router.push('/signup');
    } catch {
      setError('Something went wrong. Try signing up directly.');
    } finally {
      setLoading(false);
    }
  }

  const currentStepData = STEPS[step];
  const canProceed = isFormStep
    ? email?.includes('@')
    : answers[currentStepData?.id ?? ''] != null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Start building in 2 minutes</DialogTitle>
          <DialogDescription>
            A few quick questions to personalize your experience
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {/* Progress */}
          <div className="mb-6">
            <div className="flex justify-between text-xs font-medium text-muted-foreground mb-2">
              <span>Step {step + 1} of {totalSteps}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Step content */}
          {!isFormStep && currentStepData && (
            <div>
              <h3 className="text-lg font-semibold">{currentStepData.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{currentStepData.subtitle}</p>
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {currentStepData.options.map((opt) => {
                  const Icon = opt.icon;
                  const selected = answers[currentStepData.id] === opt.value;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSelect(currentStepData.id, opt.value)}
                      className={cn(
                        'flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all',
                        'hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary',
                        selected ? 'border-primary bg-primary/10' : 'border-border'
                      )}
                    >
                      <Icon className={cn('h-8 w-8', selected ? 'text-primary' : 'text-muted-foreground')} />
                      <span className={cn('text-sm font-medium', selected ? 'text-foreground' : 'text-muted-foreground')}>
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {isFormStep && (
            <div>
              <h3 className="text-lg font-semibold">Almost there</h3>
              <p className="text-sm text-muted-foreground mt-1">Enter your email to create your free account</p>
              <div className="mt-4 space-y-2">
                <Label htmlFor="hero-quiz-email">Email</Label>
                <Input
                  id="hero-quiz-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="h-11"
                  onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                />
                {error && <p className="text-sm text-destructive">{error}</p>}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 flex justify-between gap-4">
            <Button variant="ghost" onClick={handleBack} disabled={step === 0}>
              Back
            </Button>
            <Button onClick={handleNext} disabled={!canProceed || loading} className="gap-2">
              {loading ? 'Sending…' : isFormStep ? 'Create account' : 'Continue'}
              {!isFormStep && <ArrowRight className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
