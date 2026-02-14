import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Hero from '@/components/landing/Hero';
import ValueProposition from '@/components/landing/ValueProposition';
import ProblemStatement from '@/components/landing/ProblemStatement';
import KillerFeatures from '@/components/landing/KillerFeatures';
import TechShowcase from '@/components/landing/TechShowcase';
import SocialProof from '@/components/landing/SocialProof';
import Pricing from '@/components/landing/Pricing';
import NetworkEffects from '@/components/landing/NetworkEffects';
import Comparison from '@/components/landing/Comparison';
import FinalCTA from '@/components/landing/FinalCTA';
import Footer from '@/components/landing/Footer';

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard');
  }

  return (
    <>
      <Hero />
      <ProblemStatement />
      <ValueProposition />
      <KillerFeatures />
      <TechShowcase />
      <SocialProof />
      <Comparison />
      <NetworkEffects />
      <Pricing />
      <FinalCTA />
      <Footer />
    </>
  );
}
