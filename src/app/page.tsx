import { getFeatureFlag } from '@/lib/utils/feature-flags';
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
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Code, Zap, Shield, TrendingUp } from 'lucide-react';
import { ThemeSwitcher } from '@/components/theme-switcher';

export default async function Home() {
  // Check if user is logged in and redirect to dashboard
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user) {
    redirect('/dashboard');
  }

  // Check if launch page is enabled
  const showLaunchPage = await getFeatureFlag('Launch Page');

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
      {/* Navbar */}
      <nav className="fixed left-0 right-0 top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="mr-4 flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <span className="text-2xl">🚀</span>
              <span className="hidden font-bold sm:inline-block">
                APIMarketplace Pro
              </span>
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <nav className="flex items-center space-x-6">
              <Link href="/marketplace" className="text-sm font-medium transition-colors hover:text-primary">
                Marketplace
              </Link>
              <Link href="/login" className="text-sm font-medium transition-colors hover:text-primary">
                Playground
              </Link>
              <Link href="/login" className="text-sm font-medium transition-colors hover:text-primary">
                Sandbox
              </Link>
            </nav>
            <div className="flex items-center gap-2">
              <ThemeSwitcher />
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background via-background to-secondary/20 pt-24 pb-20">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              The Ultimate API Marketplace
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Discover, integrate, and monetize APIs with AI-powered tools and real-time
              collaboration
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/marketplace">
                <Button size="lg" className="gap-2">
                  Browse APIs
                  <ArrowRight className="h-4 w-4" />
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
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why APIMarketplace Pro?</h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to work with APIs, all in one platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <div className="group p-6 border border-border bg-card rounded-lg hover:border-primary hover:shadow-lg transition-all">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Code className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">AI Code Generation</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Generate integration code instantly with Claude AI
              </p>
            </div>

            <div className="group p-6 border border-border bg-card rounded-lg hover:border-primary hover:shadow-lg transition-all">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Real-Time Testing</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Test APIs collaboratively with your team in real-time
              </p>
            </div>

            <div className="group p-6 border border-border bg-card rounded-lg hover:border-primary hover:shadow-lg transition-all">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Enterprise Ready</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                GDPR compliant, SOC 2 ready, with full RBAC
              </p>
            </div>

            <div className="group p-6 border border-border bg-card rounded-lg hover:border-primary hover:shadow-lg transition-all">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Analytics & Insights</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
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

            <Link href="/login">
              <div className="p-6 bg-background border rounded-lg hover:shadow-lg transition-shadow cursor-pointer">
                <h3 className="font-semibold text-lg mb-2">AI Playground</h3>
                <p className="text-sm text-muted-foreground">
                  Generate code and get AI assistance
                </p>
              </div>
            </Link>

            <Link href="/login">
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
