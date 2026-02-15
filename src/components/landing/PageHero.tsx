'use client';

import { motion } from 'framer-motion';
import { fadeIn, slideUp } from '@/lib/animations';
import { LucideIcon } from 'lucide-react';

interface PageHeroProps {
  title: string;
  subtitle: string;
  icon?: LucideIcon;
  /** Optional stat pills, e.g. ["10K+ APIs", "500K+ Developers"] */
  stats?: string[];
}

export function PageHero({ title, subtitle, icon: Icon, stats }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-muted/50 via-background to-primary/5 dark:from-muted/20 dark:to-primary/10">
      <div className="absolute inset-0 opacity-30 dark:opacity-20">
        <div
          className="absolute inset-0"
          style={{ backgroundImage: 'url(/grid.svg)', backgroundSize: '60px 60px' }}
        />
      </div>
      <div className="relative mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <motion.div
          initial="initial"
          animate="animate"
          variants={slideUp}
          transition={{ duration: 0.4 }}
          className="text-center"
        >
          {Icon && (
            <motion.div variants={fadeIn} className="mb-4 flex justify-center">
              <div className="rounded-xl bg-primary/10 p-3 dark:bg-primary/20">
                <Icon className="h-10 w-10 text-primary" />
              </div>
            </motion.div>
          )}
          <h1 className="page-title text-foreground">
            {title}
          </h1>
          <p className="section-subheading mt-4 text-muted-foreground">{subtitle}</p>
          {stats && stats.length > 0 && (
            <motion.div
              variants={fadeIn}
              className="mt-6 flex flex-wrap justify-center gap-3"
            >
              {stats.map((stat) => (
                <span
                  key={stat}
                  className="rounded-full bg-muted px-4 py-1.5 text-sm font-medium text-muted-foreground"
                >
                  {stat}
                </span>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
