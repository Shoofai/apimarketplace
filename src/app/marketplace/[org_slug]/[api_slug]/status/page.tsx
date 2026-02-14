import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { StatusDashboard } from '@/components/apis/StatusDashboard';

interface StatusPageProps {
  params: Promise<{ org_slug: string; api_slug: string }>;
}

export default async function APIStatusPage({ params }: StatusPageProps) {
  const { org_slug, api_slug } = await params;
  const supabase = await createClient();

  const { data: api, error } = await supabase
    .from('apis')
    .select('id, name, slug')
    .eq('slug', api_slug)
    .eq('status', 'published')
    .single();

  if (error || !api) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href={`/marketplace/${org_slug}/${api_slug}`}>
              ← Back to {api.name}
            </Link>
          </Button>
        </div>
        <h1 className="text-3xl font-bold mb-2">{api.name} – Status</h1>
        <p className="text-muted-foreground mb-8">
          Uptime and incident history
        </p>
        <StatusDashboard apiId={api.id} apiName={api.name} />
      </div>
    </div>
  );
}
