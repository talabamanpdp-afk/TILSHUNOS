export interface LearningProcessStep {
  step: string; // '01', '02', ...
  title: string;
  desc: string;
  badge?: string;
  imageDesktop?: string;
  imageMobile?: string;
}

export interface LearningProcessConfig {
  kicker?: string;
  title?: string;
  subtitle?: string;
  studentImage?: string;
  bottomQuote?: string;
  steps: LearningProcessStep[];
}

export const DEFAULT_LEARNING_PROCESS_STEPS: LearningProcessStep[] = [
  {
    step: '01',
    title: 'Tillarni o‘rganishni boshlang',
    desc: 'Dastlab o‘zingizga mos tilni tanlang va darajangizni aniqlang. Bu sizning shaxsiy o‘quv yo‘lingizni belgilaydi.',
    badge: 'BOSHLANG‘ICH QADAM'
  },
  {
    step: '02',
    title: 'Shaxsiy reja tuziling',
    desc: 'Sizning maqsadingiz, avvalgi bilim darajangiz asosida individual o‘quv reja yaratiladi. Bu reja sizning muvaffaqiyatingiz kafolati.',
    badge: 'INDIVIDUAL YONDASHUV'
  },
  {
    step: '03',
    title: 'Darslarni o‘rganing',
    desc: 'Interaktiv darslar, audio, video va amaliy mashqlar orqali yangi bilimlarni egallaysiz. Har bir bo‘lim bosqichma-bosqich tuzilgan.',
    badge: 'INTERAKTIV TA’LIM'
  },
  {
    step: '04',
    title: 'Amaliyot va so‘z o‘yinlari',
    desc: 'O‘rganilgan bilimlaringizni amaliyotda qo‘llang. So‘z boyligini oshirish uchun interaktiv o‘yinlar, testlar va nutq mashqlari sizni kutmoqda.',
    badge: 'AMALIY MUSTAHKAMLASH'
  },
  {
    step: '05',
    title: 'Natijalar va o‘sish',
    desc: 'Muntazam testlar, progress kuzatuvi va statistikalar orqali o‘z rivojlanishingizni ko‘rasiz. Bu sizga yanada katta motivatsiya beradi.',
    badge: 'PROGRESS VA MONITORING'
  },
  {
    step: '06',
    title: 'Bilimni mustahkamlang',
    desc: 'O‘rganilgan mavzularni takrorlash, o‘qish mashqlari va real hayotdagi vaziyatlarda qo‘llash orqali bilimlaringiz mustahkamlanadi.',
    badge: 'MAHORAT VA AMALIYOT'
  },
  {
    step: '07',
    title: 'Natija – yangi imkoniyatlar',
    desc: 'Siz o‘zingizni yangi darajada his qilasiz: erkin muloqot, chet elda o‘qish yoki ishlash, yangi do‘stlar va keng imkoniyatlar sizni kutmoqda.',
    badge: 'YUKSAK MAQSADLAR'
  }
];

export const DEFAULT_LEARNING_PROCESS_CONFIG: LearningProcessConfig = {
  kicker: 'ODDIY VA TUSHUNARLI',
  title: 'O‘rganish jarayoni qanday kechadi?',
  subtitle: '7 ta oson qadam orqali maqsadingiz sari ishonch bilan yo‘l oling.',
  studentImage: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=700&q=80',
  bottomQuote: 'Katta imkoniyatlar sizni kutmoqda!',
  steps: DEFAULT_LEARNING_PROCESS_STEPS
};

