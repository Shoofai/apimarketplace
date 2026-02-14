import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getPlatformName } from '@/lib/settings/platform-name';

export async function generateMetadata() {
  const name = await getPlatformName();
  return {
    title: `Terms of Service | ${name}`,
    description: `Terms of Service for ${name}`,
  };
}

export default async function TermsOfServicePage() {
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
          <h1>Terms of Service</h1>
          <p className="text-muted-foreground text-lg">
            <strong>Version 1.0</strong> · Last Updated: February 12, 2026
          </p>

          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using {platformName} (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access the Service.
          </p>

          <h2>2. Description of Service</h2>
          <p>
            {platformName} is a marketplace platform that connects API providers with developers. The Service enables API providers to publish, distribute, and monetize their APIs; developers to discover, subscribe to, and integrate APIs; and automated billing, usage tracking, and analytics.
          </p>

          <h2>3. Account Registration</h2>
          <p>You must be at least 18 years old to use the Service. You agree to provide accurate information, maintain account security, and accept responsibility for all activities under your account.</p>

          <h2>4. Acceptable Use</h2>
          <p>You agree not to violate laws, infringe intellectual property, transmit malware, gain unauthorized access, harass others, reverse engineer the Service, or engage in fraudulent or abusive activity.</p>

          <h2>5. API Providers</h2>
          <p>Providers grant us a license to display and distribute API documentation; are responsible for API operation and accurate pricing; and accept a platform fee of 3% of gross revenue when payouts are enabled (e.g. via Stripe Connect).</p>

          <h2>6. Developers</h2>
          <p>Subscriptions are billed monthly; usage beyond plan limits may incur overage charges. API keys are confidential and must not be shared or exposed.</p>

          <h2>7. Billing and Payments</h2>
          <p>When billing is active, payment will be by card via Stripe with monthly billing. Failed payments may result in suspension once billing is fully implemented. Refunds are not provided for partial periods or unused quota unless otherwise agreed. Currently, platform billing and Stripe Connect payouts may not be active in all regions.</p>

          <h2>8. Intellectual Property</h2>
          <p>The Service and its design are owned by {platformName}. You retain ownership of your content and grant us a license to display and distribute it as part of the Service.</p>

          <h2>9. Privacy</h2>
          <p>Your use is subject to our <Link href="/legal/privacy" className="text-primary hover:underline">Privacy Policy</Link> and applicable data protection laws.</p>

          <h2>10. Limitation of Liability</h2>
          <p>The Service is provided &quot;as is.&quot; We are not liable for indirect or consequential damages. Our total liability shall not exceed the amount you paid in the last 12 months.</p>

          <h2>11. Termination</h2>
          <p>You may terminate your account at any time. We may suspend or terminate accounts for violation of terms, fraud, non-payment, or security risk.</p>

          <h2>12. Governing Law and Jurisdiction</h2>
          <p>These Terms are governed by the laws of the State of Delaware, United States, without regard to conflict of law principles. Any legal action or proceeding arising out of or relating to these Terms or the Service shall be brought exclusively in the federal or state courts located in Delaware, and you consent to the personal jurisdiction of such courts.</p>

          <h2>13. Dispute Resolution and Arbitration</h2>
          <p>Except for claims that qualify for small-claims court or injunctive relief, any dispute arising from these Terms or the Service shall be resolved by binding arbitration administered by the American Arbitration Association under its Commercial Arbitration Rules. The arbitration shall be conducted in Delaware. The arbitrator&apos;s award may be entered in any court of competent jurisdiction.</p>

          <h2>14. Indemnification</h2>
          <p>You agree to indemnify, defend, and hold harmless {platformName}, its affiliates, officers, directors, employees, and agents from and against any claims, damages, losses, liabilities, costs, and expenses (including reasonable attorneys&apos; fees) arising out of or related to your use of the Service, your content, your violation of these Terms, or your violation of any third-party rights.</p>

          <h2>15. Class Action Waiver</h2>
          <p>You agree that any dispute resolution proceedings will be conducted only on an individual basis and not in a class, consolidated, or representative action. You waive any right to participate in a class action or class-wide arbitration.</p>

          <h2>16. Severability</h2>
          <p>If any provision of these Terms is held to be invalid or unenforceable, the remaining provisions will remain in full force and effect. The invalid or unenforceable provision shall be modified to the minimum extent necessary to make it valid and enforceable while preserving the parties&apos; intent.</p>

          <h2>17. Assignment</h2>
          <p>You may not assign or transfer these Terms or your account without our prior written consent. We may assign our rights and obligations under these Terms without restriction, including in connection with a merger, acquisition, or sale of assets.</p>

          <h2>18. Contact</h2>
          <p>For questions about these Terms: legal@apimarketplace.pro.</p>

          <p className="text-sm text-muted-foreground mt-8">
            By using {platformName}, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
          </p>

          <div className="flex gap-4 mt-8">
            <Link href="/legal/privacy" className="text-primary hover:underline">Privacy Policy</Link>
            <Link href="/legal/cookies" className="text-primary hover:underline">Cookie Policy</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
