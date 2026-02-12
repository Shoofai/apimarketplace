import type { Metadata } from 'next';
import { ThemeSwitcher } from '@/components/theme-switcher';
import Link from 'next/link';
import { ArrowLeft, Code2, Zap, Shield, TrendingUp } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Authentication - APIMarketplace Pro',
  description: 'Sign in or create an account',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding & Features */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/95 to-accent dark:from-gray-900 dark:via-primary-900/30 dark:to-accent-900/30 p-12 flex-col justify-between relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ 
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` 
          }} />
        </div>

        {/* Logo & Back Link */}
        <div className="relative z-10">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-white dark:text-foreground hover:text-white/80 dark:hover:text-foreground/80 transition-colors mb-12"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Homepage</span>
          </Link>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/10 dark:bg-white/5 backdrop-blur-sm flex items-center justify-center">
                <span className="text-2xl">🚀</span>
              </div>
              <h1 className="text-3xl font-bold text-white dark:text-foreground">
                APIMarketplace Pro
              </h1>
            </div>
            <p className="text-lg text-white/90 dark:text-muted-foreground max-w-md">
              The AI-powered API marketplace that runs itself. Monetize, discover, and govern APIs at scale.
            </p>
          </div>
        </div>

        {/* Features List */}
        <div className="relative z-10 space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-white/10 dark:bg-white/5 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
              <Code2 className="w-5 h-5 text-white dark:text-foreground" />
            </div>
            <div>
              <h3 className="text-white dark:text-foreground font-semibold mb-1">AI Code Generation</h3>
              <p className="text-white/80 dark:text-muted-foreground text-sm">
                Generate integration code instantly with Claude AI
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-white/10 dark:bg-white/5 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-white dark:text-foreground" />
            </div>
            <div>
              <h3 className="text-white dark:text-foreground font-semibold mb-1">Real-Time Testing</h3>
              <p className="text-white/80 dark:text-muted-foreground text-sm">
                Test APIs collaboratively with your team
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-white/10 dark:bg-white/5 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-white dark:text-foreground" />
            </div>
            <div>
              <h3 className="text-white dark:text-foreground font-semibold mb-1">Enterprise Ready</h3>
              <p className="text-white/80 dark:text-muted-foreground text-sm">
                GDPR compliant, SOC 2 ready, with full RBAC
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="relative z-10 grid grid-cols-3 gap-8 pt-8 border-t border-white/10 dark:border-white/5">
          <div>
            <div className="text-3xl font-bold text-white dark:text-foreground mb-1">10K+</div>
            <div className="text-sm text-white/80 dark:text-muted-foreground">APIs</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white dark:text-foreground mb-1">500K+</div>
            <div className="text-sm text-white/80 dark:text-muted-foreground">Developers</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white dark:text-foreground mb-1">$100M+</div>
            <div className="text-sm text-white/80 dark:text-muted-foreground">Revenue</div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background relative">
        {/* Theme Switcher - Fixed Position */}
        <div className="fixed top-4 right-4 z-50">
          <ThemeSwitcher />
        </div>

        {/* Mobile Back Link */}
        <Link 
          href="/" 
          className="lg:hidden absolute top-4 left-4 inline-flex items-center gap-2 text-foreground hover:text-foreground/80 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back</span>
        </Link>

        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">
            <div className="inline-flex items-center gap-2 mb-2">
              <span className="text-2xl">🚀</span>
              <h1 className="text-2xl font-bold">APIMarketplace Pro</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Enterprise API Marketplace & Governance
            </p>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
