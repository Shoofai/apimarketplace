'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const COMPANIES = [
  'Stripe',
  'Shopify',
  'Uber',
  'Airbnb',
  'Notion',
  'Vercel',
  'Linear',
  'Figma',
  'Slack',
  'Discord',
  'Twilio',
  'Supabase',
  'Resend',
  'Algolia',
  'Segment',
  'Amplitude',
  'Mixpanel',
  'Intercom',
];

function LogoItem({ name }: { name: string }) {
  return (
    <div
      className="flex h-14 w-36 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white px-6 py-3 text-center text-sm font-semibold text-gray-600 grayscale transition-all duration-300 hover:grayscale-0 hover:border-primary-300 hover:text-primary-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:border-primary-600 dark:hover:text-primary-400"
      title={name}
    >
      {name}
    </div>
  );
}

export default function LogoWall() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  return (
    <section ref={ref} className="overflow-hidden border-y border-gray-200 bg-gray-50 py-12 dark:border-gray-800 dark:bg-gray-900/50">
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
        className="mb-8 text-center text-sm font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
      >
        Integrate with thousands of apps, including:
      </motion.p>

      <div className="relative overflow-hidden">
        <div className="marquee-scroll flex w-max gap-8">
          {[...COMPANIES, ...COMPANIES].map((name, i) => (
            <LogoItem key={`${name}-${i}`} name={name} />
          ))}
        </div>
      </div>

      <style jsx>{`
        .marquee-scroll {
          animation: marquee 40s linear infinite;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .marquee-scroll { animation: none; }
        }
      `}</style>
    </section>
  );
}
