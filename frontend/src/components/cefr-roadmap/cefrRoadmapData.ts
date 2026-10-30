export type CEFRLevelCode = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export type LevelStatus = 'completed' | 'current' | 'locked';

export interface LearningCategoryItem {
  category: 'Grammar' | 'Vocabulary' | 'Listening & Speaking' | 'Reading & Writing';
  title: string;
  iconName: 'sparkles' | 'book' | 'mic' | 'pen';
}

export interface CEFRLevelDetail {
  code: CEFRLevelCode;
  name: string;
  color: string;
  gradient: string;
  iconType: 'sprout' | 'book' | 'message' | 'grad-cap' | 'target' | 'trophy';
  status: LevelStatus;
  description: string;
  estimatedDuration: string;
  proficiencyLevel: string;
  learningObjectives: string[];
  whatYouLearn: LearningCategoryItem[];
  // Roadmap coordinates on 600x820 vector canvas
  mapX: number;
  mapY: number;
  labelPosition: 'right' | 'left' | 'top' | 'bottom';
}

export const CEFR_ROADMAP_LEVELS: CEFRLevelDetail[] = [
  {
    code: 'A1',
    name: 'Beginner',
    color: '#3b82f6', // Blue
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    iconType: 'sprout',
    status: 'completed',
    description: 'Build your foundation with essential vocabulary, basic grammar and everyday communication.',
    estimatedDuration: '2–3 months',
    proficiencyLevel: 'Basic User (A1)',
    learningObjectives: [
      'Basic introductions and greetings.',
      'Everyday vocabulary.',
      'Simple present and basic sentence structures.',
      'Basic listening and speaking.'
    ],
    whatYouLearn: [
      { category: 'Grammar', title: 'Grammar Basics', iconName: 'sparkles' },
      { category: 'Vocabulary', title: 'Vocabulary Essentials', iconName: 'book' },
      { category: 'Listening & Speaking', title: 'Listening & Speaking', iconName: 'mic' },
      { category: 'Reading & Writing', title: 'Reading Basics', iconName: 'pen' }
    ],
    mapX: 135,
    mapY: 690,
    labelPosition: 'right'
  },
  {
    code: 'A2',
    name: 'Elementary',
    color: '#10b981', // Green
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    iconType: 'book',
    status: 'current',
    description: 'Develop your ability to communicate in familiar everyday situations with greater confidence.',
    estimatedDuration: '2–3 months',
    proficiencyLevel: 'Elementary User (A2)',
    learningObjectives: [
      'Daily conversations.',
      'Past and future basics.',
      'Describing people and situations.',
      'Writing short messages and simple texts.'
    ],
    whatYouLearn: [
      { category: 'Grammar', title: 'Elementary Grammar', iconName: 'sparkles' },
      { category: 'Vocabulary', title: 'Everyday Vocabulary', iconName: 'book' },
      { category: 'Listening & Speaking', title: 'Practical Listening & Speaking', iconName: 'mic' },
      { category: 'Reading & Writing', title: 'Short Reading & Writing', iconName: 'pen' }
    ],
    mapX: 430,
    mapY: 575,
    labelPosition: 'left'
  },
  {
    code: 'B1',
    name: 'Intermediate',
    color: '#8b5cf6', // Purple
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
    iconType: 'message',
    status: 'locked',
    description: 'Become an independent English user and communicate confidently about familiar topics.',
    estimatedDuration: '3–4 months',
    proficiencyLevel: 'Independent User (B1)',
    learningObjectives: [
      'Expressing opinions and personal experiences.',
      'Understanding the main ideas of conversations.',
      'Handling everyday travel and work situations.',
      'Writing connected paragraphs.'
    ],
    whatYouLearn: [
      { category: 'Grammar', title: 'Intermediate Grammar', iconName: 'sparkles' },
      { category: 'Vocabulary', title: 'Topic-based Vocabulary', iconName: 'book' },
      { category: 'Listening & Speaking', title: 'Real-life Listening & Speaking', iconName: 'mic' },
      { category: 'Reading & Writing', title: 'Articles & Paragraph Writing', iconName: 'pen' }
    ],
    mapX: 145,
    mapY: 450,
    labelPosition: 'right'
  },
  {
    code: 'B2',
    name: 'Upper Intermediate',
    color: '#f97316', // Orange
    gradient: 'linear-gradient(135deg, #f97316 0%, #c2410c 100%)',
    iconType: 'grad-cap',
    status: 'locked',
    description: 'Improve fluency and communicate effectively in complex social, academic and professional situations.',
    estimatedDuration: '4–5 months',
    proficiencyLevel: 'Independent User (B2)',
    learningObjectives: [
      'Fluent and spontaneous conversations.',
      'Understanding complex texts.',
      'Presenting and defending arguments.',
      'Writing detailed and structured texts.'
    ],
    whatYouLearn: [
      { category: 'Grammar', title: 'Advanced Grammar', iconName: 'sparkles' },
      { category: 'Vocabulary', title: 'Academic Vocabulary', iconName: 'book' },
      { category: 'Listening & Speaking', title: 'Advanced Listening & Speaking', iconName: 'mic' },
      { category: 'Reading & Writing', title: 'Essay & Report Writing', iconName: 'pen' }
    ],
    mapX: 420,
    mapY: 330,
    labelPosition: 'left'
  },
  {
    code: 'C1',
    name: 'Advanced',
    color: '#ec4899', // Pink
    gradient: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
    iconType: 'target',
    status: 'locked',
    description: 'Use English flexibly and effectively in academic, professional and demanding situations.',
    estimatedDuration: '5–6 months',
    proficiencyLevel: 'Proficient User (C1)',
    learningObjectives: [
      'Understanding implicit meanings.',
      'Expressing ideas fluently and precisely.',
      'Participating in complex discussions.',
      'Producing well-structured academic writing.'
    ],
    whatYouLearn: [
      { category: 'Grammar', title: 'Advanced Language Structures', iconName: 'sparkles' },
      { category: 'Vocabulary', title: 'Sophisticated Vocabulary', iconName: 'book' },
      { category: 'Listening & Speaking', title: 'Academic Listening & Speaking', iconName: 'mic' },
      { category: 'Reading & Writing', title: 'Advanced Reading & Writing', iconName: 'pen' }
    ],
    mapX: 165,
    mapY: 215,
    labelPosition: 'right'
  },
  {
    code: 'C2',
    name: 'Proficient',
    color: '#eab308', // Red / Gold
    gradient: 'linear-gradient(135deg, #eab308 0%, #ef4444 100%)',
    iconType: 'trophy',
    status: 'locked',
    description: 'Achieve a high level of language mastery and understand virtually everything heard or read.',
    estimatedDuration: '6+ months',
    proficiencyLevel: 'Mastery / Native Fluency (C2)',
    learningObjectives: [
      'Understanding complex and nuanced language.',
      'Summarizing information from different sources.',
      'Expressing precise meanings naturally.',
      'Communicating effectively in demanding situations.'
    ],
    whatYouLearn: [
      { category: 'Grammar', title: 'Language Mastery', iconName: 'sparkles' },
      { category: 'Vocabulary', title: 'Nuanced Vocabulary', iconName: 'book' },
      { category: 'Listening & Speaking', title: 'Expert Listening & Speaking', iconName: 'mic' },
      { category: 'Reading & Writing', title: 'Advanced Reading & Writing', iconName: 'pen' }
    ],
    mapX: 345,
    mapY: 95,
    labelPosition: 'left'
  }
];

export const ROADMAP_QUOTE = "Better English, Bigger Opportunities";
export const MOTIVATIONAL_HEADING = "Small steps deliver big results.";
export const MOTIVATIONAL_DESC = "You're not just learning a language, you're opening new doors.";

