import Link from 'next/link';
import { getPlatformName } from '@/lib/settings/platform-name';
import { LegalPageLayout } from '@/components/legal/LegalPageLayout';
import { LegalCallout } from '@/components/legal/LegalCallout';
import { ContactButton } from '@/components/contact/ContactButton';

const TOC_ITEMS = [
  { id: 'scope', label: '1. Scope' },
  { id: 'availability', label: '2. Platform Availability' },
  { id: 'maintenance', label: '3. Planned Maintenance' },
  { id: 'exclusions', label: '4. Exclusions' },
  { id: 'service-credits', label: '5. Service Credits' },
  { id: 'performance', label: '6. Performance Metrics' },
  { id: 'monitoring', label: '7. Monitoring and Status' },
  { id: 'enterprise', label: '8. Enterprise SLA' },
  { id: 'contact', label: '9. Contact' },
];

export async function generateMetadata() {
  const name = await getPlatformName();
  return {
    title: `Service Level Agreement | ${name}`,
    description: `Service Level Agreement for ${name} - uptime commitments, service credits, and performance metrics.`,
  };
}

export default async function ServiceLevelAgreementPage() {
  const platformName = await getPlatformName();
  return (
    <LegalPageLayout
      title="Service Level Agreement"
      version="Version 1.0"
      lastUpdated="February 14, 2026"
      tocItems={TOC_ITEMS}
    >
      <p>
        This Service Level Agreement (&quot;SLA&quot;) describes the service levels we commit to for the {platformName}
        platform (&quot;the Service&quot;). This SLA is incorporated by reference into our{' '}
        <Link href="/legal/terms" className="text-primary hover:underline">Terms of Service</Link>. Capitalized
        terms used but not defined here have the meanings given in the Terms of Service.
      </p>

      <h2 id="scope">1. Scope</h2>
      <p>
            This SLA applies to the {platformName} platform services we operate directly, including:
          </p>
          <ul>
            <li>Website and marketplace (discovery, browsing, search)</li>
            <li>Authentication and account management</li>
            <li>API gateway and routing (for APIs proxied through our platform)</li>
            <li>Billing and subscription management</li>
            <li>Developer dashboard and documentation</li>
          </ul>
      <LegalCallout variant="muted" title="Scope">
        <p>
          This SLA does <strong>not</strong> cover third-party APIs listed on the marketplace. Availability of
          individual APIs is the responsibility of their providers. We commit to making our platform available so
          that you can discover, subscribe to, and access third-party APIs; we do not guarantee uptime of those
          third-party services.
        </p>
      </LegalCallout>

      <h2 id="availability">2. Platform Availability</h2>
      <p>
            We target <strong>99.9%</strong> monthly uptime for the core platform services described in Scope above.
            &quot;Uptime&quot; means the percentage of time during a calendar month when the Service is operational
            and responding to requests, excluding Planned Maintenance and Exclusions.
          </p>
          <p>
            Downtime is measured from our monitoring systems. An outage is counted when our systems return 5xx
            errors or fail to respond for more than 60 consecutive seconds for a given service component. Partial
            degradation (e.g., slower response times) may be considered &quot;degraded&quot; but not necessarily
            &quot;downtime&quot; unless it prevents core functionality.
          </p>
      <div className="not-prose overflow-hidden rounded-lg border border-border my-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted">
                  <th className="p-3 text-left font-semibold">Monthly Uptime</th>
                  <th className="p-3 text-left font-semibold">Allowed Downtime (approx.)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <td className="p-3">99.9%</td>
                  <td className="p-3">43 minutes per month</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-3">99.95% (Enterprise)</td>
                  <td className="p-3">22 minutes per month</td>
                </tr>
                <tr>
                  <td className="p-3">99.99% (Enterprise)</td>
                  <td className="p-3">4 minutes per month</td>
                </tr>
              </tbody>
            </table>
      </div>

      <h2 id="maintenance">3. Planned Maintenance</h2>
      <p>
            We may perform planned maintenance to improve security, performance, or features. Planned maintenance
            will:
          </p>
          <ul>
            <li>Be scheduled during low-traffic windows where practicable (e.g., weekends or early morning UTC)</li>
            <li>Be announced at least 48 hours in advance via our <Link href="/status" className="text-primary hover:underline">Status Page</Link> and, for Enterprise customers, via email</li>
            <li>Typically last no more than 4 hours</li>
            <li>Be excluded from uptime calculations</li>
          </ul>
          <p>
            Emergency maintenance (e.g., critical security patches) may be performed with shorter notice when
            necessary to protect the Service. We will post updates on the Status Page as soon as practicable.
          </p>

      <h2 id="exclusions">4. Exclusions</h2>
      <p>Downtime and performance issues are excluded from SLA calculations when caused by:</p>
          <ul>
            <li><strong>Third-party APIs:</strong> Failure or degradation of APIs listed on the marketplace, operated by API providers</li>
            <li><strong>Third-party services:</strong> Outages or issues with Stripe, Supabase, Vercel, or other sub-processors outside our control</li>
            <li><strong>Force majeure:</strong> Acts of God, war, terrorism, pandemics, natural disasters, government actions, or other events beyond our reasonable control</li>
            <li><strong>Your actions:</strong> Misuse, abuse, violation of our Terms or AUP, or your failure to implement recommended configurations</li>
            <li><strong>Your environment:</strong> Your network, DNS, firewall, or local configuration issues</li>
            <li><strong>Planned maintenance:</strong> Maintenance announced in accordance with Section 3</li>
            <li><strong>Billing suspension:</strong> Service suspended due to non-payment or fraud</li>
          </ul>

      <h2 id="service-credits">5. Service Credits</h2>
      <p>
            If we fail to meet the 99.9% uptime commitment in a calendar month, eligible paid customers may request
            a service credit. Credits are calculated as a percentage of your monthly fee for the affected month:
          </p>
      <div className="not-prose overflow-hidden rounded-lg border border-border my-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted">
                  <th className="p-3 text-left font-semibold">Monthly Uptime</th>
                  <th className="p-3 text-left font-semibold">Service Credit</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <td className="p-3">Less than 99.9% but at least 99.0%</td>
                  <td className="p-3">10%</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-3">Less than 99.0% but at least 95.0%</td>
                  <td className="p-3">25%</td>
                </tr>
                <tr>
                  <td className="p-3">Less than 95.0%</td>
                  <td className="p-3">50%</td>
                </tr>
              </tbody>
            </table>
      </div>
      <p>
            <strong>How to claim:</strong> <ContactButton source="legal-sla" category="sla-claim" variant="link" size="default" className="h-auto p-0 inline">Submit a claim</ContactButton> within 30 days of the end of
            the affected month. Include your account email and a brief description of the outage you experienced.
            We will verify against our monitoring data and respond within 30 days.
          </p>
          <p>
            <strong>Limitations:</strong> Service credits are your sole remedy for SLA failures. Credits may not be
            exchanged for cash. Maximum credit per month is 50% of that month&apos;s fee. Free tier and trial
            accounts are not eligible for service credits.
          </p>

      <h2 id="performance">6. Performance Metrics</h2>
      <p>In addition to availability, we monitor and target the following performance metrics:</p>
          <ul>
            <li>
              <strong>API gateway response time:</strong> P95 latency under 500ms for proxied API requests (excluding
              third-party API response time)
            </li>
            <li>
              <strong>Dashboard load time:</strong> Time to interactive under 3 seconds for the developer dashboard
              on typical connections
            </li>
            <li>
              <strong>Authentication:</strong> Login and session operations under 2 seconds
            </li>
          </ul>
          <p>
            These targets are best-effort and are not covered by service credits. We use them internally to drive
            improvements.
          </p>

      <h2 id="monitoring">7. Monitoring and Status</h2>
      <p>
            We operate a public <Link href="/status" className="text-primary hover:underline">Status Page</Link> that
            shows the current health of our platform services. The Status Page is updated automatically and, during
            incidents, manually with incident details and remediation progress.
          </p>
          <p>
            We monitor our infrastructure 24/7 and have defined incident response procedures. For critical outages,
            we aim to begin remediation within 15 minutes of detection and to communicate status updates at least
            every 4 hours until resolution.
          </p>

      <h2 id="enterprise">8. Enterprise SLA</h2>
      <p>
            Enterprise customers may negotiate custom SLAs including:
          </p>
          <ul>
            <li>Higher uptime commitments (e.g., 99.95% or 99.99%)</li>
            <li>Custom service credit percentages</li>
            <li>Dedicated support and incident escalation</li>
            <li>Extended maintenance windows with advanced notice</li>
          </ul>
          <p>
            <ContactButton source="legal-sla" category="sales" variant="link" size="default" className="h-auto p-0 inline">Contact sales</ContactButton> for
            Enterprise SLA terms.
          </p>

      <h2 id="contact">9. Contact</h2>
      <LegalCallout variant="info" title="Contact">
        <p>For SLA questions or service credit claims: <ContactButton source="legal-sla" category="sla-claim" variant="link" size="default" className="h-auto p-0 inline">Contact Support</ContactButton></p>
        <p>For Enterprise SLA inquiries: <ContactButton source="legal-sla" category="sales" variant="link" size="default" className="h-auto p-0 inline">Contact Sales</ContactButton></p>
      </LegalCallout>

      <p className="text-sm text-muted-foreground mt-8">
            By using {platformName}, you acknowledge that you have read and understood this Service Level Agreement.
          </p>

      <div className="not-prose flex flex-wrap gap-4 mt-8">
        <Link href="/legal/terms" className="text-primary hover:underline text-sm font-medium">Terms of Service</Link>
        <Link href="/legal/acceptable-use" className="text-primary hover:underline text-sm font-medium">Acceptable Use Policy</Link>
        <Link href="/legal/privacy" className="text-primary hover:underline text-sm font-medium">Privacy Policy</Link>
        <Link href="/legal/cookies" className="text-primary hover:underline text-sm font-medium">Cookie Policy</Link>
        <Link href="/status" className="text-primary hover:underline text-sm font-medium">Status Page</Link>
        <Link href="/security" className="text-primary hover:underline text-sm font-medium">Security & Compliance</Link>
      </div>
    </LegalPageLayout>
  );
}
