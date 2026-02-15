import type { SupabaseClient } from '@supabase/supabase-js';

const DEMO_ORG_SLUG = 'demo-org';
const DEMO_ORG_NAME = 'Demo Organization';
const DEMO_CONSUMER_SLUG = 'demo-consumer';
const DEMO_CONSUMER_NAME = 'Demo Consumer';

export interface SeedResult {
  orgId: string;
  apiIds: string[];
}

export async function seedDemoData(
  admin: SupabaseClient,
  adminUserId?: string
): Promise<SeedResult> {
  const apiIds: string[] = [];

  // 1. Get or create demo provider organization
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

  // 2. Create demo APIs if not present (with pricing plan ids for subscriptions)
  const demoApis = [
    { name: 'Weather API', slug: 'weather-api', description: 'Current weather and forecasts' },
    { name: 'Payment API', slug: 'payment-api', description: 'Process payments and refunds' },
    { name: 'Notifications API', slug: 'notifications-api', description: 'Send push and email notifications' },
  ];

  const freePlanIds: string[] = [];

  for (const api of demoApis) {
    const { data: existing } = await admin
      .from('apis')
      .select('id')
      .eq('organization_id', orgId)
      .eq('slug', api.slug)
      .maybeSingle();

    if (existing) {
      apiIds.push(existing.id);
      const { data: plan } = await admin
        .from('api_pricing_plans')
        .select('id')
        .eq('api_id', existing.id)
        .eq('slug', 'free')
        .maybeSingle();
      if (plan) freePlanIds.push(plan.id);
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

    const { data: freePlan } = await admin
      .from('api_pricing_plans')
      .insert({
        api_id: newApi!.id,
        name: 'Free',
        slug: 'free',
        price_monthly: 0,
        included_calls: 1000,
        rate_limit_per_second: 5,
        is_active: true,
        sort_order: 0,
      })
      .select('id')
      .single();
    if (freePlan) freePlanIds.push(freePlan.id);

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

  // 3. Seed dashboard data for admin user when provided
  if (adminUserId && apiIds.length > 0 && freePlanIds.length >= apiIds.length) {
    await seedDashboardData(admin, adminUserId, orgId, apiIds, freePlanIds);
  }

  return { orgId, apiIds };
}

async function seedDashboardData(
  admin: SupabaseClient,
  userId: string,
  providerOrgId: string,
  apiIds: string[],
  freePlanIds: string[]
): Promise<void> {
  const now = new Date().toISOString();
  const past = (days: number) =>
    new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  // Consumer org for subscriptions
  const { data: consumerOrg } = await admin
    .from('organizations')
    .select('id')
    .eq('slug', DEMO_CONSUMER_SLUG)
    .maybeSingle();

  let consumerOrgId: string;
  if (consumerOrg) {
    consumerOrgId = consumerOrg.id;
    const { data: member } = await admin.from('organization_members').select('id').eq('organization_id', consumerOrgId).eq('user_id', userId).maybeSingle();
    if (!member) {
      await admin.from('organization_members').insert({ organization_id: consumerOrgId, user_id: userId, role: 'owner', joined_at: now });
    }
  } else {
    const { data: newConsumer, error } = await admin
      .from('organizations')
      .insert({
        name: DEMO_CONSUMER_NAME,
        slug: DEMO_CONSUMER_SLUG,
        type: 'consumer',
        plan: 'pro',
        description: 'Demo consumer for testing subscriptions',
      })
      .select('id')
      .single();
    if (error) return;
    consumerOrgId = newConsumer!.id;

    await admin.from('organization_members').insert({
      organization_id: consumerOrgId,
      user_id: userId,
      role: 'owner',
      joined_at: now,
    });
  }

  // Switch to demo consumer org if user has none (so seeded data is visible)
  const { data: u } = await admin.from('users').select('current_organization_id').eq('id', userId).single();
  if (u && !u.current_organization_id) {
    await admin.from('users').update({ current_organization_id: consumerOrgId, updated_at: now }).eq('id', userId);
  }

  // Subscriptions (consumer org -> demo APIs)
  for (let i = 0; i < apiIds.length; i++) {
    const { data: existing } = await admin
      .from('api_subscriptions')
      .select('id')
      .eq('organization_id', consumerOrgId)
      .eq('api_id', apiIds[i])
      .maybeSingle();
    if (!existing) {
      await admin.from('api_subscriptions').insert({
        api_id: apiIds[i],
        pricing_plan_id: freePlanIds[i],
        organization_id: consumerOrgId,
        user_id: userId,
        status: 'active',
        api_key_prefix: 'sk_demo_',
        calls_this_month: 150 + i * 50,
        current_period_start: past(15),
        current_period_end: past(-15),
      });
    }
  }

  // Favorites (user favorites 2 APIs)
  for (let i = 0; i < Math.min(2, apiIds.length); i++) {
    const { data: existing } = await admin
      .from('api_favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('api_id', apiIds[i])
      .maybeSingle();
    if (!existing) {
      await admin.from('api_favorites').insert({
        user_id: userId,
        api_id: apiIds[i],
      });
    }
  }

  // Collections (user has 1 collection with 2 APIs)
  const { data: existingColl } = await admin
    .from('api_collections')
    .select('id')
    .eq('user_id', userId)
    .eq('slug', 'demo-collection')
    .maybeSingle();

  let collectionId: string | null = null;
  if (!existingColl) {
    const { data: newColl } = await admin
      .from('api_collections')
      .insert({
        user_id: userId,
        name: 'Demo Collection',
        slug: 'demo-collection',
        description: 'Sample APIs for testing',
        is_public: true,
      })
      .select('id')
      .single();
    if (newColl) {
      collectionId = newColl.id;
      for (let i = 0; i < Math.min(2, apiIds.length); i++) {
        await admin.from('api_collection_items').insert({
          collection_id: collectionId,
          api_id: apiIds[i],
          sort_order: i,
        });
      }
    }
  }

  // Forum topics and posts
  const { data: existingTopic } = await admin
    .from('forum_topics')
    .select('id')
    .eq('slug', 'getting-started-with-weather-api')
    .maybeSingle();

  if (!existingTopic) {
    const { data: topic } = await admin
      .from('forum_topics')
      .insert({
        title: 'Getting started with Weather API',
        slug: 'getting-started-with-weather-api',
        category: 'General',
        user_id: userId,
      })
      .select('id')
      .single();

    if (topic) {
      await admin.from('forum_posts').insert({
        topic_id: topic.id,
        user_id: userId,
        body: 'Has anyone integrated the Weather API with their app? Looking for best practices.',
      });
    }

    await admin.from('forum_topics').insert({
      title: 'Payment API webhook handling',
      slug: 'payment-api-webhook-handling',
      category: 'Integrations',
      user_id: userId,
    });
  }

  // Developer challenge
  const { data: existingChallenge } = await admin
    .from('developer_challenges')
    .select('id')
    .limit(1)
    .maybeSingle();

  if (!existingChallenge && apiIds[0]) {
    const { data: challenge } = await admin
      .from('developer_challenges')
      .insert({
        title: 'Build a Weather Dashboard',
        description: 'Create a simple dashboard that displays weather data from the Weather API.',
        api_id: apiIds[0],
        starts_at: past(30),
        ends_at: past(-30),
      })
      .select('id')
      .single();

    if (challenge) {
      const { data: subExisting } = await admin
        .from('challenge_submissions')
        .select('id')
        .eq('challenge_id', challenge.id)
        .eq('user_id', userId)
        .maybeSingle();
      if (!subExisting) {
        await admin.from('challenge_submissions').insert({
          challenge_id: challenge.id,
          user_id: userId,
          organization_id: consumerOrgId,
          score: 85,
          status: 'submitted',
          proof_description: 'Built a React dashboard with 5-day forecast.',
        });
      }
    }
  }

  // Referrals
  const { data: refExisting } = await admin
    .from('referrals')
    .select('id')
    .eq('referrer_id', userId)
    .limit(1)
    .maybeSingle();

  if (!refExisting) {
    await admin.from('referrals').insert([
      { referrer_id: userId, referred_email: 'friend1@example.com', code: `${userId.slice(0, 8)}-ref`, status: 'signed_up' },
      { referrer_id: userId, referred_email: 'friend2@example.com', code: `${userId.slice(0, 8)}-ref`, status: 'pending' },
    ]);
  }

  // Audit logs
  const { count } = await admin
    .from('audit_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if ((count ?? 0) < 3) {
    const actions = [
      { action: 'api.subscribe', resource_type: 'api_subscription', status: 'success' },
      { action: 'api.favorite', resource_type: 'api_favorite', status: 'success' },
      { action: 'collection.create', resource_type: 'api_collection', status: 'success' },
      { action: 'forum.topic.create', resource_type: 'forum_topic', status: 'success' },
    ];
    for (let i = 0; i < actions.length; i++) {
      await admin.from('audit_logs').insert({
        user_id: userId,
        organization_id: consumerOrgId,
        action: actions[i].action,
        resource_type: actions[i].resource_type,
        status: actions[i].status,
        created_at: past(5 - i),
      });
    }
  }

  // Notifications
  const { count: notifCount } = await admin
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if ((notifCount ?? 0) < 3) {
    const notifs = [
      { title: 'New Subscriber', body: 'Your Weather API gained a new subscriber.', event_type: 'api.new_subscriber', link: '/dashboard/apis', is_read: false },
      { title: 'Usage Alert', body: 'You\'ve used 80% of your monthly quota.', event_type: 'usage.quota_80', is_read: false },
      { title: 'API Approved', body: 'Your API submission has been approved.', event_type: 'api.status_changed', link: '/dashboard/apis', is_read: true },
    ];
    for (let i = 0; i < notifs.length; i++) {
      await admin.from('notifications').insert({
        user_id: userId,
        organization_id: consumerOrgId,
        event_type: notifs[i].event_type,
        title: notifs[i].title,
        body: notifs[i].body,
        link: notifs[i].link ?? null,
        is_read: notifs[i].is_read,
        created_at: past(2 - i),
      });
    }
  }

  // Affiliate link for demo provider org
  const { data: affExisting } = await admin
    .from('affiliate_links')
    .select('id')
    .eq('organization_id', providerOrgId)
    .maybeSingle();

  if (!affExisting) {
    await admin.from('affiliate_links').insert({
      organization_id: providerOrgId,
      code: 'demo-aff',
      commission_percent: 5,
    });
  }
}
