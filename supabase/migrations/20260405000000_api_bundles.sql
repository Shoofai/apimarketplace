-- API Bundles — curated packs of complementary APIs sold together at a discount.
-- Migration was missing; code and types already exist.

create table if not exists public.api_bundles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  logo_url text,
  price_monthly numeric not null default 0,
  discount_percent numeric not null default 0,
  status text not null default 'draft',
  tags text[],
  organization_id uuid references public.organizations(id) on delete set null,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.api_bundle_items (
  id uuid primary key default gen_random_uuid(),
  bundle_id uuid not null references public.api_bundles(id) on delete cascade,
  api_id uuid not null references public.apis(id) on delete cascade,
  sort_order int not null default 0,
  unique(bundle_id, api_id)
);

create table if not exists public.bundle_subscriptions (
  id uuid primary key default gen_random_uuid(),
  bundle_id uuid not null references public.api_bundles(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  status text not null default 'active',
  current_period_start timestamptz not null default now(),
  current_period_end timestamptz not null default (now() + interval '1 month'),
  created_at timestamptz not null default now(),
  unique(bundle_id, organization_id)
);

-- Indexes
create index idx_api_bundles_status_slug on public.api_bundles(status, slug);
create index idx_api_bundle_items_bundle on public.api_bundle_items(bundle_id);
create index idx_bundle_subscriptions_org on public.bundle_subscriptions(organization_id);

-- RLS
alter table public.api_bundles enable row level security;
alter table public.api_bundle_items enable row level security;
alter table public.bundle_subscriptions enable row level security;

-- Anyone can read published bundles
create policy "Anyone can read published bundles"
  on public.api_bundles for select
  using (status = 'published');

-- Org members can manage their bundles
create policy "Org members can manage their bundles"
  on public.api_bundles for all
  using (
    organization_id is null
    or exists (
      select 1 from public.organization_members om
      where om.organization_id = api_bundles.organization_id
        and om.user_id = auth.uid()
    )
  );

-- Service role full access
create policy "Service role full access on api_bundles"
  on public.api_bundles for all
  using (auth.role() = 'service_role');

-- Anyone can read bundle items for published bundles
create policy "Anyone can read bundle items"
  on public.api_bundle_items for select
  using (
    exists (
      select 1 from public.api_bundles b
      where b.id = api_bundle_items.bundle_id
        and b.status = 'published'
    )
  );

-- Org members can manage bundle items
create policy "Org members can manage bundle items"
  on public.api_bundle_items for all
  using (
    exists (
      select 1 from public.api_bundles b
      join public.organization_members om on om.organization_id = b.organization_id
      where b.id = api_bundle_items.bundle_id
        and om.user_id = auth.uid()
    )
  );

create policy "Service role full access on api_bundle_items"
  on public.api_bundle_items for all
  using (auth.role() = 'service_role');

-- Org members can read their own bundle subscriptions
create policy "Org members can read their bundle subscriptions"
  on public.bundle_subscriptions for select
  using (
    exists (
      select 1 from public.organization_members om
      where om.organization_id = bundle_subscriptions.organization_id
        and om.user_id = auth.uid()
    )
  );

-- Service role can manage all bundle subscriptions
create policy "Service role full access on bundle_subscriptions"
  on public.bundle_subscriptions for all
  using (auth.role() = 'service_role');
