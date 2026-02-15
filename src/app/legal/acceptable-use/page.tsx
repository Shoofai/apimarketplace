import Link from 'next/link';
import { getPlatformName } from '@/lib/settings/platform-name';
import { LegalPageLayout } from '@/components/legal/LegalPageLayout';
import { LegalCallout } from '@/components/legal/LegalCallout';
import { ContactButton } from '@/components/contact/ContactButton';

const TOC_ITEMS = [
  { id: 'prohibited', label: '1. Prohibited Activities' },
  { id: 'api-restrictions', label: '2. API-Specific Restrictions' },
  { id: 'content', label: '3. Content Policies' },
  { id: 'provider-responsibilities', label: '4. API Provider Responsibilities' },
  { id: 'developer-responsibilities', label: '5. Developer Responsibilities' },
  { id: 'consequences', label: '6. Consequences of Violations' },
  { id: 'reporting', label: '7. Reporting Violations' },
  { id: 'examples', label: '8. Examples: Acceptable vs Unacceptable' },
  { id: 'contact', label: '9. Contact' },
];

export async function generateMetadata() {
  const name = await getPlatformName();
  return {
    title: `Acceptable Use Policy | ${name}`,
    description: `Acceptable Use Policy for ${name} - prohibited activities, API restrictions, and enforcement.`,
  };
}

