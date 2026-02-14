'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Code, Rocket, Building, Globe, TestTube2, Zap } from 'lucide-react';
import { usePlatformName } from '@/contexts/PlatformNameContext';

interface WelcomeModalProps {
  open: boolean;
  onComplete: () => void;
}

export function WelcomeModal({ open, onComplete }: WelcomeModalProps) {
  const platformName = usePlatformName();
  const [step, setStep] = useState<'role' | 'tour'>('role');

  const handleComplete = async () => {
    try {
      await fetch('/api/user/onboarding', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ onboarding_completed: true }),
      });
    } finally {
      onComplete();
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        {step === 'role' && (
          <>
            <DialogHeader>
              <DialogTitle>Welcome to {platformName}</DialogTitle>
              <DialogDescription>What brings you here? We&apos;ll personalize your experience.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 py-4">
              <button
                type="button"
                onClick={() => setStep('tour')}
                className="flex items-center gap-3 rounded-lg border p-4 text-left hover:bg-accent transition-colors"
              >
                <Code className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-medium">I&apos;m a Developer</div>
                  <div className="text-sm text-muted-foreground">Find and integrate APIs into my applications</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setStep('tour')}
                className="flex items-center gap-3 rounded-lg border p-4 text-left hover:bg-accent transition-colors"
              >
                <Rocket className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-medium">I&apos;m an API Provider</div>
                  <div className="text-sm text-muted-foreground">Publish and monetize my APIs</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setStep('tour')}
                className="flex items-center gap-3 rounded-lg border p-4 text-left hover:bg-accent transition-colors"
              >
                <Building className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-medium">Both</div>
                  <div className="text-sm text-muted-foreground">I publish and consume APIs</div>
                </div>
              </button>
            </div>
          </>
        )}

        {step === 'tour' && (
          <>
            <DialogHeader>
              <DialogTitle>Quick Tour</DialogTitle>
              <DialogDescription>Here&apos;s where to find the main features (takes 30 seconds).</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-start gap-3">
                <Globe className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <div className="font-medium">Marketplace</div>
                  <div className="text-sm text-muted-foreground">Browse and subscribe to thousands of APIs</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <TestTube2 className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <div className="font-medium">Sandbox</div>
                  <div className="text-sm text-muted-foreground">Test any API right in your browser</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Zap className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <div className="font-medium">AI Playground</div>
                  <div className="text-sm text-muted-foreground">Generate integration code with AI</div>
                </div>
              </div>
            </div>
            <Button onClick={handleComplete} className="w-full">
              Start Exploring
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
