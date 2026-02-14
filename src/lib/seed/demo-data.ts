import type { SupabaseClient } from '@supabase/supabase-js';

const DEMO_ORG_SLUG = 'demo-org';
const DEMO_ORG_NAME = 'Demo Organization';

export async function seedDemoData(admin: SupabaseClient): Promise<{ orgId: string; apiIds: string[] }> {
  const apiIds: string[] = [];

  // 1. Get or create demo organization
  const { data: existingOrg } = await admin
    .from('organizations')
    .select('id')
    .eq('slug', DEMO_ORG_SLUG)
    .maybeSingle();

  let orgId: string;
  if (existingOrg) {
    orgId = existingOrg.id;
  } else {
    const { data: newOrg, error: orgError } = await admin
      .from('organizations')
      .insert({
        name: DEMO_ORG_NAME,
        slug: DEMO_ORG_SLUG,
        type: 'provider',
        plan: 'pro',
        description: 'Demo organization for sample APIs',
      })
      .select('id')
      .single();
    if (orgError) throw orgError;
    orgId = newOrg!.id;
  }

  // 2. Create demo APIs if not present
  const demoApis = [
    { name: 'Weather API', slug: 'weather-api', description: 'Current weather and forecasts' },
    { name: 'Payment API', slug: 'payment-api', description: 'Process payments and refunds' },
    { name: 'Notifications API', slug: 'notifications-api', description: 'Send push and email notifications' },
  ];

  for (const api of demoApis) {
    const { data: existing } = await admin
      .from('apis')
      .select('id')
      .eq('organization_id', orgId)
      .eq('slug', api.slug)
      .maybeSingle();

    if (existing) {
      apiIds.push(existing.id);
      continue;
    }

    const { data: newApi, error: apiError } = await admin
      .from('apis')
      .insert({
        name: api.name,
        slug: api.slug,
        description: api.description,
        organization_id: orgId,
        base_url: `https://api.example.com/${api.slug}`,
        status: 'published',
        visibility: 'public',
      })
      .select('id')
      .single();

    if (apiError) throw apiError;
    apiIds.push(newApi!.id);

    // 3. Create default pricing plan for this API
    await admin.from('api_pricing_plans').insert({
      api_id: newApi!.id,
      name: 'Free',
      slug: 'free',
      price_monthly: 0,
      included_calls: 1000,
      rate_limit_per_second: 5,
      is_active: true,
      sort_order: 0,
    });
    await admin.from('api_pricing_plans').insert({
      api_id: newApi!.id,
      name: 'Pro',
      slug: 'pro',
      price_monthly: 2999,
      included_calls: 100000,
      rate_limit_per_second: 50,
      is_active: true,
      sort_order: 1,
    });
  }

  return { orgId, apiIds };
}
