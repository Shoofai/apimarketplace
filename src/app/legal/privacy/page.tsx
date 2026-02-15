import Link from 'next/link';
import { getPlatformName } from '@/lib/settings/platform-name';
import { LegalPageLayout } from '@/components/legal/LegalPageLayout';
import { LegalCallout } from '@/components/legal/LegalCallout';
import { ContactButton } from '@/components/contact/ContactButton';

const TOC_ITEMS = [
  { id: 'introduction', label: '1. Introduction' },
  { id: 'data-collected', label: '2. Information We Collect' },
  { id: 'legal-basis', label: '3. Legal Basis for Processing' },
  { id: 'how-we-use', label: '4. How We Use Your Information' },
  { id: 'sharing', label: '5. How We Share Your Information' },
  { id: 'retention', label: '6. Data Retention' },
  { id: 'international', label: '7. International Transfers' },
  { id: 'children', label: '8. Children\'s Privacy' },
  { id: 'california', label: '9. California Residents (CCPA/CPRA)' },
  { id: 'eu-uk', label: '10. EU/UK Residents (GDPR)' },
  { id: 'other-states', label: '11. Other US State Laws' },
  { id: 'breach', label: '12. Data Breach Notification' },
  { id: 'automated', label: '13. Automated Decision-Making' },
  { id: 'marketing', label: '14. Marketing Communications' },
  { id: 'cookies', label: '15. Cookies' },
  { id: 'security', label: '16. Data Security' },
  { id: 'controller', label: '17. Data Controller Information' },
  { id: 'supervisory', label: '18. Supervisory Authority' },
  { id: 'changes', label: '19. Changes to This Policy' },
  { id: 'contact', label: '20. Contact' },
];

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
    <LegalPageLayout
      title="Privacy Policy"
      version="Version 1.1"
      lastUpdated="February 14, 2026"
      tocItems={TOC_ITEMS}
    >
      <p>
        {platformName} is committed to protecting your privacy. This Privacy Policy explains how we collect,
        use, disclose, and safeguard your information when you use our platform. This policy applies to
        Personal Data we collect as a Data Controller. Where we process data on behalf of our Customers, our{' '}
        <Link href="/legal/dpa" className="text-primary hover:underline">Data Processing Agreement</Link>{' '}
        applies.
      </p>

      <h2 id="introduction">1. Introduction</h2>
      <p>
        When you use {platformName}, we act as a Data Controller for Personal Data we collect directly from
        you or generate in providing the Service. &quot;Personal Data&quot; means any information relating to
        an identified or identifiable natural person. We process Personal Data in accordance with applicable
        data protection laws, including the EU General Data Protection Regulation (GDPR), UK GDPR, California
        Consumer Privacy Act (CCPA/CPRA), and other applicable laws.
      </p>

      <h2 id="data-collected">2. Information We Collect</h2>
      <p><strong>Account Information:</strong></p>
      <ul>
        <li>Name, email address, password (hashed)</li>
        <li>Organization name and billing address</li>
        <li>Profile information (avatar, bio) if provided</li>
      </ul>
      <p><strong>Payment Information:</strong></p>
      <ul>
        <li>Card details and billing address—processed by Stripe; we do not store full card numbers</li>
        <li>Transaction history and subscription details</li>
      </ul>
      <p><strong>Profile and API Information:</strong></p>
      <ul>
        <li>Listed APIs, documentation, pricing, and metadata (for Providers)</li>
        <li>Subscriptions, API keys (hashed), and usage quotas (for Developers)</li>
      </ul>
      <p><strong>Support Communications:</strong></p>
      <ul>
        <li>Messages, attachments, and contact history when you reach out to support</li>
      </ul>
      <p><strong>Usage Data (automatically collected):</strong></p>
      <ul>
        <li>API calls, request counts, response times, and error rates</li>
        <li>Page views, navigation paths, and feature usage</li>
        <li>Device type, browser, IP address, and user agent</li>
        <li>Log data (timestamps, request IDs, security events)</li>
      </ul>
      <p><strong>Cookies and Similar Technologies:</strong></p>
      <ul>
        <li>Essential, functional, analytics, and optional marketing cookies—see our{' '}
        <Link href="/legal/cookies" className="text-primary hover:underline">Cookie Policy</Link> for details</li>
      </ul>

      <h2 id="legal-basis">3. Legal Basis for Processing (GDPR)</h2>
      <p>Where GDPR applies, we rely on the following legal bases:</p>
      <ul>
        <li><strong>Contract:</strong> Processing necessary to perform our contract with you (e.g., providing the Service, billing)</li>
        <li><strong>Legitimate Interest:</strong> Processing necessary for our legitimate interests (e.g., security, fraud prevention, analytics, product improvement) where not overridden by your rights</li>
        <li><strong>Consent:</strong> Where required (e.g., non-essential cookies, marketing communications)</li>
        <li><strong>Legal Obligation:</strong> Processing necessary to comply with applicable law (e.g., tax, anti-money laundering)</li>
      </ul>

      <h2 id="how-we-use">4. How We Use Your Information</h2>
      <ul>
        <li>Provide and operate the Service (marketplace, API gateway, billing, analytics)</li>
        <li>Authenticate users and manage accounts</li>
        <li>Process transactions and subscriptions</li>
        <li>Monitor usage, enforce limits, and prevent abuse</li>
        <li>Send transactional communications (confirmations, receipts, security alerts)</li>
        <li>Improve the product (analytics, debugging, feature development)</li>
        <li>Comply with legal, security, and regulatory obligations</li>
        <li>Respond to support requests and legal process</li>
      </ul>

      <h2 id="sharing">5. How We Share Your Information</h2>
      <p><strong>Service Providers (Sub-Processors):</strong> We share data with trusted providers under contractual protections:</p>
      <ul>
        <li>Stripe—payment processing (when billing is used)</li>
        <li>Supabase—database, authentication, realtime</li>
        <li>Vercel—hosting, CDN, edge functions</li>
        <li>Anthropic—AI features (e.g., code generation)</li>
      </ul>
      <p><strong>API Providers:</strong> When you subscribe to an API, we share your organization name, tier, and usage data with that API provider so they can provide the service.</p>
      <p><strong>Legal and Safety:</strong> We may disclose data when required by law, court order, or legal process, or to protect rights, safety, or property.</p>
      <p><strong>Aggregate/Anonymized Data:</strong> We may share anonymized or aggregate data that cannot identify you for analytics, research, or marketing.</p>
      <p>Transactional email is sent via Supabase Auth. We do not sell Personal Data.</p>

      <h2 id="retention">6. Data Retention</h2>
      <p>We retain data as follows:</p>
      <ul>
        <li><strong>Active accounts:</strong> Data retained while your account is active</li>
        <li><strong>After deletion:</strong> Passwords and API keys removed immediately; user content within 90 days</li>
        <li><strong>Financial records:</strong> 7 years for tax and compliance</li>
        <li><strong>Anonymized analytics:</strong> May be retained indefinitely</li>
      </ul>

      <h2 id="international">7. International Transfers</h2>
      <p>
        Data may be transferred to and processed in countries outside your residence (e.g., US, EU). We use
        appropriate safeguards: Standard Contractual Clauses (SCCs) where required, adequacy decisions where
        applicable, and supplementary measures (encryption, access controls) where necessary. See our{' '}
        <Link href="/legal/dpa" className="text-primary hover:underline">Data Processing Agreement</Link> for
        details on Sub-Processor locations and safeguards.
      </p>

      <h2 id="children">8. Children&apos;s Privacy</h2>
      <p>
        The Service is not intended for individuals under 18. We do not knowingly collect Personal Data from
        children under 13 (or equivalent age in your jurisdiction). If you believe we have collected data from
        a child, <ContactButton source="legal-privacy" category="legal" variant="link" size="default" className="h-auto p-0 inline">contact us</ContactButton> and we will delete it promptly.
      </p>

      <h2 id="california">9. California Residents (CCPA/CPRA)</h2>
      <p>If you are a California resident, you have the right to:</p>
      <ul>
        <li><strong>Know:</strong> Request disclosure of categories and specific pieces of Personal Data we collect</li>
        <li><strong>Delete:</strong> Request deletion of your Personal Data (subject to exceptions)</li>
        <li><strong>Correct:</strong> Request correction of inaccurate Personal Data</li>
        <li><strong>Opt-out of sale/share:</strong> We do not sell Personal Data</li>
        <li><strong>Non-discrimination:</strong> We will not discriminate against you for exercising your rights</li>
      </ul>
      <p>
        To exercise these rights: visit <Link href="/dashboard/settings/privacy" className="text-primary hover:underline">Privacy Settings</Link> or
        <ContactButton source="legal-privacy" category="legal" variant="link" size="default" className="h-auto p-0 inline">contact us</ContactButton>. We will verify your identity before processing requests. You may
        designate an authorized agent; we may require proof of authorization.
      </p>

      <h2 id="eu-uk">10. EU/UK Residents (GDPR)</h2>
      <p>If you are in the EEA or UK, you have the right to:</p>
      <ul>
        <li><strong>Access:</strong> Request a copy of your Personal Data</li>
        <li><strong>Rectification:</strong> Request correction of inaccurate data</li>
        <li><strong>Erasure:</strong> Request deletion (&quot;right to be forgotten&quot;)</li>
        <li><strong>Restriction:</strong> Request restriction of processing in certain circumstances</li>
        <li><strong>Portability:</strong> Request transfer of your data in a structured format</li>
        <li><strong>Object:</strong> Object to processing based on legitimate interests or for direct marketing</li>
        <li><strong>Withdraw consent:</strong> Where processing is based on consent</li>
      </ul>
      <p>
        To exercise these rights: visit <Link href="/dashboard/settings/privacy" className="text-primary hover:underline">Privacy Settings</Link> or
        <ContactButton source="legal-privacy" category="legal" variant="link" size="default" className="h-auto p-0 inline">contact us</ContactButton>. We will respond within one month. You also have the right to
        lodge a complaint with your supervisory authority (see Section 18).
      </p>

      <h2 id="other-states">11. Other US State Laws</h2>
      <p>
        Residents of Virginia (CDPA), Colorado (CPA), Connecticut, Utah, and other states with similar laws
        may have rights to access, delete, correct, opt-out of targeted advertising, or port their data. To
        exercise these rights, <ContactButton source="legal-privacy" category="legal" variant="link" size="default" className="h-auto p-0 inline">contact us</ContactButton> or use our Privacy Settings.
      </p>

      <h2 id="breach">12. Data Breach Notification</h2>
      <p>
        In the event of a Personal Data breach that poses a risk to your rights and freedoms, we will notify
        affected individuals and relevant supervisory authorities as required by law (e.g., within 72 hours
        where GDPR applies). Notifications will include the nature of the breach, likely consequences, and
        remedial action taken.
      </p>

      <h2 id="automated">13. Automated Decision-Making</h2>
      <p>
        We may use automated processing (e.g., fraud detection, abuse prevention) to protect the Service.
        We do not use fully automated decision-making that produces legal or similarly significant effects
        on you without human involvement. If we introduce such processing, we will provide notice and the
        right to obtain human review.
      </p>

      <h2 id="marketing">14. Marketing Communications</h2>
      <p>
        We may send marketing emails (product updates, tips, offers) only with your consent or where
        permitted by law. You may opt out at any time via the unsubscribe link in emails or via{' '}
        <Link href="/legal/cookie-settings" className="text-primary hover:underline">Cookie Settings</Link>.
        Transactional emails (confirmations, security alerts) are sent as part of the Service and cannot be
        opted out of without closing your account.
      </p>

      <h2 id="cookies">15. Cookies</h2>
      <p>
        We use essential, functional, analytics, and optional marketing cookies. Essential cookies are
        required for the Service; others can be managed via our{' '}
        <Link href="/legal/cookie-settings" className="text-primary hover:underline">Cookie Settings</Link> or
        browser settings. See our <Link href="/legal/cookies" className="text-primary hover:underline">Cookie
        Policy</Link> for categories, purposes, durations, and how to control them.
      </p>

      <h2 id="security">16. Data Security</h2>
      <p>
        We implement encryption in transit (TLS 1.3) and at rest (AES-256), access controls, hashing for
        passwords and API keys, and regular security assessments. No system is completely secure; we cannot
        guarantee absolute security. See our <Link href="/security" className="text-primary hover:underline">Security
        & Compliance</Link> page for details.
      </p>

      <h2 id="controller">17. Data Controller Information</h2>
      <p>
        The Data Controller is {platformName} (or the legal entity operating the platform). For EU/UK
        residents, we may have an EU representative. <ContactButton source="legal-privacy" category="legal" variant="link" size="default" className="h-auto p-0 inline">Contact us</ContactButton> for entity details.
      </p>

      <h2 id="supervisory">18. Supervisory Authority</h2>
      <p>
        EU residents may lodge a complaint with the data protection authority in their country. UK residents
        may contact the Information Commissioner&apos;s Office (ICO): ico.org.uk. We will cooperate with
        supervisory authorities.
      </p>

      <h2 id="changes">19. Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy. Material changes will be posted on this page with an updated
        &quot;Last Updated&quot; date. We may also notify you by email for significant changes. Continued
        use after changes constitutes acceptance.
      </p>

      <h2 id="contact">20. Contact</h2>
      <LegalCallout variant="info" title="Contact">
        <p>For privacy questions or to exercise your rights:</p>
        <ul>
          <li><strong>Privacy:</strong> <ContactButton source="legal-privacy" category="legal" variant="link" size="default" className="h-auto p-0 inline">Contact Privacy</ContactButton></li>
          <li><strong>Data Protection Officer:</strong> <ContactButton source="legal-privacy" category="legal" variant="link" size="default" className="h-auto p-0 inline">Contact DPO</ContactButton></li>
          <li><strong>Privacy Settings:</strong> <Link href="/dashboard/settings/privacy" className="text-primary hover:underline">Dashboard</Link></li>
        </ul>
      </LegalCallout>

      <p className="text-sm text-muted-foreground mt-8">
        By using {platformName}, you acknowledge that you have read and understood this Privacy Policy.
      </p>

      <div className="not-prose flex flex-wrap gap-4 mt-8">
        <Link href="/legal/terms" className="text-primary hover:underline text-sm font-medium">Terms of Service</Link>
        <Link href="/legal/dpa" className="text-primary hover:underline text-sm font-medium">Data Processing Agreement</Link>
        <Link href="/legal/cookies" className="text-primary hover:underline text-sm font-medium">Cookie Policy</Link>
        <Link href="/security" className="text-primary hover:underline text-sm font-medium">Security & Compliance</Link>
      </div>
    </LegalPageLayout>
  );
}
