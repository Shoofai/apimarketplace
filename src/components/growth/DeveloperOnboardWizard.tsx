'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, ArrowRight, ArrowLeft, Check, Code2, Terminal, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'java', label: 'Java' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
] as const;

const FRAMEWORKS = {
  javascript: ['Node.js', 'Express', 'Next.js', 'Fastify', 'NestJS'],
  typescript: ['Next.js', 'NestJS', 'Fastify', 'Express', 'Remix'],
  python: ['FastAPI', 'Django', 'Flask', 'Starlette'],
  go: ['Gin', 'Echo', 'Chi', 'Fiber'],
  rust: ['Actix', 'Axum', 'Rocket'],
  java: ['Spring Boot', 'Quarkus', 'Micronaut'],
  php: ['Laravel', 'Symfony', 'Slim'],
  ruby: ['Rails', 'Sinatra'],
} as const;

const EXPERIENCE_LEVELS = [
  { value: 'beginner', label: 'Beginner', desc: 'Learning to code' },
  { value: 'intermediate', label: 'Intermediate', desc: '1–3 years experience' },
  { value: 'senior', label: 'Senior', desc: '3–7 years experience' },
  { value: 'staff', label: 'Staff / Principal', desc: '7+ years experience' },
] as const;

type Language = (typeof LANGUAGES)[number]['value'];

interface DeveloperOnboardWizardProps {
  onComplete?: () => void;
}

export function DeveloperOnboardWizard({ onComplete }: DeveloperOnboardWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [language, setLanguage] = useState<Language>('typescript');
  const [framework, setFramework] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [useCase, setUseCase] = useState('');
  const [githubUsername, setGithubUsername] = useState('');
  const [referredBy, setReferredBy] = useState('');

  const STEPS = [
    { title: 'Pick your language', icon: Code2 },
    { title: 'Your experience', icon: Terminal },
    { title: "What you're building", icon: Zap },
  ];

  const saveAndContinue = async () => {
    setError(null);
    setLoading(true);

    try {
      const payload: Record<string, unknown> = {};

      if (step === 0) {
        payload.preferred_language = language;
        payload.primary_language = language;
        if (framework) payload.preferred_framework = framework;
      }
      if (step === 1) {
        if (experienceLevel) payload.experience_level = experienceLevel;
        if (githubUsername) payload.github_username = githubUsername;
      }
      if (step === 2) {
        if (useCase) payload.use_case = useCase;
        if (referredBy) payload.referred_by = referredBy;
      }

      if (Object.keys(payload).length > 0) {
        const res = await fetch('/api/developer/ensure-profile', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? 'Save failed');
      }

      if (step < STEPS.length - 1) {
        setStep((s) => s + 1);
      } else {
        onComplete?.();
        router.push('/dashboard');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const skipToEnd = () => {
    onComplete?.();
    router.push('/dashboard');
  };

  return (
    <div className="max-w-lg mx-auto space-y-8">
      {/* Progress */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="flex items-center gap-2">
              {i > 0 && (
                <div className={cn('h-px flex-1 min-w-[24px]', i <= step ? 'bg-primary' : 'bg-border')} />
              )}
              <div
                className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-full border-2 text-xs font-medium transition-colors',
                  i < step
                    ? 'bg-primary border-primary text-primary-foreground'
                    : i === step
                    ? 'border-primary text-primary'
                    : 'border-border text-muted-foreground'
                )}
              >
                {i < step ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              </div>
            </div>
          );
        })}
      </div>

      <div>
        <h2 className="text-xl font-semibold">{STEPS[step].title}</h2>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 text-destructive text-sm p-3">{error}</div>
      )}

      {/* Step 0: Language + framework */}
      {step === 0 && (
        <div className="space-y-5">
          <div>
            <Label className="text-sm font-medium">Primary language</Label>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {LANGUAGES.map((l) => (
                <button
                  key={l.value}
                  type="button"
                  onClick={() => { setLanguage(l.value); setFramework(''); }}
                  className={cn(
                    'rounded-lg border px-2 py-2 text-sm font-medium transition',
                    language === l.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:bg-accent'
                  )}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="framework" className="text-sm font-medium">
              Preferred framework <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {(FRAMEWORKS[language] ?? []).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFramework(framework === f ? '' : f)}
                  className={cn(
                    'rounded-full border px-3 py-1 text-sm transition',
                    framework === f
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:bg-accent'
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 1: Experience + GitHub */}
      {step === 1 && (
        <div className="space-y-5">
          <div>
            <Label className="text-sm font-medium">Experience level</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {EXPERIENCE_LEVELS.map((lvl) => (
                <button
                  key={lvl.value}
                  type="button"
                  onClick={() => setExperienceLevel(lvl.value)}
                  className={cn(
                    'rounded-lg border px-3 py-3 text-left transition',
                    experienceLevel === lvl.value
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:bg-accent'
                  )}
                >
                  <div className="text-sm font-medium">{lvl.label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{lvl.desc}</div>
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="github" className="text-sm font-medium">
              GitHub username <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input
              id="github"
              value={githubUsername}
              onChange={(e) => setGithubUsername(e.target.value)}
              placeholder="your-username"
              className="mt-1"
            />
          </div>
        </div>
      )}

      {/* Step 2: Use case + referral */}
      {step === 2 && (
        <div className="space-y-5">
          <div>
            <Label htmlFor="useCase" className="text-sm font-medium">What are you building?</Label>
            <Textarea
              id="useCase"
              value={useCase}
              onChange={(e) => setUseCase(e.target.value)}
              placeholder="e.g. A fintech app that processes payments, a chatbot that uses AI APIs..."
              rows={3}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="referredBy" className="text-sm font-medium">
              Referral code <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input
              id="referredBy"
              value={referredBy}
              onChange={(e) => setReferredBy(e.target.value)}
              placeholder="abc123"
              className="mt-1"
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-2">
        <div className="flex gap-2">
          {step > 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep((s) => s - 1)}
              disabled={loading}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            onClick={skipToEnd}
            disabled={loading}
            className="text-muted-foreground"
          >
            Skip
          </Button>
        </div>
        <Button onClick={saveAndContinue} disabled={loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-1" />
          ) : step < STEPS.length - 1 ? (
            <ArrowRight className="h-4 w-4 mr-1" />
          ) : (
            <Check className="h-4 w-4 mr-1" />
          )}
          {step < STEPS.length - 1 ? 'Continue' : 'Go to dashboard'}
        </Button>
      </div>
    </div>
  );
}
