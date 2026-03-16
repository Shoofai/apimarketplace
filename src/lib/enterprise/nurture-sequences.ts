export interface NurtureStep {
  delay_hours: number;
  subject: string;
  template: string;
  condition?: string;
}

export const ENTERPRISE_SEQUENCES: Record<string, NurtureStep[]> = {
  discovered: [
    {
      delay_hours: 2,
      subject: 'API governance that could save your team $50K+/year — personalized ROI',
      template: 'ent_value_prop',
    },
    {
      delay_hours: 96,
      subject: 'How companies in your industry are solving API sprawl',
      template: 'ent_industry_proof',
    },
  ],
  roi_calculated: [
    {
      delay_hours: 24,
      subject: 'Your personalized ROI report: estimated savings inside',
      template: 'ent_roi_followup',
    },
    {
      delay_hours: 72,
      subject: '15-min demo? See your savings in action',
      template: 'ent_demo_invite',
    },
  ],
  demo_scheduled: [
    {
      delay_hours: 1,
      subject: 'Demo confirmed — here is what we will cover',
      template: 'ent_demo_confirmation',
    },
    {
      delay_hours: -24, // 24h before demo (relative, handled server-side)
      subject: 'Your demo is tomorrow — agenda inside',
      template: 'ent_demo_reminder',
    },
  ],
  demo_completed: [
    {
      delay_hours: 2,
      subject: 'Your pilot environment is ready — start governing APIs today',
      template: 'ent_pilot_setup',
    },
    {
      delay_hours: 168,
      subject: 'How is the pilot going? Here to help',
      template: 'ent_pilot_checkin',
    },
  ],
  pilot_active: [
    {
      delay_hours: 336,
      subject: 'Your pilot results — APIs governed, issues caught',
      template: 'ent_pilot_results',
    },
  ],
  proposal_sent: [
    {
      delay_hours: 48,
      subject: 'Proposal follow-up — any questions from your team?',
      template: 'ent_proposal_followup',
    },
  ],
};

export type EnterpriseNurtureStage = keyof typeof ENTERPRISE_SEQUENCES;
