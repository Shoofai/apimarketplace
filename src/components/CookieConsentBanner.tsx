'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const CONSENT_KEY = 'cookie-consent-given';

const defaultPreferences = {
  essential: true,
  functional: true,
  analytics: true,
  performance: true,
  marketing: true,
};

const essentialOnly = {
  essential: true,
  functional: false,
  analytics: false,
  performance: false,
  marketing: false,
};

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window === 'undefined') return;
    const given = localStorage.getItem(CONSENT_KEY);
    if (!given) setVisible(true);
  }, []);

  const hide = () => {
    setVisible(false);
    localStorage.setItem(CONSENT_KEY, 'true');
  };

  const logConsent = async (preferences: Record<string, boolean>) => {
    try {
      await fetch('/api/gdpr/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consent_preferences: preferences }),
      });
    } catch {
      // Non-blocking
    }
  };

  const handleAccept = () => {
    localStorage.setItem('cookie-preferences', JSON.stringify(defaultPreferences));
    logConsent(defaultPreferences);
    hide();
  };

  const handleDecline = () => {
    localStorage.setItem('cookie-preferences', JSON.stringify(essentialOnly));
    logConsent(essentialOnly);
    hide();
  };

  const handleCustomize = () => {
    hide();
  };

  if (!mounted || !visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card p-4 shadow-lg md:px-6"
    >
      <div className="container mx-auto flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-muted-foreground">
          We use cookies to provide authentication, preferences, and analytics. By continuing you agree to our{' '}
          <Link href="/legal/cookies" className="text-primary underline hover:no-underline">
            Cookie Policy
          </Link>
          .
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" onClick={handleAccept}>
            Accept
          </Button>
          <Link href="/legal/cookie-settings" onClick={handleCustomize}>
            <Button size="sm" variant="outline">
              Customize
            </Button>
          </Link>
          <Button size="sm" variant="ghost" onClick={handleDecline}>
            Decline
          </Button>
        </div>
      </div>
    </div>
  );
}
