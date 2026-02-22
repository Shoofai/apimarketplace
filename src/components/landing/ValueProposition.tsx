'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, TrendingUp, Code2, BarChart3 } from 'lucide-react';
import { Counter } from '@/components/ui/counter';

const valueProps = {
  providers: {
    title: 'For API Providers',
    subtitle: 'Monetize Faster, Scale Bigger',
    benefits: [
      'One-click Stripe Connect integration - get paid in 5 minutes',
      'AI-generated interactive docs from your OpenAPI spec',
      'Usage-based billing with automatic metering',
      'Built-in rate limiting and analytics dashboard',
      'Get discovered by developers in one marketplace',
    ],
    metrics: [
      { value: 90, suffix: '%', label: 'faster time-to-revenue' },
      { value: 10, suffix: 'X', label: 'more API consumers' },
      { value: 0, prefix: '$', suffix: '', label: 'infrastructure cost' },
    ],
  },
  developers: {
    title: 'For Developers',
    subtitle: 'Ship Faster, Code Smarter',
    benefits: [
      'AI generates working integration code in 2 minutes',
      'Test any API with interactive playground before buying',
      'Switch providers without changing a single line of code',
      'Auto-optimize costs across API alternatives',
      'One authentication flow for all APIs',
    ],
    metrics: [
      { value: 2, suffix: ' min', label: 'vs 2 days integration' },
      { value: 75, suffix: '%', label: 'cost reduction' },
      { value: 0, suffix: '', label: 'vendor lock-in' },
    ],
  },
  enterprises: {
    title: 'For Enterprises',
    subtitle: 'Control Everything, Risk Nothing',
    benefits: [
      'Complete visibility into all API usage across teams',
      'Policy engine enforces security and compliance rules',
      'Visibility and optimization to reduce API costs',
      'Built-in SOC2, HIPAA, GDPR compliance scanning',
      'White-label option for internal developer portals',
    ],
    metrics: [
      { value: 100, suffix: '%', label: 'API visibility' },
      { value: 60, suffix: '%', label: 'cost reduction' },
      { value: 0, suffix: '', label: 'security breaches' },
    ],
  },
};

function TypingCode({ code, isActive }: { code: string; isActive: boolean }) {
  const [display, setDisplay] = useState('');
  useEffect(() => {
    if (!isActive) {
      setDisplay('');
      return;
    }
    let i = 0;
    const t = setInterval(() => {
      if (i <= code.length) {
        setDisplay(code.slice(0, i));
        i++;
      } else {
        clearInterval(t);
      }
    }, 30);
    return () => clearInterval(t);
  }, [code, isActive]);

  return (
    <pre className="overflow-x-auto text-sm leading-relaxed text-gray-100">
      <code>
        {display}
        {isActive && display.length < code.length && (
          <span className="animate-pulse bg-primary-400">|</span>
        )}
      </code>
    </pre>
  );
}

const codeSnippet = `// One SDK, any API – generated in 2 min
const client = await apiMarketplace
  .getClient('stripe', 'v1');

const balance = await client
  .get('/v1/balance');

// Usage metered automatically
// Billing handled for you`;

