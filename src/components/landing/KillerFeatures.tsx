'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import {
  Sparkles,
  CreditCard,
  Network,
  Route,
  FileText,
  DollarSign,
  Code,
  Shield,
  TrendingDown,
  Zap,
  Palette,
  ClipboardCheck,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalHeader,
  ModalTitle,
} from '@/components/ui/modal';
import { cn } from '@/lib/utils';
import { trackFeatureDemo } from '@/lib/analytics';

const PRIMARY_GRADIENTS = [
  'from-primary-500 to-primary-700',
  'from-primary-400 to-primary-600',
  'from-primary-600 to-primary-800',
] as const;
const PRIMARY_GRADIENT_DARK = 'dark:from-primary-400 dark:to-primary-600';

const features = [
  { id: 1, name: 'AI Code Generator', icon: Sparkles, description: '2 minutes vs 2 days', longDescription: 'Our AI analyzes API docs and generates production-ready integration code in your language. Handles authentication, error handling, retries, and rate limiting automatically.' },
  { id: 2, name: 'One-Click Monetization', icon: CreditCard, description: 'Stripe Connect integration', longDescription: 'Connect your Stripe account once. We handle subscriptions, usage-based billing, invoicing, and payouts. Get paid globally in minutes, not months.' },
  { id: 3, name: 'Universal API Gateway', icon: Network, description: 'Multi-cloud, zero config', longDescription: 'Deploy our gateway in your cloud or use ours. Automatic SSL, DDoS protection, rate limiting, caching, and load balancing across all your APIs.' },
  { id: 4, name: 'Smart API Router', icon: Route, description: 'AI-optimized routing', longDescription: 'Automatically routes requests to the fastest, cheapest, or most reliable API endpoint. Handles failover, circuit breaking, and retry logic.' },
  { id: 5, name: 'Auto-Generated Docs', icon: FileText, description: 'OpenAPI → interactive docs', longDescription: 'Upload your OpenAPI/Swagger spec. We instantly generate beautiful, interactive documentation with code examples in 10 languages and a built-in playground.' },
  { id: 6, name: 'Usage-Based Billing', icon: DollarSign, description: 'Automated metering', longDescription: 'Track every API call automatically. Support any pricing model: per-call, tiered, volume discounts, freemium. Generate invoices and collect payment.' },
  { id: 7, name: 'Developer Playground', icon: Code, description: 'Test before integration', longDescription: 'Try any API directly in your browser. No coding required. Test different parameters, see live responses, and share with your team.' },
  { id: 8, name: 'Compliance Engine', icon: Shield, description: 'GDPR, SOC2 automation', longDescription: 'Automatic compliance scanning for GDPR, HIPAA, SOC2, and more. Generate audit reports, manage data retention, and handle deletion requests.' },
  { id: 9, name: 'Cost Optimizer', icon: TrendingDown, description: 'Auto-switch to cheaper providers', longDescription: 'AI analyzes your API usage and automatically suggests cheaper alternatives. One-click migration to save 60% on average without changing code.' },
  { id: 10, name: 'Network Effects Engine', icon: Zap, description: 'Viral growth mechanics', longDescription: 'Every API provider brings developers. Every developer brings API providers. Our referral system and marketplace algorithms create exponential growth.' },
  { id: 11, name: 'White-Label Option', icon: Palette, description: 'Custom branding', longDescription: 'Enterprise plan includes white-labeling. Use your domain, colors, and logo. Create an internal API marketplace for your organization.' },
  { id: 12, name: 'Production Readiness Audit', icon: ClipboardCheck, description: 'Free spec check, paid deep-dive', longDescription: 'Run a free quick audit on your OpenAPI spec for a score and top gaps. Pro and Enterprise customers get full audits with detailed reports and a ship checklist stored per API.' },
];

// Bento layout: features 1, 6, 11, 12 span 2 cols on lg
const BENTO_COL_SPAN: Record<number, 1 | 2> = {
  1: 2,
  6: 2,
  11: 2,
  12: 2,
};

