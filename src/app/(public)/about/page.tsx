import Link from 'next/link';
import { getPlatformName } from '@/lib/settings/platform-name';
import { Button } from '@/components/ui/button';
import { PageHero } from '@/components/landing/PageHero';
import { Card, CardContent } from '@/components/ui/card';
import { Code2, Users } from 'lucide-react';

export async function generateMetadata() {
  const name = await getPlatformName();
  return {
    title: `About Us | ${name}`,
    description: `Learn about ${name} - our mission, values, and why we're building the AI-powered API marketplace.`,
  };
}

export default async function AboutPage() {
  const platformName = await getPlatformName();

  return (
    <div className="min-h-screen bg-background">
      <PageHero
        title={`About ${platformName}`}
        subtitle="We believe API integration shouldn't take weeks."
        stats={['10K+ APIs', '500K+ Developers', '$100M+ Revenue Processed']}
      />
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <div className="not-prose grid grid-cols-3 gap-4 my-10 rounded-xl border border-border bg-muted/30 p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">10K+</div>
              <div className="text-sm text-muted-foreground">APIs listed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">500K+</div>
              <div className="text-sm text-muted-foreground">Active developers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">$100M+</div>
              <div className="text-sm text-muted-foreground">Revenue processed</div>
            </div>
          </div>

          <h2>Our Mission</h2>
          <p>
            {platformName} exists to connect API providers with developers in one place—with AI-powered discovery,
            one-click monetization, and enterprise governance. We want every API to be discoverable, every
            integration to take minutes not days, and every team to have full visibility into their API ecosystem.
          </p>

          <h2>Founding Story</h2>
          <p>
            We built {platformName} because we lived the pain. As developers, we spent weeks integrating APIs
            that should have taken hours. As builders, we watched talented teams abandon API products because
            payment infrastructure, docs, and analytics were too hard to build. The API economy was booming,
            but the tools to participate were fragmented and costly.
          </p>
          <p>
            We set out to build a single platform where providers can monetize in minutes, developers can
            integrate in 2 minutes with AI-generated code, and enterprises can govern their entire API
            ecosystem with full visibility and compliance. We&apos;re a remote-first team with a shared
            commitment to making APIs accessible, discoverable, and easy to use.
          </p>

          <h2>Why We Built This</h2>
          <p>
            Traditional API marketplaces force providers to build payment infrastructure, docs, and analytics
            from scratch. Developers waste days testing and integrating APIs. Enterprises struggle with shadow
            IT and fragmented spend. We built a single platform where:
          </p>
          <ul>
            <li><strong>Providers</strong> monetize in minutes with Stripe Connect and AI-generated docs</li>
            <li><strong>Developers</strong> integrate in 2 minutes with AI-generated code and unified billing</li>
            <li><strong>Enterprises</strong> govern everything with full visibility, compliance, and cost control</li>
          </ul>

          <h2>Our Values</h2>
          <div className="not-prose grid gap-4 sm:grid-cols-2 my-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Code2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Developer-first</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Every feature is designed to save developers time and reduce friction. We ship what
                      developers need, not what looks good on a slide.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Transparent pricing</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      No hidden fees. Clear tiers. Usage-based billing that scales with you. We believe in
                      predictable costs.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Code2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">AI-powered</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      We use AI to generate docs, code, and insights so you can focus on building, not
                      boilerplate.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Enterprise-ready</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Security, compliance, and governance from day one. GDPR, SOC 2 roadmap, HIPAA options.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <h2>Timeline & Milestones</h2>
          <p>We&apos;re building in public. Key milestones:</p>
          <ul>
            <li><strong>Launch:</strong> API marketplace with discovery, subscriptions, and billing</li>
            <li><strong>AI Playground:</strong> AI-generated integration code and documentation</li>
            <li><strong>Enterprise:</strong> SSO, custom SLAs, and compliance certifications</li>
            <li><strong>Roadmap:</strong> SOC 2 Type II, HIPAA BAA, white-label options</li>
          </ul>

          <h2>Technology Stack</h2>
          <p>
            We build on modern, trusted infrastructure for performance and security:
          </p>
          <ul>
            <li><strong>Frontend:</strong> Next.js, React, Tailwind CSS</li>
            <li><strong>Backend:</strong> Supabase (PostgreSQL, Auth, Realtime)</li>
            <li><strong>Hosting:</strong> Vercel (edge network, CDN)</li>
            <li><strong>Payments:</strong> Stripe</li>
            <li><strong>AI:</strong> Anthropic for code generation and documentation</li>
          </ul>
          <p>
            We believe in transparency: you can read our <Link href="/security" className="text-primary hover:underline">Security & Compliance</Link> page for details.
          </p>

          <h2>Diversity & Inclusion</h2>
          <p>
            We are committed to building a diverse and inclusive team. We welcome people of all backgrounds,
            experiences, and perspectives. We believe that diverse teams build better products. We do not
            discriminate on the basis of race, color, religion, gender, sexual orientation, national origin,
            age, disability, or any other protected characteristic.
          </p>

          <h2>Environmental Sustainability</h2>
          <p>
            We are committed to minimizing our environmental footprint. Our infrastructure runs on cloud
            providers that invest in renewable energy and carbon-neutral operations. We optimize for
            efficiency: edge deployment reduces latency and energy use, and we aim to align with
            sustainability best practices as we grow.
          </p>

          <h2>Careers</h2>
          <p>
            We&apos;re a remote-first team always looking for talented people. If you&apos;re passionate about
            APIs, developer experience, or building infrastructure that scales, we&apos;d love to hear from you.
            Reach out via our <Link href="/contact?source=about-page&category=careers" className="text-primary hover:underline">contact form</Link> with &quot;Careers&quot; in your message.
          </p>

          <h2>By the Numbers</h2>
          <p>We&apos;re just getting started.</p>

          <div className="not-prose mt-12 flex flex-wrap gap-4">
            <Button asChild>
              <Link href="/signup">Get Started Free</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
