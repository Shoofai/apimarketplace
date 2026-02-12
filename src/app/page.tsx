import { getFeatureFlag } from '@/lib/utils/feature-flags';
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
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Code, Zap, Shield, TrendingUp } from 'lucide-react';

export default async function Home() {
  // Check if launch page is enabled
  const showLaunchPage = await getFeatureFlag('launch_page_enabled');

  if (showLaunchPage) {
    // Show marketing launch page
    return (
      <div className="min-h-screen">
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
      </div>
    );
  }

  // Show application home page (default)
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/20 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold tracking-tight mb-6">
              The Ultimate API Marketplace
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Discover, integrate, and monetize APIs with AI-powered tools and real-time
              collaboration
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/marketplace">
                <Button size="lg">
                  Browse APIs
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="lg" variant="outline">
                  Get Started Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why APIMarketplace Pro?</h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to work with APIs, all in one platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <div className="p-6 border rounded-lg hover:border-primary transition-colors">
              <Code className="h-10 w-10 mb-4 text-primary" />
              <h3 className="font-semibold mb-2">AI Code Generation</h3>
              <p className="text-sm text-muted-foreground">
                Generate integration code instantly with Claude AI
              </p>
            </div>

            <div className="p-6 border rounded-lg hover:border-primary transition-colors">
              <Zap className="h-10 w-10 mb-4 text-primary" />
              <h3 className="font-semibold mb-2">Real-Time Testing</h3>
              <p className="text-sm text-muted-foreground">
                Test APIs collaboratively with your team in real-time
              </p>
            </div>

            <div className="p-6 border rounded-lg hover:border-primary transition-colors">
              <Shield className="h-10 w-10 mb-4 text-primary" />
              <h3 className="font-semibold mb-2">Enterprise Ready</h3>
              <p className="text-sm text-muted-foreground">
                GDPR compliant, SOC 2 ready, with full RBAC
              </p>
            </div>

            <div className="p-6 border rounded-lg hover:border-primary transition-colors">
              <TrendingUp className="h-10 w-10 mb-4 text-primary" />
              <h3 className="font-semibold mb-2">Analytics & Insights</h3>
              <p className="text-sm text-muted-foreground">
                Track usage, costs, and optimize API performance
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Link href="/marketplace">
              <div className="p-6 bg-background border rounded-lg hover:shadow-lg transition-shadow cursor-pointer">
                <h3 className="font-semibold text-lg mb-2">Browse APIs</h3>
                <p className="text-sm text-muted-foreground">
                  Discover thousands of APIs across all categories
                </p>
              </div>
            </Link>

            <Link href="/dashboard/playground">
              <div className="p-6 bg-background border rounded-lg hover:shadow-lg transition-shadow cursor-pointer">
                <h3 className="font-semibold text-lg mb-2">AI Playground</h3>
                <p className="text-sm text-muted-foreground">
                  Generate code and get AI assistance
                </p>
              </div>
            </Link>

            <Link href="/dashboard/sandbox">
              <div className="p-6 bg-background border rounded-lg hover:shadow-lg transition-shadow cursor-pointer">
                <h3 className="font-semibold text-lg mb-2">Test Console</h3>
                <p className="text-sm text-muted-foreground">
                  Interactive API testing environment
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-lg mb-8 opacity-90">
            Join thousands of developers using APIMarketplace Pro
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" variant="secondary">
                Sign Up Free
              </Button>
            </Link>
            <Link href="/marketplace">
              <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10">
                Explore APIs
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
