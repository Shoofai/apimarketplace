'use client';

import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';

const faqs = [
  {
    q: "What's your contract process?",
    a: "We offer month-to-month, annual, and multi-year contracts. Procurement teams can request our standard MSA template or provide their own. Typical legal turnaround is 3–5 business days. Contact our sales team to kick off the process.",
  },
  {
    q: "How do SLA credits work?",
    a: "If uptime falls below our 99.9% SLA, credits are calculated automatically and applied to your next invoice — no ticket required. Credit amounts scale with downtime duration. Full details are in our Service Level Agreement.",
  },
  {
    q: "When will SOC 2 Type II be complete?",
    a: "Our SOC 2 Type II audit is in progress, with completion targeted for Q2 2026. We can share our current security posture documentation, control list, and interim assessment on request — contact our security team.",
  },
  {
    q: "Is HIPAA compliance available?",
    a: "Yes. A Business Associate Agreement (BAA) is available for Enterprise customers who handle Protected Health Information (PHI). Contact sales to get your BAA counter-signed before going live with any PHI workloads.",
  },
  {
    q: "How is white-label pricing structured?",
    a: "White-label is available on custom Enterprise contracts. Pricing is based on seat count, API volume, and customisation scope. Book a demo and we'll put together a tailored quote within 24 hours.",
  },
  {
    q: "Can we sign an MSA or BAA before starting?",
    a: "Yes — we can sign your paper or ours. Send your preferred form to our legal team via the contact form (select 'Enterprise' as the category). Legal review typically takes 3–5 business days.",
  },
  {
    q: "Who are your sub-processors?",
    a: "Our current sub-processors are: Supabase (database and authentication), Vercel (hosting and edge network), Stripe (payment processing), and Anthropic (AI code generation). The full list with data categories and regions is available in our Data Processing Agreement.",
  },
];

export function EnterpriseFAQ() {
  return (
    <Accordion type="single" className="mt-6">
      {faqs.map(({ q, a }, i) => (
        <AccordionItem key={i} value={String(i)}>
          <AccordionTrigger className="text-left text-base font-medium text-foreground">
            {q}
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground leading-relaxed">
            {a}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
