import { createClient } from '@/lib/supabase/server';

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: 'general' | 'pricing' | 'enterprise';
  sort_order: number;
  is_active: boolean;
}

const FALLBACK_PRICING: FAQ[] = [
  { id: 'f-p1', question: 'Can I change plans later?', answer: 'Yes. You can upgrade or downgrade at any time from your dashboard. Changes take effect at the start of the next billing period.', category: 'pricing', sort_order: 1, is_active: true },
  { id: 'f-p2', question: 'What payment methods do you accept?', answer: 'We accept major credit and debit cards via Stripe. Enterprise customers can request invoice billing.', category: 'pricing', sort_order: 2, is_active: true },
  { id: 'f-p3', question: 'Is there a free trial for Pro?', answer: 'The Free tier is always free. When billing is active, we may offer a trial for Pro—check the signup flow for current offers.', category: 'pricing', sort_order: 3, is_active: true },
  { id: 'f-p4', question: 'Do you offer annual billing?', answer: 'When billing is fully active, annual plans will be available with a discount. Contact sales for enterprise annual agreements.', category: 'pricing', sort_order: 4, is_active: true },
];

const FALLBACK_ENTERPRISE: FAQ[] = [
  { id: 'f-e1', question: "What's your contract process?", answer: "We offer month-to-month, annual, and multi-year contracts. Procurement teams can request our standard MSA template or provide their own. Typical legal turnaround is 3–5 business days.", category: 'enterprise', sort_order: 1, is_active: true },
  { id: 'f-e2', question: 'How do SLA credits work?', answer: 'If uptime falls below our 99.9% SLA, credits are calculated automatically and applied to your next invoice — no ticket required.', category: 'enterprise', sort_order: 2, is_active: true },
  { id: 'f-e3', question: 'When will SOC 2 Type II be complete?', answer: 'Our SOC 2 Type II audit is in progress, with completion targeted for Q2 2026.', category: 'enterprise', sort_order: 3, is_active: true },
  { id: 'f-e4', question: 'Is HIPAA compliance available?', answer: 'Yes. A Business Associate Agreement (BAA) is available for Enterprise customers who handle Protected Health Information (PHI).', category: 'enterprise', sort_order: 4, is_active: true },
  { id: 'f-e5', question: 'How is white-label pricing structured?', answer: 'White-label is available on custom Enterprise contracts. Pricing is based on seat count, API volume, and customisation scope.', category: 'enterprise', sort_order: 5, is_active: true },
  { id: 'f-e6', question: 'Can we sign an MSA or BAA before starting?', answer: "Yes — we can sign your paper or ours. Send your preferred form to our legal team via the contact form.", category: 'enterprise', sort_order: 6, is_active: true },
  { id: 'f-e7', question: 'Who are your sub-processors?', answer: 'Our current sub-processors are: Supabase, Vercel, Stripe, and Anthropic. The full list is available in our Data Processing Agreement.', category: 'enterprise', sort_order: 7, is_active: true },
];

export async function getFAQsByCategory(category: 'pricing' | 'enterprise' | 'general'): Promise<FAQ[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('faqs')
      .select('id, question, answer, category, sort_order, is_active')
      .eq('category', category)
      .eq('is_active', true)
      .order('sort_order');

    if (error || !data || data.length === 0) {
      return category === 'pricing' ? FALLBACK_PRICING : category === 'enterprise' ? FALLBACK_ENTERPRISE : [];
    }
    return data as FAQ[];
  } catch {
    return category === 'pricing' ? FALLBACK_PRICING : category === 'enterprise' ? FALLBACK_ENTERPRISE : [];
  }
}
