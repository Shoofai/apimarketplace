-- GraphQL API configuration
create table if not exists public.api_graphql_configs (
  id uuid primary key default gen_random_uuid(),
  api_id uuid not null references public.apis(id) on delete cascade,
  introspection_enabled boolean not null default true,
  schema_sdl text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(api_id)
);

alter table public.api_graphql_configs enable row level security;

create policy "Org members can manage their API GraphQL configs"
  on public.api_graphql_configs for all
  using (
    exists (
      select 1 from public.apis a
      join public.organization_members om on om.organization_id = a.organization_id
      where a.id = api_graphql_configs.api_id and om.user_id = auth.uid()
    )
  );

create policy "Authenticated users can read published API GraphQL configs"
  on public.api_graphql_configs for select
  using (
    exists (
      select 1 from public.apis a
      where a.id = api_graphql_configs.api_id and a.status = 'published'
    )
  );

-- Mock server configurations
create table if not exists public.api_mock_configs (
  id uuid primary key default gen_random_uuid(),
  api_id uuid not null references public.apis(id) on delete cascade,
  endpoint_path text not null,
  http_method text not null default 'GET',
  response_status int not null default 200,
  response_body jsonb,
  response_headers jsonb not null default '{}'::jsonb,
  delay_ms int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.api_mock_configs enable row level security;

create policy "Org members can manage their API mock configs"
  on public.api_mock_configs for all
  using (
    exists (
      select 1 from public.apis a
      join public.organization_members om on om.organization_id = a.organization_id
      where a.id = api_mock_configs.api_id and om.user_id = auth.uid()
    )
  );

create policy "Authenticated users can read published API mock configs"
  on public.api_mock_configs for select
  using (
    exists (
      select 1 from public.apis a
      where a.id = api_mock_configs.api_id and a.status = 'published'
    )
  );

-- Feature flags for new features
insert into public.feature_flags (name, description, enabled_globally) values
  ('graphql_proxy', 'Enable GraphQL API proxy and playground', false),
  ('mock_server', 'Enable mock server for APIs', false),
  ('ip_allowlist', 'Enable IP allowlisting enforcement', false),
  ('mfa_enforcement', 'Require MFA for all organization members', false)
on conflict (name) do nothing;
