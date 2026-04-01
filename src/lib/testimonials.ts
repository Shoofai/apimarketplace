export type Testimonial = {
  quote: string;
  name: string;
  title: string;
  initials: string;
  metric: string;
  company: string;
};

export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      'The platform cut our API integration time from weeks to hours. The AI code generation is a game-changer for our engineering team.',
    name: 'Sarah Chen',
    title: 'VP Engineering',
    company: 'TechFlow',
    initials: 'SC',
    metric: '90% faster integration',
  },
  {
    quote:
      'We migrated from RapidAPI and saw 40% cost savings in the first month. The governance features alone justify the switch.',
    name: 'Marcus Rodriguez',
    title: 'CTO',
    company: 'DataPipe',
    initials: 'MR',
    metric: '40% cost savings',
  },
  {
    quote:
      'Finally, one platform where our providers and developers both thrive. Revenue grew 3x after listing our APIs here.',
    name: 'Priya Patel',
    title: 'Head of API Strategy',
    company: 'CloudNine',
    initials: 'PP',
    metric: '3x revenue growth',
  },
];
