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
    name: 'Beginner (Boshlang‘ich)',
    color: '#3b82f6', // Blue
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    iconType: 'sprout',
    status: 'completed',
    description: 'Asosiy so‘z boyligi, boshlang‘ich grammatika va kundalik oddiy muloqot bilan mustahkam poydevor quring.',
    estimatedDuration: '2–3 oy',
    proficiencyLevel: 'Boshlang‘ich daraja (A1)',
    learningObjectives: [
      'O‘zini tanishtirish va kundalik salomlashish.',
      'Kundalik eng zarur so‘zlar va iboralar.',
      'Hozirgi oddiy zamon va sodda gap tuzish.',
      'Boshlang‘ich eshitish va to‘g‘ri talaffuz.'
    ],
    whatYouLearn: [
      { category: 'Grammar', title: 'Boshlang‘ich grammatika', iconName: 'sparkles' },
      { category: 'Vocabulary', title: 'Eng muhim so‘zlar', iconName: 'book' },
      { category: 'Listening & Speaking', title: 'Oddiy suhbatlar', iconName: 'mic' },
      { category: 'Reading & Writing', title: 'Sodda matnlar', iconName: 'pen' }
    ],
    mapX: 135,
    mapY: 690,
    labelPosition: 'right'
  },
  {
    code: 'A2',
    name: 'Elementary (Elementar)',
    color: '#10b981', // Green
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    iconType: 'book',
    status: 'current',
    description: 'Kundalik tanish vaziyatlarda yuqoriroq ishonch bilan erkin muloqot qilish qobiliyatingizni rivojlantiring.',
    estimatedDuration: '2–3 oy',
    proficiencyLevel: 'Elementar daraja (A2)',
    learningObjectives: [
      'Kundalik mavzularda mustaqil suhbat.',
      'O‘tgan va kelasi zamon grammatikasi.',
      'Insonlar, buyumlar va joylarni tasvirlash.',
      'Qisqa xabarlar va sodda matnlar yozish.'
    ],
    whatYouLearn: [
      { category: 'Grammar', title: 'Elementar grammatika', iconName: 'sparkles' },
      { category: 'Vocabulary', title: 'Kundalik faol leksika', iconName: 'book' },
      { category: 'Listening & Speaking', title: 'Amaliy audio & nutq', iconName: 'mic' },
      { category: 'Reading & Writing', title: 'Qisqa matn & xatlar', iconName: 'pen' }
    ],
    mapX: 430,
    mapY: 575,
    labelPosition: 'left'
  },
  {
    code: 'B1',
    name: 'Intermediate (O‘rta)',
    color: '#8b5cf6', // Purple
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
    iconType: 'message',
    status: 'locked',
    description: 'Mustaqil til foydalanuvchisiga aylaning, shaxsiy fikrlar, sayohat va ish mavzularida ishonch bilan so‘zlang.',
    estimatedDuration: '3–4 oy',
    proficiencyLevel: 'Mustaqil daraja (B1)',
    learningObjectives: [
      'Shaxsiy fikr va tajribalarni erkin ifodalash.',
      'Suhbatlarning asosiy mazmunini to‘liq tushunish.',
      'Sayohat va ish jarayonidagi vaziyatlarni hal qilish.',
      'Mantiqiy bog‘langan matn va xatlar tuzish.'
    ],
    whatYouLearn: [
      { category: 'Grammar', title: 'O‘rta daraja qoidalari', iconName: 'sparkles' },
      { category: 'Vocabulary', title: 'Mavzuli so‘z boyligi', iconName: 'book' },
      { category: 'Listening & Speaking', title: 'Real hayotiy muloqot', iconName: 'mic' },
      { category: 'Reading & Writing', title: 'Maqolalar va insholar', iconName: 'pen' }
    ],
    mapX: 145,
    mapY: 450,
    labelPosition: 'right'
  },
  {
    code: 'B2',
    name: 'Upper Intermediate (O‘rtadan yuqori)',
    color: '#f97316', // Orange
    gradient: 'linear-gradient(135deg, #f97316 0%, #c2410c 100%)',
    iconType: 'grad-cap',
    status: 'locked',
    description: 'Murakkab ijtimoiy, akademik va professional sohalarda ravon va erkin muloqot qilish darajasiga chiqing.',
    estimatedDuration: '4–5 oy',
    proficiencyLevel: 'Yuqori mustaqil daraja (B2)',
    learningObjectives: [
      'Ravon va tabiiy spontan suhbat qurish.',
      'Murakkab mavzulardagi matnlarni chuqur tushunish.',
      'Munozaralarda o‘z fikrini ishonchli himoya qilish.',
      'Batafsil va tizimli insholar yozish.'
    ],
    whatYouLearn: [
      { category: 'Grammar', title: 'Murakkab grammatika', iconName: 'sparkles' },
      { category: 'Vocabulary', title: 'Akademik so‘zlar', iconName: 'book' },
      { category: 'Listening & Speaking', title: 'Chuqur audio tahlili', iconName: 'mic' },
      { category: 'Reading & Writing', title: 'Katta insho & hisobotlar', iconName: 'pen' }
    ],
    mapX: 420,
    mapY: 330,
    labelPosition: 'left'
  },
  {
    code: 'C1',
    name: 'Advanced (Ilg‘or)',
    color: '#ec4899', // Pink
    gradient: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
    iconType: 'target',
    status: 'locked',
    description: 'Akademik va professional sohalarda tilni moslashuvchan, aniq va chuqur ma‘nolarni anglagan holda ishlating.',
    estimatedDuration: '5–6 oy',
    proficiencyLevel: 'Ilg‘or professional daraja (C1)',
    learningObjectives: [
      'Yashirin va majoziy ma‘nolarni to‘liq anglash.',
      'Fikrlarni juda aniq va ravon ifodalash.',
      'Ilmiy va professional munozaralarda erkin qatnashish.',
      'Murakkab akademik va tahliliy hisobotlar tuzish.'
    ],
    whatYouLearn: [
      { category: 'Grammar', title: 'Ilg‘or til tuzilmalari', iconName: 'sparkles' },
      { category: 'Vocabulary', title: 'Nufuzli boy so‘zlar', iconName: 'book' },
      { category: 'Listening & Speaking', title: 'Akademik munozara', iconName: 'mic' },
      { category: 'Reading & Writing', title: 'Tahliliy ilmiy matnlar', iconName: 'pen' }
    ],
    mapX: 165,
    mapY: 215,
    labelPosition: 'right'
  },
  {
    code: 'C2',
    name: 'Proficient (Mukammal)',
    color: '#eab308', // Red / Gold
    gradient: 'linear-gradient(135deg, #eab308 0%, #ef4444 100%)',
    iconType: 'trophy',
    status: 'locked',
    description: 'Tilni ona tili (native) darajasida mukammal o‘zlashtiring, barcha murakkab matn va audio manbalarni bemalol tushuning.',
    estimatedDuration: '6+ oy',
    proficiencyLevel: 'Mukammal / Ona tili darajasi (C2)',
    learningObjectives: [
      'Har qanday murakkab va nozik nutqni tushunish.',
      'Turli manbalardan ma‘lumotlarni umumlashtirish.',
      'Nozik ma‘no va uslubiy farqlarni tabiiy ifodalash.',
      'Eng talabchan professional sohalarda erkin so‘zlashish.'
    ],
    whatYouLearn: [
      { category: 'Grammar', title: 'Mukammal uslubiyat', iconName: 'sparkles' },
      { category: 'Vocabulary', title: 'Nozik ma‘nodosh so‘zlar', iconName: 'book' },
      { category: 'Listening & Speaking', title: 'Ekspert darajasidagi nutq', iconName: 'mic' },
      { category: 'Reading & Writing', title: 'Professional tahlillar', iconName: 'pen' }
    ],
    mapX: 345,
    mapY: 95,
    labelPosition: 'left'
  }
];

export const ROADMAP_QUOTE = "Katta imkoniyatlar — kuchli til bilan!";
export const MOTIVATIONAL_HEADING = "Kichik qadamlar katta natijalar beradi.";
export const MOTIVATIONAL_DESC = "Siz shunchaki til o‘rganmayapsiz, o‘zingiz uchun yangi imkoniyatlar eshigini ochyapsiz.";

