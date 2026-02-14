import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getPlatformName } from '@/lib/settings/platform-name';

export async function generateMetadata() {
  const name = await getPlatformName();
  return {
    title: `Security & Compliance | ${name}`,
    description: `Learn how ${name} protects your data - encryption, compliance, and security practices.`,
  };
}

export default async function SecurityPage() {
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
          <h1>Security & Compliance</h1>
          <p className="text-xl text-muted-foreground">
            {platformName} is built with security and compliance at the core. Here&apos;s how we
            protect your data and meet enterprise requirements.
          </p>

          <h2>Data Security</h2>
          <ul>
            <li>
              <strong>Encryption in transit:</strong> All traffic uses TLS 1.3. API requests and
              responses are encrypted end-to-end.
            </li>
            <li>
              <strong>Encryption at rest:</strong> Data is encrypted at rest using industry-standard
              encryption. Keys are managed securely.
            </li>
            <li>
              <strong>Authentication:</strong> We use secure, industry-standard authentication.
              Passwords are hashed; API keys are never stored in plain text.
            </li>
            <li>
              <strong>Authorization:</strong> Row-level security and role-based access control
              ensure users and organizations only access their own data.
            </li>
          </ul>

          <h2>Compliance</h2>
          <p>
            We are designed to support compliance with major frameworks. Our practices align with:
          </p>
          <ul>
            <li>
              <strong>GDPR:</strong> Data subject rights (access, rectification, erasure,
              portability), lawful basis, data processing agreements. Use our Privacy Settings to
              export or delete your data.
            </li>
            <li>
              <strong>SOC 2:</strong> We follow security, availability, and confidentiality
              controls. SOC 2 Type II certification roadmap in progress.
            </li>
            <li>
              <strong>HIPAA:</strong> For healthcare use cases, we can support BAA and HIPAA-aligned
              handling. Contact sales for enterprise healthcare requirements.
            </li>
          </ul>

          <h2>Infrastructure & Access</h2>
          <ul>
            <li>Production infrastructure runs on trusted cloud providers with strict access
              controls.</li>
            <li>Access to production data is limited, logged, and reviewed.</li>
            <li>We perform regular security assessments and dependency updates.</li>
          </ul>

          <h2>Incident Response</h2>
          <p>
            We have defined procedures for detecting, containing, and resolving security incidents.
            Affected users and customers are notified in accordance with applicable law and
            contracts. Report security concerns to{' '}
            <a href="mailto:security@apimarketplace.pro" className="text-primary hover:underline">
              security@apimarketplace.pro
            </a>
            .
          </p>

          <h2>Trust & Transparency</h2>
          <p>
            We believe in transparency. This page is updated as we add certifications and
            practices. For detailed terms, see our{' '}
            <Link href="/legal/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/legal/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
            .
          </p>

          <div className="not-prose mt-12 flex flex-wrap gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Contact Us
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-accent"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