function FeaturePreview({ featureId, isWide }: { featureId: number; isWide: boolean }) {
  const base = 'rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800';

  switch (featureId) {
    case 1:
      return (
        <div className={cn(base, 'p-2')}>
          <div className="space-y-1 font-mono text-[10px] text-gray-600 dark:text-gray-400">
            <div className="flex gap-1"><span className="text-primary-600 dark:text-primary-400">const</span> res = await fetch(...)</div>
            <div className="flex gap-1"><span className="text-primary-600 dark:text-primary-400">const</span> data = res.json()</div>
            <div className="h-1 w-3/4 max-w-[75%] rounded bg-primary-200 dark:bg-primary-900/50" />
          </div>
        </div>
      );
    case 2:
      return (
        <div className={cn(base, 'p-2 flex gap-1 items-center')}>
          <div className="h-6 w-8 rounded border-2 border-gray-300 dark:border-gray-600" />
          <div className="flex-1 space-y-0.5">
            <div className="h-1.5 w-full rounded bg-gray-300 dark:bg-gray-600" />
            <div className="h-1 w-2/3 max-w-[66%] rounded bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
      );
    case 3:
      return (
        <div className={cn(base, 'p-2 flex items-center justify-center gap-1')}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col items-center gap-0.5">
              <div className="h-2 w-2 rounded-full bg-primary-500" />
              {i === 2 && <div className="h-1 w-0.5 bg-primary-400" />}
            </div>
          ))}
        </div>
      );
    case 4:
      return (
        <div className={cn(base, 'p-2')}>
          <svg viewBox="0 0 40 20" className="w-full h-8 text-primary-500">
            <path d="M2 10 L12 4 L22 10 L38 6" stroke="currentColor" strokeWidth="1" fill="none" strokeDasharray="2 1" />
          </svg>
        </div>
      );
    case 5:
      return (
        <div className={cn(base, 'p-2 space-y-0.5')}>
          <div className="h-1 w-full rounded bg-gray-300 dark:bg-gray-600" />
          <div className="h-1 w-[80%] rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-1 w-3/4 max-w-[75%] rounded bg-gray-200 dark:bg-gray-700" />
        </div>
      );
    case 6:
      return (
        <div className={cn(base, 'p-2 h-full min-h-[3rem] flex items-end gap-0.5')}>
          {[40, 65, 45, 80, 55].map((pct, i) => (
            <div key={i} className="flex-1 rounded-t bg-primary-400 dark:bg-primary-600" style={{ height: `${pct}%` }} />
          ))}
        </div>
      );
    case 7:
      return (
        <div className={cn(base, 'p-2 flex gap-1')}>
          <div className="flex-1 rounded border border-gray-300 dark:border-gray-600 p-1 text-[9px] text-gray-500">GET /api/...</div>
          <div className="flex-1 rounded bg-primary-100 dark:bg-primary-900/40 p-1 text-[9px] text-primary-600 dark:text-primary-400">{'{ }'}</div>
        </div>
      );
    case 8:
      return (
        <div className={cn(base, 'p-2 flex flex-wrap gap-1')}>
          {['GDPR', 'SOC2'].map((b) => (
            <span key={b} className="rounded px-1 py-0.5 text-[8px] font-medium bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300">{b}</span>
          ))}
        </div>
      );
    case 9:
      return (
        <div className={cn(base, 'p-2')}>
          <div className="flex items-end gap-0.5 h-6">
            <div className="flex-1 rounded-t bg-gray-300 dark:bg-gray-600" style={{ height: '70%' }} />
            <div className="flex-1 rounded-t bg-primary-400 dark:bg-primary-600" style={{ height: '40%' }} />
          </div>
        </div>
      );
    case 10:
      return (
        <div className={cn(base, 'p-2 flex items-center justify-center')}>
          <div className="flex -space-x-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-4 w-4 rounded-full border-2 border-white dark:border-gray-800 bg-primary-400" />
            ))}
          </div>
        </div>
      );
    case 11:
      return (
        <div className={cn(base, 'p-2 flex gap-1')}>
          <div className="h-4 w-4 rounded-full bg-primary-500" />
          <div className="flex-1 flex gap-0.5">
            <div className="flex-1 rounded bg-primary-200 dark:bg-primary-900/50" />
            <div className="flex-1 rounded bg-primary-300 dark:bg-primary-800/50" />
          </div>
        </div>
      );
    case 12:
      return (
        <div className={cn(base, 'p-2 flex flex-col gap-1')}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-primary-500" />
              <div className="h-1 flex-1 rounded bg-gray-200 dark:bg-gray-700" />
            </div>
          ))}
        </div>
      );
    default:
      return null;
  }
}

