import { Suspense } from 'react';
import { getUserSafe } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getHeroVariant } from '@/lib/settings/hero-variant';
import { getPlatformName } from '@/lib/settings/platform-name';
import dynamic from 'next/dynamic';

// Above-the-fold: eagerly loaded
import Hero from '@/components/landing/Hero';
import LogoWall from '@/components/landing/LogoWall';
import ProblemStatement from '@/components/landing/ProblemStatement';

// Below-the-fold: lazy loaded to reduce initial bundle
const ValueProposition = dynamic(() => import('@/components/landing/ValueProposition'));
const KillerFeatures   = dynamic(() => import('@/components/landing/KillerFeatures'));
const APIFlowDiagram   = dynamic(() => import('@/components/landing/APIFlowDiagram'));
const TechShowcase     = dynamic(() => import('@/components/landing/TechShowcase'));
const Comparison       = dynamic(() => import('@/components/landing/Comparison'));
const EnterpriseTrust  = dynamic(() => import('@/components/landing/EnterpriseTrust'));
const NetworkEffects   = dynamic(() => import('@/components/landing/NetworkEffects'));
const Pricing          = dynamic(() => import('@/components/landing/Pricing'));
const FinalCTA         = dynamic(() => import('@/components/landing/FinalCTA'));

/*
 * Landing page section order & background rhythm:
 *   1. Hero            — white / gradient (light), dark (dark)
 *   2. LogoWall        — gray-50 strip
 *   3. ProblemStatement— white
 *   4. ValueProposition— gray-50
 *   5. KillerFeatures  — white
 *   6. APIFlowDiagram  — dark (always dark)
 *   7. TechShowcase    — dark (always dark)
 *   8. Comparison      — gray-50
 *   9. EnterpriseTrust — white
 *  10. NetworkEffects  — purple gradient
 *  11. Pricing         — white
 *  12. FinalCTA        — purple gradient
 */

export async function generateMetadata() {
  const name = await getPlatformName();
  return {
    title: `${name} - The AI-Powered API Marketplace`,
    description: 'Discover, test, and integrate 500+ APIs. AI-generated code, one-click monetization, and enterprise governance — all in one platform.',
    openGraph: {
      title: `${name} - The AI-Powered API Marketplace`,
      description: 'From API discovery to production in 2 minutes. AI code generation, Stripe Connect monetization, and enterprise governance.',
      type: 'website',
    },
  };
}

export default async function Home() {
  const { data: { user } } = await getUserSafe();

  if (user) {
    redirect('/dashboard');
  }

  const heroVariant = await getHeroVariant();

  return (
    <>
      {/* Critical above-the-fold content */}
      <Hero variant={heroVariant} />
      <LogoWall />
      <ProblemStatement />

      {/* Below-the-fold: dynamically loaded */}
      <Suspense fallback={null}>
        <ValueProposition />
        <KillerFeatures />
        <APIFlowDiagram />
        <TechShowcase />
        <Comparison />
        <EnterpriseTrust />
        <NetworkEffects />
        <Pricing />
        <FinalCTA />
      </Suspense>
    </>
  );
}
