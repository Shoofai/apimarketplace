'use client';

import { motion, useInView, AnimatePresence } from 'framer-motion';
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
  HelpCircle,
  Shuffle,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalHeader,
  ModalTitle,
} from '@/components/ui/modal';
import { trackFeatureDemo } from '@/lib/analytics';
import { useFeatureUnlock } from '@/hooks/useFeatureUnlock';
import { SparkleBurst } from './SparkleBurst';

const features = [
  { id: 1, name: 'AI Code Generator', icon: Sparkles, description: '2 minutes vs 2 days', longDescription: 'Our AI analyzes API docs and generates production-ready integration code in your language. Handles authentication, error handling, retries, and rate limiting automatically.', color: 'from-violet-500 to-purple-600' },
  { id: 2, name: 'One-Click Monetization', icon: CreditCard, description: 'Stripe Connect integration', longDescription: 'Connect your Stripe account once. We handle subscriptions, usage-based billing, invoicing, and payouts. Get paid globally in minutes, not months.', color: 'from-blue-500 to-cyan-600' },
  { id: 3, name: 'Universal API Gateway', icon: Network, description: 'Multi-cloud, zero config', longDescription: 'Deploy our gateway in your cloud or use ours. Automatic SSL, DDoS protection, rate limiting, caching, and load balancing across all your APIs.', color: 'from-green-500 to-emerald-600' },
  { id: 4, name: 'Smart API Router', icon: Route, description: 'AI-optimized routing', longDescription: 'Automatically routes requests to the fastest, cheapest, or most reliable API endpoint. Handles failover, circuit breaking, and retry logic.', color: 'from-orange-500 to-red-600' },
  { id: 5, name: 'Auto-Generated Docs', icon: FileText, description: 'OpenAPI → interactive docs', longDescription: 'Upload your OpenAPI/Swagger spec. We instantly generate beautiful, interactive documentation with code examples in 10 languages and a built-in playground.', color: 'from-pink-500 to-rose-600' },
  { id: 6, name: 'Usage-Based Billing', icon: DollarSign, description: 'Automated metering', longDescription: 'Track every API call automatically. Support any pricing model: per-call, tiered, volume discounts, freemium. Generate invoices and collect payment.', color: 'from-yellow-500 to-amber-600' },
  { id: 7, name: 'Developer Playground', icon: Code, description: 'Test before integration', longDescription: 'Try any API directly in your browser. No coding required. Test different parameters, see live responses, and share with your team.', color: 'from-indigo-500 to-blue-600' },
  { id: 8, name: 'Compliance Engine', icon: Shield, description: 'GDPR, SOC2 automation', longDescription: 'Automatic compliance scanning for GDPR, HIPAA, SOC2, and more. Generate audit reports, manage data retention, and handle deletion requests.', color: 'from-gray-500 to-slate-600' },
  { id: 9, name: 'Cost Optimizer', icon: TrendingDown, description: 'Auto-switch to cheaper providers', longDescription: 'AI analyzes your API usage and automatically suggests cheaper alternatives. One-click migration to save 60% on average without changing code.', color: 'from-teal-500 to-cyan-600' },
  { id: 10, name: 'Network Effects Engine', icon: Zap, description: 'Viral growth mechanics', longDescription: 'Every API provider brings developers. Every developer brings API providers. Our referral system and marketplace algorithms create exponential growth.', color: 'from-purple-500 to-pink-600' },
  { id: 11, name: 'White-Label Option', icon: Palette, description: 'Custom branding', longDescription: 'Enterprise plan includes white-labeling. Use your domain, colors, and logo. Create an internal API marketplace for your organization.', color: 'from-red-500 to-orange-600' },
];

