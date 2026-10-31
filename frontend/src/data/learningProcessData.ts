export interface LearningProcessStep {
  step: string; // '01', '02', ...
  title: string;
  desc: string;
  badge?: string;
  image?: string;
  imageDesktop?: string;
  imageMobile?: string;
}

export interface LearningProcessConfig {
  kicker?: string;
  title?: string;
  subtitle?: string;
  studentImage?: string;
  floatingFlags?: string[];
  bottomQuote?: string;
  steps: LearningProcessStep[];
}

export const DEFAULT_LEARNING_PROCESS_STEPS: LearningProcessStep[] = [
  {
    step: '01',
    title: 'Tillarni örganişni boşlang',
    desc: 'Dastlab özingizga mos tilni tanlang va darajangizni aniqlang. Bu sizning şaxsiy öquv yölingizni belgilaydi.',
    badge: 'BOŞLANĞIÇ QADAM'
  },
  {
    step: '02',
    title: 'Şaxsiy reja tuziling',
    desc: 'Sizning maqsadingiz, avvalgi bilim darajangiz asosida individual öquv reja yaratiladi. Bu reja sizning muvaffaqiyatingiz kafolati.',
    badge: 'INDIVIDUAL YONDAŞUV'
  },
  {
    step: '03',
    title: 'Darslarni örganing',
    desc: 'Interaktiv darslar, audio, video va amaliy maşqlar orqali yangi bilimlarni egallaysiz. Har bir bölim bosqiçma-bosqiç tuzilgan.',
    badge: 'INTERAKTIV TA’LIM'
  },
  {
    step: '04',
    title: 'Amaliyot va söz öyinlari',
    desc: 'Örganilgan bilimlaringizni amaliyotda qöllang. Söz boyligini oşiriş uçun interaktiv öyinlar, testlar va nutq maşqlari sizni kutmoqda.',
    badge: 'AMALIY MUSTAHKAMLAŞ'
  },
  {
    step: '05',
    title: 'Natijalar va ösiş',
    desc: 'Muntazam testlar, progress kuzatuvi va statistikalar orqali öz rivojlanişingizni körasiz. Bu sizga yanada katta motivatsiya beradi.',
    badge: 'PROGRESS VA MONITORING'
  },
  {
    step: '06',
    title: 'Bilimni mustahkamlang',
    desc: 'Örganilgan mavzularni takrorlaş, öqiş maşqlari va real hayotdagi vaziyatlarda qöllaş orqali bilimlaringiz mustahkamlanadi.',
    badge: 'MAHORAT VA AMALIYOT'
  },
  {
    step: '07',
    title: 'Natija – yangi imkoniyatlar',
    desc: 'Siz özingizni yangi darajada his qilasiz: erkin muloqot, çet elda öqiş yoki işlaş, yangi döstlar va keng imkoniyatlar sizni kutmoqda.',
    badge: 'YUKSAK MAQSADLAR'
  }
];

export const DEFAULT_LEARNING_PROCESS_CONFIG: LearningProcessConfig = {
  kicker: 'ODDIY VA TUŞUNARLI',
  title: 'Örganiş jarayoni qanday keçadi?',
  subtitle: '7 ta oson qadam orqali maqsadingiz sari işonç bilan yöl oling.',
  studentImage: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=700&q=80',
  floatingFlags: ['🇬🇧', '🇫🇷', '🇩🇪', '🇰🇷'],
  bottomQuote: 'Katta imkoniyatlar sizni kutmoqda!',
  steps: DEFAULT_LEARNING_PROCESS_STEPS
};

