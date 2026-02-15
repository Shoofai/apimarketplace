import Link from 'next/link';
import { getPlatformName } from '@/lib/settings/platform-name';
import { LegalPageLayout } from '@/components/legal/LegalPageLayout';
import { LegalCallout } from '@/components/legal/LegalCallout';
import { ContactButton } from '@/components/contact/ContactButton';

const TOC_ITEMS = [
  { id: 'definitions', label: '1. Definitions' },
  { id: 'roles', label: '2. Roles and Responsibilities' },
  { id: 'scope', label: '3. Processing Instructions and Scope' },
  { id: 'sub-processors', label: '4. Sub-Processors' },
  { id: 'security', label: '5. Security Measures' },
  { id: 'data-subject-rights', label: '6. Data Subject Rights' },
  { id: 'breach', label: '7. Data Breach Notification' },
  { id: 'transfers', label: '8. International Data Transfers' },
  { id: 'audit', label: '9. Audit and Compliance' },
  { id: 'deletion', label: '10. Deletion and Return of Data' },
  { id: 'contact', label: '11. Contact' },
];

export async function generateMetadata() {
  const name = await getPlatformName();
  return {
    title: `Data Processing Agreement | ${name}`,
    description: `Data Processing Agreement for ${name} - GDPR-compliant processor terms and sub-processor list.`,
  };
}

