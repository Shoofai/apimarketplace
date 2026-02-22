import Link from 'next/link';
import { getPlatformName } from '@/lib/settings/platform-name';
import { PageHero } from '@/components/landing/PageHero';
import { AuditTool } from '@/components/audit/AuditTool';

export async function generateMetadata() {
  const name = await getPlatformName();
  return {
    title: `Production Readiness Audit | ${name}`,
    description: `Free OpenAPI spec check. Get a quick score and top gaps, then request a full audit.`,
  };
}

export default async function AuditPage() {
  return (
    <div className="min-h-screen bg-background">
      <PageHero
        title="Production Readiness Audit"
        subtitle="Run a free quick audit on your OpenAPI spec. Get a score and top gaps in seconds."
      />
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <AuditTool />
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-primary underline underline-offset-4">
            Sign in
          </Link>{' '}
          to run a full audit for your APIs.
        </p>
      </main>
    </div>
  );
}
