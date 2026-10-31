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
    name: 'Beginner (Boşlang‘iç)',
    color: '#3b82f6', // Blue
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    iconType: 'sprout',
    status: 'completed',
    description: 'Asosiy söz boyligi, boşlang‘iç grammatika va kundalik oddiy muloqot bilan mustahkam poydevor quring.',
    estimatedDuration: '2–3 oy',
    proficiencyLevel: 'Boşlang‘iç daraja (A1)',
    learningObjectives: [
      'Özini taniştiriş va kundalik salomlaşiş.',
      'Kundalik eng zarur sözlar va iboralar.',
      'Hozirgi oddiy zamon va sodda gap tuziş.',
      'Boşlang‘iç eşitiş va töğri talaffuz.'
    ],
    whatYouLearn: [
      { category: 'Grammar', title: 'Boşlang‘iç grammatika', iconName: 'sparkles' },
      { category: 'Vocabulary', title: 'Eng muhim sözlar', iconName: 'book' },
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
    description: 'Kundalik taniş vaziyatlarda yuqoriroq işonç bilan erkin muloqot qiliş qobiliyatingizni rivojlantiring.',
    estimatedDuration: '2–3 oy',
    proficiencyLevel: 'Elementar daraja (A2)',
    learningObjectives: [
      'Kundalik mavzularda mustaqil suhbat.',
      'Ötgan va kelasi zamon grammatikasi.',
      'Insonlar, buyumlar va joylarni tasvirlaş.',
      'Qisqa xabarlar va sodda matnlar yoziş.'
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
    name: 'Intermediate (Örta)',
    color: '#8b5cf6', // Purple
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
    iconType: 'message',
    status: 'locked',
    description: 'Mustaqil til foydalanuvçisiga aylaning, şaxsiy fikrlar, sayohat va iş mavzularida işonç bilan sözlang.',
    estimatedDuration: '3–4 oy',
    proficiencyLevel: 'Mustaqil daraja (B1)',
    learningObjectives: [
      'Şaxsiy fikr va tajribalarni erkin ifodalaş.',
      'Suhbatlarning asosiy mazmunini töliq tuşuniş.',
      'Sayohat va iş jarayonidagi vaziyatlarni hal qiliş.',
      'Mantiqiy boğlangan matn va xatlar tuziş.'
    ],
    whatYouLearn: [
      { category: 'Grammar', title: 'Örta daraja qoidalari', iconName: 'sparkles' },
      { category: 'Vocabulary', title: 'Mavzuli söz boyligi', iconName: 'book' },
      { category: 'Listening & Speaking', title: 'Real hayotiy muloqot', iconName: 'mic' },
      { category: 'Reading & Writing', title: 'Maqolalar va inşolar', iconName: 'pen' }
    ],
    mapX: 145,
    mapY: 450,
    labelPosition: 'right'
  },
  {
    code: 'B2',
    name: 'Upper Intermediate (Örtadan yuqori)',
    color: '#f97316', // Orange
    gradient: 'linear-gradient(135deg, #f97316 0%, #c2410c 100%)',
    iconType: 'grad-cap',
    status: 'locked',
    description: 'Murakkab ijtimoiy, akademik va professional sohalarda ravon va erkin muloqot qiliş darajasiga çiqing.',
    estimatedDuration: '4–5 oy',
    proficiencyLevel: 'Yuqori mustaqil daraja (B2)',
    learningObjectives: [
      'Ravon va tabiiy spontan suhbat quriş.',
      'Murakkab mavzulardagi matnlarni çuqur tuşuniş.',
      'Munozaralarda öz fikrini işonçli himoya qiliş.',
      'Batafsil va tizimli inşolar yoziş.'
    ],
    whatYouLearn: [
      { category: 'Grammar', title: 'Murakkab grammatika', iconName: 'sparkles' },
      { category: 'Vocabulary', title: 'Akademik sözlar', iconName: 'book' },
      { category: 'Listening & Speaking', title: 'Çuqur audio tahlili', iconName: 'mic' },
      { category: 'Reading & Writing', title: 'Katta inşo & hisobotlar', iconName: 'pen' }
    ],
    mapX: 420,
    mapY: 330,
    labelPosition: 'left'
  },
  {
    code: 'C1',
    name: 'Advanced (Ilğor)',
    color: '#ec4899', // Pink
    gradient: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
    iconType: 'target',
    status: 'locked',
    description: 'Akademik va professional sohalarda tilni moslaşuvçan, aniq va çuqur ma’nolarni anglagan holda işlating.',
    estimatedDuration: '5–6 oy',
    proficiencyLevel: 'Ilğor professional daraja (C1)',
    learningObjectives: [
      'Yaşirin va majoziy ma’nolarni töliq anglaş.',
      'Fikrlarni juda aniq va ravon ifodalaş.',
      'Ilmiy va professional munozaralarda erkin qatnaşiş.',
      'Murakkab akademik va tahliliy hisobotlar tuziş.'
    ],
    whatYouLearn: [
      { category: 'Grammar', title: 'Ilğor til tuzilmalari', iconName: 'sparkles' },
      { category: 'Vocabulary', title: 'Nufuzli boy sözlar', iconName: 'book' },
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
    description: 'Tilni ona tili (native) darajasida mukammal özlaştiring, barça murakkab matn va audio manbalarni bemalol tuşuning.',
    estimatedDuration: '6+ oy',
    proficiencyLevel: 'Mukammal / Ona tili darajasi (C2)',
    learningObjectives: [
      'Har qanday murakkab va nozik nutqni tuşuniş.',
      'Turli manbalardan ma’lumotlarni umumlaştiriş.',
      'Nozik ma’no va uslubiy farqlarni tabiiy ifodalaş.',
      'Eng talabçan professional sohalarda erkin sözlaşiş.'
    ],
    whatYouLearn: [
      { category: 'Grammar', title: 'Mukammal uslubiyat', iconName: 'sparkles' },
      { category: 'Vocabulary', title: 'Nozik ma’nodoş sözlar', iconName: 'book' },
      { category: 'Listening & Speaking', title: 'Ekspert darajasidagi nutq', iconName: 'mic' },
      { category: 'Reading & Writing', title: 'Professional tahlillar', iconName: 'pen' }
    ],
    mapX: 345,
    mapY: 95,
    labelPosition: 'left'
  }
];

export const ROADMAP_QUOTE = "Katta imkoniyatlar — kuçli til bilan!";
export const MOTIVATIONAL_HEADING = "Kiçik qadamlar katta natijalar beradi.";
export const MOTIVATIONAL_DESC = "Siz şunçaki til örganmayapsiz, özingiz uçun yangi imkoniyatlar eşigini oçyapsiz.";
