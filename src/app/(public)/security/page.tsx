import Link from 'next/link';
import { ContactButton } from '@/components/contact/ContactButton';
import {
  Shield,
  Lock,
  FileCheck,
  Server,
  AlertTriangle,
  Key,
  Network,
  Users,
  Activity,
  Eye,
  ExternalLink,
} from 'lucide-react';
import { getPlatformName } from '@/lib/settings/platform-name';
import { PageHero } from '@/components/landing/PageHero';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

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
      <PageHero
        title="Security & Compliance"
        subtitle={`${platformName} is built with security and compliance at the core. Here's how we protect your data.`}
      />
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Overview Cards */}
        <div className="grid gap-6 sm:grid-cols-2 mb-12">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Lock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-lg">Data Security</h2>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <li>Encryption in transit (TLS 1.3) and at rest (AES-256)</li>
                    <li>Passwords hashed; API keys never stored in plain text</li>
                    <li>Row-level security and RBAC</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <FileCheck className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-lg">Compliance</h2>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <li>GDPR: data subject rights, DPAs, lawful basis</li>
                    <li>SOC 2 Type II roadmap</li>
                    <li>HIPAA: BAA available for enterprise</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Server className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-lg">Infrastructure</h2>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <li>Trusted cloud providers (Vercel, Supabase)</li>
                    <li>DDoS protection, CDN, edge network</li>
                    <li>Regular security assessments</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <AlertTriangle className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-lg">Incident Response</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Defined procedures for detecting, containing, and resolving incidents. Affected users notified per law and contracts.
                  </p>
                  <ContactButton source="security-page" category="security" variant="link" size="default" className="mt-3 h-auto p-0">
                    Report a vulnerability
                  </ContactButton>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Comprehensive Security Sections */}
        <div className="prose prose-slate dark:prose-invert max-w-none space-y-12">
          <section>
            <h2 className="flex items-center gap-2">
              <div className="rounded-lg bg-primary/10 p-1.5">
                <Server className="h-5 w-5 text-primary" />
              </div>
              Infrastructure Security
            </h2>
            <p>
              Our platform runs on trusted cloud providers (Vercel for hosting and CDN, Supabase for database and
              auth). We leverage:
            </p>
            <ul>
              <li><strong>DDoS protection:</strong> Edge network and CDN with built-in DDoS mitigation</li>
              <li><strong>Global CDN:</strong> Content and API responses served from edge locations for low latency and resilience</li>
              <li><strong>Redundancy:</strong> Multi-region deployment where available</li>
              <li><strong>Dependency updates:</strong> Regular patching of dependencies and security advisories</li>
            </ul>
          </section>

          <section>
            <h2 className="flex items-center gap-2">
              <div className="rounded-lg bg-primary/10 p-1.5">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              Application Security
            </h2>
            <p>
              We follow security best practices throughout the development lifecycle:
            </p>
            <ul>
              <li><strong>OWASP Top 10:</strong> Measures to mitigate injection, XSS, CSRF, broken auth, and other common vulnerabilities</li>
              <li><strong>Secure coding:</strong> Code review, static analysis, and dependency scanning</li>
              <li><strong>Security testing:</strong> Regular internal testing and penetration testing on a schedule</li>
              <li><strong>CI/CD security:</strong> Automated checks in the deployment pipeline</li>
            </ul>
          </section>

          <section>
            <h2 className="flex items-center gap-2">
              <div className="rounded-lg bg-primary/10 p-1.5">
                <Lock className="h-5 w-5 text-primary" />
              </div>
              Data Security
            </h2>
            <p>
              All data is protected with industry-standard encryption and access controls:
            </p>
            <ul>
              <li><strong>Encryption in transit:</strong> TLS 1.3 for all connections</li>
              <li><strong>Encryption at rest:</strong> AES-256 for stored data</li>
              <li><strong>Key management:</strong> Secrets managed via environment variables and provider secret stores</li>
              <li><strong>Password hashing:</strong> Industry-standard algorithms via Supabase Auth</li>
            </ul>
          </section>

          <section>
            <h2 className="flex items-center gap-2">
              <div className="rounded-lg bg-primary/10 p-1.5">
                <Key className="h-5 w-5 text-primary" />
              </div>
              API Key Security
            </h2>
            <p>
              API keys and credentials are handled with care:
            </p>
            <ul>
              <li><strong>Hashing:</strong> API keys are hashed; plain-text keys are never stored</li>
              <li><strong>Display:</strong> Keys shown only at creation; partial display for identification</li>
              <li><strong>Rotation:</strong> Users can rotate keys from the dashboard; compromised keys should be rotated immediately</li>
              <li><strong>Compromise response:</strong> Report suspected exposure via our <ContactButton source="security-page" category="security" variant="link" size="default" className="h-auto p-0 inline">contact form</ContactButton>; we will assist with rotation and investigation</li>
            </ul>
          </section>

          <section>
            <h2 className="flex items-center gap-2">
              <div className="rounded-lg bg-primary/10 p-1.5">
                <Users className="h-5 w-5 text-primary" />
              </div>
              Authentication & Authorization
            </h2>
            <p>
              User authentication and authorization are built on Supabase Auth:
            </p>
            <ul>
              <li><strong>Authentication:</strong> Secure sign-up, sign-in, and session management</li>
              <li><strong>MFA:</strong> Multi-factor authentication support where available</li>
              <li><strong>SSO:</strong> Enterprise SSO (SAML/OIDC) on our roadmap</li>
              <li><strong>RBAC:</strong> Role-based access control for dashboard and API access</li>
              <li><strong>RLS:</strong> Row-level security in the database for multi-tenant isolation</li>
            </ul>
          </section>

          <section>
            <h2 className="flex items-center gap-2">
              <div className="rounded-lg bg-primary/10 p-1.5">
                <Network className="h-5 w-5 text-primary" />
              </div>
              Network Security
            </h2>
            <p>
              Network-level protections include:
            </p>
            <ul>
              <li><strong>Firewalls:</strong> Managed by cloud providers with restrictive rules</li>
              <li><strong>WAF:</strong> Web application firewall where applicable</li>
              <li><strong>Rate limiting:</strong> Per-user and per-API rate limits to prevent abuse</li>
              <li><strong>VPC:</strong> Isolated network environments for sensitive workloads</li>
            </ul>
          </section>

          <section>
            <h2 className="flex items-center gap-2">
              <div className="rounded-lg bg-primary/10 p-1.5">
                <Eye className="h-5 w-5 text-primary" />
              </div>
              Access Control
            </h2>
            <p>
              Access to production systems follows the principle of least privilege:
            </p>
            <ul>
              <li><strong>RBAC:</strong> Role-based access control for users and internal teams</li>
              <li><strong>RLS:</strong> Row-level security ensures tenant data isolation</li>
              <li><strong>Production access:</strong> Limited to authorized personnel; access is logged and reviewed</li>
              <li><strong>Credentials:</strong> Separate credentials for dev/staging/production</li>
            </ul>
          </section>

          <section>
            <h2 className="flex items-center gap-2">
              <div className="rounded-lg bg-primary/10 p-1.5">
                <FileCheck className="h-5 w-5 text-primary" />
              </div>
              Compliance Certifications
            </h2>
            <p>
              We are committed to compliance with major frameworks:
            </p>
            <ul>
              <li><strong>GDPR:</strong> Data subject rights, lawful basis, DPAs. See our <Link href="/legal/privacy" className="text-primary hover:underline">Privacy Policy</Link> and <Link href="/legal/dpa" className="text-primary hover:underline">DPA</Link>.</li>
              <li><strong>SOC 2 Type II:</strong> On our roadmap; controls aligned with trust principles (security, availability, confidentiality)</li>
              <li><strong>HIPAA:</strong> BAA and HIPAA-aligned handling available for Enterprise customers; <ContactButton source="security-page" category="sales" variant="link" size="default" className="h-auto p-0 inline">contact sales</ContactButton></li>
            </ul>
          </section>

          <section>
            <h2 className="flex items-center gap-2">
              <div className="rounded-lg bg-primary/10 p-1.5">
                <AlertTriangle className="h-5 w-5 text-primary" />
              </div>
              Incident Response & Vulnerability Disclosure
            </h2>
            <p>
              We have defined procedures for security incidents and vulnerability reports:
            </p>
            <ul>
              <li><strong>24/7 monitoring:</strong> Automated monitoring and alerting for anomalies</li>
              <li><strong>Incident response:</strong> Detect, contain, remediate, and post-mortem</li>
              <li><strong>User notification:</strong> Affected users notified per GDPR, contracts, and applicable law</li>
              <li><strong>Vulnerability disclosure:</strong> Responsible disclosure policy; <ContactButton source="security-page" category="security" reportType="security_report" variant="link" size="default" className="h-auto p-0 inline">report via our contact form</ContactButton></li>
              <li><strong>Scope:</strong> Our platform and services; third-party APIs are out of scope</li>
            </ul>
            <p>
              To report a vulnerability: <ContactButton source="security-page" category="security" reportType="security_report" variant="link" size="default" className="h-auto p-0 inline">use our contact form</ContactButton>. Include a description, steps to reproduce, and impact. We aim to acknowledge within 48 hours and respond within 7 days.
            </p>
          </section>

          <section>
            <h2 className="flex items-center gap-2">
              <div className="rounded-lg bg-primary/10 p-1.5">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              Third-Party Security
            </h2>
            <p>
              We use trusted Sub-Processors with strong security practices:
            </p>
            <ul>
              <li><strong>Stripe:</strong> PCI DSS Level 1 certified for payment processing</li>
              <li><strong>Supabase:</strong> SOC 2 compliant; encryption, RLS, and secure auth</li>
              <li><strong>Vercel:</strong> Enterprise-grade hosting and CDN</li>
            </ul>
            <p>
              Sub-processors are contractually bound to protect data. See our <Link href="/legal/dpa" className="text-primary hover:underline">Data Processing Agreement</Link> for the full list.
            </p>
          </section>
        </div>

        {/* Trust signals */}
        <div className="mt-12 flex flex-wrap items-center gap-4 rounded-lg border border-border bg-muted/30 px-4 py-4">
          <span className="text-sm font-medium">Trust</span>
          <span className="rounded bg-muted px-2 py-1 text-xs">GDPR aligned</span>
          <span className="rounded bg-muted px-2 py-1 text-xs">SOC 2 roadmap</span>
          <span className="rounded bg-muted px-2 py-1 text-xs">TLS 1.3</span>
          <span className="rounded bg-muted px-2 py-1 text-xs">AES-256 at rest</span>
        </div>

        {/* Trust Center links */}
        <div className="mt-8 flex flex-wrap gap-4">
          <Link href="/status">
            <Button variant="outline" className="gap-2">
              <Activity className="h-4 w-4" />
              Status Page
            </Button>
          </Link>
          <Link href="/legal/terms">
            <Button variant="outline" className="gap-2">
              <FileCheck className="h-4 w-4" />
              Terms of Service
            </Button>
          </Link>
          <Link href="/legal/privacy">
            <Button variant="outline" className="gap-2">
              <Lock className="h-4 w-4" />
              Privacy Policy
            </Button>
          </Link>
          <Link href="/contact">
            <Button className="gap-2">
              <ExternalLink className="h-4 w-4" />
              Contact Us
            </Button>
          </Link>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none mt-8">
          <p className="text-sm text-muted-foreground">
            For detailed terms, see our <Link href="/legal/terms" className="text-primary hover:underline">Terms of Service</Link>, <Link href="/legal/privacy" className="text-primary hover:underline">Privacy Policy</Link>, and <Link href="/legal/dpa" className="text-primary hover:underline">Data Processing Agreement</Link>.
          </p>
          <div className="not-prose mt-6 flex gap-4">
            <Button asChild>
              <Link href="/contact">Contact Us</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
