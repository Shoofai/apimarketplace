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
import Pricing from '@/components/landing/Pricing';
import NetworkEffects from '@/components/landing/NetworkEffects';
import Comparison from '@/components/landing/Comparison';
import EnterpriseTrust from '@/components/landing/EnterpriseTrust';
import FinalCTA from '@/components/landing/FinalCTA';

/*
 * Landing page section order & background rhythm:
 *   1. Hero            — white / gradient (light), dark (dark)
 *   2. LogoWall        — gray-50 strip
 *   3. ProblemStatement— white
 *   4. ValueProposition— gray-50
 *   5. KillerFeatures  — white
 *   6. APIFlowDiagram  — dark (always dark)
 *   7. TechShowcase    — dark (always dark)
 *   8. PlatformStats   — white
 *   9. Comparison      — gray-50
 *  10. EnterpriseTrust — white  (NEW — trust badges + testimonials)
 *  11. NetworkEffects  — purple gradient
 *  12. Pricing         — white
 *  13. FinalCTA        — purple gradient
 *
 * Removed: ComparisonMini (merged into Comparison), redundant "Powered By" ticker (was in TechShowcase)
 */

export default async function Home() {
  const { data: { user } } = await getUserSafe();

  if (user) {
    redirect('/dashboard');
  }

  const heroVariant = await getHeroVariant();

  return (
    <>
      <Hero variant={heroVariant} />
      <LogoWall />
      <ProblemStatement />
      <ValueProposition />
      <KillerFeatures />
      <APIFlowDiagram />
      <TechShowcase />
      <Comparison />
      <EnterpriseTrust />
      <NetworkEffects />
      <Pricing />
      <FinalCTA />
    </>
  );
}