export default async function DataProcessingAgreementPage() {
  const platformName = await getPlatformName();
  return (
    <LegalPageLayout
      title="Data Processing Agreement"
      version="Version 1.0"
      lastUpdated="February 14, 2026"
      tocItems={TOC_ITEMS}
    >
      <p>
        This Data Processing Agreement (&quot;DPA&quot;) supplements our{' '}
        <Link href="/legal/terms" className="text-primary hover:underline">Terms of Service</Link> and{' '}
        <Link href="/legal/privacy" className="text-primary hover:underline">Privacy Policy</Link> where we
        process Personal Data on behalf of Customers (as Data Controller) in connection with the {platformName}
        platform. This DPA is designed to meet the requirements of GDPR Article 28 and other applicable data
        protection laws.
      </p>

      <h2 id="definitions">1. Definitions</h2>
          <ul>
            <li>
              <strong>&quot;Controller&quot;</strong> means the Customer who determines the purposes and means of
              processing Personal Data (e.g., an API provider or developer using the Service).
            </li>
            <li>
              <strong>&quot;Processor&quot;</strong> means {platformName} (or the legal entity operating the platform)
              who processes Personal Data on behalf of the Controller.
            </li>
            <li>
              <strong>&quot;Personal Data&quot;</strong> means any information relating to an identified or
              identifiable natural person as defined in GDPR Article 4(1).
            </li>
            <li>
              <strong>&quot;Processing&quot;</strong> means any operation performed on Personal Data (collection,
              storage, use, disclosure, etc.) as defined in GDPR Article 4(2).
            </li>
            <li>
              <strong>&quot;Sub-Processor&quot;</strong> means any third party engaged by the Processor to process
              Personal Data on behalf of the Controller.
            </li>
            <li>
              <strong>&quot;Data Subject&quot;</strong> means the identified or identifiable natural person to whom
              Personal Data relates.
            </li>
          </ul>

          <h2 id="roles">2. Roles and Responsibilities</h2>
          <p>
            The Customer acts as Controller with respect to Personal Data it provides or causes to be processed via
            the Service (e.g., end-user data, developer account data, API usage data). {platformName} acts as
            Processor when processing such data in accordance with the Customer&apos;s instructions.
          </p>
          <p>
            The Processor shall process Personal Data only on documented instructions from the Controller, including
            as set forth in the Terms of Service, Privacy Policy, and this DPA. The Processor shall not process
            Personal Data for any other purpose except as required by applicable law; in such case, the Processor
            shall inform the Controller of that legal requirement before processing, unless the law prohibits such
            disclosure.
          </p>

          <h2 id="scope">3. Processing Instructions and Scope</h2>
          <p>The Processor processes Personal Data for the following purposes:</p>
          <ul>
            <li>Providing and operating the {platformName} platform (marketplace, API gateway, billing, analytics)</li>
            <li>Authenticating users and managing accounts</li>
            <li>Processing subscriptions and payments (via Stripe)</li>
            <li>Storing and serving API documentation and metadata</li>
            <li>Monitoring usage, performance, and security</li>
            <li>Communicating with users (support, notifications, transactional email)</li>
            <li>Complying with legal obligations</li>
          </ul>
          <p>
            <strong>Categories of Personal Data:</strong> Account identifiers (name, email, organization), payment
            information (processed by Stripe), usage data (API calls, subscriptions, analytics), device and log
            data (IP address, user agent, timestamps).
          </p>
          <p>
            <strong>Categories of Data Subjects:</strong> Developers, API providers, organization administrators,
            end users of APIs (where the Controller passes such data through the platform).
          </p>
          <p>
            <strong>Duration:</strong> Processing continues for the term of the Customer&apos;s use of the Service
            and for as long as necessary thereafter to fulfill legal retention requirements (e.g., 7 years for
            financial records).
          </p>

          <h2 id="sub-processors">4. Sub-Processors</h2>
          <p>
            The Processor engages the following Sub-Processors to assist in providing the Service. Each Sub-Processor
            is bound by contractual obligations substantially similar to those in this DPA.
          </p>
          <div className="not-prose overflow-hidden rounded-lg border border-border my-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted">
                  <th className="p-3 text-left font-semibold">Sub-Processor</th>
                  <th className="p-3 text-left font-semibold">Purpose</th>
                  <th className="p-3 text-left font-semibold">Location</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <td className="p-3">Supabase</td>
                  <td className="p-3">Database, authentication, realtime</td>
                  <td className="p-3">US / EU (configurable)</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-3">Stripe</td>
                  <td className="p-3">Payment processing, billing</td>
                  <td className="p-3">US (global)</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-3">Vercel</td>
                  <td className="p-3">Hosting, CDN, edge functions</td>
                  <td className="p-3">Global</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-3">Anthropic</td>
                  <td className="p-3">AI features (e.g., code generation)</td>
                  <td className="p-3">US</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            We will notify Customers of any new Sub-Processors at least 30 days before authorizing them to process
            Personal Data. Customers may object on reasonable grounds relating to data protection. If we cannot
            reasonably accommodate the objection, the Customer may terminate the affected services without penalty.
          </p>

          <h2 id="security">5. Security Measures (Article 32)</h2>
          <p>The Processor implements appropriate technical and organizational measures to ensure a level of security appropriate to the risk:</p>
          <ul>
            <li>
              <strong>Encryption:</strong> Data encrypted in transit (TLS 1.3) and at rest (AES-256). API keys and
              credentials are hashed; plain-text keys are never stored.
            </li>
            <li>
              <strong>Access control:</strong> Role-based access control (RBAC), row-level security (RLS), and
              principle of least privilege. Production access is limited, logged, and reviewed.
            </li>
            <li>
              <strong>Authentication:</strong> Secure authentication via Supabase Auth with support for MFA. Session
              management with secure token handling.
            </li>
            <li>
              <strong>Infrastructure:</strong> Hosting on trusted cloud providers (Vercel, Supabase) with security
              certifications. Regular dependency updates and security patching.
            </li>
            <li>
              <strong>Incident response:</strong> Defined procedures for detecting, containing, and resolving
              security incidents. Affected Controllers notified per Section 7.
            </li>
          </ul>
          <p>
            For more details, see our <Link href="/security" className="text-primary hover:underline">Security &
            Compliance</Link> page.
          </p>

          <h2 id="data-subject-rights">6. Data Subject Rights</h2>
          <p>
            The Processor shall assist the Controller in fulfilling its obligations to respond to Data Subject
            requests (access, rectification, erasure, restriction, portability, objection) as set forth in GDPR
            Articles 12–22.
          </p>
          <p>
            To the extent a Data Subject request is directed to the Processor, the Processor shall promptly inform
            the Controller and shall not respond to the Data Subject except with the Controller&apos;s prior
            authorization or as required by law. The Processor shall provide reasonable assistance, including by
            providing the Controller with the ability to access, correct, or delete Personal Data through the
            Service or upon request.
          </p>
          <p>
            Controllers and Data Subjects may also <ContactButton source="legal-dpa" category="legal" variant="link" size="default" className="h-auto p-0 inline">contact us</ContactButton> or via{' '}
            <Link href="/dashboard/settings/privacy" className="text-primary hover:underline">Privacy Settings</Link>.
          </p>

          <h2 id="breach">7. Data Breach Notification</h2>
          <p>
            In the event of a Personal Data breach, the Processor shall:
          </p>
          <ol>
            <li>Notify the Controller without undue delay and in any event within 72 hours of becoming aware of the breach</li>
            <li>Provide information reasonably available to assist the Controller in meeting its breach notification obligations</li>
            <li>Include, where possible: nature of the breach, categories and approximate number of Data Subjects and records affected, likely consequences, and measures taken or proposed to address the breach</li>
          </ol>
          <p>
            The Processor shall document breaches, their effects, and remedial action taken, and make such
            documentation available to the Controller and supervisory authorities upon request.
          </p>

          <h2 id="transfers">8. International Data Transfers</h2>
          <p>
            Personal Data may be transferred to and processed in countries outside the EEA, UK, or Switzerland. Where
            such transfers occur, we ensure appropriate safeguards are in place:
          </p>
          <ul>
            <li>
              <strong>Standard Contractual Clauses (SCCs):</strong> We use the EU Commission&apos;s Standard
              Contractual Clauses (2021) with our Sub-Processors where required.
            </li>
            <li>
              <strong> adequacy:</strong> Transfers to countries deemed adequate by the EU Commission, UK, or Swiss
              authorities are permitted without additional safeguards.
            </li>
            <li>
              <strong>Supplementary measures:</strong> Where necessary, we implement supplementary measures
              (encryption, access controls) to ensure an essentially equivalent level of protection.
            </li>
          </ul>
          <p>
            Enterprise customers may request a signed DPA incorporating SCCs. <ContactButton source="legal-dpa" category="legal" variant="link" size="default" className="h-auto p-0 inline">Contact DPO</ContactButton>.
          </p>

          <h2 id="audit">9. Audit and Compliance</h2>
          <p>
            The Processor shall make available to the Controller all information necessary to demonstrate compliance
            with this DPA and applicable data protection laws. Upon reasonable notice and no more than once per year,
            the Processor shall allow for and contribute to audits or inspections conducted by the Controller or an
            agreed third-party auditor, subject to confidentiality obligations and reasonable scheduling to avoid
            disruption.
          </p>
          <p>
            The Processor maintains documentation of its processing activities and security measures. We are on a
            SOC 2 Type II roadmap and will share relevant compliance certifications when available.
          </p>

          <h2 id="deletion">10. Deletion and Return of Data</h2>
          <p>
            Upon termination of the Service or upon the Controller&apos;s request, the Processor shall delete or
            return all Personal Data processed on behalf of the Controller, unless required to retain it by law.
            Deletion shall be completed within 90 days of termination or request, except where longer retention is
            required for legal, regulatory, or audit purposes (e.g., financial records for 7 years).
          </p>

          <h2 id="contact">11. Contact</h2>
          <LegalCallout variant="info" title="Contact">
            <p>For DPA and data protection inquiries:</p>
            <ul>
              <li><strong>Privacy:</strong> <ContactButton source="legal-dpa" category="legal" variant="link" size="default" className="h-auto p-0 inline">Contact Privacy</ContactButton></li>
              <li><strong>Data Protection Officer:</strong> <ContactButton source="legal-dpa" category="legal" variant="link" size="default" className="h-auto p-0 inline">Contact DPO</ContactButton></li>
              <li><strong>Signed DPA / Enterprise:</strong> <ContactButton source="legal-dpa" category="legal" variant="link" size="default" className="h-auto p-0 inline">Contact Legal</ContactButton></li>
            </ul>
          </LegalCallout>

          <p className="text-sm text-muted-foreground mt-8">
            By using {platformName} and processing Personal Data through the Service, you acknowledge that you have
            read and agree to this Data Processing Agreement.
          </p>

      <div className="not-prose flex flex-wrap gap-4 mt-8">
        <Link href="/legal/terms" className="text-primary hover:underline text-sm font-medium">Terms of Service</Link>
        <Link href="/legal/privacy" className="text-primary hover:underline text-sm font-medium">Privacy Policy</Link>
        <Link href="/legal/cookies" className="text-primary hover:underline text-sm font-medium">Cookie Policy</Link>
        <Link href="/security" className="text-primary hover:underline text-sm font-medium">Security & Compliance</Link>
        <Link href="/contact" className="text-primary hover:underline text-sm font-medium">Contact</Link>
      </div>
    </LegalPageLayout>
  );
}
