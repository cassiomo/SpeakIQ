export interface ExpertProfile {
  name: string;
  title: string;
  description: string;
  avatar: string;
  scores: {
    clarity: number;
    engagement: number;
    confidence: number;
  };
}

export const expertProfiles: ExpertProfile[] = [
  {
    name: 'The Visionary',
    title: 'e.g., Steve Jobs',
    description: 'Paints a compelling picture of the future. Uses powerful, simple language and a confident, deliberate pace to inspire and motivate.',
    avatar: 'https://picsum.photos/seed/visionary/100/100',
    scores: {
      clarity: 90,
      engagement: 95,
      confidence: 98,
    },
  },
  {
    name: 'The Storyteller',
    title: 'e.g., Brené Brown',
    description: 'Builds deep emotional connections through narrative and vulnerability. Their speeches are engaging, relatable, and highly memorable.',
    avatar: 'https://picsum.photos/seed/storyteller/100/100',
    scores: {
      clarity: 85,
      engagement: 98,
      confidence: 90,
    },
  },
  {
    name: 'The Educator',
    title: 'e.g., Sir Ken Robinson',
    description: 'Makes complex topics accessible and engaging. Uses humor, clear structure, and insightful analysis to inform and enlighten.',
    avatar: 'https://picsum.photos/seed/educator/100/100',
    scores: {
      clarity: 95,
      engagement: 90,
      confidence: 88,
    },
  },
  {
    name: 'The Motivator',
    title: 'e.g., Tony Robbins',
    description: 'High-energy and action-oriented. Uses a dynamic vocal range, repetition, and a powerful stage presence to drive audiences to act.',
    avatar: 'https://picsum.photos/seed/motivator/100/100',
    scores: {
      clarity: 80,
      engagement: 92,
      confidence: 95,
    },
  },
];
