import Link from 'next/link';
import { getPlatformName } from '@/lib/settings/platform-name';
import { LegalPageLayout } from '@/components/legal/LegalPageLayout';
import { LegalCallout } from '@/components/legal/LegalCallout';
import { ContactButton } from '@/components/contact/ContactButton';

const TOC_ITEMS = [
  { id: 'acceptance', label: '1. Acceptance of Terms' },
  { id: 'definitions', label: '2. Definitions' },
  { id: 'description', label: '3. Description of Service' },
  { id: 'registration', label: '4. Account Registration' },
  { id: 'acceptable-use', label: '5. Acceptable Use' },
  { id: 'providers', label: '6. API Providers' },
  { id: 'developers', label: '7. Developers' },
  { id: 'billing', label: '8. Billing and Payments' },
  { id: 'sla', label: '9. Service Level Expectations' },
  { id: 'content-moderation', label: '10. Content Moderation' },
  { id: 'ip', label: '11. Intellectual Property' },
  { id: 'privacy', label: '12. Privacy' },
  { id: 'warranties', label: '13. Warranties and Disclaimers' },
  { id: 'liability', label: '14. Limitation of Liability' },
  { id: 'termination', label: '15. Termination' },
  { id: 'force-majeure', label: '16. Force Majeure' },
  { id: 'export', label: '17. Export Compliance' },
  { id: 'third-party', label: '18. Third-Party Services' },
  { id: 'governing-law', label: '19. Governing Law' },
  { id: 'arbitration', label: '20. Dispute Resolution' },
  { id: 'indemnification', label: '21. Indemnification' },
  { id: 'class-waiver', label: '22. Class Action Waiver' },
  { id: 'entire-agreement', label: '23. Entire Agreement' },
  { id: 'notices', label: '24. Notices' },
  { id: 'severability', label: '25. Severability' },
  { id: 'assignment', label: '26. Assignment' },
  { id: 'contact', label: '27. Contact' },
];

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
    <LegalPageLayout
      title="Terms of Service"
      version="Version 1.1"
      lastUpdated="February 14, 2026"
      tocItems={TOC_ITEMS}
    >
      <h2 id="acceptance">1. Acceptance of Terms</h2>
      <p>
        By accessing or using {platformName} (&quot;the Service&quot;), you agree to be bound by these Terms of
        Service (&quot;Terms&quot;). If you disagree with any part of these terms, you may not access the Service.
        If you use the Service on behalf of an organization, you represent that you have authority to bind that
        organization and that the organization agrees to these Terms.
      </p>

      <h2 id="definitions">2. Definitions</h2>
      <ul>
        <li><strong>&quot;Platform&quot;</strong> means the {platformName} website, marketplace, API gateway, and related infrastructure.</li>
        <li><strong>&quot;API&quot;</strong> means an application programming interface listed on the Platform.</li>
        <li><strong>&quot;Provider&quot;</strong> means a user who publishes or distributes an API via the Platform.</li>
        <li><strong>&quot;Developer&quot;</strong> means a user who discovers, subscribes to, or integrates APIs via the Platform.</li>
        <li><strong>&quot;Organization&quot;</strong> means a business entity under which Providers or Developers operate.</li>
        <li><strong>&quot;Usage Data&quot;</strong> means data about API calls, subscriptions, billing, and analytics generated through use of the Service.</li>
      </ul>

      <h2 id="description">3. Description of Service</h2>
      <p>
        {platformName} is a marketplace platform that connects API providers with developers. The Service enables:
      </p>
      <ul>
        <li>Providers to publish, distribute, and monetize their APIs with documentation, pricing, and analytics</li>
        <li>Developers to discover, subscribe to, and integrate APIs with unified billing and key management</li>
        <li>Automated billing, usage tracking, analytics, and AI-powered documentation and code generation</li>
      </ul>
      <p>
        We reserve the right to modify, suspend, or discontinue any part of the Service with reasonable notice
        where practicable.
      </p>

      <h2 id="registration">4. Account Registration</h2>
      <p>
        You must be at least 18 years old to use the Service. You agree to provide accurate, current, and complete
        information during registration and to update it as needed. You are responsible for maintaining the
        security of your account credentials and for all activities under your account. You must notify us
        promptly of any unauthorized access.
      </p>

      <h2 id="acceptable-use">5. Acceptable Use</h2>
      <p>
        You agree to comply with our{' '}
        <Link href="/legal/acceptable-use" className="text-primary hover:underline">Acceptable Use Policy</Link>.
        Prohibited activities include, but are not limited to: violating laws; fraud; malware; unauthorized
        access; spam; scraping; harassment; intellectual property infringement; abuse of rate limits; credential
        sharing; reverse engineering (except as permitted by law); and DDoS or load abuse.
      </p>
      <p>
        We may suspend or terminate accounts that violate the Acceptable Use Policy. See the AUP for reporting
        mechanisms and examples of acceptable vs unacceptable use.
      </p>

      <h2 id="providers">6. API Providers</h2>
      <p>
        If you list an API on {platformName}, you agree to:
      </p>
      <ul>
        <li>
          <strong>License:</strong> Grant us a non-exclusive, royalty-free, worldwide license to display,
          distribute, and promote your API documentation, metadata, and branding as necessary to operate the
          Platform.
        </li>
        <li>
          <strong>Operation:</strong> Operate your API in accordance with applicable laws and your own terms.
          You are responsible for API uptime, accuracy of documentation, and support.
        </li>
        <li>
          <strong>Pricing:</strong> Maintain accurate and current pricing. Price changes apply to new
          subscriptions; existing subscriptions generally retain their pricing until renewal unless otherwise
          agreed.
        </li>
        <li>
          <strong>Platform fee:</strong> When payouts are enabled (e.g., via Stripe Connect), you accept a
          platform fee of 3% of gross revenue from subscriptions and usage billed through the Platform. Fees
          are deducted before payout.
        </li>
        <li>
          <strong>Support:</strong> Provide reasonable support to Developers who subscribe to your API.
        </li>
      </ul>
      <p>
        We do not guarantee minimum revenue or Developer uptake. Third-party API availability is your
        responsibility; our SLA applies to the Platform, not to individual APIs.
      </p>

      <h2 id="developers">7. Developers</h2>
      <p>
        If you use APIs via {platformName}, you agree to:
      </p>
      <ul>
        <li>
          <strong>Subscriptions:</strong> Subscriptions are billed monthly (or as specified in the API plan).
          Usage beyond plan limits may incur overage charges as defined in the API&apos;s pricing.
        </li>
        <li>
          <strong>API keys:</strong> Keep API keys and credentials confidential. Do not share, expose, or
          commit keys to public repositories. You are responsible for key compromise; rotate keys immediately
          if exposed.
        </li>
        <li>
          <strong>Rate limits:</strong> Respect rate limits imposed by API providers and the Platform.
        </li>
        <li>
          <strong>Third-party terms:</strong> Comply with each API provider&apos;s terms and policies when
          using their APIs.
        </li>
      </ul>

      <h2 id="billing">8. Billing and Payments</h2>
      <p>
        When billing is active, payment is by card via Stripe. Subscriptions are billed monthly; usage-based
        charges may be billed in arrears. Failed payments may result in suspension of access; we will attempt
        to notify you before suspension. Refunds are not provided for partial periods or unused quota unless
        otherwise agreed or required by law.
      </p>
      <p>
        Disputed charges must be raised within 30 days of the charge. We will work in good faith to resolve
        disputes. Chargebacks may result in account suspension.
      </p>
      <p>
        Platform billing and Stripe Connect payouts may not be active in all regions. Pricing is displayed in
        USD unless otherwise indicated.
      </p>

      <h2 id="sla">9. Service Level Expectations</h2>
      <p>
        We target 99.9% monthly uptime for the Platform. Details on availability, planned maintenance,
        exclusions, and service credits are set forth in our{' '}
        <Link href="/legal/sla" className="text-primary hover:underline">Service Level Agreement</Link>. The
        SLA does not cover third-party API availability.
      </p>

      <h2 id="content-moderation">10. Content Moderation</h2>
      <p>
        We reserve the right to review APIs and content listed on the Platform. We may remove or suspend
        listings that violate these Terms, the Acceptable Use Policy, or applicable law. Prohibited APIs
        include those that facilitate illegal activity, promote hate or violence, contain malware, or
        infringe third-party rights.
      </p>
      <p>
        If you believe content on the Platform infringes your rights, <ContactButton source="legal-terms" category="legal" reportType="dmca_takedown" variant="link" size="default" className="h-auto p-0 inline">contact us</ContactButton> with
        sufficient detail. We will process takedown requests in accordance with applicable law (e.g., DMCA).
      </p>

      <h2 id="ip">11. Intellectual Property</h2>
      <p>
        The Service, its design, branding, and underlying technology are owned by {platformName} or our
        licensors. You retain ownership of your content (e.g., API documentation, organization branding).
      </p>
      <p>
        By submitting content to the Platform, you grant us a non-exclusive, royalty-free, worldwide license
        to use, display, reproduce, and distribute that content as necessary to operate the Service.
      </p>
      <p>
        We respect intellectual property and respond to valid DMCA takedown notices. If you believe content
        infringes your copyright, send a notice via our <ContactButton source="legal-terms" category="legal" reportType="dmca_takedown" variant="link" size="default" className="h-auto p-0 inline">contact form</ContactButton> including: (1) identification of
        the copyrighted work; (2) identification of the infringing material; (3) your contact information;
        (4) a statement of good faith belief; (5) a statement under penalty of perjury that the information
        is accurate; and (6) your physical or electronic signature.
      </p>

      <h2 id="privacy">12. Privacy</h2>
      <p>
        Your use is subject to our <Link href="/legal/privacy" className="text-primary hover:underline">Privacy
        Policy</Link> and applicable data protection laws. Where we process Personal Data on your behalf, our{' '}
        <Link href="/legal/dpa" className="text-primary hover:underline">Data Processing Agreement</Link>
        applies.
      </p>

      <h2 id="warranties">13. Warranties and Disclaimers</h2>
      <LegalCallout variant="warning" title="Important">
        <p>
          THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND,
          EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
          PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED,
          ERROR-FREE, OR SECURE. WE DISCLAIM ALL LIABILITY FOR THIRD-PARTY API AVAILABILITY, ACCURACY, OR
          PERFORMANCE.
        </p>
      </LegalCallout>

      <h2 id="liability">14. Limitation of Liability</h2>
      <LegalCallout variant="warning" title="Important">
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE ARE NOT LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL,
          CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR GOODWILL. OUR TOTAL LIABILITY
          FOR ANY CLAIMS ARISING FROM OR RELATED TO THE SERVICE SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE
          TWELVE (12) MONTHS PRECEDING THE CLAIM, OR ONE HUNDRED DOLLARS ($100), WHICHEVER IS GREATER.
        </p>
      </LegalCallout>

      <h2 id="termination">15. Termination</h2>
      <p>
        You may terminate your account at any time from account settings. We may suspend or terminate accounts
        for violation of these Terms, the Acceptable Use Policy, fraud, non-payment, or security risk. Upon
        termination, your right to use the Service ceases. We may retain data as required by law or for
        legitimate business purposes.
      </p>

      <h2 id="force-majeure">16. Force Majeure</h2>
      <p>
        We are not liable for failure or delay in performance due to circumstances beyond our reasonable
        control, including acts of God, war, terrorism, pandemics, natural disasters, government actions,
        labor disputes, internet or telecommunications failures, or failures of third-party services
        (including cloud providers, payment processors, or API providers).
      </p>

      <h2 id="export">17. Export Compliance</h2>
      <p>
        You agree to comply with applicable export and sanctions laws, including U.S. Export Administration
        Regulations (EAR) and International Traffic in Arms Regulations (ITAR). You may not use the Service
        from, or transfer data to, sanctioned countries or in connection with prohibited end uses.
      </p>

      <h2 id="third-party">18. Third-Party Services</h2>
      <p>
        The Service integrates with third-party services (e.g., Stripe for payments, Supabase for data and
        auth, Vercel for hosting). Your use of those services is subject to their respective terms. We are
        not responsible for third-party service availability, security, or compliance. Data processed by
        Sub-Processors is covered by our <Link href="/legal/dpa" className="text-primary hover:underline">Data
        Processing Agreement</Link>.
      </p>

      <h2 id="governing-law">19. Governing Law and Jurisdiction</h2>
      <p>
        These Terms are governed by the laws of the State of Delaware, United States, without regard to
        conflict of law principles. Any legal action or proceeding arising out of or relating to these Terms
        or the Service shall be brought exclusively in the federal or state courts located in Delaware, and
        you consent to the personal jurisdiction of such courts.
      </p>

      <h2 id="arbitration">20. Dispute Resolution and Arbitration</h2>
      <p>
        Except for claims that qualify for small-claims court or injunctive relief, any dispute arising from
        these Terms or the Service shall be resolved by binding arbitration administered by the American
        Arbitration Association under its Commercial Arbitration Rules. The arbitration shall be conducted in
        Delaware. The arbitrator&apos;s award may be entered in any court of competent jurisdiction.
      </p>

      <h2 id="indemnification">21. Indemnification</h2>
      <p>
        You agree to indemnify, defend, and hold harmless {platformName}, its affiliates, officers, directors,
        employees, and agents from and against any claims, damages, losses, liabilities, costs, and expenses
        (including reasonable attorneys&apos; fees) arising out of or related to your use of the Service, your
        content, your violation of these Terms, or your violation of any third-party rights.
      </p>

      <h2 id="class-waiver">22. Class Action Waiver</h2>
      <p>
        You agree that any dispute resolution proceedings will be conducted only on an individual basis and not
        in a class, consolidated, or representative action. You waive any right to participate in a class
        action or class-wide arbitration.
      </p>

      <h2 id="entire-agreement">23. Entire Agreement</h2>
      <p>
        These Terms, together with the Privacy Policy, Acceptable Use Policy, SLA, DPA, and Cookie Policy,
        constitute the entire agreement between you and {platformName} regarding the Service and supersede
        any prior agreements.
      </p>

      <h2 id="notices">24. Notices</h2>
      <p>
        We may provide notices by email to your registered address, by posting on the Platform, or through the
        Service. Notices are deemed received when sent (email) or posted (Platform). You may send legal
        notices via our <ContactButton source="legal-terms" category="legal" variant="link" size="default" className="h-auto p-0 inline">contact form</ContactButton>. We will use reasonable efforts to respond to formal legal
        notices.
      </p>

      <h2 id="severability">25. Severability</h2>
      <p>
        If any provision of these Terms is held to be invalid or unenforceable, the remaining provisions will
        remain in full force and effect. The invalid or unenforceable provision shall be modified to the
        minimum extent necessary to make it valid and enforceable while preserving the parties&apos; intent.
      </p>

      <h2 id="assignment">26. Assignment</h2>
      <p>
        You may not assign or transfer these Terms or your account without our prior written consent. We may
        assign our rights and obligations under these Terms without restriction, including in connection with
        a merger, acquisition, or sale of assets.
      </p>

      <h2 id="contact">27. Contact</h2>
      <LegalCallout variant="info" title="Contact">
        <p>For questions about these Terms: <ContactButton source="legal-terms" category="legal" variant="link" size="default" className="h-auto p-0 inline">Contact Legal Team</ContactButton></p>
      </LegalCallout>

      <p className="text-sm text-muted-foreground mt-8">
        By using {platformName}, you acknowledge that you have read, understood, and agree to be bound by these
        Terms of Service.
      </p>

      <div className="not-prose flex flex-wrap gap-4 mt-8">
        <Link href="/legal/privacy" className="text-primary hover:underline text-sm font-medium">Privacy Policy</Link>
        <Link href="/legal/acceptable-use" className="text-primary hover:underline text-sm font-medium">Acceptable Use Policy</Link>
        <Link href="/legal/sla" className="text-primary hover:underline text-sm font-medium">Service Level Agreement</Link>
        <Link href="/legal/dpa" className="text-primary hover:underline text-sm font-medium">Data Processing Agreement</Link>
        <Link href="/legal/cookies" className="text-primary hover:underline text-sm font-medium">Cookie Policy</Link>
      </div>
    </LegalPageLayout>
  );
}