export default function ValueProposition() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const [activeTab, setActiveTab] = useState('providers');

  return (
    <section ref={ref} className="bg-gradient-to-br from-gray-50 to-gray-100 py-24 dark:from-gray-950 dark:to-gray-900 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          className="mb-12 text-center"
        >
          <h2 className="section-heading mb-6 text-gray-900 dark:text-white">
            Built for Your Workflow
          </h2>
          <p className="section-subheading mx-auto max-w-2xl text-gray-600 dark:text-gray-300">
            The only platform that solves API discovery, integration, monetization, and governance
            in one place.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs defaultValue="providers" className="w-full" onValueChange={(v) => setActiveTab(v)}>
            <div className="sticky top-16 z-20 -mx-4 bg-transparent px-4 py-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
              <TabsList className="mx-auto mb-8 grid w-full max-w-3xl grid-cols-3">
                <TabsTrigger value="providers" className="text-sm sm:text-base">
                  Providers
                </TabsTrigger>
                <TabsTrigger value="developers" className="text-sm sm:text-base">
                  Developers
                </TabsTrigger>
                <TabsTrigger value="enterprises" className="text-sm sm:text-base">
                  Enterprises
                </TabsTrigger>
              </TabsList>
            </div>

            {Object.entries(valueProps).map(([key, content]) => (
              <TabsContent key={key} value={key} className="mt-0">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="grid gap-8 lg:grid-cols-2 lg:items-center"
                >
                  <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg ring-1 ring-gray-200/50 dark:border-gray-800 dark:bg-gray-900 dark:ring-gray-800/50">
                    <h3 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">{content.title}</h3>
                    <p className="mb-8 text-lg leading-relaxed text-gray-600 dark:text-gray-300">{content.subtitle}</p>
                    <ul className="space-y-4">
                      {content.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <CheckCircle2 className="mt-0.5 h-6 w-6 flex-shrink-0 text-green-600 dark:text-green-400" />
                          <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-col gap-6 py-6">
                    <div className="grid gap-4">
                      {content.metrics.map((metric, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.1 }}
                          className="rounded-xl border border-gray-200 bg-gradient-to-br from-gray-100 to-gray-50 p-6 text-center dark:border-gray-600 dark:from-gray-800 dark:to-gray-900"
                        >
                          <p className="text-2xl font-black text-gray-900 dark:text-white">
                            {metric.value > 0 ? (
                              <>
                                <Counter end={metric.value} prefix={'prefix' in metric ? metric.prefix : undefined} suffix={metric.suffix} />
                                {' '}
                                {metric.label}
                              </>
                            ) : (
                              <>Zero {metric.label}</>
                            )}
                          </p>
                        </motion.div>
                      ))}
                    </div>

                    {/* Tab-specific visuals */}
                    {key === 'providers' && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-1 flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-800 dark:bg-gray-900"
                      >
                        <div className="mb-4 flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-green-600" />
                          <span className="font-semibold text-gray-900 dark:text-white">Revenue growth</span>
                        </div>
                        <div className="flex h-32 items-end justify-around gap-2">
                          {[30, 50, 45, 70, 65, 85, 80, 100].map((h, i) => (
                            <motion.div
                              key={i}
                              initial={{ height: 0 }}
                              animate={{ height: `${h}%` }}
                              transition={{ delay: 0.5 + i * 0.08, duration: 0.5 }}
                              className="w-full max-w-8 rounded-t bg-gradient-to-t from-primary-600 to-primary-400"
                            />
                          ))}
                        </div>
                        <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">Exponential growth</p>
                      </motion.div>
                    )}

                    {key === 'developers' && (
                      <div className="flex flex-1 flex-col rounded-2xl border border-gray-200 bg-gray-900 p-4 shadow-lg dark:border-gray-700">
                        <div className="mb-3 flex items-center gap-2 border-b border-gray-700 pb-2">
                          <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                          <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                          <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
<span className="ml-2 flex items-center gap-1 text-xs text-gray-400">
                          <Code2 className="h-3 w-3" /> integration.js
                          </span>
                        </div>
                        <TypingCode code={codeSnippet} isActive={activeTab === 'developers'} />
                      </div>
                    )}

                    {key === 'enterprises' && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-1 flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-800 dark:bg-gray-900"
                      >
                        <div className="mb-4 flex items-center gap-2">
                          <BarChart3 className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                          <span className="font-semibold text-gray-900 dark:text-white">Cost savings</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="rounded-lg bg-gray-100 p-4 dark:bg-gray-800">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Before</p>
                            <p className="text-xl font-bold text-gray-700 dark:text-gray-300">$1.2M</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">API spend/year</p>
                          </div>
                          <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
                            <p className="text-xs text-green-600 dark:text-green-400">After</p>
                            <p className="text-xl font-bold text-green-700 dark:text-green-400">
                              $<Counter end={480} suffix="K" />
                            </p>
                            <p className="text-xs text-green-600 dark:text-green-400">60% saved</p>
                          </div>
                        </div>
                        <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">Real-time dashboard</p>
                      </motion.div>
                    )}

                  </div>
                </motion.div>
              </TabsContent>
            ))}
          </Tabs>
        </motion.div>
      </div>
    </section>
  );
}
