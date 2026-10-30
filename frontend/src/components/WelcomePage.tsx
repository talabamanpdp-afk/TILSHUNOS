import React, { useState, useEffect } from 'react';
import {
  Languages, ArrowRight, ChevronRight, Check, Sparkles, BookOpen, Headphones,
  PenLine, MessageCircle, Mic2, Gamepad2, Users, Trophy, ShieldCheck,
  ChevronDown, ChevronUp, Sun, Moon, Menu, X, Play, Volume2, VolumeX, Volume1,
  Award, Clock, Flame, HelpCircle, Send, ExternalLink, Heart, Layers, Target, Compass,
  Search, Star, Smartphone, Mic, RotateCcw
} from 'lucide-react';
import {
  playSpeech, stopSpeech, startListening,
  SupportedLang, LANG_LABELS, isSpeechRecognitionSupported
} from '../utils/speech';
import { PracticeGuideSection } from './PracticeGuideSection';
import { PracticeGuideConfig } from '../data/practiceGuideData';
import { CEFRRoadmapSection } from './cefr-roadmap/CEFRRoadmapSection';
import { SkillsSection } from './skills/SkillsSection';
import { LearningProcessSection } from './learning-process/LearningProcessSection';
import { FeaturesSection } from './features/FeaturesSection';
import { AboutSection } from './about/AboutSection';
import { FaqSection } from './faq/FaqSection';
import { FinalCtaSection } from './cta/FinalCtaSection';
import { FooterSection } from './footer/FooterSection';

export interface CmsConfig {
  hero?: string;
  heroBadge?: string;
  heroImage?: string;
  heroMobileImage?: string;
  description?: string;
  cta?: string;
  secondaryCta?: string;
  header?: string;
  heroFlags?: string[];
  heroFlagsCount?: string;
  heroFlagsLabel?: string;
  metrics?: {
    useLiveStats?: boolean;
    metric1Value?: string;
    metric1Label?: string;
    metric2Value?: string;
    metric2Label?: string;
    metric3Value?: string;
    metric3Label?: string;
  };
  authBanner?: {
    kicker?: string;
    loginTitle?: string;
    registerTitle?: string;
    verifyTitle?: string;
    subtitle?: string;
    statNumber?: string;
    statLabel?: string;
    bgImage?: string;
  };
  floatingBadge1?: {
    flag?: string;
    title?: string;
    subtitle?: string;
  };
  floatingBadge2?: {
    title?: string;
    subtitle?: string;
  };
  previewSection?: {
    kicker?: string;
    title?: string;
    subtitle?: string;
    vocabItems?: Array<{
      word: string;
      tr: string;
      lvl: string;
      ex: string;
      topic: string;
    }>;
    sampleLesson?: {
      level?: string;
      time?: string;
      title?: string;
      article?: string;
      question?: string;
      choiceA?: string;
      choiceB?: string;
    };
  };
  practiceGuide?: PracticeGuideConfig;
  cefrSection?: {
    kicker?: string;
    title?: string;
    subtitle?: string;
    levels?: Array<{
      code: string;
      name: string;
      desc: string;
      color: string;
    }>;
  };
  skillsSection?: {
    kicker?: string;
    title?: string;
    subtitle?: string;
    skills?: Array<{
      key: string;
      title: string;
      desc: string;
      color?: string;
    }>;
  };
  stepsSection?: {
    kicker?: string;
    title?: string;
    subtitle?: string;
    steps?: Array<{
      step: string;
      title: string;
      desc: string;
    }>;
  };
  featuresSection?: {
    kicker?: string;
    title?: string;
    subtitle?: string;
    features?: Array<{
      key: string;
      color?: string;
      title: string;
      desc: string;
    }>;
  };
  about?: string;
  aboutDetailed?: string;
  aboutButton?: string;
  team?: Array<{ name: string; role: string; bio: string; avatar?: string }>;
  founderName?: string;
  founderBio?: string;
  contacts?: {
    telegram?: string;
    instagram?: string;
    email?: string;
    phone?: string;
    youtube?: string;
    facebook?: string;
  };
  footer?: string;
  contact?: string;
  faqs?: Array<{ q: string; a: string }>;
  finalCta?: {
    kicker?: string;
    title?: string;
    desc?: string;
    btnRegister?: string;
    btnLogin?: string;
  };
  liveStats?: {
    usersCount?: number;
    wordsCount?: number;
    practicesCount?: number;
    materialsCount?: number;
    teachersCount?: number;
  };
}

interface WelcomePageProps {
  cms: CmsConfig | null;
  onBegin: (intent: 'login' | 'register' | 'trial') => void;
  onOpenAbout: () => void;
  dark: boolean;
  setDark: (val: boolean) => void;
  onSelectLevel?: (lvl: string) => void;
}

