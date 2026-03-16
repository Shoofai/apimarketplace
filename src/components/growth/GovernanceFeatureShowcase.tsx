import Link from 'next/link';

const FEATURES = [
  {
    icon: '🗂',
    title: 'Centralised API Inventory',
    description:
      'One searchable catalog for every internal and third-party API your organisation uses — with owner, status, SLA, and cost data in a single view.',
    badges: ['Discovery', 'Catalog'],
  },
  {
    icon: '🔐',
    title: 'Access Control & RBAC',
    description:
      'Define who can call what, with role-based policies, team scoping, and automatic key rotation. SSO/SAML ready out of the box.',
    badges: ['Security', 'SSO/SAML'],
  },
  {
    icon: '📊',
    title: 'Real-Time Cost Intelligence',
    description:
      'Per-API, per-team cost dashboards with anomaly alerts. Know exactly where budget is being spent before the invoice arrives.',
    badges: ['FinOps', 'Alerts'],
  },
  {
    icon: '🛡',
    title: 'Compliance & Security Auditing',
    description:
      'Automated compliance checks against SOC 2, GDPR, and ISO 27001 controls. Exportable audit logs for every API call.',
    badges: ['SOC 2', 'GDPR'],
  },
  {
    icon: '📈',
    title: 'Usage Monitoring & SLA Tracking',
    description:
      'Real-time dashboards for latency, error rates, and uptime across every API. Automated SLA breach notifications.',
    badges: ['Observability', 'SLA'],
  },
  {
    icon: '🤖',
    title: 'AI-Powered Optimisation',
    description:
      'Identify redundant APIs, suggest consolidations, and get automated recommendations to cut costs and reduce maintenance burden.',
    badges: ['AI', 'Cost saving'],
  },
];

export function GovernanceFeatureShowcase() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-6xl px-4">
        {/* Section header */}
        <div className="mb-12 text-center">
          <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary uppercase tracking-wide mb-3">
            Enterprise Governance
          </span>
          <h2 className="text-3xl font-bold sm:text-4xl">
            Everything your organisation needs to govern APIs at scale
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Built for security, compliance, and cost control — not just developer experience.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-border bg-card p-6 hover:shadow-md transition-shadow"
            >
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-base mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                {f.description}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {f.badges.map((b) => (
                  <span
                    key={b}
                    className="inline-block rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
                  >
                    {b}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Comparison strip */}
        <div className="mt-14 rounded-2xl border border-border bg-muted/40 p-8">
          <h3 className="text-center font-semibold text-lg mb-6">
            Why enterprises choose a dedicated governance platform over DIY
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-6 font-medium text-muted-foreground w-1/3">
                    Capability
                  </th>
                  <th className="text-center py-2 px-4 font-medium text-muted-foreground">
                    Spreadsheets + manual
                  </th>
                  <th className="text-center py-2 px-4 font-medium text-muted-foreground">
                    AWS API Gateway only
                  </th>
                  <th className="text-center py-2 px-4 font-semibold text-primary">
                    This platform
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  ['Full API inventory', '❌', '⚠️ Partial', '✅'],
                  ['Cross-team cost allocation', '❌', '❌', '✅'],
                  ['Compliance audit logs', '⚠️ Manual', '❌', '✅'],
                  ['AI-powered recommendations', '❌', '❌', '✅'],
                  ['Third-party API coverage', '❌', '❌', '✅'],
                  ['SSO/SAML + RBAC', '❌', '⚠️ Basic', '✅'],
                ].map(([cap, a, b, c]) => (
                  <tr key={cap}>
                    <td className="py-2.5 pr-6 font-medium text-sm">{cap}</td>
                    <td className="text-center py-2.5 px-4 text-sm">{a}</td>
                    <td className="text-center py-2.5 px-4 text-sm">{b}</td>
                    <td className="text-center py-2.5 px-4 text-sm font-semibold text-primary">
                      {c}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-10 text-center">
          <Link
            href="#roi"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition"
          >
            Calculate my ROI &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
