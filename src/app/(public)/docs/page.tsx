import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Globe, FileText } from 'lucide-react';
import Link from 'next/link';
import { getPlatformName } from '@/lib/settings/platform-name';
import { PageHero } from '@/components/landing/PageHero';

export async function generateMetadata() {
  const name = await getPlatformName();
  return {
    title: `API Documentation | ${name}`,
    description: 'Browse and view API documentation. Get started in minutes.',
  };
}

const steps = [
  { n: 1, title: 'Sign up', body: 'Create a free account.', href: '/signup' },
  { n: 2, title: 'Browse marketplace', body: 'Find the API you need.', href: '/marketplace' },
  { n: 3, title: 'Subscribe', body: 'Subscribe to an API to get access.', href: '/marketplace' },
  { n: 4, title: 'Get your API key', body: 'Find your key in the dashboard.', href: '/dashboard' },
  { n: 5, title: 'Use docs & code', body: 'Open the API docs and use generated code samples.', href: '/docs' },
];

export default function DocsIndexPage() {
  return (
    <div className="min-h-screen bg-background">
      <PageHero
        title="API Documentation"
        subtitle="Find an API, then open its docs from the API page. Get started in minutes."
      />
      <div className="container mx-auto max-w-3xl px-4 py-12">
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Getting started</h2>
          <ol className="space-y-4">
            {steps.map((step) => (
              <li key={step.n} className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {step.n}
                </span>
                <div>
                  <Link href={step.href} className="font-medium text-foreground hover:underline">
                    {step.title}
                  </Link>
                  <p className="text-sm text-muted-foreground">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
        <section className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardContent className="pt-6">
              <FileText className="h-8 w-8 text-primary mb-2" />
              <h3 className="font-semibold">Integration guides</h3>
              <p className="text-sm text-muted-foreground mt-1">Per-API guides and examples.</p>
              <Button variant="outline" size="sm" className="mt-3" asChild>
                <Link href="/marketplace">Browse APIs</Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <Globe className="h-8 w-8 text-primary mb-2" />
              <h3 className="font-semibold">API reference</h3>
              <p className="text-sm text-muted-foreground mt-1">Full reference per API after you subscribe.</p>
              <Button size="sm" className="mt-3" asChild>
                <Link href="/marketplace">Browse Marketplace</Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
