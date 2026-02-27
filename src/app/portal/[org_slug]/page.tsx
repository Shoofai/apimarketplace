import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { APICard } from '@/components/marketplace/APICard';
import Image from 'next/image';
import { Globe } from 'lucide-react';

interface Props {
  params: Promise<{ org_slug: string }>;
}

export default async function InternalPortalPage({ params }: Props) {
  const { org_slug } = await params;
  const supabase = await createClient();

  const { data: org, error } = await supabase
    .from('organizations')
    .select('id, name, slug, logo_url, portal_enabled, portal_settings')
    .eq('slug', org_slug)
    .single();

  if (error || !org) notFound();
  if (!org.portal_enabled) notFound();

  const settings = (org.portal_settings ?? {}) as {
    title?: string;
    logo_url?: string;
    accent_color?: string;
    visibility?: 'public' | 'members_only';
  };

  // For members_only portals, require authentication
  if (settings.visibility === 'members_only') {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect(`/login?redirect=/portal/${org_slug}`);

    const { data: membership } = await supabase
      .from('organization_members')
      .select('id')
      .eq('organization_id', org.id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (!membership) {
      return (
        <div className="min-h-screen flex items-center justify-center p-8 text-center">
          <div>
            <h1 className="text-2xl font-bold mb-2">Members Only</h1>
            <p className="text-muted-foreground">This internal portal is restricted to members of {org.name}.</p>
          </div>
        </div>
      );
    }
  }

  // Fetch org's published APIs
  const { data: apis } = await supabase
    .from('apis')
    .select(`
      id, name, slug, short_description, description, logo_url,
      avg_rating, total_subscribers, status,
      organization:organizations!apis_organization_id_fkey(name, slug, logo_url),
      category:api_categories(name, slug),
      pricing_plans:api_pricing_plans(price_monthly)
    `)
    .eq('organization_id', org.id)
    .eq('status', 'published')
    .order('name');

  const title = settings.title ?? `${org.name} Developer Portal`;
  const logoUrl = settings.logo_url ?? org.logo_url;
  const accentColor = settings.accent_color ?? '#6366f1';

  return (
    <div className="min-h-screen bg-background">
      {/* Portal Header */}
      <header
        className="border-b"
        style={{ borderBottomColor: `${accentColor}30` }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={org.name}
                width={40}
                height={40}
                className="rounded-lg"
              />
            ) : (
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${accentColor}20` }}
              >
                <Globe className="h-5 w-5" style={{ color: accentColor }} />
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold">{title}</h1>
              <p className="text-sm text-muted-foreground">Internal API Catalog</p>
            </div>
          </div>
        </div>
      </header>

      {/* API Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!apis || apis.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Globe className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p className="font-medium">No APIs published yet.</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-6">
              {apis.length} API{apis.length !== 1 ? 's' : ''} available
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {apis.map((api) => {
                const org = Array.isArray(api.organization) ? api.organization[0] : api.organization;
                const cat = Array.isArray(api.category) ? api.category[0] : api.category;
                const plans = (api.pricing_plans as { price_monthly?: number | null }[] | null) ?? [];
                const minPrice = plans.reduce(
                  (min: number | undefined, p) =>
                    p.price_monthly != null
                      ? min === undefined ? Number(p.price_monthly) : Math.min(min, Number(p.price_monthly))
                      : min,
                  undefined as number | undefined
                );
                return (
                  <APICard
                    key={api.id}
                    api={{
                      id: api.id,
                      name: api.name,
                      slug: api.slug,
                      short_description: api.short_description,
                      description: api.description,
                      logo_url: api.logo_url,
                      avg_rating: api.avg_rating,
                      total_reviews: null,
                      total_subscribers: api.total_subscribers,
                      status: api.status,
                      organization: org ?? { name: '', slug: '', logo_url: null },
                      category: cat ?? null,
                      minPrice,
                    }}
                  />
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