export default function KillerFeatures() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);
  const [modalFeature, setModalFeature] = useState<typeof features[0] | null>(null);
  const [burstCardId, setBurstCardId] = useState<number | null>(null);
  const { unlocked, isUnlocked, unlock, unlockRandom, count, total, badge } = useFeatureUnlock();

  const handleUnlock = (feature: typeof features[0]) => {
    if (isUnlocked(feature.id)) {
      setModalFeature(feature);
      trackFeatureDemo({ feature_id: feature.id, feature_name: feature.name, interaction_type: 'demo_open' });
      return;
    }
    setBurstCardId(feature.id);
    unlock(feature.id);
    trackFeatureDemo({ feature_id: feature.id, feature_name: feature.name, interaction_type: 'click' });
    setTimeout(() => setBurstCardId(null), 700);
  };

  const handleSurpriseMe = () => {
    const id = unlockRandom([...unlocked]);
    if (id) {
      const feature = features.find((f) => f.id === id)!;
      setBurstCardId(id);
      setTimeout(() => setBurstCardId(null), 700);
      trackFeatureDemo({ feature_id: id, feature_name: feature.name, interaction_type: 'click' });
    }
  };

  return (
    <section ref={ref} className="bg-white py-24 dark:bg-gray-950 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          className="mb-12 text-center"
        >
          <h2 className="section-heading mb-6 text-gray-900 dark:text-white">
            Discover Our 11 Power Features
          </h2>
          <p className="section-subheading mx-auto mb-8 max-w-3xl text-gray-600 dark:text-gray-300">
            Click to reveal each feature. Find all 11 to earn the Feature Master badge.
          </p>

          {/* Progress bar & Surprise Me */}
          <div className="mx-auto flex max-w-md flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <div className="w-full sm:w-72">
              <div className="mb-2 flex justify-between text-sm font-medium text-gray-600 dark:text-gray-400">
                <span>{count}/{total} Features Discovered</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-primary-500 to-accent-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${(count / total) * 100}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
            </div>
            <button
              type="button"
              onClick={handleSurpriseMe}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <Shuffle className="h-4 w-4" />
              Surprise Me
            </button>
          </div>

          {badge && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-4"
            >
              <span className="inline-flex items-center rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
                🏆 {badge}
              </span>
            </motion.div>
          )}
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const unlockedCard = isUnlocked(feature.id);
            const showBurst = burstCardId === feature.id;

            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ delay: index * 0.05 }}
                onHoverStart={() => setHoveredFeature(feature.id)}
                onHoverEnd={() => setHoveredFeature(null)}
                className="relative"
              >
                {showBurst && <SparkleBurst />}
                <Card
                  role="button"
                  tabIndex={0}
                  onClick={() => handleUnlock(feature)}
                  onKeyDown={(e) => e.key === 'Enter' && handleUnlock(feature)}
                  className={`group relative h-full cursor-pointer overflow-hidden border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl motion-safe:hover:rotate-1 dark:border-gray-800 dark:bg-gray-900 ${
                    hoveredFeature === feature.id ? 'border-primary-400 ring-1 ring-primary-400 dark:border-primary-500 dark:ring-primary-500' : ''
                  }`}
                >
                  <AnimatePresence mode="wait">
                    {!unlockedCard ? (
                      <motion.div
                        key="mystery"
                        initial={{ rotateY: 0, opacity: 1 }}
                        exit={{ rotateY: -90, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex flex-col items-center justify-center py-8 text-center"
                      >
                        <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 text-xl font-bold text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                          {feature.id}
                        </span>
                        <HelpCircle className="mb-3 h-12 w-12 text-gray-400 dark:text-gray-500" />
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Click to reveal</p>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="revealed"
                        initial={{ rotateY: 90, opacity: 0 }}
                        animate={{ rotateY: 0, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="relative"
                      >
                        <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 transition-opacity group-hover:opacity-5`} />
                        <div className={`mb-6 inline-flex rounded-xl bg-gradient-to-br ${feature.color} p-3.5 text-white shadow-md`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <h3 className="mb-3 text-xl font-bold text-gray-900 dark:text-white">{feature.name}</h3>
                        <p className="text-base leading-relaxed text-gray-600 dark:text-gray-400">{feature.description}</p>
                        <div className="mt-4 flex items-center text-sm font-medium text-primary-600 opacity-0 transition-opacity group-hover:opacity-100 dark:text-primary-400">
                          Click to learn more →
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
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
                <div className={`rounded-lg bg-gradient-to-br ${modalFeature.color} p-2 text-white`}>
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
