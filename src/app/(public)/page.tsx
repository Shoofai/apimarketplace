import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
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

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard');
  }

  return (
    <>
      <Hero />
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
