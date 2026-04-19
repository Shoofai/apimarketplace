import Link from 'next/link';
import { getPlatformName } from '@/lib/settings/platform-name';
import { ContactButton } from '@/components/contact/ContactButton';
import {
  Code2,
  Search,
  FileText,
  CreditCard,
  Key,
  LayoutDashboard,
  HeadphonesIcon,
  Globe,
  Zap,
  Shield,
  BarChart3,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  BookOpen,
} from 'lucide-react';

export async function generateMetadata() {
  const name = await getPlatformName();
  return {
    title: `About Us | ${name}`,
    description:
      'GradeCircle builds developer tools and enterprise software. LukeAPI is our unified API marketplace — built by developers who got tired of the mess.',
  };
}

export default async function AboutPage() {
  return (
    <div className="min-h-screen bg-background">

      {/* ── Hero ── */}
      <section className="border-b border-border bg-gradient-to-b from-muted/40 to-background">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <span className="inline-block rounded-full border border-primary/30 bg-primary/5 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-primary mb-6">
            About LukeAPI
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
            The API marketplace built by developers<br className="hidden sm:block" /> who got tired of the mess.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Finding, evaluating, and integrating quality APIs is unnecessarily difficult.
            We built LukeAPI to solve this — for ourselves first, then for everyone.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Browse the marketplace <ChevronRight className="h-4 w-4" />
            </Link>
            <ContactButton source="about-page" category="general" variant="outline" size="default">
              Get in touch
            </ContactButton>
          </div>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6 text-center">
            {[
              { value: '1,000+', label: 'Developers' },
              { value: '50+', label: 'APIs Available' },
              { value: '25+', label: 'Countries' },
              { value: '60%', label: 'Faster Integration' },
              { value: '99.9%', label: 'Uptime SLA' },
              { value: '<2 hrs', label: 'Support Response' },
            ].map(({ value, label }) => (
              <div key={label}>
                <div className="text-2xl font-bold text-primary">{value}</div>
                <div className="text-xs text-muted-foreground mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-4xl px-6 py-16 space-y-24">

        {/* ── The Problem ── */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-foreground">The Problem</h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              Developers waste 30–40% of integration time just finding and evaluating APIs.
              This isn&apos;t a technical problem — it&apos;s an infrastructure problem.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            {[
              {
                icon: Search,
                title: 'Scattered Discovery',
                body: 'APIs are spread across dozens of marketplaces with no consistent quality bar. Searching takes days, not minutes.',
              },
              {
                icon: FileText,
                title: 'Inconsistent Docs',
                body: 'Documentation quality ranges from excellent to nonexistent. Every provider uses a different format and structure.',
              },
              {
                icon: DollarSign,
                title: 'Opaque Pricing & Billing Sprawl',
                body: "Can't test before committing. Separate invoices per provider. No unified view of your API spend.",
              },
            ].map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 space-y-3"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                  <Icon className="h-5 w-5 text-destructive" />
                </div>
                <h3 className="font-semibold text-foreground">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Our Solution ── */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-foreground">Our Solution</h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              LukeAPI is a unified API marketplace that solves each pain point — curated,
              standardized, and built for real developer workflows.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: BookOpen,
                title: 'Curated API Catalog',
                body: '50+ high-quality APIs across 15+ categories — all vetted for reliability and documentation quality. We reject more than we accept.',
              },
              {
                icon: FileText,
                title: 'Standardized Docs',
                body: 'Consistent format across all APIs. Same structure, same quality, same developer experience. Learn once, use everywhere.',
              },
              {
                icon: Zap,
                title: 'Live Testing Sandboxes',
                body: 'Test any API instantly with real requests before you commit. No payment required to evaluate.',
              },
              {
                icon: CreditCard,
                title: 'Unified Billing',
                body: 'One subscription, one invoice, access to all APIs. No more managing multiple vendor relationships.',
              },
              {
                icon: Key,
                title: 'Single API Key',
                body: 'Integrate multiple APIs with one authentication key. One onboarding, one auth flow, endless APIs.',
              },
              {
                icon: LayoutDashboard,
                title: 'Developer Dashboard',
                body: 'Monitor usage, debug issues, manage subscriptions, and track costs — all in one place.',
              },
            ].map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="rounded-xl border border-primary/20 bg-primary/5 p-6 space-y-3"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── About GradeCircle ── */}
        <section className="rounded-2xl border border-border bg-muted/30 p-8 sm:p-10">
          <div className="flex flex-col sm:flex-row gap-8">
            <div className="shrink-0">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg">
                <Globe className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">About the maker</p>
                <h2 className="text-2xl font-bold text-foreground">GradeCircle</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                GradeCircle builds technology infrastructure for developers and businesses. LukeAPI emerged from a problem we
                encountered while building our own application portfolio: finding, evaluating, and integrating quality APIs is
                unnecessarily difficult. Developers waste hours searching across scattered marketplaces, documentation is
                inconsistent, pricing is opaque, and testing APIs before commitment is complicated.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                As builders of 10+ production applications across healthcare, legal, fintech, and logistics, we understand what
                developers need: clear documentation, reliable uptime, fair pricing, responsive support, and tools that actually
                work. We built LukeAPI to the standard we demand for ourselves.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Beyond the marketplace, GradeCircle operates software platforms across emerging markets and provides strategic
                consulting for companies implementing AI and building technical infrastructure.
              </p>
              <p className="font-semibold text-foreground">
                We&apos;re developers building for developers.
              </p>
              <a
                href="https://www.gradecircle.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline font-medium"
              >
                Learn more at gradecircle.com <ChevronRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </section>

        {/* ── Origin Story ── */}
        <section>
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground">Why We Built This</h2>
            <p className="mt-2 text-muted-foreground">LukeAPI wasn&apos;t planned. It emerged from frustration.</p>
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none">
            <p>
              In 2023, while building our medical staffing platform, we needed to integrate payment processing,
              SMS notifications, email delivery, identity verification, and geolocation services. Simple
              requirements. Standard APIs.
            </p>
            <p>The integration process was a nightmare:</p>
          </div>

          <ul className="mt-4 mb-6 space-y-3">
            {[
              'Spent 3 days just finding API providers across different marketplaces',
              'Read through 8 different documentation formats, ranging from excellent to terrible',
              'Signed up for 6 different accounts with 6 different pricing models',
              "Couldn't test most APIs without providing payment information upfront",
              'Ended up with 6 monthly invoices to track and reconcile',
              'When issues arose, got bounced between providers blaming each other',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 list-none">
                <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                <span className="text-sm text-muted-foreground">{item}</span>
              </li>
            ))}
          </ul>

          <div className="prose prose-slate dark:prose-invert max-w-none">
            <p>
              For a supposedly &quot;solved&quot; problem (API integration), we burned two weeks and significant
              developer frustration. And this was just for ONE application. We were building TEN.
            </p>
            <p>
              We calculated the waste: across our development team, API discovery and integration consumed
              30–35% of project time. Not building features. Not improving user experience. Just plumbing
              work that should be commoditized.
            </p>
            <p>
              We looked for solutions. Existing API marketplaces were either too narrow (one category only),
              too fragmented (listed APIs but didn&apos;t simplify integration), too enterprise (built for
              procurement departments, not dev teams), or too Western — optimized for US/Europe with a
              poor experience for emerging market developers.
            </p>
            <p>
              So we built what we needed. LukeAPI launched internally for our own applications in Q2 2024 —
              it cut our integration time by 60%. We opened it to external developers in Q4 2024. Within 3
              months, 1,000+ developers had integrated LukeAPI-sourced APIs.
            </p>
            <p>
              The name &quot;LukeAPI&quot; comes from &quot;Luke&quot; meaning light — bringing clarity to the API
              discovery mess. Today, LukeAPI powers integrations for startups, agencies, and enterprises
              across 25+ countries. The mission hasn&apos;t changed: make API integration dramatically faster
              and less painful for developers worldwide.
            </p>
          </div>
        </section>

        {/* ── Principles ── */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-foreground">Our Principles</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Code2,
                title: 'Developers First',
                body: 'Built by developers who use the platform themselves. Every feature is designed to save developer time, not to look good on a slide.',
              },
              {
                icon: Shield,
                title: 'Quality Over Quantity',
                body: 'Every API is vetted for reliability and documentation quality. We reject more than we accept — and only list APIs we use ourselves.',
              },
              {
                icon: BarChart3,
                title: 'Radical Transparency',
                body: 'Clear pricing, honest reviews, no hidden fees. Transparent revenue share with API providers — we make money when you make money.',
              },
              {
                icon: Globe,
                title: 'Global Access',
                body: 'Optimized for developers everywhere, not just Silicon Valley. Multi-currency, mobile-first, and emerging market payment methods.',
              },
              {
                icon: Zap,
                title: 'Continuous Improvement',
                body: 'We ship updates weekly based on user feedback. Building in public — our roadmap is driven by the developers using the platform.',
              },
              {
                icon: HeadphonesIcon,
                title: 'Responsive Support',
                body: 'Direct access to our technical team. Average response under 2 hours. Our own applications depend on this platform — we have skin in the game.',
              },
            ].map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-xl border border-border bg-card p-6 space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <Icon className="h-5 w-5 text-foreground" />
                </div>
                <h3 className="font-semibold text-foreground">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Who We Serve ── */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-foreground">Who We Serve</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                title: 'Developers',
                body: 'Building applications who need reliable, well-documented APIs without the integration overhead.',
              },
              {
                title: 'Startups',
                body: 'Seeking cost-effective infrastructure that scales — one API key, one bill, all the APIs you need.',
              },
              {
                title: 'Agencies',
                body: 'Integrating client systems faster with standardized tooling and a single vendor relationship.',
              },
              {
                title: 'Enterprises',
                body: 'Consolidating API vendors, reducing shadow IT, and getting full visibility into API spend.',
              },
              {
                title: 'Emerging Market Teams',
                body: 'We optimize for low-bandwidth, mobile-first users and support local payment methods across 25+ countries.',
              },
              {
                title: 'API Providers',
                body: 'Reach thousands of qualified developers through a marketplace they trust — we handle billing, docs, and support routing.',
              },
            ].map(({ title, body }) => (
              <div key={title} className="flex items-start gap-3 rounded-xl border border-border bg-card p-5">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground text-sm">{title}</p>
                  <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── FAQ ── */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-foreground">Frequently Asked Questions</h2>
          </div>
          <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
            {[
              {
                q: 'Who is GradeCircle?',
                a: 'GradeCircle is a technology company that builds developer tools and enterprise software. We operate 10+ production applications across healthcare, legal, fintech, and logistics, serving users in 15+ countries. LukeAPI emerged from our own need for better API infrastructure while building these applications.',
              },
              {
                q: 'Why should I trust GradeCircle with my API integrations?',
                a: "We're developers ourselves, building production applications that serve real users. Our own software relies on the APIs in LukeAPI — we have skin in the game. We only list APIs we'd use in our own applications. Every API is vetted for reliability, documentation quality, and support responsiveness.",
              },
              {
                q: 'How does GradeCircle make money from LukeAPI?',
                a: 'We charge a small platform fee on API usage (typically 5–10% depending on the API). Pricing remains competitive with going direct because we negotiate volume discounts. For API providers, we bring qualified developer traffic they would not reach otherwise. Transparent revenue share — we make money when you make money.',
              },
              {
                q: 'Does GradeCircle build its own APIs?',
                a: 'Not primarily. We focus on curating, documenting, and simplifying integration with the best third-party APIs. We do maintain a few proprietary APIs based on our application work (healthcare staffing, legal marketplace, etc.) which are also available in the marketplace.',
              },
              {
                q: "What's GradeCircle's experience with emerging markets?",
                a: "Extensive. We've built and operated applications across 15+ African and Asian countries. We understand challenges like unreliable internet, mobile-first users, local payment systems, and regulatory complexity. LukeAPI is optimized for these realities with offline-first documentation, mobile-responsive design, and emerging market payment methods.",
              },
              {
                q: "Is LukeAPI GradeCircle's only product?",
                a: 'No. LukeAPI is one component of our developer infrastructure portfolio. We also operate 10 SaaS applications (healthcare, legal, fintech, logistics), strategic consulting services (AI strategy, market entry, digital transformation), custom software development, and strategic simulation tools.',
              },
            ].map(({ q, a }) => (
              <div key={q} className="bg-card px-6 py-5">
                <h3 className="font-semibold text-foreground text-sm mb-2">{q}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Contact CTA grid ── */}
        <section className="pb-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-foreground">Contact Us</h2>
            <p className="mt-3 text-muted-foreground">
              Choose the right channel and we&apos;ll route you to the right team.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-card p-6 flex flex-col gap-4">
              <div>
                <p className="font-semibold text-foreground">General Inquiries</p>
                <p className="text-sm text-muted-foreground mt-1">Partnerships, press, and everything else.</p>
              </div>
              <ContactButton
                source="about-page"
                category="general"
                variant="outline"
                size="sm"
                className="w-full justify-center"
              >
                Get in touch
              </ContactButton>
            </div>
            <div className="rounded-xl border border-border bg-card p-6 flex flex-col gap-4">
              <div>
                <p className="font-semibold text-foreground">API Support</p>
                <p className="text-sm text-muted-foreground mt-1">Technical issues, integration questions, billing.</p>
              </div>
              <ContactButton
                source="about-page"
                category="support"
                variant="outline"
                size="sm"
                className="w-full justify-center"
              >
                Contact support
              </ContactButton>
            </div>
            <div className="rounded-xl border border-border bg-card p-6 flex flex-col gap-4">
              <div>
                <p className="font-semibold text-foreground">Partnership Opportunities</p>
                <p className="text-sm text-muted-foreground mt-1">Integrations, reseller programs, co-marketing.</p>
              </div>
              <ContactButton
                source="about-page"
                category="partners"
                variant="outline"
                size="sm"
                className="w-full justify-center"
              >
                Discuss partnership
              </ContactButton>
            </div>
          </div>
          <p className="text-center text-sm text-muted-foreground mt-6">
            Or visit{' '}
            <a
              href="https://www.gradecircle.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              gradecircle.com
            </a>{' '}
            to learn more about GradeCircle.
          </p>
        </section>

      </main>
    </div>
  );
}
