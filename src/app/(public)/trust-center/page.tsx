import Link from 'next/link';
import { Shield, FileCheck, Lock, Activity, Server, ExternalLink, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { getPlatformName } from '@/lib/settings/platform-name';
import { PageHero } from '@/components/landing/PageHero';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export async function generateMetadata() {
  const name = await getPlatformName();
  return {
    title: `Trust Center | ${name}`,
    description: `${name}'s compliance, security, and privacy commitments — GDPR, SOC 2, HIPAA, PCI DSS, TLS 1.3, and more.`,
  };
}

const compliance = [
  {
    label: 'GDPR',
    status: 'Compliant',
    statusType: 'green',
    icon: Shield,
    description: 'Data subject rights, lawful basis, and data processing agreements fully documented.',
  },
  {
    label: 'SOC 2 Type II',
    status: 'In Progress (Q2 2026)',
    statusType: 'amber',
    icon: FileCheck,
    description: 'Audit underway. Controls aligned with trust service principles. Interim docs available on request.',
  },
  {
    label: 'HIPAA',
    status: 'BAA Available',
    statusType: 'blue',
    icon: Lock,
    description: 'Business Associate Agreement available for Enterprise customers handling PHI.',
  },
  {
    label: 'PCI DSS',
    status: 'Via Stripe (Level 1)',
    statusType: 'green',
    icon: Shield,
    description: 'All payment processing handled by Stripe, a PCI DSS Level 1 certified provider.',
  },
  {
    label: 'TLS 1.3',
    status: 'Enforced',
    statusType: 'green',
    icon: Activity,
    description: 'All data in transit encrypted with TLS 1.3. TLS 1.0 and 1.1 disabled platform-wide.',
  },
  {
    label: 'AES-256',
    status: 'At Rest',
    statusType: 'green',
    icon: Server,
    description: 'All stored data encrypted at rest using AES-256. Keys managed via dedicated key management.',
  },
];

const legalDocs = [
  { name: 'Privacy Policy', description: 'How we collect, use, and protect your data.', href: '/legal/privacy' },
  { name: 'Terms of Service', description: 'Rules and conditions for using the platform.', href: '/legal/terms' },
  { name: 'Data Processing Agreement', description: 'GDPR-compliant DPA including sub-processors.', href: '/legal/dpa' },
  { name: 'Service Level Agreement', description: 'Uptime commitments, credit terms, and support SLAs.', href: '/legal/sla' },
  { name: 'Security Details', description: 'Full technical security and compliance overview.', href: '/security' },
  { name: 'Platform Status', description: 'Real-time and historical uptime monitoring.', href: '/status' },
];

const partners = [
  {
    name: 'Supabase',
    cert: 'SOC 2 Type II certified',
    role: 'Database, auth, and storage',
    href: 'https://supabase.com/security',
  },
  {
    name: 'Vercel',
    cert: 'Enterprise security, DDoS protection',
    role: 'Hosting and edge network',
    href: 'https://vercel.com/security',
  },
  {
    name: 'Stripe',
    cert: 'PCI DSS Level 1 certified',
    role: 'Payment processing',
    href: 'https://stripe.com/docs/security',
  },
  {
    name: 'Anthropic',
    cert: 'Responsible AI, no training on your data',
    role: 'AI code generation',
    href: 'https://www.anthropic.com/security',
  },
];

function StatusBadge({ type, label }: { type: string; label: string }) {
  const styles: Record<string, string> = {
    green: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    amber: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  };
  const icons: Record<string, React.ReactNode> = {
    green: <CheckCircle className="h-3.5 w-3.5" />,
    amber: <Clock className="h-3.5 w-3.5" />,
    blue: <AlertCircle className="h-3.5 w-3.5" />,
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[type] ?? styles.green}`}>
      {icons[type]}
      {label}
    </span>
  );
}

export default async function TrustCenterPage() {
  const platformName = await getPlatformName();

  return (
    <div className="min-h-screen bg-background">
      <PageHero
        title="Trust Center"
        subtitle={`${platformName}'s compliance, security, and privacy commitments — all in one place.`}
        stats={['GDPR Compliant', 'SOC 2 in progress', 'TLS 1.3']}
      />

      <main className="container mx-auto px-4 py-12 max-w-5xl space-y-16">
        {/* Compliance Status */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-2">Compliance Status</h2>
          <p className="text-muted-foreground mb-8">Our current compliance posture across key frameworks.</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {compliance.map(({ label, status, statusType, icon: Icon, description }) => (
              <Card key={label}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                      <Icon className="h-5 w-5 text-primary" aria-hidden />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-foreground mb-1">{label}</div>
                      <StatusBadge type={statusType} label={status} />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Legal Documents */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-2">Legal &amp; Policy Documents</h2>
          <p className="text-muted-foreground mb-8">All legal documents needed for procurement and compliance review.</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {legalDocs.map(({ name, description, href }) => (
              <Link
                key={name}
                href={href}
                className="group rounded-xl border border-border bg-card p-5 hover:border-primary/40 hover:bg-primary/5 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-foreground group-hover:text-primary transition-colors">{name}</span>
                  <FileCheck className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" aria-hidden />
                </div>
                <p className="text-xs text-muted-foreground">{description}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Infrastructure Partners */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-2">Infrastructure Partners</h2>
          <p className="text-muted-foreground mb-8">We rely on best-in-class vendors — each independently certified.</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {partners.map(({ name, cert, role, href }) => (
              <a
                key={name}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-xl border border-border bg-card p-5 hover:border-primary/40 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-foreground">{name}</span>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" aria-hidden />
                </div>
                <p className="text-xs text-muted-foreground mb-1">{role}</p>
                <p className="text-xs text-primary/80 font-medium">{cert}</p>
              </a>
            ))}
          </div>
        </section>

        {/* Procurement CTA */}
        <section className="rounded-xl border border-border bg-muted/30 p-8 text-center">
          <Shield className="mx-auto h-10 w-10 text-primary mb-4" aria-hidden />
          <h2 className="text-xl font-bold text-foreground mb-2">Need compliance docs for procurement?</h2>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
            Our security team can provide security questionnaire responses, DPA counter-signatures, and additional compliance documentation on request.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <Link href="/contact?source=trust-center&category=enterprise">Contact Security Team</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/enterprise">Enterprise Features</Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
