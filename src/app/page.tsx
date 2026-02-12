'use client';

import { useEffect } from 'react';
import Navbar from '@/components/navbar';
import Hero from '@/components/landing/Hero';
import ProblemStatement from '@/components/landing/ProblemStatement';
import ValueProposition from '@/components/landing/ValueProposition';
import KillerFeatures from '@/components/landing/KillerFeatures';
import NetworkEffects from '@/components/landing/NetworkEffects';
import SocialProof from '@/components/landing/SocialProof';
import Pricing from '@/components/landing/Pricing';
import TechShowcase from '@/components/landing/TechShowcase';
import Comparison from '@/components/landing/Comparison';
import FinalCTA from '@/components/landing/FinalCTA';
import Footer from '@/components/landing/Footer';
import { trackPageView } from '@/lib/analytics';

export default function Home() {
  useEffect(() => {
    // Track initial page view
    trackPageView({ page_path: '/' });

    // Track scroll depth
    let maxScroll = 0;
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const scrollPercentage = (scrollTop / (documentHeight - windowHeight)) * 100;
      maxScroll = Math.max(maxScroll, scrollPercentage);
    };

    window.addEventListener('scroll', handleScroll);

    // Track time on page on unmount
    const startTime = Date.now();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      const timeOnPage = Math.floor((Date.now() - startTime) / 1000);
      trackPageView({
        page_path: '/',
        scroll_depth: Math.floor(maxScroll),
        time_on_page: timeOnPage,
      });
    };
  }, []);

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-16">{/* Offset for fixed navbar */}</div>
      <Hero />
      <ProblemStatement />
      <ValueProposition />
      <KillerFeatures />
      <NetworkEffects />
      <SocialProof />
      <Pricing />
      <TechShowcase />
      <Comparison />
      <FinalCTA />
      <Footer />
    </main>
  );
}
