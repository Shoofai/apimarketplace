export type HelpCategory =
  | 'Getting Started'
  | 'Billing & Account'
  | 'API Integration'
  | 'Security'
  | 'For Providers'
  | 'Troubleshooting';

export interface HelpArticle {
  slug: string;
  title: string;
  category: HelpCategory;
  summary: string;
  /** Markdown body */
  body: string;
  keywords?: string[];
}

export const HELP_CATEGORIES: HelpCategory[] = [
  'Getting Started',
  'Billing & Account',
  'API Integration',
  'Security',
  'For Providers',
  'Troubleshooting',
];

export const HELP_ARTICLES: HelpArticle[] = [
  // ─── Getting Started ───────────────────────────────────────────────────
  {
    slug: 'how-to-get-started',
    title: 'How to get started as a developer',
    category: 'Getting Started',
    summary: 'Sign up, browse the marketplace, subscribe to an API, and generate integration code in minutes.',
    keywords: ['signup', 'first steps', 'onboarding', 'quickstart'],
    body: `## Getting started in 5 steps

**1. Create a free account**

Sign up at [/signup](/signup). No credit card required for the free tier.

**2. Browse the marketplace**

Go to [/marketplace](/marketplace) to browse 10,000+ APIs by category, rating, and pricing. Use filters to narrow by language, use case, or price.

**3. Subscribe to an API**

Open an API's page and click **Subscribe**. Free plans are activated instantly. Paid plans go through Stripe Checkout.

**4. Get your API key**

After subscribing, find your API key in the [dashboard](/dashboard). Keys are shown once — save them securely.

**5. Use docs and AI code generation**

Open the API's documentation page for the full reference. Use the [AI Playground](/dashboard/developer) to generate ready-to-run integration code in JavaScript, Python, or other languages.

---

## Next steps

- [Browse the marketplace](/marketplace)
- [View your subscriptions](/dashboard/discover/subscriptions)
- [Try the AI Playground](/dashboard/developer)
`,
  },
  {
    slug: 'how-to-list-your-api',
    title: 'How to list your API',
    category: 'Getting Started',
    summary: 'Create an organization, publish your API, set pricing, and connect Stripe for payouts.',
    keywords: ['publish', 'list api', 'provider', 'onboarding'],
    body: `## Publishing your first API

**1. Create an account and set up your organization**

Sign up at [/signup](/signup). During onboarding, select **I want to list my API** and choose the "Provider" organization type.

**2. Add your API**

From the dashboard, go to **Provider → My APIs → Publish New API**. Fill in name, description, and category. You can paste your OpenAPI spec to auto-populate documentation.

**3. Set pricing plans**

Create one or more pricing plans (free tiers, monthly subscriptions, usage-based). You can offer a free tier alongside paid tiers.

**4. Connect Stripe for payouts**

Go to **Settings → Payouts** and connect your Stripe account via Stripe Connect. The platform takes a 3% fee on revenue billed through the platform.

**5. Submit for review**

New APIs are reviewed before going live. Typically approved within 1 business day. You'll receive an email when your API is published.

---

## After publishing

- Track subscribers and revenue in **Provider → Analytics**
- Update your OpenAPI spec at any time from the API settings
- Respond to subscriber support via the ticketing system
`,
  },
  {
    slug: 'api-key-management',
    title: 'Managing your API keys',
    category: 'Getting Started',
    summary: 'Find, rotate, and revoke your API keys from the dashboard.',
    keywords: ['api key', 'rotate', 'revoke', 'credentials'],
    body: `## API key management

### Finding your API key

After subscribing to an API, your key is available in **Settings → API Keys** or on the subscription detail page. Keys are revealed once — if you miss it, rotate to get a new one.

### Rotating a key

1. Go to **Settings → API Keys**
2. Find the subscription
3. Click **Rotate key**
4. Copy and update your integration immediately — the old key is invalidated

### Revoking a key

To revoke a key without generating a new one, cancel the subscription. The key stops working immediately.

### Security best practices

- Never commit API keys to source control
- Store keys in environment variables or a secrets manager
- Rotate keys immediately if you suspect exposure
- Use separate keys per environment (dev, staging, production)

If your key was compromised, rotate it immediately from the dashboard and [contact security](/contact?category=security).
`,
  },

  // ─── Billing & Account ─────────────────────────────────────────────────
  {
    slug: 'how-billing-works',
    title: 'How billing works',
    category: 'Billing & Account',
    summary: 'Subscriptions are billed monthly via Stripe. Usage-based charges apply beyond plan limits.',
    keywords: ['billing', 'payment', 'invoice', 'stripe', 'subscription'],
    body: `## Billing overview

### Platform subscription

Your platform plan (Free or Pro) is billed monthly at the start of each billing period. The Pro plan is **$99/month**.

- **Free:** $0/month. 50 AI generations/day, 10,000 API calls/month.
- **Pro:** $99/month. 200 AI generations/day, 1M API calls/month, priority support.
- **Enterprise:** Custom pricing. [Contact sales](/contact?category=Enterprise).

### API subscriptions

Individual API subscriptions are billed separately by each API provider. Payments are processed through Stripe. You can view all your subscriptions in **Settings → Billing**.

### Credits

Prepaid credits can be used for AI generations beyond your plan's daily limit. Buy credits from **Dashboard → Credits**. Credits never expire.

### Invoices

Invoices are generated monthly and available in **Settings → Billing**. You can download PDFs or view them in the Stripe portal.

### Payment methods

All payments are processed through Stripe. You can update your payment method at any time via **Settings → Billing → Manage Subscription**.
`,
  },
  {
    slug: 'cancel-or-change-plan',
    title: 'How to cancel or change your plan',
    category: 'Billing & Account',
    summary: 'Cancel anytime from Settings → Billing. Cancellation takes effect at the end of the billing period.',
    keywords: ['cancel', 'downgrade', 'upgrade', 'plan change'],
    body: `## Changing or cancelling your plan

### Upgrading to Pro

Go to **Settings → Billing** and click **Upgrade to Pro**. You'll be redirected to Stripe Checkout. The upgrade takes effect immediately.

### Cancelling your subscription

1. Go to **Settings → Billing**
2. Click **Manage Subscription**
3. In the Stripe portal, select **Cancel plan**

Your access continues until the end of the current billing period. You will not be charged for the next period.

### Downgrading

After cancellation, your account returns to the Free tier at the end of the billing period. Your data and subscriptions are preserved; features beyond the Free tier limits become unavailable.

### Refund policy

Refunds are not provided for partial periods or unused quota unless otherwise required by law. [Contact support](/contact?category=support) for billing disputes.
`,
  },
  {
    slug: 'how-to-get-refund',
    title: 'Refund policy',
    category: 'Billing & Account',
    summary: 'Our refund policy and how to submit a billing dispute.',
    keywords: ['refund', 'dispute', 'charge'],
    body: `## Refund policy

We do not provide refunds for:
- Partial billing periods
- Unused API call quota
- Credits that have been consumed

### Exceptions

Refunds may be issued in cases of:
- Duplicate charges
- Billing errors on our part
- Situations required by applicable law

### Submitting a billing dispute

[Contact support](/contact?category=Billing Issue) and include:
- Your account email
- The invoice number or charge amount
- A description of the issue

We aim to resolve billing disputes within 3 business days.
`,
  },

  // ─── API Integration ───────────────────────────────────────────────────
  {
    slug: 'making-your-first-api-call',
    title: 'Making your first API call',
    category: 'API Integration',
    summary: 'How to authenticate and make your first request to a subscribed API.',
    keywords: ['api call', 'authentication', 'request', 'curl', 'http'],
    body: `## Making your first API call

### Authentication

All API calls require your API key in the request header:

\`\`\`http
Authorization: Bearer YOUR_API_KEY
\`\`\`

Or as a query parameter (check the specific API's documentation):

\`\`\`
GET https://api.example.com/endpoint?api_key=YOUR_API_KEY
\`\`\`

### Using the AI Playground

The fastest way to get working code:

1. Go to [AI Playground](/dashboard/developer)
2. Select your subscribed API
3. Describe what you want to do in plain English
4. Copy the generated code in your language of choice

### Rate limits

Rate limits vary by API and subscription plan. Check the API's documentation for its specific limits. If you exceed a limit, you'll receive a **429 Too Many Requests** response.

### Debugging

- Check the [API Status page](/status) for platform health
- Review the API's documentation for correct endpoint paths and parameters
- Use the Sandbox in your dashboard to test calls safely
`,
  },
  {
    slug: 'webhooks-and-integrations',
    title: 'Webhooks and integrations',
    category: 'API Integration',
    summary: 'Configure webhooks to receive real-time events from your subscribed APIs.',
    keywords: ['webhook', 'zapier', 'integration', 'events'],
    body: `## Webhooks

### Platform webhooks

You can configure webhooks in **Settings → Webhooks** to receive notifications for platform events such as:

- Subscription created or cancelled
- API key rotated
- Invoice paid

### Individual API webhooks

Many APIs offer their own webhook events. Check the specific API's documentation for supported events and how to configure them.

### Enterprise integrations

Enterprise customers can request custom integration support. [Contact sales](/contact?category=Enterprise) for:
- Zapier integration
- Custom Slack notifications
- SIEM/log forwarding
- SSO (SAML/OIDC)
`,
  },

  // ─── Security ──────────────────────────────────────────────────────────
  {
    slug: 'compromised-api-key',
    title: 'What to do if your API key is compromised',
    category: 'Security',
    summary: 'Rotate your key immediately and follow these steps to secure your account.',
    keywords: ['compromised', 'leaked', 'security', 'rotate', 'breach'],
    body: `## Compromised API key — immediate steps

### 1. Rotate the key immediately

Go to **Settings → API Keys**, find the affected subscription, and click **Rotate key**. The old key is revoked instantly.

### 2. Update your integrations

Replace the old key in all your environments (dev, staging, production) with the new key.

### 3. Review your usage logs

Check the API's usage logs in **Dashboard → Analytics** for unusual activity or unexpected spikes.

### 4. Notify the API provider

If you see unauthorized usage, [contact support](/contact?category=security) and optionally notify the API provider directly.

### 5. Audit your secrets management

Review how the key was stored. Never commit keys to source control. Use environment variables or a dedicated secrets manager (e.g. AWS Secrets Manager, Vault, Doppler).

---

If you need further assistance, [contact our security team](/contact?category=security).
`,
  },
  {
    slug: 'security-and-compliance',
    title: 'Security and compliance overview',
    category: 'Security',
    summary: 'How the platform handles data security, encryption, and compliance.',
    keywords: ['security', 'compliance', 'gdpr', 'soc2', 'encryption', 'data'],
    body: `## Security overview

### Data encryption

- All data is encrypted in transit using TLS 1.2+
- Data at rest is encrypted using AES-256
- API keys are stored as salted hashes — plaintext keys are never stored after creation

### Authentication

- Email/password authentication with bcrypt hashing
- OAuth2 (Google) single sign-on available
- Session tokens are short-lived with secure refresh rotation
- Platform admins require additional verification

### Access control

- Row-level security (RLS) enforced at the database layer
- Organization isolation: users can only access data within their organization
- API keys are scoped to a single subscription

### Compliance

We are working toward SOC 2 Type II certification. Our [Security & Compliance page](/security) has the latest status.

For enterprise compliance requirements (GDPR DPA, custom DPA, penetration test reports), [contact sales](/contact?category=Enterprise).

### Reporting a vulnerability

Please report security vulnerabilities responsibly via [contact security](/contact?category=security). Do not publicly disclose before we've had a chance to respond.
`,
  },

  // ─── For Providers ─────────────────────────────────────────────────────
  {
    slug: 'provider-payouts',
    title: 'How provider payouts work',
    category: 'For Providers',
    summary: 'Connect Stripe, understand the 3% platform fee, and track your earnings.',
    keywords: ['payout', 'stripe connect', 'earnings', 'fee', 'revenue'],
    body: `## Provider payouts

### Platform fee

The platform takes a **3% fee** on all revenue billed through the platform. This covers payment processing, fraud protection, and platform infrastructure.

### Connecting Stripe

1. Go to **Dashboard → Provider → Payouts**
2. Click **Connect with Stripe**
3. Complete the Stripe Connect onboarding (identity verification, bank account)

Payouts are sent to your connected Stripe account on a rolling basis (typically 2 business days after a subscriber's payment clears).

### Minimum payout threshold

The minimum payout is $1.00. Earnings below this threshold are held until the next payout cycle.

### Viewing earnings

Track your earnings in **Provider → Analytics**:
- Revenue by month
- Active subscribers
- Churn rate
- Per-plan breakdown

### Disputes and refunds

If a subscriber disputes a charge, Stripe handles the dispute process. You will be notified and given 7 days to respond with evidence. [Contact support](/contact?category=Payout Issue) if you need assistance.
`,
  },
  {
    slug: 'api-review-process',
    title: 'API review and approval process',
    category: 'For Providers',
    summary: 'What happens after you submit your API for review, and what reviewers look for.',
    keywords: ['review', 'approval', 'publish', 'moderation'],
    body: `## API review process

When you submit an API for publication, our team reviews it to ensure quality and safety for subscribers.

### What reviewers check

- **Documentation quality:** Does the API have a valid OpenAPI spec? Are endpoints documented?
- **Description accuracy:** Does the description accurately describe what the API does?
- **Pricing clarity:** Are pricing plans clearly defined with accurate limits?
- **Legal compliance:** No illegal content, no spam APIs, no terms violations

### Timeline

Reviews typically complete within **1 business day**. You'll receive an email with the outcome.

### If your API is rejected

You'll receive a rejection reason. Common reasons:
- Missing or incomplete OpenAPI spec
- Vague or inaccurate description
- No working endpoint or base URL

Fix the issues and resubmit. There's no limit on resubmissions.

### After approval

Your API appears in the marketplace immediately. Subscribers can find it via search, category browsing, or direct link.
`,
  },

  // ─── Troubleshooting ───────────────────────────────────────────────────
  {
    slug: 'platform-status',
    title: 'Checking platform status',
    category: 'Troubleshooting',
    summary: 'How to check real-time status of platform services and subscribe to incident notifications.',
    keywords: ['status', 'outage', 'incident', 'downtime', 'uptime'],
    body: `## Platform status

### Status page

Visit [/status](/status) for real-time health of all platform services:

- API gateway
- Authentication
- Marketplace and search
- AI Playground
- Billing and payments
- Webhooks

### Subscribing to incidents

On the status page, click **Subscribe** to receive email or SMS notifications for incidents and maintenance windows.

### Reporting an issue

If you believe something is broken but the status page shows all systems operational, [contact support](/contact?category=Technical Support) with:
- What you were trying to do
- The error message or response code
- Your account email and the API name
`,
  },
  {
    slug: 'response-times-and-sla',
    title: 'Support response times and SLA',
    category: 'Troubleshooting',
    summary: 'Expected response times by plan tier and what the SLA guarantees.',
    keywords: ['sla', 'response time', 'support', 'enterprise'],
    body: `## Support response times

| Plan | First response | Business hours |
|------|---------------|----------------|
| Free | 48 hours | Mon–Fri |
| Pro | 24 hours | Mon–Fri |
| Enterprise | 4 hours | 24/7 |

Business hours are Monday–Friday, excluding public holidays.

### Escalating a ticket

If your ticket has not received a response within the expected window, reply to the email confirmation or update your ticket from the dashboard. Tickets can be marked as **Urgent** if your workload is impacted.

### Enterprise SLA

Enterprise customers have a formal SLA with uptime guarantees and remedies. Contact your account manager or [view the SLA](/legal/sla).

### What the SLA covers

- Response time for support tickets
- Platform uptime (99.9% monthly)
- Planned maintenance notification (72 hours in advance)

The SLA does not cover third-party API availability or issues caused by subscriber misconfiguration.
`,
  },
  {
    slug: 'common-api-errors',
    title: 'Common API error codes',
    category: 'Troubleshooting',
    summary: 'What 401, 403, 429, and 500 errors mean and how to resolve them.',
    keywords: ['401', '403', '429', '500', 'error', 'unauthorized', 'rate limit'],
    body: `## Common API error codes

### 401 Unauthorized

Your API key is missing or invalid.

**Fix:** Check that you are including the key in the correct header format: \`Authorization: Bearer YOUR_KEY\`. Verify the key is still active in **Settings → API Keys**.

### 403 Forbidden

You are authenticated but don't have access to this resource.

**Fix:**
- Confirm you have an active subscription to this API
- Check that your subscription plan includes the endpoint you're calling
- If you hit a daily AI generation limit, buy credits from [Dashboard → Credits](/dashboard/credits)

### 429 Too Many Requests

You've exceeded the rate limit for your subscription plan.

**Fix:** Implement exponential backoff with jitter. Upgrade your plan for higher rate limits. Check the \`Retry-After\` response header for when to retry.

### 500 Internal Server Error

An unexpected error on the server side.

**Fix:** Retry the request after a short delay. If the problem persists, check the [status page](/status) and [contact support](/contact?category=Technical Support) with the request ID from the response.

### 503 Service Unavailable

The API or platform is temporarily unavailable.

**Fix:** Check the [status page](/status) for active incidents. Retry with exponential backoff.
`,
  },
];

/** Flat-search helper — matches title, summary, body, and keywords */
export function searchArticles(query: string): HelpArticle[] {
  if (!query.trim()) return HELP_ARTICLES;
  const q = query.toLowerCase();
  return HELP_ARTICLES.filter(
    (a) =>
      a.title.toLowerCase().includes(q) ||
      a.summary.toLowerCase().includes(q) ||
      a.body.toLowerCase().includes(q) ||
      a.keywords?.some((k) => k.toLowerCase().includes(q))
  );
}

export function getArticleBySlug(slug: string): HelpArticle | undefined {
  return HELP_ARTICLES.find((a) => a.slug === slug);
}

export function getArticlesByCategory(category: HelpCategory): HelpArticle[] {
  return HELP_ARTICLES.filter((a) => a.category === category);
}
