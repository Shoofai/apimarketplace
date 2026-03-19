-- Tables for admin diagnostic endpoints that previously read from the local filesystem.
-- These allow regression-results and readiness routes to work on Vercel (read-only fs).

-- Regression test summaries (written by CI after E2E runs)
create table if not exists public.regression_summaries (
  id uuid primary key default gen_random_uuid(),
  last_run timestamptz not null default now(),
  passed int not null default 0,
  failed int not null default 0,
  skipped int not null default 0,
  total int not null default 0,
  duration_ms int not null default 0,
  error text,
  results jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

-- Production readiness scanner reports
create table if not exists public.readiness_reports (
  id uuid primary key default gen_random_uuid(),
  report jsonb not null default '{}'::jsonb,
  scanner_version text,
  created_at timestamptz not null default now()
);

-- Only platform admins should read these
alter table public.regression_summaries enable row level security;
alter table public.readiness_reports enable row level security;

create policy "Platform admins can read regression summaries"
  on public.regression_summaries for select
  using (
    exists (
      select 1 from public.organization_members om
      join public.organizations o on o.id = om.organization_id
      where om.user_id = auth.uid()
        and om.role = 'admin'
        and o.is_platform_owner = true
    )
  );

create policy "Platform admins can read readiness reports"
  on public.readiness_reports for select
  using (
    exists (
      select 1 from public.organization_members om
      join public.organizations o on o.id = om.organization_id
      where om.user_id = auth.uid()
        and om.role = 'admin'
        and o.is_platform_owner = true
    )
  );

-- Service role can insert (from CI/scripts)
create policy "Service role can insert regression summaries"
  on public.regression_summaries for insert
  with check (true);

create policy "Service role can insert readiness reports"
  on public.readiness_reports for insert
  with check (true);
