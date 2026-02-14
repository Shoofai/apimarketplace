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
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalHeader,
  ModalTitle,
  ModalTrigger,
} from '@/components/ui/modal';
import { trackFeatureDemo } from '@/lib/analytics';

const features = [
  {
    id: 1,
    name: 'AI Code Generator',
    icon: Sparkles,
    description: '2 minutes vs 2 days',
    longDescription:
      'Our AI analyzes API docs and generates production-ready integration code in your language. Handles authentication, error handling, retries, and rate limiting automatically.',
    color: 'from-violet-500 to-purple-600',
  },
  {
    id: 2,
    name: 'One-Click Monetization',
    icon: CreditCard,
    description: 'Stripe Connect integration',
    longDescription:
      'Connect your Stripe account once. We handle subscriptions, usage-based billing, invoicing, and payouts. Get paid globally in minutes, not months.',
    color: 'from-blue-500 to-cyan-600',
  },
  {
    id: 3,
    name: 'Universal API Gateway',
    icon: Network,
    description: 'Multi-cloud, zero config',
    longDescription:
      'Deploy our gateway in your cloud or use ours. Automatic SSL, DDoS protection, rate limiting, caching, and load balancing across all your APIs.',
    color: 'from-green-500 to-emerald-600',
  },
  {
    id: 4,
    name: 'Smart API Router',
    icon: Route,
    description: 'AI-optimized routing',
    longDescription:
      'Automatically routes requests to the fastest, cheapest, or most reliable API endpoint. Handles failover, circuit breaking, and retry logic.',
    color: 'from-orange-500 to-red-600',
  },
  {
    id: 5,
    name: 'Auto-Generated Docs',
    icon: FileText,
    description: 'OpenAPI → interactive docs',
    longDescription:
      'Upload your OpenAPI/Swagger spec. We instantly generate beautiful, interactive documentation with code examples in 10 languages and a built-in playground.',
    color: 'from-pink-500 to-rose-600',
  },
  {
    id: 6,
    name: 'Usage-Based Billing',
    icon: DollarSign,
    description: 'Automated metering',
    longDescription:
      'Track every API call automatically. Support any pricing model: per-call, tiered, volume discounts, freemium. Generate invoices and collect payment.',
    color: 'from-yellow-500 to-amber-600',
  },
  {
    id: 7,
    name: 'Developer Playground',
    icon: Code,
    description: 'Test before integration',
    longDescription:
      'Try any API directly in your browser. No coding required. Test different parameters, see live responses, and share with your team.',
    color: 'from-indigo-500 to-blue-600',
  },
  {
    id: 8,
    name: 'Compliance Engine',
    icon: Shield,
    description: 'GDPR, SOC2 automation',
    longDescription:
      'Automatic compliance scanning for GDPR, HIPAA, SOC2, and more. Generate audit reports, manage data retention, and handle deletion requests.',
    color: 'from-gray-500 to-slate-600',
  },
  {
    id: 9,
    name: 'Cost Optimizer',
    icon: TrendingDown,
    description: 'Auto-switch to cheaper providers',
    longDescription:
      'AI analyzes your API usage and automatically suggests cheaper alternatives. One-click migration to save 60% on average without changing code.',
    color: 'from-teal-500 to-cyan-600',
  },
  {
    id: 10,
    name: 'Network Effects Engine',
    icon: Zap,
    description: 'Viral growth mechanics',
    longDescription:
      'Every API provider brings developers. Every developer brings API providers. Our referral system and marketplace algorithms create exponential growth.',
    color: 'from-purple-500 to-pink-600',
  },
  {
    id: 11,
    name: 'White-Label Option',
    icon: Palette,
    description: 'Custom branding',
    longDescription:
      'Enterprise plan includes white-labeling. Use your domain, colors, and logo. Create an internal API marketplace for your organization.',
    color: 'from-red-500 to-orange-600',
  },
];

export default function KillerFeatures() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const handleFeatureInteraction = async (
    featureId: number,
    featureName: string,
    type: 'view' | 'hover' | 'click' | 'demo_open'
  ) => {
    await trackFeatureDemo({
      feature_id: featureId,
      feature_name: featureName,
      interaction_type: type,
    });
  };

  return (
    <section ref={ref} className="bg-white py-24 dark:bg-gray-950 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          className="mb-16 text-center"
        >
          <h2 className="mb-4 font-heading text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
            11 Features That Change Everything
          </h2>
          <p className="mx-auto max-w-3xl text-xl leading-relaxed text-gray-600 dark:text-gray-300">
            Each feature alone would be a product. Together, they create the most powerful API
            platform ever built.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Modal key={feature.id}>
                <ModalTrigger asChild>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                    transition={{ delay: index * 0.05 }}
                    onHoverStart={() => {
                      setHoveredFeature(feature.id);
                      handleFeatureInteraction(feature.id, feature.name, 'hover');
                    }}
                    onHoverEnd={() => setHoveredFeature(null)}
                    onClick={() => handleFeatureInteraction(feature.id, feature.name, 'demo_open')}
                  >
                    <Card
                      className={`group relative h-full cursor-pointer overflow-hidden border border-gray-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl dark:border-gray-800 dark:bg-gray-900 ${
                        hoveredFeature === feature.id ? 'border-primary-400 ring-1 ring-primary-400 dark:border-primary-500 dark:ring-primary-500' : ''
                      }`}
                    >
                      {/* Gradient Background on Hover */}
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 transition-opacity group-hover:opacity-5`}
                      />

                      {/* Content */}
                      <div className="relative">
                        <div
                          className={`mb-6 inline-flex rounded-xl bg-gradient-to-br ${feature.color} p-3.5 text-white shadow-md`}
                        >
                          <Icon className="h-6 w-6" />
                        </div>
                        <h3 className="mb-3 text-xl font-bold text-gray-900 dark:text-white">{feature.name}</h3>
                        <p className="text-base leading-relaxed text-gray-600 dark:text-gray-400">{feature.description}</p>

                        {/* Hover indicator */}
                        <div className="mt-4 flex items-center text-sm font-medium text-primary-600 opacity-0 transition-opacity group-hover:opacity-100 dark:text-primary-400">
                          Click to learn more →
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                </ModalTrigger>

                <ModalContent className="max-w-2xl">
                  <ModalHeader>
                    <ModalTitle className="flex items-center gap-3">
                      <div className={`rounded-lg bg-gradient-to-br ${feature.color} p-2 text-white`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      {feature.name}
                    </ModalTitle>
                    <ModalDescription className="mt-4 text-base">
                      {feature.longDescription}
                    </ModalDescription>
                  </ModalHeader>

                  {/* Placeholder for demo/video */}
                  <div className="mt-6 flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-12 dark:border-gray-700 dark:bg-gray-800">
                    <div className="text-center">
                      <div className="mb-2 text-5xl">🎥</div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Demo video or interactive preview</p>
                    </div>
                  </div>
                </ModalContent>
              </Modal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