export default function KillerFeatures() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);
  const [modalFeature, setModalFeature] = useState<typeof features[0] | null>(null);

  const handleCardClick = (feature: typeof features[0]) => {
    setModalFeature(feature);
    trackFeatureDemo({ feature_id: feature.id, feature_name: feature.name, interaction_type: 'demo_open' });
  };

  return (
    <section ref={ref} className="bg-gray-50 py-24 dark:bg-gray-950 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          className="mb-12 text-center"
        >
          <h2 className="section-heading mb-6 text-gray-900 dark:text-white">
            Discover Our 12 Power Features
          </h2>
          <p className="section-subheading mx-auto mb-8 max-w-3xl text-gray-600 dark:text-gray-300">
            Explore our 12 power features. Click any card to learn more.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 auto-rows-fr">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const colSpan = BENTO_COL_SPAN[feature.id] ?? 1;
            const isWide = colSpan === 2;

            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ delay: index * 0.05 }}
                onHoverStart={() => setHoveredFeature(feature.id)}
                onHoverEnd={() => setHoveredFeature(null)}
                className={cn(
                  'relative min-h-[240px]',
                  isWide && 'lg:col-span-2'
                )}
              >
                <Card
                  role="button"
                  tabIndex={0}
                  onClick={() => handleCardClick(feature)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCardClick(feature)}
                  className={cn(
                    'group relative h-full cursor-pointer overflow-hidden rounded-2xl border-0 bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl dark:bg-gray-900',
                    hoveredFeature === feature.id && 'ring-2 ring-primary-500/50 shadow-lg'
                  )}
                >
                  <div className="relative flex flex-col h-full">
                    <div className={cn('absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity group-hover:opacity-5', PRIMARY_GRADIENTS[index % 3], PRIMARY_GRADIENT_DARK)} />
                    <div className={cn(
                      'mb-4 flex-shrink-0',
                      isWide ? 'h-24 lg:h-28' : 'h-20'
                    )}>
                      <FeaturePreview featureId={feature.id} isWide={isWide} />
                    </div>
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        'shrink-0 inline-flex rounded-xl bg-gradient-to-br p-2.5 text-white shadow-sm',
                        PRIMARY_GRADIENTS[index % 3],
                        PRIMARY_GRADIENT_DARK,
                        isWide && 'p-3'
                      )}>
                        <Icon className={cn('h-5 w-5', isWide && 'h-6 w-6')} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className={cn(
                          'mb-1 font-bold text-gray-900 dark:text-white',
                          isWide ? 'text-lg lg:text-xl' : 'text-base'
                        )}>{feature.name}</h3>
                        <p className={cn(
                          'leading-snug text-gray-600 dark:text-gray-400',
                          isWide ? 'text-sm lg:text-base' : 'text-sm'
                        )}>{feature.description}</p>
                      </div>
                    </div>
                    <div className="mt-auto pt-3 flex items-center text-sm font-medium text-primary-600 opacity-0 transition-opacity group-hover:opacity-100 dark:text-primary-400">
                      Click to learn more →
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      <Modal open={!!modalFeature} onOpenChange={(open) => !open && setModalFeature(null)}>
        {modalFeature && (
          <ModalContent className="max-w-2xl">
            <ModalHeader>
              <ModalTitle className="flex items-center gap-3">
                <div className={cn('rounded-lg bg-gradient-to-br p-2 text-white', PRIMARY_GRADIENTS[(modalFeature.id - 1) % 3], PRIMARY_GRADIENT_DARK)}>
                  {(() => {
                    const Icon = modalFeature.icon;
                    return <Icon className="h-6 w-6" />;
                  })()}
                </div>
                {modalFeature.name}
              </ModalTitle>
              <ModalDescription className="mt-4 text-base">
                {modalFeature.longDescription}
              </ModalDescription>
            </ModalHeader>
            <div className="mt-6 flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-12 dark:border-gray-700 dark:bg-gray-800">
              <div className="text-center">
                <div className="mb-2 text-5xl">🎥</div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Demo video or interactive preview</p>
              </div>
            </div>
          </ModalContent>
        )}
      </Modal>
    </section>
  );
}
