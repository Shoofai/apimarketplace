import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home, FileQuestion, Search } from 'lucide-react';
import { PublicNav } from '@/components/landing/PublicNav';
import Footer from '@/components/landing/Footer';
import { getPlatformName } from '@/lib/settings/platform-name';

const SUGGESTIONS = [
  { label: 'Browse APIs', href: '/marketplace' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Documentation', href: '/docs' },
  { label: 'Help Center', href: '/help' },
];

export default async function PublicNotFound() {
  const platformName = await getPlatformName();

  return (
    <div className="min-h-screen bg-background">
      <PublicNav />
      <main id="main-content" className="flex flex-col items-center justify-center gap-8 px-8 py-24 text-center">
        <div className="relative flex items-center justify-center">
          <div className="absolute h-48 w-48 rounded-full bg-primary/5 blur-3xl" />
          <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl border border-border bg-card shadow-sm">
            <FileQuestion className="h-12 w-12 text-muted-foreground/50" />
          </div>
        </div>

        <div className="space-y-3 max-w-md">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">404 — Not Found</p>
          <h1 className="text-3xl font-bold tracking-tight">Page not found</h1>
          <p className="text-muted-foreground">
            This page doesn&apos;t exist on {platformName}. Check the URL or explore the links below.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <Button variant="outline" asChild>
            <Link href="/" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Home
            </Link>
          </Button>
          <Button asChild>
            <Link href="/marketplace" className="gap-2">
              <Home className="h-4 w-4" />
              Browse APIs
            </Link>
          </Button>
        </div>

        <div className="w-full max-w-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground text-center mb-3">
            Helpful links
          </p>
          <div className="grid grid-cols-2 gap-2">
            {SUGGESTIONS.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-foreground"
              >
                <Search className="h-3.5 w-3.5 shrink-0" />
                {label}
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
