import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Globe } from 'lucide-react';
import Link from 'next/link';
import { getPlatformName } from '@/lib/settings/platform-name';

export async function generateMetadata() {
  const name = await getPlatformName();
  return {
    title: `API Documentation | ${name}`,
    description: 'Browse and view API documentation',
  };
}

export default function DocsIndexPage() {
  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto max-w-2xl px-4 text-center">
        <div className="flex justify-center mb-6">
          <div className="p-4 rounded-full bg-primary/10">
            <BookOpen className="h-12 w-12 text-primary" />
          </div>
        </div>
        <h1 className="text-3xl font-bold mb-4">API Documentation</h1>
        <p className="text-muted-foreground mb-8">
          Documentation is available per API. Browse the marketplace to find an API, then open its docs from the API page.
        </p>
        <Card>
          <CardContent className="pt-6">
            <Link href="/marketplace">
              <Button size="lg" className="gap-2 w-full sm:w-auto">
                <Globe className="h-5 w-5" />
                Browse Marketplace
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
