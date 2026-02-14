import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getPlatformName } from '@/lib/settings/platform-name';

export async function generateMetadata() {
  const name = await getPlatformName();
  return {
    title: `Privacy Policy | ${name}`,
    description: `Privacy Policy for ${name}`,
  };
}

export default async function PrivacyPolicyPage() {
  const platformName = await getPlatformName();
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h1>Privacy Policy</h1>
          <p className="text-muted-foreground text-lg">
            <strong>Version 1.0</strong> · Last Updated: February 12, 2026
          </p>

          <h2>1. Introduction</h2>
          <p>
            {platformName} is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
          </p>

          <h2>2. Information We Collect</h2>
          <p>We collect account information (name, email, organization), payment information (processed by Stripe), profile and API information, and support communications. We automatically collect usage data, API usage data, device information, log data, and cookies.</p>

          <h2>3. How We Use Your Information</h2>
          <p>We use information to provide and operate the Service, process transactions, authenticate users, monitor usage, send communications, improve the product, and comply with security and legal obligations.</p>

          <h2>4. How We Share Your Information</h2>
          <p>We share with your consent; with service providers (Stripe when billing is used, Supabase for data and auth, Vercel for hosting, Anthropic for AI features, and Supabase for first-party analytics) under contractual protections; with API providers (organization name, tier, usage) when you subscribe; and when required by law or to protect rights and safety. We may share anonymized aggregate data. Transactional email is sent via Supabase Auth.</p>

          <h2>5. Data Retention</h2>
          <p>We retain data while your account is active. After deletion: passwords and keys are removed immediately; user content for 90 days; financial records for 7 years for compliance; anonymized analytics may be retained indefinitely.</p>

          <h2>6. Your Rights (GDPR)</h2>
          <p>You have rights to access, rectification, erasure, restriction, data portability, and to object. To exercise these rights, visit your <Link href="/dashboard/settings/privacy" className="text-primary hover:underline">Privacy Settings</Link> or contact privacy@apimarketplace.pro.</p>

          <h2>7. Data Security</h2>
          <p>We use encryption in transit and at rest, access controls, and hashing for passwords and API keys. No system is completely secure; we cannot guarantee absolute security.</p>

          <h2>8. Cookies</h2>
          <p>We use essential, analytics, and optional marketing cookies. You can manage preferences via our <Link href="/legal/cookie-settings" className="text-primary hover:underline">Cookie Settings</Link> or browser settings.</p>

          <h2>9. Contact</h2>
          <p>For privacy questions or to exercise your rights: privacy@apimarketplace.pro. Data Protection Officer: dpo@apimarketplace.pro.</p>

          <p className="text-sm text-muted-foreground mt-8">
            By using {platformName}, you acknowledge that you have read and understood this Privacy Policy.
          </p>

          <div className="flex gap-4 mt-8">
            <Link href="/legal/terms" className="text-primary hover:underline">Terms of Service</Link>
            <Link href="/legal/cookies" className="text-primary hover:underline">Cookie Policy</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
