import { getUserSafe } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getHeroVariant } from '@/lib/settings/hero-variant';
import Hero from '@/components/landing/Hero';
import LogoWall from '@/components/landing/LogoWall';
import ValueProposition from '@/components/landing/ValueProposition';
import ProblemStatement from '@/components/landing/ProblemStatement';
import KillerFeatures from '@/components/landing/KillerFeatures';
import APIFlowDiagram from '@/components/landing/APIFlowDiagram';
import TechShowcase from '@/components/landing/TechShowcase';
import SocialProof from '@/components/landing/SocialProof';
import Pricing from '@/components/landing/Pricing';
import NetworkEffects from '@/components/landing/NetworkEffects';
import Comparison from '@/components/landing/Comparison';
import FinalCTA from '@/components/landing/FinalCTA';

/** Set to 'true' to use gradient bands for section continuity. Set to 'false' or leave unset to use original block layout. */
const USE_GRADIENT_BANDS = process.env.NEXT_PUBLIC_LANDING_GRADIENT_BANDS === 'true';

export default async function Home() {
  const { data: { user } } = await getUserSafe();

  if (user) {
    redirect('/dashboard');
  }

  const heroVariant = await getHeroVariant();

  if (!USE_GRADIENT_BANDS) {
    return (
      <>
        <Hero variant={heroVariant} />
        <LogoWall />
        <ProblemStatement />
        <ValueProposition />
        <KillerFeatures />
        <APIFlowDiagram />
        <TechShowcase />
        <SocialProof />
        <Comparison />
        <NetworkEffects />
        <Pricing />
        <FinalCTA />
      </>
    );
  }

  return (
    <>
      <Hero variant={heroVariant} />
      {/* Band 1: soft flow from top into first content */}
      <div
        className="bg-gradient-to-b from-white via-gray-50 to-gray-100 [&>*]:!bg-transparent dark:from-gray-950 dark:via-gray-900 dark:to-gray-900"
        aria-hidden
      >
        <LogoWall />
        <ProblemStatement />
      </div>
      {/* Band 2: middle sections as one continuous gradient */}
      <div
        className="bg-gradient-to-b from-gray-100 via-gray-50 to-gray-100 [&>*]:!bg-transparent dark:from-gray-900 dark:via-gray-900 dark:to-gray-950"
        aria-hidden
      >
        <ValueProposition />
        <KillerFeatures />
        <APIFlowDiagram />
        <TechShowcase />
        <SocialProof />
        <Comparison />
      </div>
      {/* Band 3: Pricing + NetworkEffects + FinalCTA keep their own gradients */}
      <NetworkEffects />
      <Pricing />
      <FinalCTA />
    </>
  );
}
