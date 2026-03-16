'use client';

import { useEffect, useRef, useState } from 'react';
import { EnterpriseROICalculator } from '@/components/growth/EnterpriseROICalculator';

const CALENDLY_URL =
  process.env.NEXT_PUBLIC_CALENDLY_URL ?? 'https://calendly.com/apimarketplace/enterprise-demo';

declare global {
  interface Window {
    Calendly?: {
      initPopupWidget: (opts: { url: string }) => void;
      closePopupWidget: () => void;
    };
  }
}

export function EnterprisePageClient() {
  const [demoScheduled, setDemoScheduled] = useState(false);
  const [enterpriseId, setEnterpriseId] = useState<string | undefined>();
  const [stakeholderId, setStakeholderId] = useState<string | undefined>();
  const calendlyScriptLoaded = useRef(false);

  // Load Calendly inline widget script
  useEffect(() => {
    if (calendlyScriptLoaded.current) return;
    calendlyScriptLoaded.current = true;

    const link = document.createElement('link');
    link.href = 'https://assets.calendly.com/assets/external/widget.css';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    document.head.appendChild(script);
  }, []);

  // Listen for Calendly event_scheduled postMessage
  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      if (
        e.origin === 'https://calendly.com' &&
        e.data?.event === 'calendly.event_scheduled'
      ) {
        const scheduledAt =
          e.data?.payload?.event?.start_time ?? new Date().toISOString();

        // Update enterprise profile stage
        fetch('/api/enterprise/schedule-demo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ enterprise_id: enterpriseId, stakeholder_id: stakeholderId, scheduled_at: scheduledAt }),
        }).catch(() => {});

        setDemoScheduled(true);
        window.Calendly?.closePopupWidget();
      }
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [enterpriseId, stakeholderId]);

  const openCalendly = () => {
    if (window.Calendly) {
      window.Calendly.initPopupWidget({ url: CALENDLY_URL });
    } else {
      // Fallback: open in new tab
      window.open(CALENDLY_URL, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <section className="py-16 px-4 bg-muted/30">
      <div className="mx-auto max-w-5xl space-y-16">
        {/* ROI Calculator */}
        <EnterpriseROICalculator
          enterpriseId={enterpriseId}
          stakeholderId={stakeholderId}
          onDemoClick={openCalendly}
        />

        {/* Demo Scheduling */}
        <div id="demo" className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="px-6 pt-6 pb-4 border-b border-border">
            <h3 className="text-lg font-semibold">Book a 15-minute demo</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              No sales pitch. We will show you the platform with your numbers and answer your team&apos;s questions.
            </p>
          </div>

          <div className="p-6">
            {demoScheduled ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">✅</div>
                <h4 className="text-lg font-semibold mb-2">Demo scheduled!</h4>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  You will receive a calendar invite shortly. We look forward to meeting you.
                </p>
                <a
                  href="/signup?ref=enterprise_demo"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition"
                >
                  Start your free account while you wait →
                </a>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
                {/* What to expect */}
                <ul className="flex-1 space-y-3 text-sm">
                  {[
                    'Live walkthrough of the governance dashboard',
                    'Your personalised cost-savings breakdown',
                    'Pilot setup — live in under an hour',
                    'Q&A with your team — unlimited attendees',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="text-primary mt-0.5 shrink-0">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="flex flex-col items-center gap-3">
                  <button
                    onClick={openCalendly}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition"
                  >
                    Pick a time →
                  </button>
                  <p className="text-xs text-muted-foreground">Usually responds within 1 business day</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
