'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Star, Quote } from 'lucide-react';
import { Counter } from '@/components/ui/counter';
import { Card } from '@/components/ui/card';
import { usePlatformName } from '@/contexts/PlatformNameContext';

const testimonials = [
  {
    quote:
      "We went from idea to $50K MRR in 3 weeks. The AI-generated docs and automatic billing saved us 6 months of dev time.",
    author: 'Sarah Chen',
    role: 'CEO, WeatherAPI',
    avatar: '👩‍💼',
  },
  {
    quote:
      "Integration time went from 2 days to 2 minutes. The cost optimizer saved us $120K annually by auto-switching to cheaper providers.",
    author: 'Marcus Johnson',
    role: 'CTO, FinanceApp',
    avatar: '👨‍💻',
  },
  {
    quote:
      'Complete visibility into $2M API spend across 200 teams. Security scanning caught 47 vulnerabilities before they became breaches.',
    author: 'Dr. Emily Rodriguez',
    role: 'VP Engineering, MegaCorp',
    avatar: '👩‍🔬',
  },
];

const metrics = [
  { value: 10000, suffix: '+', label: 'APIs Listed' },
  { value: 500, suffix: 'K+', label: 'Active Developers' },
  { value: 100, prefix: '$', suffix: 'M+', label: 'Revenue Processed' },
  { value: 99.99, suffix: '%', label: 'Uptime SLA' },
];

const caseStudies = [
  {
    company: 'PaymentCo',
    result: '10X revenue in 6 months',
    description: 'From 100 to 10,000 API consumers',
  },
  {
    company: 'DataStream',
    result: '90% faster integrations',
    description: 'AI code generation reduced support tickets',
  },
  {
    company: 'Enterprise Inc',
    result: '$500K annual savings',
    description: 'Cost optimizer + compliance automation',
  },
];

export default function SocialProof() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  const platformName = usePlatformName();

  return (
    <section ref={ref} className="bg-white py-24 dark:bg-gray-950 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          className="mb-16 text-center"
        >
          <h2 className="section-heading mb-6 text-gray-900 dark:text-white">
            Trusted by Thousands. Loved by All.
          </h2>
          <p className="section-subheading mx-auto max-w-3xl text-gray-600 dark:text-gray-300">
            From solo developers to Fortune 500 companies, everyone builds better on
            {platformName}.
          </p>
        </motion.div>

        {/* Metrics Ticker */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ delay: 0.2 }}
          className="mb-16 grid grid-cols-2 gap-6 md:grid-cols-4"
        >
          {metrics.map((metric, index) => (
            <div key={index} className="text-center">
              <div className="mb-2 text-4xl font-black text-primary-600 dark:text-primary-400">
                <Counter end={metric.value} prefix={metric.prefix} suffix={metric.suffix} />
              </div>
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">{metric.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Testimonials */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-16 grid gap-8 md:grid-cols-3"
        >
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="relative h-full p-8 shadow-sm transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
              <Quote className="absolute right-6 top-6 h-10 w-10 text-primary-500 dark:text-primary-900/50" />
              <div className="mb-6 flex text-yellow-400 dark:text-yellow-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-current" />
                ))}
              </div>
              <blockquote className="mb-8 text-lg font-medium leading-relaxed text-gray-900 dark:text-gray-100">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>
              <div className="mt-auto flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-2xl dark:bg-gray-800">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-bold text-gray-900 dark:text-white">{testimonial.author}</div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">{testimonial.role}</div>
                </div>
              </div>
            </Card>
          ))}
        </motion.div>

        {/* Case Study Preview Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="mb-8 text-center text-2xl font-bold text-gray-900 dark:text-white">Case Studies</h3>
          <div className="grid gap-6 md:grid-cols-3">
            {caseStudies.map((study, index) => (
              <Card key={index} className="p-6 transition-all hover:shadow-lg dark:border-gray-800 dark:bg-gray-900">
                <div className="mb-2 text-sm font-semibold text-primary-600 dark:text-primary-400">
                  {study.company}
                </div>
                <div className="mb-3 text-2xl font-black text-gray-900 dark:text-white">{study.result}</div>
                <p className="text-gray-600 dark:text-gray-400">{study.description}</p>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Customer Logos Placeholder */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16"
        >
          <p className="mb-8 text-center text-sm font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Trusted by leading companies
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-50">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="flex h-12 w-32 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
              >
                <span className="text-xs text-gray-400 dark:text-gray-500">Logo {i + 1}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