export function WelcomePage({ cms, onBegin, onOpenAbout, dark, setDark, onSelectLevel }: WelcomePageProps) {
  const ensureSecureUrl = (u?: string) => u ? u.replace(/^http:\/\/tilshunos\.onrender\.com/i, 'https://tilshunos.onrender.com') : u;
  const desktopTutorImg = ensureSecureUrl(cms?.heroImage) || 'https://yipexommqztxnvpckqyi.supabase.co/storage/v1/object/public/tilshunos-media/Global%20Language%20Learning%20Workspace_ba49fd.jpg';
  const mobileTutorImg = ensureSecureUrl(cms?.heroMobileImage || cms?.heroImage) || 'https://yipexommqztxnvpckqyi.supabase.co/storage/v1/object/public/tilshunos-media/Global%20Language%20Study%20Desk_195231.jpg';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [previewTab, setPreviewTab] = useState<'vocab' | 'lesson' | 'progress'>('vocab');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Smart auto-hiding navbar on scroll down, reappearing on scroll up
  const [navVisible, setNavVisible] = useState(true);
  const [navScrolled, setNavScrolled] = useState(false);

  useEffect(() => {
    let lastScrollY = typeof window !== 'undefined' ? window.scrollY : 0;
    let ticking = false;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (currentScrollY <= 70) {
            // Near the top: always visible and unscrolled
            setNavVisible(true);
            setNavScrolled(false);
          } else {
            setNavScrolled(true);
            const delta = currentScrollY - lastScrollY;
            if (delta < -4) {
              // Scrolling UP -> reveal navbar immediately
              setNavVisible(true);
            } else if (delta > 4 && !mobileMenuOpen) {
              // Scrolling DOWN -> hide navbar to increase screen area
              setNavVisible(false);
            }
          }
          lastScrollY = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [mobileMenuOpen]);

  // Scroll reveal observer: smoothly animates every element as user scrolls down the page
  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;

    // Small delay to ensure DOM nodes are ready
    const timer = setTimeout(() => {
      const elements = document.querySelectorAll(
        '.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-scale, .scroll-stagger-parent'
      );

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('revealed');
              observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.08,
          rootMargin: '0px 0px -30px 0px'
        }
      );

      elements.forEach((el) => observer.observe(el));
    }, 40);

    return () => clearTimeout(timer);
  }, [previewTab]);

  // Multilingual Speech & Interactive Demo State
  const [selectedDemoLang, setSelectedDemoLang] = useState<SupportedLang>('en');
  const [flipMode, setFlipMode] = useState(false);
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const [activeSpeechText, setActiveSpeechText] = useState<string | null>(null);
  const [listeningWord, setListeningWord] = useState<string | null>(null);
  const [interimSpeech, setInterimSpeech] = useState<string>('');
  const [pronunciationResults, setPronunciationResults] = useState<Record<string, { score: number; passed: boolean; feedback: string } | null>>({});
  const [readingAudioPlaying, setReadingAudioPlaying] = useState(false);

  const handlePlayAudio = (text: string, rate: number = 0.9) => {
    if (activeSpeechText === text) {
      stopSpeech();
      setActiveSpeechText(null);
      return;
    }
    setActiveSpeechText(text);
    playSpeech(text, {
      lang: selectedDemoLang,
      rate,
      onEnd: () => setActiveSpeechText(null),
      onError: () => setActiveSpeechText(null)
    });
  };

  const handleMicTest = (word: string) => {
    if (listeningWord === word) {
      stopSpeech();
      setListeningWord(null);
      setInterimSpeech('');
      return;
    }

    if (!isSpeechRecognitionSupported()) {
      alert('Sizning brauzeringizda mikrofondan ovoz tanish moduli qo‘llab-quvvatlanmaydi. Iltimos Google Chrome yoki Microsoft Edge brauzeridan foydalaning.');
      return;
    }

    setListeningWord(word);
    setInterimSpeech('Eshityapman... So‘zni ayting');
    startListening({
      lang: selectedDemoLang,
      targetWord: word,
      onInterim: (text) => setInterimSpeech(text),
      onResult: (res) => {
        setListeningWord(null);
        setInterimSpeech('');
        setPronunciationResults(prev => ({ ...prev, [word]: res }));
      },
      onError: (errMsg) => {
        setListeningWord(null);
        setInterimSpeech('');
        alert(errMsg);
      }
    });
  };

  const toggleCardFlip = (word: string) => {
    if (!flipMode) return;
    setFlippedCards(prev => ({ ...prev, [word]: !prev[word] }));
  };

  const toggleReadingAudio = () => {
    if (readingAudioPlaying) {
      stopSpeech();
      setReadingAudioPlaying(false);
    } else {
      setReadingAudioPlaying(true);
      const fullText = `${sampleLesson.title}. ${sampleLesson.article}`;
      playSpeech(fullText, {
        lang: selectedDemoLang === 'ru' ? 'ru' : selectedDemoLang === 'de' ? 'de' : selectedDemoLang === 'tr' ? 'tr' : 'en',
        rate: 0.88,
        onEnd: () => setReadingAudioPlaying(false),
        onError: () => setReadingAudioPlaying(false)
      });
    }
  };

  // Safe defaults & Hero texts
  const heroTitle = cms?.hero || 'Yangi tilni erkin gapiring';
  const heroBadge = cms?.heroBadge || '99 PERCENT';
  const heroDesc = cms?.description || 'TILSHUNOS bilan har kuni tizimli o‘rganing, CEFR standartlarida bilimingizni mustahkamlang va erkin muloqotga chiqing.';
  const primaryCta = cms?.cta || 'Hoziroq Boshlash';
  const secondaryCta = cms?.secondaryCta || 'Platformani o‘rganish';
  const heroBgDesktop = cms?.heroBgDesktop || cms?.headerBgDesktop || 'https://yipexommqztxnvpckqyi.supabase.co/storage/v1/object/public/tilshunos-media/img_1793254439976_c6auer.webp';
  const heroBgMobile = cms?.heroBgMobile || cms?.headerBgMobile || 'https://yipexommqztxnvpckqyi.supabase.co/storage/v1/object/public/tilshunos-media/img_1793254446169_xxtbf7.webp';
  const heroFlags = (cms?.heroFlags && cms.heroFlags.length > 0)
    ? cms.heroFlags
    : ['🇬🇧', '🇷🇺', '🇩🇪', '🇺🇿'];
  const heroFlagsCount = cms?.heroFlagsCount || '5+';
  const heroFlagsLabel = cms?.heroFlagsLabel || 'Tillarda';

  // Dynamic top menu anchor links from cms.header
  const rawNavHeader = cms?.header?.trim() || 'Imkoniyatlar, Biz haqimizda, Kirish';
  const navItems = rawNavHeader
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
    .map((text, idx) => {
      const lower = text.toLowerCase();
      let href = '#features';
      let icon = <Sparkles size={15} />;
      let action: (() => void) | null = null;

      if (lower.includes('imkoniyat') || lower.includes('xususiyat') || lower.includes('feature')) {
        href = '#features';
        icon = <Sparkles size={15} />;
      } else if (lower.includes('haqimizda') || lower.includes('biz') || lower.includes('about')) {
        href = '#about';
        icon = <BookOpen size={15} />;
        action = () => onOpenAbout();
      } else if (lower.includes('kirish') || lower.includes('login') || lower.includes('sign in')) {
        href = '#login';
        icon = <ArrowRight size={15} />;
        action = () => onBegin('login');
      } else if (lower.includes('boshlash') || lower.includes('start') || lower.includes('ro‘yxat')) {
        href = '#register';
        icon = <Sparkles size={15} />;
        action = () => onBegin('register');
      } else if (lower.includes('o‘qituvchi') || lower.includes('oqituvchi') || lower.includes('teacher') || lower.includes('topish') || lower.includes('bo‘lish')) {
        href = '#features';
        icon = <Search size={15} />;
      } else if (lower.includes('hamjamiyat') || lower.includes('community') || lower.includes('ko‘nikma')) {
        href = '#skills';
        icon = <Users size={15} />;
      } else if (lower.includes('namoyish') || lower.includes('preview') || lower.includes('interfeys') || lower.includes('o‘rganish')) {
        href = '#preview';
        icon = <Play size={15} />;
      } else if (lower.includes('sinab') || lower.includes('sinov') || lower.includes('trial') || lower.includes('test')) {
        href = '#trial';
        icon = <Sparkles size={15} />;
        action = () => onBegin('trial');
      } else if (lower.includes('cefr') || lower.includes('daraja')) {
        href = '#cefr';
        icon = <Target size={15} />;
      } else if (lower.includes('savol') || lower.includes('faq')) {
        href = '#faq';
        icon = <HelpCircle size={15} />;
      } else {
        if (idx === 0) { href = '#features'; icon = <Sparkles size={15} />; }
        else if (idx === 1) { href = '#about'; icon = <BookOpen size={15} />; action = () => onOpenAbout(); }
        else { href = '#preview'; icon = <Play size={15} />; }
      }

      return { text, href, icon, action };
    });

  // Dynamic Real or Admin-Configured Statistics
  const liveStats = cms?.liveStats;
  const useLive = cms?.metrics?.useLiveStats ?? true;

  const metric1Val = useLive
    ? `${(liveStats?.materialsCount ?? 0) > 0 ? liveStats?.materialsCount : 3}+`
    : (cms?.metrics?.metric1Value && cms.metrics.metric1Value !== '6 M' ? cms.metrics.metric1Value : `${liveStats?.materialsCount ?? 3}+`);
  const metric1Lbl = cms?.metrics?.metric1Label && cms.metrics.metric1Label !== 'App Downloads'
    ? cms.metrics.metric1Label
    : 'O‘quv Materiallari';

  const metric2Val = useLive
    ? `${liveStats?.wordsCount ?? 0}+`
    : (cms?.metrics?.metric2Value && cms.metrics.metric2Value !== '8.24 M' ? cms.metrics.metric2Value : `${liveStats?.wordsCount ?? 0}+`);
  const metric2Lbl = cms?.metrics?.metric2Label && cms.metrics.metric2Label !== 'Learned monthly'
    ? cms.metrics.metric2Label
    : 'Lug‘at So‘zlari';

  const metric3Val = useLive
    ? `${liveStats?.usersCount ?? 0}+`
    : (cms?.metrics?.metric3Value && cms.metrics.metric3Value !== '4.8 ★' && cms.metrics.metric3Value !== '4.8' && cms.metrics.metric3Value !== '120+'
        ? cms.metrics.metric3Value
        : `${liveStats?.usersCount ?? 0}+`);
  const metric3Lbl = cms?.metrics?.metric3Label && cms.metrics.metric3Label !== '177k Rating' && cms.metrics.metric3Label !== 'Mashq Bajarildi'
    ? cms.metrics.metric3Label
    : 'Jami Foydalanuvchilar';

  const flBadge1 = cms?.floatingBadge1 || { flag: '🇬🇧', title: 'Basic English', subtitle: '103 Lesson' };
  const flBadge2 = cms?.floatingBadge2 || { title: '9 / 12 Quiz', subtitle: 'Speaking ✓' };

  // Preview Section Data
  const previewKicker = cms?.previewSection?.kicker || 'AMALIY TAJRIBA';
  const previewTitle = cms?.previewSection?.title || 'Platformaning haqiqiy imkoniyatlarini sinab ko‘ring';
  const previewSubtitle = cms?.previewSection?.subtitle || 'Ro‘yxatdan o‘tishdan avval asosiy 3 ta modulimiz qanday ishlashini amalda ko‘ring.';

  const multilingualVocab: Record<SupportedLang, Array<{ word: string; tr: string; lvl: string; ex: string; topic: string }>> = {
    en: (cms?.previewSection?.vocabItems && cms.previewSection.vocabItems.length > 0)
      ? cms.previewSection.vocabItems
      : [
          { word: 'Achieve', tr: 'Erishmoq, zabt etmoq', lvl: 'B1', ex: 'You can achieve any language goal with daily practice.', topic: 'Motivatsiya' },
          { word: 'Curious', tr: 'Qiziquvchan, yangilikka intiluvchan', lvl: 'A2', ex: 'Children are naturally curious about the world.', topic: 'Xarakter' },
          { word: 'Resilience', tr: 'Sabr-bardosh, chidamlilik', lvl: 'B2', ex: 'She showed great resilience in learning pronunciation.', topic: 'Psixologiya' }
        ],
    de: [
      { word: 'Entdecken', tr: 'Kashf qilmoq, o‘rganmoq', lvl: 'A2', ex: 'Wir entdecken jeden Tag neue deutsche Wörter.', topic: 'Bilim' },
      { word: 'Zuverlässig', tr: 'Ishonchli, qat’iyatli', lvl: 'B1', ex: 'Ein zuverlässiger Wortschatz ist der Schlüssel zum Erfolg.', topic: 'Ko‘nikma' },
      { word: 'Begeisterung', tr: 'Ishtiyoq, katta qiziqish', lvl: 'B2', ex: 'Mit Begeisterung lernt man Sprachen viel schneller.', topic: 'Ruhlanish' }
    ],
    tr: [
      { word: 'Başarmak', tr: 'Muvaffaqiyat qozonmoq, uddalamoq', lvl: 'A2', ex: 'Her gün pratik yaparak Türkçe konuşmayı başaracaksınız.', topic: 'Muvaffaqiyat' },
      { word: 'Meraklı', tr: 'Qiziquvchan, o‘rganishga intiluvchan', lvl: 'A2', ex: 'Yeni bir dil öğrenirken meraklı olmak çok önemlidir.', topic: 'Xarakter' },
      { word: 'Kararlılık', tr: 'Qat’iyat, sobitqadamlik', lvl: 'B2', ex: 'Büyük hedeflere kararlılık ve düzenli çalışma ile ulaşılır.', topic: 'Iroda' }
    ],
    ru: [
      { word: 'Вдохновение', tr: 'Ilhom, jo‘shqinlik', lvl: 'B1', ex: 'Вдохновение приходит во время ежедневных практических занятий.', topic: 'Ijod' },
      { word: 'Достижение', tr: 'Yutuq, muhim marra', lvl: 'B1', ex: 'Каждое новое выученное слово — это ваше личное достижение.', topic: 'Rivojlanish' },
      { word: 'Любознательный', tr: 'Bilimga chanqoq, qiziquvchan', lvl: 'A2', ex: 'Любознательные студенты осваивают язык значительно быстрее.', topic: 'Xususiyat' }
    ],
    uz: [
      { word: 'Barkamol', tr: 'Har tomonlama yetuk, mukammal', lvl: 'B2', ex: 'Barkamol avlod o‘z ona tilidan tashqari jahon tillarini puxta egallaydi.', topic: 'Ma’naviyat' },
      { word: 'Izlanish', tr: 'Doimiy intilish, yangi bilim izlash', lvl: 'A2', ex: 'Muntazam izlanish va mashqlar tilni ravon gapirishga olib keladi.', topic: 'Ta’lim' },
      { word: 'Zukko', tr: 'Topqir, zehnli, tez anglovchi', lvl: 'B1', ex: 'Zukko o‘quvchilar yangi qoidalarni jonli misollarda oson eslab qoladilar.', topic: 'Zehn' }
    ]
  };

  const vocabItems = multilingualVocab[selectedDemoLang] || multilingualVocab.en;

  const defaultSampleLesson = {
    level: 'CEFR B1 · READING',
    time: '5 daqiqa',
    title: 'The Power of Tiny Daily Habits',
    article: 'Consistency is far more powerful than intensity. When learning a new language, practicing for just 15 minutes every single day wires the brain more effectively than studying for 4 hours once a week. The secret lies in frequent retrieval: each time you actively recall a word, the neural pathway strengthens.',
    question: 'Matnga ko‘ra, til o‘rganishda eng muhim omil nima?',
    choiceA: 'Har kuni muntazam 15 daqiqa shug‘ullanish (To‘g‘ri ✓)',
    choiceB: 'Faqat haftada bir marta 4 soat o‘rganish'
  };
  const sampleLesson = {
    ...defaultSampleLesson,
    ...(cms?.previewSection?.sampleLesson || {})
  };

  // CEFR Section Data
  const cefrKicker = cms?.cefrSection?.kicker || 'XALQARO METODIKA';
  const cefrTitle = cms?.cefrSection?.title || 'CEFR bo‘yicha aniq yo‘l xaritasi (A1–C2)';
  const cefrSubtitle = cms?.cefrSection?.subtitle || 'O‘zingizga mos boshlang‘ich nuqtani tanlang va bosqichma-bosqich yuksaling.';
  const defaultCefrLevels = [
    { code: 'A1', name: 'Boshlang‘ich', desc: 'Oddiy so‘zlar, tanishuv va kundalik eng muhim iboralar.', color: '#3b82f6' },
    { code: 'A2', name: 'Elementar', desc: 'Xarid, transport va oddiy kundalik vaziyatlarda muloqot.', color: '#0ea5e9' },
    { code: 'B1', name: 'O‘rta daraja', desc: 'Sayohat, fikr bildirish va o‘z tajribasini erkin tushuntirish.', color: '#10b981' },
    { code: 'B2', name: 'Mustaqil', desc: 'Murakkab matnlar, insholar va mavzular bo‘yicha erkin bahslashish.', color: '#8b5cf6' },
    { code: 'C1', name: 'Ilg‘or', desc: 'Akademik va kasbiy darajada chuqur fikrlash hamda tahlil.', color: '#f59e0b' },
    { code: 'C2', name: 'Mukammal', desc: 'Ona tili darajasidagi ravonlik va nozik ma’nolarni anglash.', color: '#ec4899' }
  ];
  const cefrLevelsList = (cms?.cefrSection?.levels && cms.cefrSection.levels.length > 0)
    ? cms.cefrSection.levels
    : defaultCefrLevels;

  // 5 Skills Data
  const skillsKicker = cms?.skillsSection?.kicker || 'MUVOZANATLI RIVOJLANISH';
  const skillsTitle = cms?.skillsSection?.title || '5 ta asosiy til ko‘nikmasini mustahkamlang';
  const skillsSubtitle = cms?.skillsSection?.subtitle || 'Faqat qoidalar yodlash emas — har tomonlama tabiiy o‘rganish uslubi.';
  const defaultSkills = [
    { key: 'reading', title: 'O‘qish (Reading)', desc: 'Darajangizga moslangan qiziqarli hikoyalar, badiiy parchalar va zamonaviy maqolalar.', color: '#356cf6' },
    { key: 'writing', title: 'Yozish (Writing)', desc: 'Insho va xatlar yozish, grammatik xatolarni sun’iy intellekt orqali darhol tekshirish.', color: '#8b5cf6' },
    { key: 'listening', title: 'Tinglash (Listening)', desc: 'Tabiiy tezlikdagi audio podkastlar, kundalik muloqot dialoglari va transkriptlar.', color: '#0ea5e9' },
    { key: 'speaking', title: 'Gapirish (Speaking)', desc: 'To‘g‘ri talaffuz va intonatsiya mashqlari bilan muloqotdagi to‘siqlarni yengish.', color: '#10b981' },
    { key: 'vocab', title: 'Lug‘at (Vocabulary)', desc: 'Shaxsiy so‘z daftari, kontekstual misollar va intervalli takrorlash metodikasi.', color: '#f59e0b' }
  ];
  const skillsList = (cms?.skillsSection?.skills && cms.skillsSection.skills.length > 0)
    ? cms.skillsSection.skills
    : defaultSkills;

  // 5 Steps Data
  const stepsKicker = cms?.stepsSection?.kicker || 'ODDIY VA TUSHUNARLI';
  const stepsTitle = cms?.stepsSection?.title || 'O‘rganish jarayoni qanday kechadi?';
  const stepsSubtitle = cms?.stepsSection?.subtitle || '5 ta oson qadam orqali maqsadingiz sari ishonch bilan yo‘l oling.';
  const defaultSteps = [
    { step: '01', title: 'Til va maqsadni tanlaysiz', desc: 'Ingliz, rus, nemis yoki boshqa tillar hamda kunlik shug‘ullanish vaqti.' },
    { step: '02', title: 'Boshlang‘ich daraja aniqlanadi', desc: 'CEFR A1 dan C2 gacha bo‘lgan aniq darajangiz belgilanadi.' },
    { step: '03', title: 'Shaxsiy reja tuziladi', desc: 'Dashboardda har kungi yangi so‘zlar va mashqlar tartibli aks etadi.' },
    { step: '04', title: 'Amaliyot va so‘z o‘yinlari', desc: 'Typing, so‘z zanjiri va 1v1 bellashuvlar orqali bilim mustahkamlanadi.' },
    { step: '05', title: 'Natijalar va o‘sish', desc: 'O‘zlashtirilgan so‘zlar va yuqori CEFR darajalariga o‘tish.' }
  ];
  const stepsList = (cms?.stepsSection?.steps && cms.stepsSection.steps.length > 0)
    ? cms.stepsSection.steps
    : defaultSteps;

  // Features Data
  const featuresKicker = cms?.featuresSection?.kicker || 'ILG‘OR IMKONIYATLAR';
  const featuresTitle = cms?.featuresSection?.title || 'Zamonaviy texnologiyalar xizmatingizda';
  const featuresSubtitle = cms?.featuresSection?.subtitle || 'Biz til o‘rganishni nafaqat samarali, balki maroqli jarayonga aylantiramiz.';
  const defaultFeatures = [
    { key: 'ai', color: 'purple', title: '24/7 AI Til Repetitori', desc: 'Istalgan savolingizni bering, grammatik xatolaringizni aniqlang va muloyim tushuntirishlar oling.' },
    { key: 'pvp', color: 'orange', title: '1v1 So‘z Bellashuvi', desc: 'Boshqa o‘quvchilar bilan real vaqtda so‘z boyligingizni sinang, XP to‘plang va yetakchilar safiga kiring.' },
    { key: 'anticheat', color: 'green', title: 'Anti-Cheat & Spaced Repetition', desc: 'So‘zlar tasodifiy takrorlanmaydi — ilmiy tasdiqlangan intervallar bilan uzoq muddatli xotiraga ko‘chadi.' },
    { key: 'teachers', color: 'blue', title: 'Malakali Ustozlar Nazorati', desc: 'Maxsus o‘qituvchilar tizimda sizning yozma insho va vazifalaringizni tekshirib, shaxsiy baho beradi.' }
  ];
  const featuresList = (cms?.featuresSection?.features && cms.featuresSection.features.length > 0)
    ? cms.featuresSection.features
    : defaultFeatures;

  // About, Founder, Contacts
  const aboutShort = cms?.about || 'TILSHUNOS til o‘rganishni tartibli, qiziqarli va shaxsiy maqsadlaringizga mos qilish uchun yaratilayotgan ilg‘or platforma.';
  const aboutDetailed = cms?.aboutDetailed || 'TILSHUNOS — xalqaro CEFR (A1–C2) standartlariga moslashtirilgan, sun’iy intellekt va professional ustozlar metodikasini o‘zida mujassam etgan zamonaviy ta’lim platformasi. Bizning asosiy maqsadimiz — har bir foydalanuvchiga murakkab grammatik qoidalarsiz, interaktiv so‘z o‘yinlari, amaliy audio-dialoglar, yozma tahlil va real muloqot orqali tilni tabiiy o‘zlashtirish imkoniyatini taqdim etishdir.';
  const aboutBtn = cms?.aboutButton || 'Batafsil ma’lumot';

  const teamMembers = Array.isArray(cms?.team) ? cms.team : [
    { name: 'Soxibjon Gaybullayev', role: 'Asoschi & Bosh Muhandis', bio: 'Til o‘rganish texnologiyalari va raqamli ta’lim bo‘yicha mutaxassis.', avatar: 'S' },
    { name: 'Dilnoza Karimova', role: 'Bosh O‘qituvchi & Metodist', bio: 'IELTS va CEFR standartlari bo‘yicha 8 yillik tajribaga ega ustoz.', avatar: 'D' },
    { name: 'Jasur Aliyev', role: 'Ta’lim Koordinatori', bio: 'Talabalar bilan ishlash va interaktiv mashqlar mutaxassisi.', avatar: 'J' }
  ];

  const founderName = cms?.founderName || 'Soxibjon Gaybullayev';
  const founderBio = cms?.founderBio || 'TILSHUNOS platformasi asoschisi. O‘zbekiston yoshlariga jahon tillarini eng samarali va qulay usulda o‘rganish uchun innovatsion ekotizim yaratish ustida ishlaydi.';

  const contacts = cms?.contacts || {
    telegram: '@tilshunos',
    instagram: 'tilshunos_app',
    email: 'soxibgaybullayev439@gmail.com',
    phone: '+998 90 123 45 67'
  };

  const footerText = cms?.footer || '© 2026 TILSHUNOS · Barcha huquqlar himoyalangan';

  const defaultFaqs = [
    { q: 'TILSHUNOS platformasidan foydalanish bepulmi?', a: 'Ha, asosiy funksiyalar — so‘z yodlash, mashqlar, CEFR reading va listening materiallari barcha uchun bepul.' },
    { q: 'CEFR darajalarini qanday aniqlayman?', a: 'Ro‘yxatdan o‘tish chog‘ida darajangizni (A1–C2) o‘zingiz belgilashingiz yoki diagnostik test orqali aniqlab olishingiz mumkin.' },
    { q: 'Mobil qurilmalarda ishlaydimi?', a: 'Ha, TILSHUNOS responsive veb-ilova va PWA (Progressive Web App) sifatida smartfon va planshetlarda qulay ishlaydi.' },
    { q: 'O‘qituvchi bilan qanday bog‘lanaman?', a: 'Platformadagi O‘qituvchilar bo‘limi orqali tasdiqlangan ustozlar bilan bog‘lanib, shaxsiy topshiriqlar olishingiz mumkin.' }
  ];
  const faqs = Array.isArray(cms?.faqs) ? cms.faqs : defaultFaqs;

  // Final CTA Data
  const finalCtaKicker = cms?.finalCta?.kicker || 'BIZ BILAN O‘RGANING';
  const finalCtaTitle = cms?.finalCta?.title || 'Yangi tilni erkin gapirish vaqti keldi';
  const finalCtaDesc = cms?.finalCta?.desc || 'Til o‘rganish — yangi imkoniyatlar eshiklarini ochadi. Biz siz bilan birga bu yo‘lda!';
  const finalCtaBtnRegister = cms?.finalCta?.btnRegister || 'Bepul hisob yaratish';
  const finalCtaBtnLogin = cms?.finalCta?.btnLogin || 'Tizimga kirish';

  return (
    <div className={`welcome-root ${dark ? 'dark' : ''}`}>
      {/* 1. TOP SPLIT HEADER & HERO WRAPPER */}
      <section className={`holo-hero-wrapper ${(heroBgDesktop || heroBgMobile) ? 'has-custom-bg' : ''}`}>
        {/* Dynamic Header & Hero Background Images (Desktop & Mobile) */}
        {(heroBgDesktop || heroBgMobile) && (
          <div className="holo-custom-bg-layer">
            {heroBgDesktop && (
              <div
                className={`holo-custom-bg holo-custom-bg-desktop ${heroBgMobile ? 'desktop-only-bg' : ''}`}
                style={{ backgroundImage: `url(${heroBgDesktop})` }}
              />
            )}
            {heroBgMobile && (
              <div
                className="holo-custom-bg holo-custom-bg-mobile mobile-only-bg"
                style={{ backgroundImage: `url(${heroBgMobile})` }}
              />
            )}
            <div className="holo-custom-bg-overlay" />
          </div>
        )}

        {/* Split Background Layers */}
        <div className="holo-bg-split">
          <div className="holo-bg-left" />
          <div className="holo-bg-right">
            <div className="holo-radial-mesh" />
          </div>
        </div>

        {/* Global Split Nav Header */}
        <header
          className={`holo-nav ${navScrolled ? 'holo-nav-scrolled' : ''} ${
            navVisible || mobileMenuOpen ? 'holo-nav-visible' : 'holo-nav-hidden'
          }`}
        >
          <div className="holo-nav-container">
            {/* Left Brand & Nav links (on blue side) */}
            <div className="holo-nav-left">
              <a href="#" className="holo-brand">
                <span className="holo-brand-icon">
                  <img src={cms?.brandLogo || "/brand_logo.png"} alt="TILSHUNOS" className="brand-logo-img" onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/brand_logo.png'; }} />
                </span>
                <span className="holo-brand-name">TILSHUNOS</span>
              </a>

              <nav className="holo-nav-links">
                {navItems.map((item, idx) => (
                  <a
                    key={idx}
                    href={item.href}
                    className="holo-nav-link"
                    onClick={(e) => {
                      if (item.action) {
                        e.preventDefault();
                        item.action();
                      } else if (item.href.startsWith('#')) {
                        const targetId = item.href.slice(1);
                        const el = document.getElementById(targetId);
                        if (el) {
                          e.preventDefault();
                          el.scrollIntoView({ behavior: 'smooth' });
                        }
                      }
                    }}
                  >
                    {item.icon}
                    <span>{item.text}</span>
                  </a>
                ))}
              </nav>
            </div>

            {/* Right Nav Auth & Controls (on dark side) */}
            <div className="holo-nav-right">
              <button
                id="welcome-theme-toggle"
                className="holo-theme-toggle"
                onClick={() => setDark(!dark)}
                title={dark ? 'Yorug‘ mavzuga o‘tish' : 'Tungi mavzuga o‘tish'}
                aria-label="Mavzuni almashtirish"
              >
                {dark ? <Sun size={17} /> : <Moon size={17} />}
              </button>

              <button className="holo-sign-in" onClick={() => onBegin('login')}>
                Kirish
              </button>

              <button className="holo-get-started" onClick={() => onBegin('register')}>
                Boshlash
              </button>

              <button
                className={`holo-mobile-hamburger ${mobileMenuOpen ? 'is-active' : ''}`}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Menyu"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Mobile Select-Style Dropdown Menu */}
          {mobileMenuOpen && (
            <>
              <div className="holo-mobile-scrim" onClick={() => setMobileMenuOpen(false)} />
              <div className="holo-mobile-select-menu">
                <div className="mobile-select-header">
                  <span className="mobile-select-eyebrow">
                    <Compass size={12} /> Bo‘limni tanlang
                  </span>
                  <span className="mobile-select-pill">TILSHUNOS</span>
                </div>

                <div className="mobile-select-list">
                  {[
                    {
                      text: 'Imkoniyatlar',
                      desc: 'Platformaning asosiy afzalliklari',
                      href: '#features',
                      icon: <Sparkles size={15} />,
                      color: '#7869f5',
                      bg: 'rgba(120, 105, 245, 0.12)'
                    },
                    {
                      text: 'Biz haqimizda',
                      desc: 'Loyiha maqsadi va asoschi',
                      href: '#about',
                      icon: <BookOpen size={15} />,
                      color: '#2563eb',
                      bg: 'rgba(37, 99, 235, 0.12)',
                      action: () => onOpenAbout()
                    },
                    {
                      text: 'Interaktiv tajriba',
                      desc: 'Haqiqiy so‘z va dars namunasi',
                      href: '#preview',
                      icon: <Play size={15} />,
                      color: '#10b981',
                      bg: 'rgba(16, 185, 129, 0.12)'
                    },
                    {
                      text: 'CEFR Xaritasi',
                      desc: 'A1 dan C2 gacha bosqichlar',
                      href: '#cefr',
                      icon: <Target size={15} />,
                      color: '#8b5cf6',
                      bg: 'rgba(139, 92, 246, 0.12)'
                    },
                    {
                      text: 'Savol-javoblar',
                      desc: 'Ko‘p beriladigan savollar',
                      href: '#faq',
                      icon: <HelpCircle size={15} />,
                      color: '#f59e0b',
                      bg: 'rgba(245, 158, 11, 0.12)'
                    }
                  ].map((item, idx) => (
                    <button
                      key={idx}
                      className="mobile-select-row"
                      onClick={(e) => {
                        setMobileMenuOpen(false);
                        if (item.action) {
                          e.preventDefault();
                          item.action();
                        } else if (item.href.startsWith('#')) {
                          const targetId = item.href.slice(1);
                          const el = document.getElementById(targetId);
                          if (el) {
                            e.preventDefault();
                            el.scrollIntoView({ behavior: 'smooth' });
                          }
                        }
                      }}
                    >
                      <div className="mobile-select-row-left">
                        <span className="mobile-select-icon-box" style={{ background: item.bg, color: item.color }}>
                          {item.icon}
                        </span>
                        <div className="mobile-select-row-text">
                          <span className="mobile-select-row-title">{item.text}</span>
                          <span className="mobile-select-row-desc">{item.desc}</span>
                        </div>
                      </div>
                      <ChevronRight size={14} className="mobile-select-row-chevron" />
                    </button>
                  ))}
                </div>

                <div className="mobile-select-divider" />

                <div className="mobile-select-actions">
                  <button
                    className="mobile-select-login-btn"
                    onClick={() => { setMobileMenuOpen(false); onBegin('login'); }}
                  >
                    Kirish
                  </button>
                  <button
                    className="mobile-select-start-btn"
                    onClick={() => { setMobileMenuOpen(false); onBegin('register'); }}
                  >
                    <span>Boshlash</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </>
          )}
        </header>

        {/* Hero Content Section */}
        <div className="holo-hero-content">
          <div className="holo-hero-grid">
            {/* Left Hero Column */}
            <div className="holo-hero-copy animate-fade-in-up">
              <h1 className="holo-headline">
                {heroTitle.includes('erkin gapiring') ? (
                  <>
                    {heroTitle.replace('erkin gapiring', '').trim()}{' '}
                    <span className="holo-pill-badge">{heroBadge}</span>
                    <br />
                    erkin gapiring
                  </>
                ) : (
                  <>
                    {heroTitle}{' '}
                    {heroBadge && <span className="holo-pill-badge">{heroBadge}</span>}
                  </>
                )}
              </h1>

              <p className="holo-description">
                {heroDesc || 'Har kuni bor-yo‘g‘i 20–30 daqiqa vaqt ajrating, real kerakli so‘zlarni o‘rganing va so‘z boyligingizni oshiring.'}
              </p>

              {/* Action row with Primary CTA, Secondary CTA and Flags */}
              <div className="holo-cta-row">
                <div className="holo-cta-buttons">
                  <button className="holo-start-btn" onClick={() => onBegin('register')}>
                    <span>{primaryCta || 'Start Learning'}</span>
                    <ChevronRight size={18} />
                  </button>

                  <button
                    className="holo-trial-btn"
                    onClick={() => onBegin('trial')}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '7px',
                      padding: '12px 20px',
                      borderRadius: '14px',
                      background: 'rgba(120, 105, 245, 0.15)',
                      border: '1.5px solid rgba(120, 105, 245, 0.4)',
                      color: 'var(--hero-text, #ffffff)',
                      fontWeight: 800,
                      fontSize: '14px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 4px 16px rgba(120, 105, 245, 0.2)'
                    }}
                  >
                    <Sparkles size={16} style={{ color: '#7869f5' }} />
                    <span>O‘zingizni sinab ko‘ring</span>
                  </button>

                  {secondaryCta && (
                    <a
                      href="#preview"
                      className="holo-secondary-btn"
                      onClick={(e) => {
                        const el = document.getElementById('preview');
                        if (el) {
                          e.preventDefault();
                          el.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                    >
                      <Play size={13} style={{ fill: 'currentColor', marginRight: '2px' }} />
                      <span>{secondaryCta}</span>
                    </a>
                  )}
                </div>

                <div className="holo-flags-group">
                  <div className="holo-flags-stack">
                    {heroFlags.map((flag, idx) => (
                      <span key={idx} className="holo-flag">{flag}</span>
                    ))}
                  </div>
                  <div className="holo-flags-text">
                    <strong>{heroFlagsCount}</strong>
                    <span>{heroFlagsLabel}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Metrics Bar */}
              <div className="holo-metrics-bar">
                <div className="holo-metric-item">
                  <span className="metric-val">{metric1Val}</span>
                  <span className="metric-lbl">{metric1Lbl}</span>
                </div>
                <div className="holo-metric-divider" />
                <div className="holo-metric-item">
                  <span className="metric-val">{metric2Val}</span>
                  <span className="metric-lbl">{metric2Lbl}</span>
                </div>
                <div className="holo-metric-divider" />
                <div className="holo-metric-item">
                  <span className="metric-val">{metric3Val}</span>
                  <span className="metric-lbl">{metric3Lbl}</span>
                </div>
              </div>
            </div>

            {/* Right Hero Column: Laptop on Desktop, Smartphone on Mobile */}
            <div className="holo-hero-visual animate-fade-in-up delay-200">
              {/* DESKTOP VIEW: MAC LAPTOP & FLOATING CARDS */}
              <div className="holo-laptop-scene desktop-only-scene">
                {/* Floating Card 1: Popular Course Card */}
                <div className="holo-floating-card card-course animate-float-slow">
                  <div className="card-popular-badge">POPULAR</div>
                  <div className="card-course-top">
                    <span className="course-label">COURSE</span>
                    <span className="course-badge">{flBadge1.subtitle || '103 Darslik'}</span>
                  </div>
                  <div className="card-course-body">
                    <span className="course-flag">{flBadge1.flag || '🇬🇧'}</span>
                    <div>
                      <strong>{flBadge1.title || 'Basic English'}</strong>
                      <small>{flBadge1.subtitle || 'Conversation Practice'}</small>
                    </div>
                  </div>
                </div>

                {/* Floating Card 2: Teaches & Speaking Tally Bars */}
                <div className="holo-floating-card card-skills animate-float-medium">
                  <div className="skills-row">
                    <span className="skills-lbl">Teaches</span>
                    <div className="tally-bars green">
                      <i /><i /><i /><i /><i />
                    </div>
                  </div>
                  <div className="skills-row">
                    <span className="skills-lbl">Speaking</span>
                    <div className="tally-bars blue">
                      <i /><i /><i /><i /><i />
                    </div>
                  </div>
                  <div className="verified-badge-circle" title="Tasdiqlangan mutaxassis">
                    <Check size={13} strokeWidth={3} />
                  </div>
                </div>

                {/* Floating Card 3: Donut Progress Chart */}
                <div className="holo-floating-card card-progress animate-float-fast">
                  <div className="donut-chart-box">
                    <svg viewBox="0 0 42 42" className="donut-svg">
                      <circle className="donut-ring-outer" cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#50D890" strokeWidth="3" strokeDasharray="75 25" strokeDashoffset="25" />
                      <circle className="donut-ring-middle" cx="21" cy="21" r="12.5" fill="transparent" stroke="#2F54EB" strokeWidth="3" strokeDasharray="60 40" strokeDashoffset="40" />
                      <circle className="donut-ring-inner" cx="21" cy="21" r="9" fill="transparent" stroke="#F59E0B" strokeWidth="2.5" strokeDasharray="80 20" strokeDashoffset="10" />
                    </svg>
                  </div>
                  <div className="progress-info">
                    <strong>{flBadge2.title || '9 / 12 Quiz'}</strong>
                    <span>{flBadge2.subtitle || 'Speaking ✓'}</span>
                  </div>
                </div>

                {/* Laptop Hardware Frame */}
                <div className="holo-laptop-device">
                  <div className="laptop-screen">
                    <img
                      src={desktopTutorImg}
                      alt="Tilshunos professional o‘qituvchi"
                      className="laptop-tutor-img"
                    />
                  </div>
                  <div className="laptop-base">
                    <div className="laptop-notch" />
                  </div>
                  <div className="laptop-reflection" />
                </div>
              </div>

              {/* MOBILE VIEW: SMARTPHONE DEVICE */}
              <div className="holo-phone-scene mobile-only-scene">
                {/* Floating mini badges around the phone */}
                <div className="phone-floating-badge badge-top-left animate-float-slow">
                  <span className="badge-fl-flag">{flBadge1.flag || '🇬🇧'}</span>
                  <div>
                    <strong>{flBadge1.title || 'Basic English'}</strong>
                    <small>{flBadge1.subtitle || '103 Lesson'}</small>
                  </div>
                </div>

                <div className="phone-floating-badge badge-bottom-right animate-float-medium">
                  <div className="verified-dot-circle"><Check size={11} strokeWidth={3} /></div>
                  <div>
                    <strong>{flBadge2.title || '9 / 12 Quiz'}</strong>
                    <small>{flBadge2.subtitle || 'Speaking ✓'}</small>
                  </div>
                </div>

                {/* Smartphone Hardware Frame */}
                <div className="holo-mobile-device">
                  <div className="phone-screen">
                    <img
                      src={mobileTutorImg}
                      alt="Tilshunos mobil ilova"
                      className="phone-tutor-img"
                    />

                    {/* Dynamic Island Overlay - directly on top of the image */}
                    <div className="phone-dynamic-island">
                      <span className="island-lens" />
                      <span className="island-sensor" />
                    </div>

                    {/* App badge tag overlay */}
                    <div className="phone-screen-overlay">
                      <span className="phone-screen-tag">TILSHUNOS APP</span>
                    </div>

                    {/* Modern iOS Home Indicator Bar - on top of image */}
                    <div className="phone-home-indicator" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. AMALIY QO'LLANMA (7 SKILLS PRACTICE GUIDE) SECTION */}
      <PracticeGuideSection
        guideConfig={cms?.practiceGuide}
        onBegin={onBegin}
        dark={dark}
      />

      {/* 4. ILLUSTRATED INTERACTIVE CEFR ROADMAP SECTION */}
      <CEFRRoadmapSection
        onBegin={onBegin}
        onSelectLevel={onSelectLevel}
        dark={dark}
      />

      {/* 5. LEARNING SKILLS SECTION (MATCHING REFERENCE IMAGE 2) */}
      <SkillsSection
        kicker={skillsKicker}
        title={skillsTitle}
        subtitle={skillsSubtitle}
        skills={skillsList}
        dark={dark}
        onSelectSkill={(key) => onBegin('trial')}
      />

      {/* 6. HOW IT WORKS (7 CONNECTED STEPS WITH DUAL SCREENSHOTS) */}
      <LearningProcessSection
        config={cms?.stepsSection}
        dark={dark}
      />

      {/* 7. FEATURES & INNOVATION (Matching reference image 2) */}
      <FeaturesSection
        kicker={featuresKicker}
        title={featuresTitle}
        subtitle={featuresSubtitle}
        features={featuresList}
        dark={dark}
        onExploreFeature={(featKey) => {
          if (featKey === 'teachers') {
            const el = document.getElementById('teachers');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
            else onBegin('register');
          } else {
            onBegin('register');
          }
        }}
      />

      {/* 8. ABOUT US SECTION (MATCHING USER MOCKUP WITH DESK SCENE & 5 CONNECTED CARDS) */}
      <AboutSection
        cms={cms}
        onOpenAbout={onOpenAbout}
        dark={dark}
      />

      {/* 9. FAQ SECTION (Matching reference image exactly) */}
      <FaqSection
        faqs={faqs}
        dark={dark}
      />

      {/* 10. FINAL SIGNUP CALL-TO-ACTION (Matching reference mockup image) */}
      <FinalCtaSection
        kicker={finalCtaKicker}
        title={finalCtaTitle}
        desc={finalCtaDesc}
        btnRegister={finalCtaBtnRegister}
        btnLogin={finalCtaBtnLogin}
        onRegister={() => onBegin('register')}
        onLogin={() => onBegin('login')}
        dark={dark}
      />

      {/* 11. DETAILED FOOTER (Matching user mockup with floating glass card & mobile accordion) */}
      <FooterSection
        cms={cms}
        heroBgDesktop={heroBgDesktop}
        heroBgMobile={heroBgMobile}
        dark={dark}
        onBegin={onBegin}
        onOpenAbout={onOpenAbout}
      />

    </div>
  );
}
