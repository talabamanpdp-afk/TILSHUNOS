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
import { convertUzbekText } from '../utils/textTransform';
import { PracticeGuideSection } from './PracticeGuideSection';
import { PracticeGuideConfig } from '../data/practiceGuideData';
import { CEFRRoadmapSection } from './cefr-roadmap/CEFRRoadmapSection';
import { SkillsSection } from './skills/SkillsSection';
import { LearningProcessSection } from './learning-process/LearningProcessSection';
import { LearningProcessConfig } from '../data/learningProcessData';
import { FeaturesSection } from './features/FeaturesSection';
import { AboutSection } from './about/AboutSection';
import { FaqSection } from './faq/FaqSection';
import { FinalCtaSection } from './cta/FinalCtaSection';
import { FooterSection } from './footer/FooterSection';
import { motion, AnimatePresence } from 'framer-motion';
import Lenis from 'lenis';
import '../welcome-motion.css';
import { MagneticButton } from '../utils/motion/MagneticButton';
import { TiltCard } from '../utils/motion/TiltCard';
import { AnimatedCounter } from '../utils/motion/AnimatedCounter';
import { TextReveal } from '../utils/motion/TextReveal';
import { FloatingParticles } from '../utils/motion/FloatingParticles';

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
  stepsSection?: LearningProcessConfig;
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
  heroBgDesktop?: string;
  headerBgDesktop?: string;
  heroBgMobile?: string;
  headerBgMobile?: string;
  brandLogo?: string;
  cefrRoadmap?: any;
  founderPhoto?: string;
  founderTitle?: string;
  founderQuote?: string;
  [key: string]: any;
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

  // Lenis smooth scroll initialization (desktop with fine pointer only)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isTouch || prefersReduced) return;

    let lenis: Lenis | null = null;
    let rafId: number;

    try {
      lenis = new Lenis({
        duration: 1.15,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        smoothWheel: true,
      });

      function raf(time: number) {
        lenis?.raf(time);
        rafId = requestAnimationFrame(raf);
      }
      rafId = requestAnimationFrame(raf);
    } catch (e) {
      console.warn('Lenis scroll error:', e);
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      lenis?.destroy();
    };
  }, []);

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
  const heroDesc = convertUzbekText(cms?.description) || 'TILŞUNOS bilan har kuni tizimli örganing, CEFR standartlarida bilimingizni mustahkamlang va erkin muloqotga çiqing.';
  const primaryCta = convertUzbekText(cms?.cta) || 'Hoziroq Boşlaş';
  const secondaryCta = convertUzbekText(cms?.secondaryCta) || 'Platformani örganiş';
  const heroBgDesktop = cms?.heroBgDesktop || cms?.headerBgDesktop || 'https://yipexommqztxnvpckqyi.supabase.co/storage/v1/object/public/tilshunos-media/img_1793254439976_c6auer.webp';
  const heroBgMobile = cms?.heroBgMobile || cms?.headerBgMobile || 'https://yipexommqztxnvpckqyi.supabase.co/storage/v1/object/public/tilshunos-media/img_1793254446169_xxtbf7.webp';
  const heroFlags = (cms?.heroFlags && cms.heroFlags.length > 0)
    ? cms.heroFlags
    : ['🇬🇧', '🇷🇺', '🇩🇪', '🇺🇿'];
  const heroFlagsCount = cms?.heroFlagsCount || '5+';
  const heroFlagsLabel = cms?.heroFlagsLabel || 'Tillarda';

  // Dynamic top menu anchor links from cms.header
  const rawNavHeader = cms?.header?.trim() || 'Imkoniyatlar, Biz haqimizda, Kiriş';
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
  const metric1Lbl = convertUzbekText(
    cms?.metrics?.metric1Label && cms.metrics.metric1Label !== 'App Downloads'
      ? cms.metrics.metric1Label
      : 'Öquv Materiallari'
  );

  const metric2Val = useLive
    ? `${liveStats?.wordsCount ?? 0}+`
    : (cms?.metrics?.metric2Value && cms.metrics.metric2Value !== '8.24 M' ? cms.metrics.metric2Value : `${liveStats?.wordsCount ?? 0}+`);
  const metric2Lbl = convertUzbekText(
    cms?.metrics?.metric2Label && cms.metrics.metric2Label !== 'Learned monthly'
      ? cms.metrics.metric2Label
      : 'Luğat Sözlari'
  );

  const metric3Val = useLive
    ? `${liveStats?.usersCount ?? 0}+`
    : (cms?.metrics?.metric3Value && cms.metrics.metric3Value !== '4.8 ★' && cms.metrics.metric3Value !== '4.8' && cms.metrics.metric3Value !== '120+'
        ? cms.metrics.metric3Value
        : `${liveStats?.usersCount ?? 0}+`);
  const metric3Lbl = convertUzbekText(
    cms?.metrics?.metric3Label && cms.metrics.metric3Label !== '177k Rating' && cms.metrics.metric3Label !== 'Mashq Bajarildi'
      ? cms.metrics.metric3Label
      : 'Foydalanuvçilar'
  );

  const flBadge1 = cms?.floatingBadge1 || { flag: '🇬🇧', title: 'Basic English', subtitle: '103 Lesson' };
  const flBadge2 = cms?.floatingBadge2 || { title: '9 / 12 Quiz', subtitle: 'Speaking ✓' };

  // Preview Section Data
  const previewKicker = convertUzbekText(cms?.previewSection?.kicker) || 'AMALIY TAJRIBA';
  const previewTitle = convertUzbekText(cms?.previewSection?.title) || 'Platformaning haqiqiy imkoniyatlarini sinab köring';
  const previewSubtitle = convertUzbekText(cms?.previewSection?.subtitle) || 'Röyxatdan ötişdan avval asosiy 3 ta modulimiz qanday işlaşini amalda köring.';

  const multilingualVocab: Record<SupportedLang, Array<{ word: string; tr: string; lvl: string; ex: string; topic: string }>> = {
    en: (cms?.previewSection?.vocabItems && cms.previewSection.vocabItems.length > 0)
      ? cms.previewSection.vocabItems.map((item: any) => ({
          ...item,
          tr: convertUzbekText(item.tr),
          topic: convertUzbekText(item.topic)
        }))
      : [
          { word: 'Achieve', tr: 'Erişmoq, zabt etmoq', lvl: 'B1', ex: 'You can achieve any language goal with daily practice.', topic: 'Motivatsiya' },
          { word: 'Curious', tr: 'Qiziquvçan, yangilikka intiluvçan', lvl: 'A2', ex: 'Children are naturally curious about the world.', topic: 'Xarakter' },
          { word: 'Resilience', tr: 'Sabr-bardoş, çidamlilik', lvl: 'B2', ex: 'She showed great resilience in learning pronunciation.', topic: 'Psixologiya' }
        ],
    de: [
      { word: 'Entdecken', tr: 'Kaşf qilmoq, örganmoq', lvl: 'A2', ex: 'Wir entdecken jeden Tag neue deutsche Wörter.', topic: 'Bilim' },
      { word: 'Zuverlässig', tr: 'Işonçli, qat’iyatli', lvl: 'B1', ex: 'Ein zuverlässiger Wortschatz ist der Schlüssel zum Erfolg.', topic: 'Könikma' },
      { word: 'Begeisterung', tr: 'Iştiyoq, katta qiziqiş', lvl: 'B2', ex: 'Mit Begeisterung lernt man Sprachen viel schneller.', topic: 'Ruhlaniş' }
    ],
    tr: [
      { word: 'Başarmak', tr: 'Muvaffaqiyat qozonmoq, uddalamoq', lvl: 'A2', ex: 'Her gün pratik yaparak Türkçe konuşmayı başaracaksınız.', topic: 'Muvaffaqiyat' },
      { word: 'Meraklı', tr: 'Qiziquvçan, örganişga intiluvçan', lvl: 'A2', ex: 'Yeni bir dil öğrenirken meraklı olmak çok önemlidir.', topic: 'Xarakter' },
      { word: 'Kararlılık', tr: 'Qat’iyat, sobitqadamlik', lvl: 'B2', ex: 'Büyük hedeflere kararlılık ve düzenli çalışma ile ulaşılır.', topic: 'Iroda' }
    ],
    ru: [
      { word: 'Вдохновение', tr: 'Ilhom, jöşqinlik', lvl: 'B1', ex: 'Вдохновение приходит во время ежедневных практических занятий.', topic: 'Ijod' },
      { word: 'Достижение', tr: 'Yutuq, muhim marra', lvl: 'B1', ex: 'Каждое новое выученное слово — это ваше личное достижение.', topic: 'Rivojlaniş' },
      { word: 'Любознательный', tr: 'Bilimga çanqoq, qiziquvçan', lvl: 'A2', ex: 'Любознательные студенты осваивают язык значительно быстрее.', topic: 'Xususiyat' }
    ],
    uz: [
      { word: 'Barkamol', tr: 'Har tomonlama yetuk, mukammal', lvl: 'B2', ex: 'Barkamol avlod öz ona tilidan taşqari jahon tillarini puxta egallaydi.', topic: 'Ma’naviyat' },
      { word: 'Izlanish', tr: 'Doimiy intiliş, yangi bilim izlaş', lvl: 'A2', ex: 'Muntazam izlaniş va maşqlar tilni ravon gapirişga olib keladi.', topic: 'Ta’lim' },
      { word: 'Zukko', tr: 'Topqir, zehnli, tez anglovçi', lvl: 'B1', ex: 'Zukko öquvçilar yangi qoidalarni jonli misollarda oson eslab qoladilar.', topic: 'Zehn' }
    ]
  };

  const vocabItems = multilingualVocab[selectedDemoLang] || multilingualVocab.en;

  const defaultSampleLesson = {
    level: 'CEFR B1 · READING',
    time: '5 daqiqa',
    title: 'The Power of Tiny Daily Habits',
    article: 'Consistency is far more powerful than intensity. When learning a new language, practicing for just 15 minutes every single day wires the brain more effectively than studying for 4 hours once a week. The secret lies in frequent retrieval: each time you actively recall a word, the neural pathway strengthens.',
    question: 'Matnga köra, til örganişda eng muhim omil nima?',
    choiceA: 'Har kuni muntazam 15 daqiqa şuğullaniş (Töğri ✓)',
    choiceB: 'Faqat haftada bir marta 4 soat örganiş'
  };
  const sampleLesson = {
    ...defaultSampleLesson,
    ...(cms?.previewSection?.sampleLesson || {})
  };

  // CEFR Section Data
  const cefrKicker = convertUzbekText(cms?.cefrSection?.kicker) || 'XALQARO METODIKA';
  const cefrTitle = convertUzbekText(cms?.cefrSection?.title) || 'CEFR böyiça aniq yöl xaritasi (A1–C2)';
  const cefrSubtitle = convertUzbekText(cms?.cefrSection?.subtitle) || 'Özingizga mos boşlang‘iç nuqtani tanlang va bosqiçma-bosqiç yuksaling.';
  const defaultCefrLevels = [
    { code: 'A1', name: 'Boşlang‘iç', desc: 'Oddiy sözlar, tanişuv va kundalik eng muhim iboralar.', color: '#3b82f6' },
    { code: 'A2', name: 'Elementar', desc: 'Xarid, transport va oddiy kundalik vaziyatlarda muloqot.', color: '#0ea5e9' },
    { code: 'B1', name: 'Örta daraja', desc: 'Sayohat, fikr bildiriş va öz tajribasini erkin tuşuntiriş.', color: '#10b981' },
    { code: 'B2', name: 'Mustaqil', desc: 'Murakkab matnlar, inşolar va mavzular böyiça erkin bahslaşiş.', color: '#8b5cf6' },
    { code: 'C1', name: 'Ilğor', desc: 'Akademik va kasbiy darajada çuqur fikrlaş hamda tahlil.', color: '#f59e0b' },
    { code: 'C2', name: 'Mukammal', desc: 'Ona tili darajasidagi ravonlik va nozik ma’nolarni anglaş.', color: '#ec4899' }
  ];
  const cefrLevelsList = (cms?.cefrSection?.levels && cms.cefrSection.levels.length > 0)
    ? cms.cefrSection.levels.map((lvl: any) => ({
        ...lvl,
        name: convertUzbekText(lvl.name),
        desc: convertUzbekText(lvl.desc)
      }))
    : defaultCefrLevels;

  // 5 Skills Data
  const skillsKicker = convertUzbekText(cms?.skillsSection?.kicker) || 'MUVOZANATLI RIVOJLANIŞ';
  const skillsTitle = convertUzbekText(cms?.skillsSection?.title) || '5 ta asosiy til könikmasini mustahkamlang';
  const skillsSubtitle = convertUzbekText(cms?.skillsSection?.subtitle) || 'Faqat qoidalar yodlaş emas — har tomonlama tabiiy örganiş uslubi.';
  const defaultSkills = [
    { key: 'reading', title: 'Öqiş (Reading)', desc: 'Darajangizga moslangan qiziqarli hikoyalar, badiiy parçalar va zamonaviy maqolalar.', color: '#356cf6' },
    { key: 'writing', title: 'Yoziş (Writing)', desc: 'Inşo va xatlar yoziş, grammatik xatolarni sun’iy intellekt orqali darhol tekşiriş.', color: '#8b5cf6' },
    { key: 'listening', title: 'Tinglaş (Listening)', desc: 'Tabiiy tezlikdagi audio podkastlar, kundalik muloqot dialoglari va transkriptlar.', color: '#0ea5e9' },
    { key: 'speaking', title: 'Gapiriş (Speaking)', desc: 'Töğri talaffuz va intonatsiya maşqlari bilan muloqotdagi tösiqlarni yengiş.', color: '#10b981' },
    { key: 'vocab', title: 'Luğat (Vocabulary)', desc: 'Şaxsiy söz daftari, kontekstual misollar va intervalli takrorlaş metodikasi.', color: '#f59e0b' }
  ];
  const skillsList = (cms?.skillsSection?.skills && cms.skillsSection.skills.length > 0)
    ? cms.skillsSection.skills.map((s: any) => ({
        ...s,
        title: convertUzbekText(s.title),
        desc: convertUzbekText(s.desc)
      }))
    : defaultSkills;

  // 5 Steps Data
  const stepsKicker = convertUzbekText(cms?.stepsSection?.kicker) || 'ODDIY VA TUŞUNARLI';
  const stepsTitle = convertUzbekText(cms?.stepsSection?.title) || 'Örganiş jarayoni qanday keçadi?';
  const stepsSubtitle = convertUzbekText(cms?.stepsSection?.subtitle) || '5 ta oson qadam orqali maqsadingiz sari işonç bilan yöl oling.';
  const defaultSteps = [
    { step: '01', title: 'Til va maqsadni tanlaysiz', desc: 'Ingliz, rus, nemis yoki boşqa tillar hamda kunlik şuğullaniş vaqti.' },
    { step: '02', title: 'Boşlang‘iç daraja aniqlanadi', desc: 'CEFR A1 dan C2 gaça bölgan aniq darajangiz belgilanadi.' },
    { step: '03', title: 'Şaxsiy reja tuziladi', desc: 'Dashboardda har kungi yangi sözlar va maşqlar tartibli aks etadi.' },
    { step: '04', title: 'Amaliyot va söz öyinlari', desc: 'Typing, söz zanjiri va 1v1 bellaşuvlar orqali bilim mustahkamlanadi.' },
    { step: '05', title: 'Natijalar va ösiş', desc: 'Özlaştirilgan sözlar va yuqori CEFR darajalariga ötiş.' }
  ];
  const stepsList = (cms?.stepsSection?.steps && cms.stepsSection.steps.length > 0)
    ? cms.stepsSection.steps.map((st: any) => ({
        ...st,
        title: convertUzbekText(st.title),
        desc: convertUzbekText(st.desc)
      }))
    : defaultSteps;

  // Features Data
  const featuresKicker = convertUzbekText(cms?.featuresSection?.kicker) || 'ILĞOR IMKONIYATLAR';
  const featuresTitle = convertUzbekText(cms?.featuresSection?.title) || 'Zamonaviy texnologiyalar xizmatingizda';
  const featuresSubtitle = convertUzbekText(cms?.featuresSection?.subtitle) || 'Biz til örganişni nafaqat samarali, balki maroqli jarayonga aylantiramiz.';
  const defaultFeatures = [
    { key: 'ai', color: 'purple', title: '24/7 AI Til Repetitori', desc: 'Istalgan savolingizni bering, grammatik xatolaringizni aniqlang va muloyim tuşuntirişlar oling.' },
    { key: 'pvp', color: 'orange', title: '1v1 Söz Bellaşuvi', desc: 'Boşqa öquvçilar bilan real vaqtda söz boyligingizni sinang, XP töplang va yetakçilar safiga kiring.' },
    { key: 'anticheat', color: 'green', title: 'Anti-Cheat & Spaced Repetition', desc: 'Sözlar tasodifiy takrorlanmaydi — ilmiy tasdiqlangan intervallar bilan uzoq muddatli xotiraga köçadi.' },
    { key: 'teachers', color: 'blue', title: 'Malakali Ustozlar Nazorati', desc: 'Maxsus öqituvçilar tizimda sizning yozma inşo va vazifalaringizni tekşirib, şaxsiy baho beradi.' }
  ];
  const featuresList = (cms?.featuresSection?.features && cms.featuresSection.features.length > 0)
    ? cms.featuresSection.features.map((f: any) => ({
        ...f,
        title: convertUzbekText(f.title),
        desc: convertUzbekText(f.desc)
      }))
    : defaultFeatures;

  // About, Founder, Contacts
  const aboutShort = cms?.about || 'TILŞUNOS til örganişni tartibli, qiziqarli va şaxsiy maqsadlaringizga mos qiliş uçun yaratilayotgan ilğor platforma.';
  const aboutDetailed = cms?.aboutDetailed || 'TILŞUNOS — xalqaro CEFR (A1–C2) standartlariga moslaştirilgan, sun’iy intellekt va professional ustozlar metodikasini özida mujassam etgan zamonaviy ta’lim platformasi. Bizning asosiy maqsadimiz — har bir foydalanuvçiga murakkab grammatik qoidalarsiz, interaktiv söz öyinlari, amaliy audio-dialoglar, yozma tahlil va real muloqot orqali tilni tabiiy özlaştiriş imkoniyatini taqdim etişdir.';
  const aboutBtn = cms?.aboutButton || 'Batafsil ma’lumot';

  const teamMembers = Array.isArray(cms?.team) ? cms.team : [
    { name: 'Soxibjon Gaybullayev', role: 'Asosçi & Boş Muhandis', bio: 'Til örganiş texnologiyalari va raqamli ta’lim böyiça mutaxassis.', avatar: 'S' },
    { name: 'Dilnoza Karimova', role: 'Boş Öqituvçi & Metodist', bio: 'IELTS va CEFR standartlari böyiça 8 yillik tajribaga ega ustoz.', avatar: 'D' },
    { name: 'Jasur Aliyev', role: 'Ta’lim Koordinatori', bio: 'Talabalar bilan işlaş va interaktiv maşqlar mutaxassisi.', avatar: 'J' }
  ];

  const founderName = cms?.founderName || 'Soxibjon Gaybullayev';
  const founderBio = cms?.founderBio || 'TILŞUNOS platformasi asosçisi. Özbekiston yoşlariga jahon tillarini eng samarali va qulay usulda örganiş uçun innovatsion ekotizim yaratiş ustida işlaydi.';

  const contacts = cms?.contacts || {
    telegram: '@tilshunos',
    instagram: 'tilshunos_app',
    email: 'soxibgaybullayev439@gmail.com',
    phone: '+998 90 123 45 67'
  };

  const footerText = cms?.footer || '© 2026 TILŞUNOS · Barça huquqlar himoyalangan';

  const defaultFaqs = [
    { q: 'TILŞUNOS platformasidan foydalaniş bepulmi?', a: 'Ha, asosiy funksiyalar — söz yodlaş, maşqlar, CEFR reading va listening materiallari barça uçun bepul.' },
    { q: 'CEFR darajalarini qanday aniqlayman?', a: 'Röyxatdan ötiş çoğida darajangizni (A1–C2) özingiz belgilaşingiz yoki diagnostik test orqali aniqlab olişingiz mumkin.' },
    { q: 'Mobil qurilmalarda işlaydimi?', a: 'Ha, TILŞUNOS responsive veb-ilova va PWA (Progressive Web App) sifatida smartfon va planşetlarda qulay işlaydi.' },
    { q: 'Öqituvçi bilan qanday boğlanaman?', a: 'Platformadagi Öqituvçilar bölimi orqali tasdiqlangan ustozlar bilan boğlanib, şaxsiy topşiriqlar olişingiz mumkin.' }
  ];
  const faqs = Array.isArray(cms?.faqs) ? cms.faqs : defaultFaqs;

  // Final CTA Data
  const finalCtaKicker = cms?.finalCta?.kicker || 'BIZ BILAN ÖRGANING';
  const finalCtaTitle = cms?.finalCta?.title || 'Yangi tilni erkin gapiriş vaqti keldi';
  const finalCtaDesc = cms?.finalCta?.desc || 'Til örganiş — yangi imkoniyatlar eşiklarini oçadi. Biz siz bilan birga bu yölda!';
  const finalCtaBtnRegister = cms?.finalCta?.btnRegister || 'Bepul hisob yaratiş';
  const finalCtaBtnLogin = cms?.finalCta?.btnLogin || 'Tizimga kiriş';

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
          {/* Ambient Cosmic Floating Orbs & Interactive Language Particles */}
          <div
            className="cosmic-mesh-bg"
            style={{
              top: '-12%',
              left: '12%',
              width: '420px',
              height: '420px',
              background: 'radial-gradient(circle, rgba(56, 189, 248, 0.18) 0%, transparent 70%)'
            }}
          />
          <div
            className="cosmic-mesh-bg"
            style={{
              top: '25%',
              right: '6%',
              width: '460px',
              height: '460px',
              background: 'radial-gradient(circle, rgba(168, 85, 247, 0.16) 0%, transparent 70%)',
              animationDelay: '-6s'
            }}
          />
          <FloatingParticles />
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
                  <img src={cms?.brandLogo || "/brand_logo.png"} alt="TILŞUNOS" className="brand-logo-img" onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/brand_logo.png'; }} />
                </span>
                <span className="holo-brand-name">TILŞUNOS</span>
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
                title={dark ? 'Yoruğ mavzuga ötiş' : 'Tungi mavzuga ötiş'}
                aria-label="Mavzuni almaştiriş"
              >
                {dark ? <Sun size={17} /> : <Moon size={17} />}
              </button>

              <button className="holo-sign-in" onClick={() => onBegin('login')}>
                Kiriş
              </button>

              <button className="holo-get-started" onClick={() => onBegin('register')}>
                Boşlaş
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
                    <Compass size={12} /> Bölimni tanlang
                  </span>
                  <span className="mobile-select-pill">TILŞUNOS</span>
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
                      desc: 'Loyiha maqsadi va asosçi',
                      href: '#about',
                      icon: <BookOpen size={15} />,
                      color: '#2563eb',
                      bg: 'rgba(37, 99, 235, 0.12)',
                      action: () => onOpenAbout()
                    },
                    {
                      text: 'Interaktiv tajriba',
                      desc: 'Haqiqiy söz va dars namunasi',
                      href: '#preview',
                      icon: <Play size={15} />,
                      color: '#10b981',
                      bg: 'rgba(16, 185, 129, 0.12)'
                    },
                    {
                      text: 'CEFR Xaritasi',
                      desc: 'A1 dan C2 gaça bosqiçlar',
                      href: '#cefr',
                      icon: <Target size={15} />,
                      color: '#8b5cf6',
                      bg: 'rgba(139, 92, 246, 0.12)'
                    },
                    {
                      text: 'Savol-javoblar',
                      desc: 'Köp beriladigan savollar',
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
                    <TextReveal
                      text={heroTitle.replace('erkin gapiring', '').trim()}
                      as="span"
                      delay={0.12}
                    />{' '}
                    <span className="holo-pill-badge">{heroBadge}</span>
                    <br />
                    <span className="text-gradient-flow">erkin gapiring</span>
                  </>
                ) : (
                  <>
                    <TextReveal text={heroTitle} as="span" delay={0.12} />{' '}
                    {heroBadge && <span className="holo-pill-badge">{heroBadge}</span>}
                  </>
                )}
              </h1>

              <motion.p
                className="holo-description"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                {heroDesc || 'Har kuni bor-yöği 20–30 daqiqa vaqt ajrating, real kerakli sözlarni örganing va söz boyligingizni oşiring.'}
              </motion.p>

              {/* Action row with Primary CTA, Secondary CTA and Flags */}
              <div className="holo-cta-row">
                <div className="holo-cta-buttons">
                  <MagneticButton activeGlow>
                    <button className="holo-start-btn" onClick={() => onBegin('register')}>
                      <span>{primaryCta || 'Start Learning'}</span>
                      <ChevronRight size={18} />
                    </button>
                  </MagneticButton>

                  <MagneticButton>
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
                      <span>Özingizni sinab köring</span>
                    </button>
                  </MagneticButton>

                  {secondaryCta && (
                    <MagneticButton>
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
                    </MagneticButton>
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
                  <span className="metric-val">
                    <AnimatedCounter value={metric1Val} />
                  </span>
                  <span className="metric-lbl">{metric1Lbl}</span>
                </div>
                <div className="holo-metric-divider" />
                <div className="holo-metric-item">
                  <span className="metric-val">
                    <AnimatedCounter value={metric2Val} />
                  </span>
                  <span className="metric-lbl">{metric2Lbl}</span>
                </div>
                <div className="holo-metric-divider" />
                <div className="holo-metric-item">
                  <span className="metric-val">
                    <AnimatedCounter value={metric3Val} />
                  </span>
                  <span className="metric-lbl">{metric3Lbl}</span>
                </div>
              </div>
            </div>

            {/* Right Hero Column: Laptop on Desktop, Smartphone on Mobile */}
            <div className="holo-hero-visual animate-fade-in-up delay-200">
              {/* DESKTOP VIEW: MAC LAPTOP & FLOATING CARDS */}
              <div className="holo-laptop-scene desktop-only-scene">
                {/* Floating Card 1: Popular Course Card */}
                <motion.div
                  className="holo-floating-card card-course"
                  animate={{ y: [0, -14, 0], rotate: [-1, 1, -1] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                >
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
                </motion.div>

                {/* Floating Card 2: Teaches & Speaking Tally Bars */}
                <motion.div
                  className="holo-floating-card card-skills"
                  animate={{ y: [0, -18, 0], rotate: [1, -1, 1] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.7 }}
                >
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
                </motion.div>

                {/* Floating Card 3: Donut Progress Chart */}
                <motion.div
                  className="holo-floating-card card-progress"
                  animate={{ y: [0, -15, 0], rotate: [-1.5, 1.5, -1.5] }}
                  transition={{ duration: 5.6, repeat: Infinity, ease: 'easeInOut', delay: 1.4 }}
                >
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
                </motion.div>

                {/* Laptop Hardware Frame with 3D Tilt */}
                <TiltCard maxTilt={5}>
                  <div className="holo-laptop-device">
                    <div className="laptop-screen">
                      <img
                        src={desktopTutorImg}
                        alt="Tilşunos professional öqituvçi"
                        className="laptop-tutor-img"
                      />
                    </div>
                    <div className="laptop-base">
                      <div className="laptop-notch" />
                    </div>
                    <div className="laptop-reflection" />
                  </div>
                </TiltCard>
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
                      alt="Tilşunos mobil ilova"
                      className="phone-tutor-img"
                    />

                    {/* Dynamic Island Overlay - directly on top of the image */}
                    <div className="phone-dynamic-island">
                      <span className="island-lens" />
                      <span className="island-sensor" />
                    </div>

                    {/* App badge tag overlay */}
                    <div className="phone-screen-overlay">
                      <span className="phone-screen-tag">TILŞUNOS APP</span>
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
        config={cms?.cefrRoadmap || cms?.cefrSection}
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
