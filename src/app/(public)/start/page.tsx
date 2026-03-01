import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getPlatformName } from '@/lib/settings/platform-name';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Code2, Building2, Landmark, ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const name = await getPlatformName();
  return {
    title: `Get Started | ${name}`,
    description: 'Choose how you want to use the API marketplace.',
    robots: { index: false, follow: true },
  };
}

export default async function StartPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard');
  }

  const platformName = await getPlatformName();

  const paths = [
    {
      title: 'Developer',
      description: 'Discover APIs, get AI-generated code',
      href: '/signup?audience=developer',
      icon: Code2,
    },
    {
      title: 'API Provider',
      description: 'List your API and start earning',
      href: '/providers/onboard',
      icon: Building2,
    },
    {
      title: 'Enterprise',
      description: 'Governance, compliance, cost control',
      href: '/enterprise',
      icon: Landmark,
    },
  ];

  return (
    <main className="min-h-screen">
      <section className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-background to-background" />
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold sm:text-5xl lg:text-6xl leading-tight">
              Choose your path
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              How will you use {platformName}?
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {paths.map(({ title, description, href, icon: Icon }) => (
              <Link key={href} href={href} className="block group">
                <Card className="h-full transition-colors hover:border-primary/50 hover:bg-primary/5">
                  <CardContent className="pt-6 pb-6 flex flex-col items-center text-center">
                    <div className="rounded-xl bg-primary/10 p-3 mb-4 dark:bg-primary/20">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <h2 className="text-xl font-semibold">{title}</h2>
                    <p className="mt-2 text-sm text-muted-foreground flex-1">
                      {description}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-4 group-hover:text-primary"
                      asChild
                    >
                      <span>
                        Continue
                        <ArrowRight className="ml-1 inline h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Already know?{' '}
            <Link href="/signup" className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
