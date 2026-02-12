import type { Metadata } from 'next';
import { ThemeSwitcher } from '@/components/theme-switcher';

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-primary/90 to-accent p-4 dark:from-background dark:via-background dark:to-muted/20">
      {/* Theme Switcher - Fixed Position */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeSwitcher />
      </div>

      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white dark:text-foreground mb-2">
            APIMarketplace Pro
          </h1>
          <p className="text-primary-100 dark:text-muted-foreground">
            Enterprise API Marketplace & Governance
          </p>
        </div>
        <div className="bg-white dark:bg-card border dark:border-border rounded-lg shadow-xl p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
