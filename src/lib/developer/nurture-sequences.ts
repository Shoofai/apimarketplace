export interface NurtureStep {
  delay_hours: number;
  subject: string;
  template: string;
  condition?: string; // e.g. 'first_call_made IS NULL' — evaluated server-side
}

export const DEVELOPER_SEQUENCES: Record<string, NurtureStep[]> = {
  signed_up: [
    {
      delay_hours: 0.5,
      subject: 'Your API key is ready — make your first call in 30 seconds',
      template: 'dev_welcome',
    },
    {
      delay_hours: 24,
      subject: '3 APIs trending this week that match your stack',
      template: 'dev_trending_apis',
    },
    {
      delay_hours: 72,
      subject: 'Build something cool? Share it and get $10 credit',
      template: 'dev_referral_intro',
    },
  ],
  api_key_created: [
    {
      delay_hours: 48,
      subject: "Haven't made your first call yet? Here's a 1-min quickstart",
      template: 'dev_activation_nudge',
      condition: 'first_call_made IS NULL',
    },
  ],
  first_call_made: [
    {
      delay_hours: 2,
      subject: '🎉 First API call success! Here\'s what to try next',
      template: 'dev_first_call_celebration',
    },
  ],
  active_user: [
    {
      delay_hours: 168, // Weekly
      subject: 'Your API usage this week + new APIs you might like',
      template: 'dev_weekly_digest',
    },
  ],
  code_generated: [
    {
      delay_hours: 1,
      subject: 'Ready to test that code live? Get your free API key',
      template: 'dev_post_codegen_cta',
    },
  ],
};

export type DeveloperNurtureStage = keyof typeof DEVELOPER_SEQUENCES;