export default async function AcceptableUsePolicyPage() {
  const platformName = await getPlatformName();
  return (
    <LegalPageLayout
      title="Acceptable Use Policy"
      version="Version 1.0"
      lastUpdated="February 14, 2026"
      tocItems={TOC_ITEMS}
    >
      <p>
        This Acceptable Use Policy (&quot;AUP&quot;) describes prohibited uses of the {platformName} platform
        (&quot;the Service&quot;). This policy is incorporated by reference into our{' '}
        <Link href="/legal/terms" className="text-primary hover:underline">Terms of Service</Link>. By using the
        Service, you agree to comply with this AUP. We may modify this policy at any time; continued use after
        changes constitutes acceptance.
      </p>

      <h2 id="prohibited">1. Prohibited Activities</h2>
          <p>You may not use the Service to:</p>
          <ul>
            <li>
              <strong>Violate laws:</strong> Use the Service in violation of any applicable local, state, national, or
              international law, regulation, or court order. This includes laws governing fraud, data protection, export
              control, anti-money laundering, and sanctions.
            </li>
            <li>
              <strong>Fraud and abuse:</strong> Engage in fraud, misrepresentation, phishing, identity theft, or any
              activity intended to deceive or harm others. Do not use stolen payment methods or credentials.
            </li>
            <li>
              <strong>Malware and harmful code:</strong> Distribute, upload, or transmit viruses, trojans, ransomware,
              or any malicious code. Do not attempt to compromise the integrity of the Service, APIs, or user systems.
            </li>
            <li>
              <strong>Unauthorized access:</strong> Access, probe, or attempt to breach any system, network, or account
              without authorization. Do not bypass authentication, rate limits, or security controls.
            </li>
            <li>
              <strong>Spam and unsolicited communications:</strong> Send spam, unsolicited bulk messages, or conduct
              unsolicited marketing. Do not harvest email addresses or personal data for marketing without consent.
            </li>
            <li>
              <strong>Scraping and automated abuse:</strong> Scrape the marketplace, APIs, or documentation beyond
              reasonable discovery or integration use. Do not run excessive automated requests that degrade service for
              others.
            </li>
            <li>
              <strong>Harassment and abuse:</strong> Harass, threaten, defame, or intimidate other users, API providers,
              or our staff. Do not use the Service to coordinate harassment campaigns.
            </li>
            <li>
              <strong>Intellectual property infringement:</strong> Infringe copyrights, trademarks, patents, or other
              intellectual property rights. Do not publish APIs or content you do not have rights to use.
            </li>
          </ul>

          <h2 id="api-restrictions">2. API-Specific Restrictions</h2>
          <p>When using APIs listed on {platformName}, you must also comply with:</p>
          <ul>
            <li>
              <strong>Rate limits:</strong> Respect rate limits imposed by API providers and the platform. Do not
              circumvent limits through multiple accounts, IP rotation, or other means.
            </li>
            <li>
              <strong>Credential security:</strong> Keep API keys and credentials confidential. Do not share keys,
              embed them in client-side code, or expose them in public repositories, logs, or screenshots.
            </li>
            <li>
              <strong>Reverse engineering:</strong> Do not reverse engineer, decompile, or disassemble the Service,
              APIs, or underlying infrastructure except as permitted by applicable law (e.g., interoperability).
            </li>
            <li>
              <strong>Reselling and redistribution:</strong> Do not resell or redistribute API access in violation of
              the API provider&apos;s terms or our marketplace rules. Enterprise redistribution may require separate
              agreements.
            </li>
            <li>
              <strong>DDoS and load abuse:</strong> Do not initiate denial-of-service attacks, excessive load, or
              traffic designed to overwhelm APIs or the platform.
            </li>
            <li>
              <strong>Data misuse:</strong> Do not use API data in ways prohibited by the API provider or applicable
              law. Respect data use restrictions, retention limits, and privacy requirements.
            </li>
          </ul>

          <h2 id="content">3. Content Policies</h2>
          <p>API providers listing on {platformName} must ensure their APIs and associated content do not:</p>
          <ul>
            <li>
              <strong>Facilitate illegal activity:</strong> Support illegal content, services, or transactions (e.g.,
              illegal drugs, weapons, human trafficking, child exploitation).
            </li>
            <li>
              <strong>Promote hate or violence:</strong> Promote hate speech, discrimination, violence, or content
              that incites harm against individuals or groups based on protected characteristics.
            </li>
            <li>
              <strong>Include harmful or deceptive content:</strong> Contain malware, deceptive practices, or content
              that could harm users or their systems.
            </li>
            <li>
              <strong>Violate third-party rights:</strong> Infringe intellectual property or violate the terms of
              third-party services on which the API depends.
            </li>
          </ul>
          <p>
            We reserve the right to review listed APIs and remove or suspend those that violate these policies. See
            our <Link href="/legal/terms" className="text-primary hover:underline">Terms of Service</Link> for
            content moderation procedures.
          </p>

          <h2 id="provider-responsibilities">4. API Provider Responsibilities</h2>
          <p>If you list an API on {platformName}, you agree to:</p>
          <ul>
            <li>Maintain accurate documentation and pricing.</li>
            <li>Operate your API in compliance with applicable laws and your own terms.</li>
            <li>Respond to abuse reports and security incidents in a timely manner.</li>
            <li>Notify us promptly of any breach, vulnerability, or compliance issue affecting your API or our platform.</li>
            <li>Not use the platform to collect developer data beyond what is necessary for API operation.</li>
          </ul>

          <h2 id="developer-responsibilities">5. Developer Responsibilities</h2>
          <p>If you use APIs via {platformName}, you agree to:</p>
          <ul>
            <li>Use APIs only for lawful purposes and in accordance with each API provider&apos;s terms.</li>
            <li>Protect your API keys and credentials from unauthorized access.</li>
            <li>Report suspected abuse or security issues via our <ContactButton source="legal-acceptable-use" category="abuse" reportType="aup_violation" variant="link" size="default" className="h-auto p-0 inline">contact form</ContactButton>.</li>
            <li>Not share accounts or credentials with unauthorized parties.</li>
          </ul>

          <h2 id="consequences">6. Consequences of Violations</h2>
          <p>Violations of this AUP may result in:</p>
          <ul>
            <li>
              <strong>Warning:</strong> For minor or first-time violations, we may issue a written warning and request
              corrective action.
            </li>
            <li>
              <strong>Suspension:</strong> Temporary suspension of account or API access until the violation is
              resolved.
            </li>
            <li>
              <strong>Termination:</strong> Permanent termination of account and access to the Service for serious or
              repeat violations.
            </li>
            <li>
              <strong>Legal action:</strong> Reporting to law enforcement or pursuing legal remedies where
              appropriate.
            </li>
          </ul>
          <p>
            We determine the appropriate response based on the nature and severity of the violation. We may take
            action without prior notice when necessary to protect the Service, users, or third parties (e.g., in
            response to security incidents or legal requirements).
          </p>

          <h2 id="reporting">7. Reporting Violations</h2>
          <p>
            To report violations of this AUP, suspected abuse, or security issues:
          </p>
          <ul>
            <li><strong>Abuse reports:</strong> <ContactButton source="legal-acceptable-use" category="abuse" reportType="aup_violation" variant="link" size="default" className="h-auto p-0 inline">Contact Abuse Team</ContactButton></li>
            <li><strong>Subject line:</strong> Include &quot;AUP Violation&quot; or &quot;Abuse Report&quot;</li>
            <li><strong>Include:</strong> Description of the violation, relevant URLs, timestamps, and any evidence.</li>
          </ul>
          <p>
            We will investigate reports in good faith and take action as appropriate. We may not disclose the outcome
            of investigations to reporters due to privacy and legal constraints.
          </p>

          <h2 id="examples">8. Examples: Acceptable vs Unacceptable Use</h2>
          <div className="not-prose overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted">
                  <th className="p-3 text-left font-semibold">Acceptable</th>
                  <th className="p-3 text-left font-semibold">Unacceptable</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <td className="p-3">Using APIs to build a legitimate app within rate limits</td>
                  <td className="p-3">Running scripts to scrape the entire marketplace</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-3">Storing API keys in environment variables or a secrets manager</td>
                  <td className="p-3">Committing API keys to public GitHub repositories</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-3">Listing an API with accurate documentation and pricing</td>
                  <td className="p-3">Listing an API that facilitates illegal transactions</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-3">Testing API integration in a development environment</td>
                  <td className="p-3">Sending massive traffic to overwhelm an API or the platform</td>
                </tr>
                <tr>
                  <td className="p-3">Reporting a vulnerability via our contact form</td>
                  <td className="p-3">Publicly disclosing a vulnerability before a fix is deployed</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2 id="contact">9. Contact</h2>
          <LegalCallout variant="info" title="Contact">
            <p>For questions about this Acceptable Use Policy: <ContactButton source="legal-acceptable-use" category="abuse" reportType="aup_violation" variant="link" size="default" className="h-auto p-0 inline">Contact Abuse Team</ContactButton></p>
            <p>For legal inquiries: <ContactButton source="legal-acceptable-use" category="legal" variant="link" size="default" className="h-auto p-0 inline">Contact Legal</ContactButton></p>
          </LegalCallout>

          <p className="text-sm text-muted-foreground mt-8">
            By using {platformName}, you acknowledge that you have read, understood, and agree to comply with this
            Acceptable Use Policy.
          </p>

      <div className="not-prose flex flex-wrap gap-4 mt-8">
        <Link href="/legal/terms" className="text-primary hover:underline text-sm font-medium">Terms of Service</Link>
        <Link href="/legal/privacy" className="text-primary hover:underline text-sm font-medium">Privacy Policy</Link>
        <Link href="/legal/sla" className="text-primary hover:underline text-sm font-medium">Service Level Agreement</Link>
        <Link href="/legal/cookies" className="text-primary hover:underline text-sm font-medium">Cookie Policy</Link>
        <Link href="/security" className="text-primary hover:underline text-sm font-medium">Security & Compliance</Link>
      </div>
    </LegalPageLayout>
  );
}
