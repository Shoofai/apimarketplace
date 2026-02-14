'use client';

import { useState, useEffect } from 'react';
import { WelcomeModal } from '@/components/onboarding/WelcomeModal';
import { OnboardingChecklist } from '@/components/onboarding/OnboardingChecklist';

export function DashboardOnboarding() {
  const [showWelcome, setShowWelcome] = useState(false);
  const [completed, setCompleted] = useState<boolean | null>(null);

  useEffect(() => {
    fetch('/api/user/onboarding')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.onboarding_completed === false) {
          setShowWelcome(true);
        }
        setCompleted(data?.onboarding_completed ?? true);
      })
      .catch(() => setCompleted(true));
  }, []);

  const handleComplete = () => {
    setShowWelcome(false);
    setCompleted(true);
  };

  return (
    <>
      {showWelcome && <WelcomeModal open={true} onComplete={handleComplete} />}
      {completed === false && (
        <div className="mb-6">
          <OnboardingChecklist />
        </div>
      )}
    </>
  );
}
