create type faq_category as enum ('general', 'pricing', 'enterprise');

create table faqs (
  id          uuid primary key default gen_random_uuid(),
  question    text not null,
  answer      text not null,
  category    faq_category not null default 'general',
  sort_order  integer not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- auto-update updated_at
create or replace function update_faqs_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger faqs_updated_at
  before update on faqs
  for each row execute function update_faqs_updated_at();

-- RLS: public can read active FAQs; only service-role can write
alter table faqs enable row level security;

create policy "Public read active FAQs"
  on faqs for select
  using (is_active = true);

create policy "Service role full access"
  on faqs for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- Seed with existing hardcoded FAQs
insert into faqs (question, answer, category, sort_order) values
  ('Can I change plans later?',
   'Yes. You can upgrade or downgrade at any time from your dashboard. Changes take effect at the start of the next billing period.',
   'pricing', 1),
  ('What payment methods do you accept?',
   'We accept major credit and debit cards via Stripe. Enterprise customers can request invoice billing.',
   'pricing', 2),
  ('Is there a free trial for Pro?',
   'The Free tier is always free. When billing is active, we may offer a trial for Pro—check the signup flow for current offers.',
   'pricing', 3),
  ('Do you offer annual billing?',
   'When billing is fully active, annual plans will be available with a discount. Contact sales for enterprise annual agreements.',
   'pricing', 4),
  ('What''s your contract process?',
   'We offer month-to-month, annual, and multi-year contracts. Procurement teams can request our standard MSA template or provide their own. Typical legal turnaround is 3–5 business days. Contact our sales team to kick off the process.',
   'enterprise', 1),
  ('How do SLA credits work?',
   'If uptime falls below our 99.9% SLA, credits are calculated automatically and applied to your next invoice — no ticket required. Credit amounts scale with downtime duration. Full details are in our Service Level Agreement.',
   'enterprise', 2),
  ('When will SOC 2 Type II be complete?',
   'Our SOC 2 Type II audit is in progress, with completion targeted for Q2 2026. We can share our current security posture documentation, control list, and interim assessment on request — contact our security team.',
   'enterprise', 3),
  ('Is HIPAA compliance available?',
   'Yes. A Business Associate Agreement (BAA) is available for Enterprise customers who handle Protected Health Information (PHI). Contact sales to get your BAA counter-signed before going live with any PHI workloads.',
   'enterprise', 4),
  ('How is white-label pricing structured?',
   'White-label is available on custom Enterprise contracts. Pricing is based on seat count, API volume, and customisation scope. Book a demo and we''ll put together a tailored quote within 24 hours.',
   'enterprise', 5),
  ('Can we sign an MSA or BAA before starting?',
   'Yes — we can sign your paper or ours. Send your preferred form to our legal team via the contact form (select ''Enterprise'' as the category). Legal review typically takes 3–5 business days.',
   'enterprise', 6),
  ('Who are your sub-processors?',
   'Our current sub-processors are: Supabase (database and authentication), Vercel (hosting and edge network), Stripe (payment processing), and Anthropic (AI code generation). The full list with data categories and regions is available in our Data Processing Agreement.',
   'enterprise', 7);
