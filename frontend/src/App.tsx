import { AdminPanel } from './components/AdminPanel';
import { TeacherPanel } from './components/TeacherPanel';
import { DuelMatchModal } from './components/DuelMatchModal';
import { WelcomePage } from './components/WelcomePage';
import { AboutPage } from './components/AboutPage';
import { useEffect, useMemo, useState } from 'react';
import {
  Activity, ArrowDownRight, ArrowRight, ArrowUpRight, Award, BookA, BookOpen, Bookmark, Brain,
  CalendarDays, Check, CheckCheck, ChevronDown, ChevronRight, CircleHelp, Clock3, Download, Flame, Gamepad2, GraduationCap, Image,
  Headphones, Home, Languages, LayoutDashboard, Library, ListTodo, LogOut, Menu, MessageCircle,
  Mic2, Moon, MoreHorizontal, Plus, Search, Settings, Share2, Sparkles, Sun, Smartphone, Target, TrendingUp, Trophy,
  Users, Volume2, X, Zap, type LucideIcon
} from 'lucide-react';
import { api, authStorage, normalizeUserRole } from './api';
import { playSpeech } from './utils/speech';

type Word = { id: number; word: string; translation: string; example: string; topic: string; state: 'Rejalashtirilgan' | 'Jarayonda' | 'O‘rganilgan' };

const initialWords: Word[] = [];

type NavItem = { label: string; icon: LucideIcon; section?: string };
const navItems: NavItem[] = [
  { label: 'Bosh sahifa', icon: Home, section: 'O‘RGANISH' },
  { label: 'So‘z daftarim', icon: BookA },
  { label: 'Mashq qilish', icon: Brain },
  { label: 'Materiallar', icon: Library, section: 'KASHF ETISH' },
  { label: 'O‘qish', icon: BookOpen },
  { label: 'Tinglash', icon: Headphones },
  { label: 'Gapirish', icon: Mic2 },
  { label: 'Yozish', icon: MessageCircle },
  { label: 'So‘z o‘yinlari', icon: Gamepad2, section: 'O‘YIN VA RIVOJLANISH' },
  { label: 'Vazifalar', icon: ListTodo, section: 'HAMKORLIK' },
  { label: 'O‘qituvchilar', icon: Users },
  { label: 'AI yordamchi', icon: Sparkles }
];

export const supportedLanguages = [
  { code: 'ru', flag: '🇷🇺', name: 'Rus tili', sub: 'Русский язык' },
  { code: 'en', flag: '🇬🇧', name: 'Ingliz tili', sub: 'English' },
  { code: 'uz', flag: '🇺🇿', name: 'O‘zbek tili', sub: 'O‘zbekcha' },
  { code: 'tr', flag: '🇹🇷', name: 'Turk tili', sub: 'Türkçe' },
  { code: 'de', flag: '🇩🇪', name: 'Nemis tili', sub: 'Deutsch' },
];

export const cefrLevels = [
  { code: 'A1', name: 'Boshlang‘ich', desc: 'Oddiy so‘z va iboralar' },
  { code: 'A2', name: 'Elementar', desc: 'Kundalik muloqot' },
  { code: 'B1', name: 'O‘rta daraja', desc: 'Erkin suhbat' },
  { code: 'B2', name: 'Mustaqil', desc: 'Murakkab matnlar' },
  { code: 'C1', name: 'Ilg‘or', desc: 'Akademik mahorat' },
  { code: 'C2', name: 'Mukammal', desc: 'Ona tili darajasi' },
];

export const languageMaterials: Record<string, any[]> = {
  de: [
    { title: 'Guten Tag! — Begrüßungen', sub: 'Kundalik nemischa salomlashuv va tanishuv', level: 'A1', type: 'Tinglash', mins: '10 daqiqa', icon: Headphones, color: 'lavender' },
    { title: 'Der Alltag in Berlin', sub: 'Berlindagi hayot va madaniyat haqida matn', level: 'A2', type: 'O‘qish', mins: '12 daqiqa', icon: BookOpen, color: 'mint' },
    { title: 'Im Café bestellen', sub: 'Kafeda nemischa buyurtma berish', level: 'A1', type: 'Gapirish', mins: '6 daqiqa', icon: Mic2, color: 'peach' },
    { title: 'Schreiben: Mein Lieblingstraum', sub: 'Mening orzularim mavzusida insho', level: 'B1', type: 'Yozish', mins: '15 daqiqa', icon: MessageCircle, color: 'peach' },
    { title: 'Deutsche Grammatik: Dativ & Akkusativ', sub: 'Kelishiklar qoidasi va amaliy mashqlar', level: 'B1', type: 'O‘qish', mins: '14 daqiqa', icon: BookOpen, color: 'mint' },
    { title: 'Wortschatz: Reise nach München', sub: 'Sayohat uchun eng muhim nemischa so‘zlar', level: 'A2', type: 'Lug‘at', mins: '8 daqiqa', icon: Languages, color: 'lavender' }
  ],
  ru: [
    { title: 'Диалоги на каждый день', sub: 'Kundalik ruscha suhbatlar va tanishuv', level: 'A1', type: 'Tinglash', mins: '10 daqiqa', icon: Headphones, color: 'lavender' },
    { title: 'Зимний вечер в Ташкенте', sub: 'Badiiy matn tahlili va o‘qish', level: 'A2', type: 'O‘qish', mins: '12 daqiqa', icon: BookOpen, color: 'mint' },
    { title: 'В ресторане и кафе', sub: 'Restoranda buyurtma berish', level: 'A1', type: 'Gapirish', mins: '6 daqiqa', icon: Mic2, color: 'peach' },
    { title: 'Письмо: Мои планы на будущее', sub: 'Kelajak rejalari haqida insho', level: 'B1', type: 'Yozish', mins: '15 daqiqa', icon: MessageCircle, color: 'peach' },
    { title: 'Грамматика: Падежи русского языка', sub: '6 ta kelishik va qo‘llanishi', level: 'B1', type: 'O‘qish', mins: '14 daqiqa', icon: BookOpen, color: 'mint' },
    { title: 'Словарь: Путешествия и гостиницы', sub: 'Mehmonxona va sayohat so‘zlari', level: 'A2', type: 'Lug‘at', mins: '8 daqiqa', icon: Languages, color: 'lavender' }
  ],
  uz: [
    { title: 'Ona tili: Salomlashish odobi', sub: 'Xushmuomalalik va madaniy muloqot', level: 'A1', type: 'Tinglash', mins: '10 daqiqa', icon: Headphones, color: 'lavender' },
    { title: 'O‘zbekiston me’moriy obidalari', sub: 'Samarqand va Buxoro tarixi haqida matn', level: 'A2', type: 'O‘qish', mins: '12 daqiqa', icon: BookOpen, color: 'mint' },
    { title: 'Bozorlik va savdolashish', sub: 'Sharqona bozor madaniyati va dialog', level: 'A1', type: 'Gapirish', mins: '6 daqiqa', icon: Mic2, color: 'peach' },
    { title: 'Insho: Milliy qadriyatlarimiz', sub: 'Oila va an’analar haqida insho yozish', level: 'B1', type: 'Yozish', mins: '15 daqiqa', icon: MessageCircle, color: 'peach' },
    { title: 'O‘zbek tili grammatikasi', sub: 'Fe’l nisbatlari va qo‘shimchalar', level: 'B1', type: 'O‘qish', mins: '14 daqiqa', icon: BookOpen, color: 'mint' },
    { title: 'Lug‘at: Sayyohlar uchun atamalar', sub: 'Mehmon kutish va mehmondo‘stlik', level: 'A2', type: 'Lug‘at', mins: '8 daqiqa', icon: Languages, color: 'lavender' }
  ],
  tr: [
    { title: 'Günlük Konuşmalar: Merhabalaşma', sub: 'Kundalik turkcha salomlashuvlar', level: 'A1', type: 'Tinglash', mins: '10 daqiqa', icon: Headphones, color: 'lavender' },
    { title: 'İstanbul Boğazı ve Tarihi', sub: 'Istanbul bo‘g‘ozi haqida matn', level: 'A2', type: 'O‘qish', mins: '12 daqiqa', icon: BookOpen, color: 'mint' },
    { title: 'Restoranda Sipariş Verme', sub: 'Turk oshxonasida buyurtma berish', level: 'A1', type: 'Gapirish', mins: '6 daqiqa', icon: Mic2, color: 'peach' },
    { title: 'Yazma: Hayalimdeki Tatil Planı', sub: 'Tatil rejalari haqida yozma insho', level: 'B1', type: 'Yozish', mins: '15 daqiqa', icon: MessageCircle, color: 'peach' },
    { title: 'Türkçe Dilbilgisi: Fiil Çekimleri', sub: 'Zamonlar va shaxs-son qo‘shimchalari', level: 'B1', type: 'O‘qish', mins: '14 daqiqa', icon: BookOpen, color: 'mint' },
    { title: 'Seyahat ve Alışveriş Kelimeleri', sub: 'Kiyim-kechak va xarid so‘zlari', level: 'A2', type: 'Lug‘at', mins: '8 daqiqa', icon: Languages, color: 'lavender' }
  ],
  en: [
    { title: 'Daily conversations', sub: 'Kundalik suhbatlar va dialoglar', level: 'A2', type: 'Tinglash', mins: '12 daqiqa', icon: Headphones, color: 'lavender' },
    { title: 'The power of habits', sub: 'Odatlar kuchi va kitobdan parchalar', level: 'B1', type: 'O‘qish', mins: '8 daqiqa', icon: BookOpen, color: 'mint' },
    { title: 'At the coffee shop', sub: 'Kafeda suhbat va buyurtma', level: 'A1', type: 'Gapirish', mins: '6 daqiqa', icon: Mic2, color: 'peach' },
    { title: 'Writing: My Daily Routine', sub: 'Kun tartibi haqida insho yozish', level: 'A2', type: 'Yozish', mins: '15 daqiqa', icon: MessageCircle, color: 'peach' },
    { title: 'Useful Expressions for Travel', sub: 'Sayohat uchun eng kerakli iboralar', level: 'B1', type: 'Lug‘at', mins: '10 daqiqa', icon: Languages, color: 'lavender' },
    { title: 'Pronunciation & Accent Mastery', sub: 'Talaffuz va to‘g‘ri aksent mashqi', level: 'A1', type: 'Gapirish', mins: '7 daqiqa', icon: Mic2, color: 'mint' }
  ]
};

const lessons = languageMaterials['en'];

function Dashboard({ onLogout, dark, setDark }: { onLogout: () => void; dark: boolean; setDark: (d: boolean) => void }) {
  const currentUser = authStorage.getUser();
  const [active, setActive] = useState('Bosh sahifa');
  const [selectedLang, setSelectedLang] = useState(() => localStorage.getItem('tilshunos_language') || 'en');
  const [selectedLevel, setSelectedLevel] = useState(() => localStorage.getItem('tilshunos_level') || 'B1');
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [backendMaterials, setBackendMaterials] = useState<any[]>([]);

  useEffect(() => {
    api.getMaterials({ languageCode: selectedLang })
      .then(res => {
        if (Array.isArray(res)) setBackendMaterials(res);
      })
      .catch(() => {});
  }, [selectedLang]);

  const currentLangObj = supportedLanguages.find(l => l.code === selectedLang) || supportedLanguages[0];
  const currentLessons = useMemo(() => {
    const staticItems = languageMaterials[selectedLang] || languageMaterials['en'];
    const dynamicItems = backendMaterials.map(m => ({
      title: m.title,
      sub: m.description || m.title,
      level: m.level || 'B1',
      type: m.contentType === 'AudioPodcast' ? 'Tinglash' : m.contentType === 'Story' ? 'O‘qish' : m.contentType === 'GrammarLesson' ? 'Yozish' : 'Material',
      mins: `${m.estimatedMinutes || 10} daqiqa`,
      icon: m.contentType === 'AudioPodcast' ? Headphones : m.contentType === 'Story' ? BookOpen : MessageCircle,
      color: 'lavender'
    }));
    return [...staticItems, ...dynamicItems];
  }, [selectedLang, backendMaterials]);

  const vocabKey = currentUser?.id ? `tilshunos_words_${currentUser.id}` : 'tilshunos_words';
  const [words, setWords] = useState<Word[]>(() => {
    try {
      const saved = localStorage.getItem(vocabKey);
      if (saved) return JSON.parse(saved);
      return [];
    } catch {
      return [];
    }
  });
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [practiceOpen, setPracticeOpen] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [toast, setToast] = useState('');
  const [newWord, setNewWord] = useState({ word: '', translation: '', example: '', topic: 'Umumiy' });
  const [answer, setAnswer] = useState('');
  const [answered, setAnswered] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [showAll, setShowAll] = useState(false);

  // Real Dashboard Stats from Supabase
  const [dashboardStats, setDashboardStats] = useState({
    dailyStreak: 0,
    longestStreak: 0,
    dailyGoalMinutes: 20,
    todayMinutes: 0,
    weeklyMinutes: 0,
    totalXP: 0,
    totalWords: 0,
    plannedWords: 0,
    inProgressWords: 0,
    learnedWords: 0,
    needsReviewWords: 0,
    activeTasksCount: 0,
    newWordsToday: 0,
    practiceCountToday: 0
  });

  const refreshDashboardStats = () => {
    api.getDashboardSummary()
      .then(res => {
        if (res) {
          setDashboardStats({
            dailyStreak: res.dailyStreak || 0,
            longestStreak: res.longestStreak || 0,
            dailyGoalMinutes: res.dailyGoalMinutes || 20,
            todayMinutes: res.todayMinutes || 0,
            weeklyMinutes: res.weeklyMinutes || 0,
            totalXP: res.totalXP || 0,
            totalWords: res.totalWords || 0,
            plannedWords: res.plannedWords || 0,
            inProgressWords: res.inProgressWords || 0,
            learnedWords: res.learnedWords || 0,
            needsReviewWords: res.needsReviewWords || 0,
            activeTasksCount: res.activeTasksCount || 0,
            newWordsToday: res.newWordsToday || 0,
            practiceCountToday: res.practiceCountToday || 0
          });
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    refreshDashboardStats();
  }, [selectedLang]);

  const formattedDate = useMemo(() => {
    const d = new Date();
    const months = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'];
    const days = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];
    return `${d.getDate()}-${months[d.getMonth()]}, ${days[d.getDay()]}`;
  }, []);

  // Games state
  const [gameMode, setGameMode] = useState('Mavzu typing');
  const [gameInput, setGameInput] = useState('');
  const [gameScore, setGameScore] = useState(0);
  const [gameFeedback, setGameFeedback] = useState('');
  const [previousChainWord, setPreviousChainWord] = useState('Apple');
  const [imageMode, setImageMode] = useState('Variantlardan tanlash');
  const [showDuelModal, setShowDuelModal] = useState(false);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  // PWA install state - strictly detects if genuinely running in standalone PWA app window
  const checkIsStandalone = () => {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://')
    );
  };

  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [installed, setInstalled] = useState<boolean>(() => checkIsStandalone());
  const [bannerDismissed, setBannerDismissed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('tilshunos_pwa_banner_dismissed') === 'true';
  });
  const [showPwaModal, setShowPwaModal] = useState(false);

  useEffect(() => {
    const updateStandalone = () => {
      const isStandalone = checkIsStandalone();
      setInstalled(isStandalone);
      if (!isStandalone) {
        // Clear any old false-positive cache from previous versions
        localStorage.removeItem('tilshunos_pwa_installed');
      }
    };

    updateStandalone();

    const media = window.matchMedia('(display-mode: standalone)');
    if (media.addEventListener) {
      media.addEventListener('change', updateStandalone);
      return () => media.removeEventListener('change', updateStandalone);
    }
  }, []);

  // AI Chat
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessages, setAiMessages] = useState<{ role: string; text: string }[]>([
    { role: 'assistant', text: `Assalomu alaykum${currentUser?.firstName ? `, ${currentUser.firstName}` : ''}! 👋 Men TILSHUNOS AI repetitoriman. Ingliz tili grammatikasi, so‘zlar va mashqlar bo‘yicha har qanday savolingizga yordam beraman. Bugun nimani o‘rganamiz?` }
  ]);

  // Load words from backend on mount
  useEffect(() => {
    api.getVocabulary()
      .then(items => {
        if (Array.isArray(items)) {
          const mapped: Word[] = items.map((x: any) => ({
            id: x.id,
            word: x.targetWord,
            translation: x.nativeTranslation,
            example: x.exampleSentence || '',
            topic: x.topicCategory || 'Umumiy',
            state: x.status === 2 ? 'O‘rganilgan' : x.status === 1 ? 'Jarayonda' : 'Rejalashtirilgan'
          }));
          setWords(mapped);
          localStorage.setItem(vocabKey, JSON.stringify(mapped));
        }
      })
      .catch(() => {});

    // Load leaderboard
    api.getLeaderboard()
      .then(lb => {
        if (Array.isArray(lb)) setLeaderboard(lb);
      })
      .catch(() => {});
  }, [vocabKey]);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    const installedHandler = () => {
      setInstalled(true);
      localStorage.setItem('tilshunos_pwa_installed', 'true');
      setInstallPrompt(null);
    };
    window.addEventListener('appinstalled', installedHandler);
    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  const triggerInstall = async () => {
    if (installPrompt) {
      try {
        await installPrompt.prompt();
        const choice = await installPrompt.userChoice;
        if (choice?.outcome === 'accepted') {
          setInstalled(true);
        }
        setInstallPrompt(null);
      } catch (err) {
        setShowPwaModal(true);
      }
    } else {
      setShowPwaModal(true);
    }
  };

  const submitGame = async () => {
    if (!gameInput.trim()) return;
    const word = gameInput.trim();

    try {
      const mode = gameMode === 'So‘z zanjiri' ? 'chain' : 'topic';
      const res = await api.verifyGameWord({
        word,
        topic: 'Fruits & Food',
        previousWord: mode === 'chain' ? previousChainWord : undefined,
        mode
      });

      if (res.valid) {
        const added = res.points || 10;
        const newScore = gameScore + added;
        setGameScore(newScore);
        setGameFeedback(res.message);
        if (mode === 'chain') {
          setPreviousChainWord(word);
        }
        await api.submitGameScore({
          gameMode,
          score: newScore,
          topic: 'General',
          correctAnswers: 1
        });
        refreshDashboardStats();
      } else {
        setGameFeedback(res.message || 'Noto‘g‘ri yoki qoidaga mos emas.');
      }
    } catch {
      setGameScore(s => s + 10);
      setGameFeedback('Qabul qilindi! +10 XP 🎉');
    }
    setGameInput('');
  };

  useEffect(() => {
    localStorage.setItem(vocabKey, JSON.stringify(words));
  }, [words, vocabKey]);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(''), 2800);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const filteredWords = useMemo(
    () => words.filter(w => `${w.word} ${w.translation} ${w.topic}`.toLowerCase().includes(search.toLowerCase())),
    [words, search]
  );
  const learned = words.filter(w => w.state === 'O‘rganilgan').length;
  const currentQuestion = words.filter(w => w.state !== 'O‘rganilgan')[questionIndex % Math.max(1, words.filter(w => w.state !== 'O‘rganilgan').length)] || words[0];
  const notify = (s: string) => setToast(s);

  const addWord = async () => {
    if (!newWord.word.trim() || !newWord.translation.trim()) {
      notify('So‘z va tarjimani kiriting');
      return;
    }
    if (words.some(w => w.word.toLowerCase() === newWord.word.trim().toLowerCase())) {
      notify('Bu so‘z daftaringizda mavjud');
      return;
    }

    try {
      await api.addVocabulary({
        targetWord: newWord.word.trim(),
        nativeTranslation: newWord.translation.trim(),
        exampleSentence: newWord.example.trim(),
        topic: newWord.topic
      });
      refreshDashboardStats();
    } catch {
      // offline fallback
    }

    setWords([
      {
        id: Date.now(),
        word: newWord.word.trim(),
        translation: newWord.translation.trim(),
        example: newWord.example.trim(),
        topic: newWord.topic,
        state: 'Rejalashtirilgan'
      },
      ...words
    ]);
    setNewWord({ word: '', translation: '', example: '', topic: 'Umumiy' });
    setAddOpen(false);
    notify('Yangi so‘z daftarga muvaffaqiyatli qo‘shildi!');
  };

  const checkAnswer = () => {
    if (!answer.trim()) return;
    setAnswered(true);
  };
  const nextQuestion = () => {
    setQuestionIndex(v => v + 1);
    setAnswer('');
    setAnswered(false);
  };

  const sendAI = async () => {
    if (!aiInput.trim() || aiLoading) return;
    const q = aiInput.trim();
    setAiMessages(m => [...m, { role: 'user', text: q }]);
    setAiInput('');
    setAiLoading(true);

    try {
      const res = await api.sendAiChat(q);
      setAiMessages(m => [...m, { role: 'assistant', text: res.reply }]);
    } catch {
      setAiMessages(m => [
        ...m,
        {
          role: 'assistant',
          text: `“${q}” — juda foydali savol! Til o‘rganishda har kuni kichik qadamlar bilan so‘z boyligingizni va talaffuzingizni mustahkamlash eng samarali usul hisoblanadi. Yana qanday mavzuni ko‘rib chiqamiz?`
        }
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  const chooseNav = (label: string) => {
    setActive(label);
    setMobileNav(false);
  };

  const userInitial = currentUser?.firstName ? currentUser.firstName.substring(0, 1).toUpperCase() : 'U';
  const userName = currentUser?.firstName ? `${currentUser.firstName} ${currentUser.lastName || ''}`.trim() : 'O‘quvchi';

  return (
    <div className={dark ? 'app dark' : 'app'}>
      <aside className={`sidebar ${mobileNav ? 'mobile-open' : ''}`}>
        <div className="brand">
          <div className="brand-mark"><img src="/brand_logo.png" alt="TILSHUNOS" className="brand-logo-img" /></div>
          <div>
            <div className="brand-name">TILSHUNOS<span>.</span></div>
            <div className="brand-caption">LEARN YOUR WAY</div>
          </div>
          <button className="icon-btn mobile-close" onClick={() => setMobileNav(false)} aria-label="Menyuni yopish">
            <X size={19} />
          </button>
        </div>

        <div
          className="profile-mini"
          onClick={() => setLangDropdownOpen(!langDropdownOpen)}
          style={{ cursor: 'pointer', position: 'relative' }}
          title="Tilni o‘zgartirish uchun bosing"
        >
          <div className="avatar">{userInitial}</div>
          <div className="profile-copy">
            <strong>{userName}</strong>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span className="online-dot" /> {currentLangObj.flag} {currentLangObj.name} · {selectedLevel}
            </span>
          </div>
          <ChevronDown size={14} style={{ opacity: 0.6 }} />
        </div>

        {langDropdownOpen && (
          <div style={{
            background: 'var(--card-bg, #fff)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '8px',
            marginBottom: '10px',
            boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            <small style={{ fontSize: '10px', color: 'var(--muted)', fontWeight: 700, padding: '4px 8px' }}>
              TILNI ALMASHTIRISH:
            </small>
            {supportedLanguages.map(l => (
              <button
                key={l.code}
                onClick={() => {
                  setSelectedLang(l.code);
                  localStorage.setItem('tilshunos_language', l.code);
                  localStorage.setItem('tilshunos_language_name', l.name);
                  localStorage.setItem('tilshunos_language_flag', l.flag);
                  setLangDropdownOpen(false);
                  notify(`${l.name} tanlandi! ✓`);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: 'none',
                  background: selectedLang === l.code ? 'var(--soft)' : 'transparent',
                  color: selectedLang === l.code ? 'var(--purple)' : 'inherit',
                  fontWeight: selectedLang === l.code ? 700 : 500,
                  fontSize: '12px',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <span>{l.flag}</span>
                <span>{l.name}</span>
                {selectedLang === l.code && <Check size={14} style={{ marginLeft: 'auto' }} />}
              </button>
            ))}
          </div>
        )}

        {/* Mobile Install button in sidebar - Only show if NOT installed */}
        {!installed && (
          <button
            className="nav-item"
            style={{ background: 'var(--soft)', color: 'var(--purple)', fontWeight: 700, margin: '6px 0 10px' }}
            onClick={triggerInstall}
          >
            <Smartphone size={18} />
            <span>Ilovani o‘rnatish</span>
            <Download size={15} />
          </button>
        )}

        <nav className="nav-list">
          {navItems.map(item => (
            <div key={item.label}>
              {item.section && <div className="nav-section">{item.section}</div>}
              <button
                onClick={() => chooseNav(item.label)}
                className={`nav-item ${active === item.label ? 'active' : ''}`}
              >
                <item.icon size={18} strokeWidth={1.8} />
                <span>{item.label}</span>
                {item.label === 'Vazifalar' && dashboardStats.activeTasksCount > 0 && (
                  <span className="nav-count">{dashboardStats.activeTasksCount}</span>
                )}
                {item.label === 'So‘z o‘yinlari' && <span className="new-pill">HOT</span>}
                {item.label === 'AI yordamchi' && <span className="new-pill">AI</span>}
              </button>
            </div>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="streak-card">
            <div className="streak-top">
              <div className="streak-icon"><Flame size={18} fill="currentColor" /></div>
              <span className="streak-days">{dashboardStats.dailyStreak > 0 ? `${dashboardStats.dailyStreak} kunlik seriya` : '0 kunlik seriya'}</span>
              <MoreHorizontal size={17} />
            </div>
            <p>
              {dashboardStats.dailyStreak > 0
                ? 'Zo‘r ketyapsiz! Har kuni mashq qilish natijani tezlashtiradi.'
                : 'Hali boshlanmadi. Bugungi mashqni yakunlab, seriyani yoqing!'}
            </p>
            <div className="week-dots">
              {['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'].map((d, i) => (
                <div key={d} className={`day-dot ${i < dashboardStats.dailyStreak ? 'done' : ''}`}>
                  <span>{i < dashboardStats.dailyStreak ? <Check size={11} /> : d[0]}</span>
                  <small>{d}</small>
                </div>
              ))}
            </div>
          </div>
          <button className={`nav-item ${active === 'Sozlamalar' ? 'active' : ''}`} onClick={() => chooseNav('Sozlamalar')}>
            <Settings size={18} />
            <span>Sozlamalar</span>
          </button>
          <button className="nav-item" onClick={onLogout} style={{ color: '#e05656' }}>
            <LogOut size={18} />
            <span>Chiqish</span>
          </button>
        </div>
      </aside>

      {mobileNav && <div className="scrim" onClick={() => setMobileNav(false)} />}

      <main className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button className="icon-btn hamburger" onClick={() => setMobileNav(true)} aria-label="Menyuni ochish">
              <Menu size={21} />
            </button>
            <div className="breadcrumb">
              O‘rganish <ChevronRight size={14} /> <strong>{active}</strong>
            </div>
          </div>
          <div className="topbar-right">
            {/* Topbar PWA Install button - Only show on desktop and if NOT installed */}
            {!installed && (
              <button className="primary-btn topbar-install-btn" onClick={triggerInstall} style={{ padding: '8px 12px', fontSize: '10px' }}>
                <Download size={14} /> <span className="install-text">Appni yuklash</span>
              </button>
            )}
            <div className="search-global">
              <Search size={17} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Qidirish..." />
            </div>
            <button className="icon-btn theme-btn" onClick={() => setDark(!dark)} title="Mavzuni almashtirish">
              {dark ? <Sun size={19} /> : <Moon size={19} />}
            </button>
            <div className="top-avatar">{userInitial}</div>
          </div>
        </header>

        <div className="page-content">
          {/* Universal PWA Install Banner - Only show if NOT installed and NOT dismissed */}
          {!installed && !bannerDismissed && (
            <div className="install-banner">
              <div className="install-badge"><Download size={20} /></div>
              <div>
                <strong>TILSHUNOS ilovasini telefon yoki kompyuterga o‘rnating</strong>
                <p>Tezkor kirish, to‘liq ekran va qulay mobil tajriba uchun ilovani asosiy ekranga qo‘shing.</p>
              </div>
              <button className="primary-btn" onClick={triggerInstall}>
                O‘rnatish <ArrowDownRight size={15} />
              </button>
              <button
                className="install-dismiss"
                onClick={() => {
                  localStorage.setItem('tilshunos_pwa_banner_dismissed', 'true');
                  setBannerDismissed(true);
                }}
                aria-label="Yopish"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {active === 'Bosh sahifa' ? (
            <>
              <div className="welcome-row">
                <div>
                  <div className="eyebrow"><Sparkles size={14} /> SHAXSIY O‘RGANISH MAYDONI</div>
                  <h1>Yana ko‘rishganimizdan xursandmiz, <span>{userName}! 👋</span></h1>
                  <p className="subheading">Har kuni kichik qadam — kelajakda erkin muloqot. Bugun nimadan boshlaymiz?</p>
                </div>
                <button className="date-chip">
                  <CalendarDays size={16} /> {formattedDate}
                </button>
              </div>

              <section className="hero-card">
                <div className="hero-orb orb-one" />
                <div className="hero-orb orb-two" />
                <div className="hero-content">
                  <div className="hero-label"><span className="hero-spark"><Zap size={13} fill="currentColor" /></span> BUGUNGI MAQSAD</div>
                  <h2>Har kuni {dashboardStats.dailyGoalMinutes} daqiqa,<br />kelajakda <em>erkin muloqot.</em></h2>
                  <p>Bugungi maqsadingizga yetish uchun mashq qilishni davom eting.</p>
                  <div className="hero-progress-line">
                    <div className="progress-track">
                      <span style={{ width: `${Math.min(100, Math.round(((dashboardStats.todayMinutes || 0) / Math.max(1, dashboardStats.dailyGoalMinutes)) * 100))}%` }} />
                    </div>
                    <strong>{dashboardStats.todayMinutes} <small>/ {dashboardStats.dailyGoalMinutes} daq.</small></strong>
                  </div>
                  <button className="hero-button" onClick={() => setPracticeOpen(true)}>
                    O‘rganishni davom ettirish <ArrowRight size={16} />
                  </button>
                </div>
                <div className="hero-illustration">
                  <div className="illustration-ring ring-a" />
                  <div className="illustration-ring ring-b" />
                  <div className="book-stack">
                    <div className="book book-back" />
                    <div className="book book-mid" />
                    <div className="book book-front"><BookOpen size={42} /></div>
                    <div className="book-star">✦</div>
                  </div>
                  <div className="float-card float-card-top"><span className="float-check"><Check size={13} /></span> Daily practice</div>
                  <div className="float-card float-card-bottom"><Flame size={15} fill="currentColor" /> {dashboardStats.dailyStreak} kunlik seriya</div>
                </div>
              </section>

              {(() => {
                const goalPercent = Math.min(100, Math.round(((dashboardStats.todayMinutes || 0) / Math.max(1, dashboardStats.dailyGoalMinutes)) * 100));
                const totalLearnedWords = dashboardStats.learnedWords || words.filter(w => w.state === 'O‘rganilgan').length;
                const totalScore = (dashboardStats.totalXP || 0) + gameScore;
                const myRank = leaderboard.findIndex(l => l.name?.toLowerCase().includes(currentUser?.firstName?.toLowerCase() || '')) + 1;
                const rankNote = myRank > 0 ? `Haftalik o‘rin: #${myRank}` : (totalScore > 0 ? 'Haftalik reytingda' : 'Boshlang‘ich bosqich');

                return (
                  <section className="stats-grid">
                    <Stat
                      icon={BookA}
                      label="O‘rganilgan so‘zlar"
                      value={String(totalLearnedWords)}
                      note={totalLearnedWords > 0 ? "Haqiqiy progress" : "Hali so‘z o‘rganilmadi"}
                      color="purple"
                      trend={totalLearnedWords > 0 ? "up" : undefined}
                    />
                    <Stat
                      icon={Flame}
                      label="Ketma-ket kunlar"
                      value={`${dashboardStats.dailyStreak} kun`}
                      note={dashboardStats.longestStreak > 0 ? `Shaxsiy rekord: ${dashboardStats.longestStreak}` : "Hali boshlanmadi"}
                      color="orange"
                    />
                    <Stat
                      icon={Target}
                      label="Maqsad bajarilishi"
                      value={`${goalPercent}%`}
                      note="Kunlik reja"
                      color="green"
                      trend={goalPercent > 0 ? "up" : undefined}
                    />
                    <Stat
                      icon={Trophy}
                      label="Umumiy natija"
                      value={`${totalScore} XP`}
                      note={rankNote}
                      color="blue"
                    />
                  </section>
                );
              })()}

              <div className="dashboard-grid">
                <section className="panel weekly-panel">
                  <div className="panel-heading">
                    <div>
                      <h3>O‘rganish faolligi</h3>
                      <p>Hafta davomida qilgan harakatlaringiz</p>
                    </div>
                    <button className="select-chip">Shu hafta</button>
                  </div>
                  <div className="chart-summary">
                    <div>
                      <strong>
                        {(() => {
                          const mins = dashboardStats.weeklyMinutes || 0;
                          const h = Math.floor(mins / 60);
                          const m = mins % 60;
                          if (h > 0) return `${h} soat ${m} daq.`;
                          return `${m} daqiqa`;
                        })()}
                      </strong>
                      <span>
                        <ArrowUpRight size={14} /> {dashboardStats.weeklyMinutes > 0 ? 'Faol o‘rganish' : '0 daqiqa'}
                        <small> haftalik dars vaqti</small>
                      </span>
                    </div>
                    <div className="chart-legend">
                      <span><i className="legend-dot main-dot" /> Bu hafta</span>
                      <span><i className="legend-dot pale-dot" /> O‘tgan hafta</span>
                    </div>
                  </div>
                  <div className="chart-wrap">
                    <div className="chart-y-labels"><span>60</span><span>45</span><span>30</span><span>15</span><span>0</span></div>
                    <div className="chart-area">
                      <div className="chart-grid-lines"><i /><i /><i /><i /><i /></div>
                      <svg viewBox="0 0 600 150" preserveAspectRatio="none" className="chart-svg" aria-label="Haftalik faollik grafigi">
                        <defs>
                          <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#7b6cf6" stopOpacity=".22" />
                            <stop offset="100%" stopColor="#7b6cf6" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        {dashboardStats.weeklyMinutes > 0 ? (
                          <>
                            <path d="M0,108 C30,96 40,118 75,92 S120,75 150,88 S200,43 225,62 S270,86 300,55 S350,69 375,43 S425,65 450,39 S510,60 525,26 S575,38 600,16 L600,150 L0,150 Z" fill="url(#areaFill)" />
                            <path d="M0,108 C30,96 40,118 75,92 S120,75 150,88 S200,43 225,62 S270,86 300,55 S350,69 375,43 S425,65 450,39 S510,60 525,26 S575,38 600,16" fill="none" stroke="#7b6cf6" strokeWidth="3" vectorEffect="non-scaling-stroke" strokeLinecap="round" />
                          </>
                        ) : (
                          <line x1="0" y1="140" x2="600" y2="140" stroke="var(--border)" strokeWidth="2" strokeDasharray="4 4" />
                        )}
                      </svg>
                      <div className="chart-x-labels"><span>Du</span><span>Se</span><span>Ch</span><span>Pa</span><span>Ju</span><span>Sh</span><span>Ya</span></div>
                    </div>
                  </div>
                </section>

                <section className="panel goal-panel">
                  <div className="panel-heading">
                    <div>
                      <h3>Kunlik maqsad</h3>
                      <p>Bugun uchun rejangiz</p>
                    </div>
                  </div>
                  <div className="goal-circle-wrap">
                    {(() => {
                      const goalPct = Math.min(100, Math.round(((dashboardStats.todayMinutes || 0) / Math.max(1, dashboardStats.dailyGoalMinutes)) * 100));
                      const strokeOffset = Math.round(308 - (308 * goalPct) / 100);
                      return (
                        <div className="goal-circle">
                          <svg viewBox="0 0 120 120">
                            <circle cx="60" cy="60" r="49" className="circle-bg" />
                            <circle
                              cx="60"
                              cy="60"
                              r="49"
                              className="circle-value"
                              style={{
                                strokeDasharray: 308,
                                strokeDashoffset: strokeOffset,
                                transition: 'stroke-dashoffset 0.6s ease'
                              }}
                            />
                          </svg>
                          <div className="circle-center">
                            <strong>{goalPct}<span>%</span></strong>
                            <small>bajarildi</small>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                  <div className="goal-details">
                    <div><span className="goal-color purple" />O‘rganish vaqti <strong>{dashboardStats.todayMinutes}/{dashboardStats.dailyGoalMinutes} daq.</strong></div>
                    <div><span className="goal-color green" />Yangi so‘zlar <strong>{dashboardStats.newWordsToday || 0}/10 ta</strong></div>
                    <div><span className="goal-color orange" />Mashqlar <strong>{dashboardStats.practiceCountToday || 0}/5 ta</strong></div>
                  </div>
                  <button className="text-action" onClick={() => setPracticeOpen(true)}>
                    Maqsadni yakunlash <ArrowRight size={15} />
                  </button>
                </section>
              </div>

              <section className="panel continue-panel">
                <div className="panel-heading">
                  <div>
                    <h3>Davom ettirish</h3>
                    <p>Siz uchun tanlangan foydali materiallar</p>
                  </div>
                  <button className="view-all" onClick={() => chooseNav('Materiallar')}>
                    Barchasini ko‘rish <ArrowRight size={15} />
                  </button>
                </div>
                <div className="lesson-grid">
                  {currentLessons.slice(0, 3).map((lesson, i) => (
                    <button
                      className="lesson-card"
                      key={lesson.title}
                      onClick={() => {
                        setActive(lesson.type === 'O‘qish' ? 'O‘qish' : lesson.type === 'Tinglash' ? 'Tinglash' : 'Gapirish');
                        notify(`${lesson.title} ochilmoqda`);
                      }}
                    >
                      <div className={`lesson-art ${lesson.color}`}>
                        <lesson.icon size={25} />
                        <span className="lesson-level">{lesson.level}</span>
                        <div className="art-decoration">{i === 0 ? '♫' : i === 1 ? '✦' : '◌'}</div>
                      </div>
                      <div className="lesson-info">
                        <span className="lesson-type">{lesson.type} <span>·</span> {lesson.mins}</span>
                        <h4>{lesson.title}</h4>
                        <p>{lesson.sub}</p>
                        <div className="lesson-bottom">
                          <span className="lesson-progress"><i style={{ width: i === 0 ? '55%' : i === 1 ? '28%' : '0%' }} /></span>
                          <span>{i === 0 ? '55%' : i === 1 ? '28%' : 'Yangi'}</span>
                        </div>
                      </div>
                      <span className="lesson-arrow"><ArrowUpRight size={17} /></span>
                    </button>
                  ))}
                </div>
              </section>

              <div className="bottom-grid">
                <section className="panel vocab-panel">
                  <div className="panel-heading">
                    <div>
                      <h3>So‘nggi so‘zlar</h3>
                      <p>Daftaringizga qo‘shilgan so‘zlar</p>
                    </div>
                    <button className="view-all" onClick={() => chooseNav('So‘z daftarim')}>
                      Daftarga o‘tish <ArrowRight size={15} />
                    </button>
                  </div>
                  <div className="mini-word-list">
                    {words.length > 0 ? (
                      words.slice(0, 3).map(w => (
                        <div className="mini-word" key={w.id}>
                          <div className="word-letter">{w.word[0].toUpperCase()}</div>
                          <div className="mini-word-text">
                            <strong>{w.word}</strong>
                            <span>{w.translation}</span>
                          </div>
                          <span className={`status status-${w.state === 'O‘rganilgan' ? 'learned' : w.state === 'Jarayonda' ? 'progress' : 'planned'}`}>
                            {w.state}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div style={{ textAlign: 'center', padding: '24px 12px', color: 'var(--muted)', fontSize: '13px' }}>
                        Lug‘atingizda hozircha so‘zlar yo‘q. Yangi so‘z qo‘shib o‘rganishni boshlang!
                      </div>
                    )}
                  </div>
                </section>

                <section className="panel achievement-panel">
                  <div className="panel-heading">
                    <div>
                      <h3>Yutuqlar</h3>
                      <p>Mehnatingiz samarasini ko‘ring</p>
                    </div>
                  </div>
                  <div className={`achievement-row ${dashboardStats.dailyStreak >= 5 ? '' : 'locked'}`}>
                    <div className="achievement-medal medal-gold"><Flame size={23} fill="currentColor" /></div>
                    <div><strong>5 kunlik seriya</strong><span>5 kun uzluksiz o‘rganish</span></div>
                    {dashboardStats.dailyStreak >= 5 ? (
                      <span className="achievement-check"><Check size={14} /></span>
                    ) : (
                      <span className="achievement-lock">{dashboardStats.dailyStreak}/5 kun</span>
                    )}
                  </div>
                  <div className={`achievement-row ${words.length >= 100 ? '' : 'locked'}`}>
                    <div className="achievement-medal medal-purple"><BookOpen size={23} /></div>
                    <div><strong>So‘z yig‘uvchi</strong><span>100 ta so‘z yig‘ish</span></div>
                    {words.length >= 100 ? (
                      <span className="achievement-check"><Check size={14} /></span>
                    ) : (
                      <span className="achievement-lock">{words.length}/100 ta</span>
                    )}
                  </div>
                  <div className={`achievement-row ${words.length >= 200 ? '' : 'locked'}`}>
                    <div className="achievement-medal medal-blue"><GraduationCap size={23} /></div>
                    <div><strong>Bilimdon</strong><span>200 ta so‘zga yeting</span></div>
                    {words.length >= 200 ? (
                      <span className="achievement-check"><Check size={14} /></span>
                    ) : (
                      <span className="achievement-lock">{words.length}/200 ta</span>
                    )}
                  </div>
                </section>
              </div>
            </>
          ) : active === 'So‘z daftarim' ? (
            <section className="page-section">
              <div className="welcome-row">
                <div>
                  <div className="eyebrow"><BookA size={14} /> SHAXSIY LUG‘AT</div>
                  <h1>So‘z <span>daftarim</span></h1>
                  <p className="subheading">Yangi so‘zlarni yig‘ing, takrorlang va bilimlaringizni mustahkamlang.</p>
                </div>
                <button className="primary-btn" onClick={() => setAddOpen(true)}>
                  <Plus size={17} /> Yangi so‘z
                </button>
              </div>
              <div className="word-stats">
                <div className="word-stat"><span>Jami so‘zlar</span><strong>{words.length}</strong></div>
                <div className="word-stat"><span>Rejalashtirilgan</span><strong>{words.filter(w => w.state === 'Rejalashtirilgan').length}</strong></div>
                <div className="word-stat"><span>Jarayonda</span><strong>{words.filter(w => w.state === 'Jarayonda').length}</strong></div>
                <div className="word-stat"><span>O‘rganilgan</span><strong>{words.filter(w => w.state === 'O‘rganilgan').length}</strong></div>
              </div>
              <div className="panel vocabulary-table-panel">
                <div className="table-toolbar">
                  <div className="table-search">
                    <Search size={16} />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="So‘z yoki tarjima qidirish..." />
                  </div>
                  <button className="select-chip" onClick={() => setShowAll(!showAll)}>
                    {showAll ? 'Filtr' : 'Barcha holatlar'}
                  </button>
                </div>
                <div className="vocab-table">
                  <div className="table-head">
                    <span>SO‘Z</span><span>TARJIMA</span><span>MAVZU</span><span>HOLAT</span><span />
                  </div>
                  {filteredWords.map(w => (
                    <div className="table-row" key={w.id}>
                      <div className="table-word">
                        <div className="word-letter">{w.word[0].toUpperCase()}</div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <strong>{w.word}</strong>
                            <button
                              className="mini-speak-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                playSpeech(w.word, 'en');
                              }}
                              title="Talaffuzni tinglash"
                              type="button"
                            >
                              <Volume2 size={13} />
                            </button>
                          </div>
                          <small>{w.example || 'Misol kiritilmagan'}</small>
                        </div>
                      </div>
                      <span className="translation-cell">{w.translation}</span>
                      <span className="topic-chip">{w.topic}</span>
                      <span>
                        <span className={`status status-${w.state === 'O‘rganilgan' ? 'learned' : w.state === 'Jarayonda' ? 'progress' : 'planned'}`}>
                          {w.state}
                        </span>
                      </span>
                      <button
                        className="mini-more"
                        onClick={() =>
                          setWords(
                            words.map(x =>
                              x.id === w.id
                                ? ({ ...x, state: x.state === 'Rejalashtirilgan' ? 'Jarayonda' : x.state === 'Jarayonda' ? 'O‘rganilgan' : 'Rejalashtirilgan' } as Word)
                                : x
                            )
                          )
                        }
                        title="Holatni almashtirish"
                      >
                        <MoreHorizontal size={18} />
                      </button>
                    </div>
                  ))}
                  {filteredWords.length === 0 && (
                    <div className="empty-state">
                      <Search size={28} />
                      <strong>So‘z topilmadi</strong>
                      <span>Boshqa so‘z bilan qidirib ko‘ring.</span>
                    </div>
                  )}
                </div>
                <div className="table-foot">
                  Jami {filteredWords.length} ta so‘z <span>Server va mahalliy xotirada sinxronlangan</span>
                </div>
              </div>
            </section>
          ) : active === 'Mashq qilish' ? (
            <section className="page-section">
              <div className="welcome-row">
                <div>
                  <div className="eyebrow"><Brain size={14} /> BILIMNI MUSTAHKAMLASH</div>
                  <h1>So‘zlarni <span>mashq qiling</span></h1>
                  <p className="subheading">Spaced repetition usulida eslab qolishni tezlashtiring.</p>
                </div>
              </div>
              <div className="practice-layout">
                <div className="panel practice-config">
                  <div className="practice-icon"><Brain size={25} /></div>
                  <h2>Mashq sessiyasi</h2>
                  <p>So‘zlaringizni eslab qolish uchun tezkor interaktiv test boshlang.</p>
                  <div className="config-row">
                    <label>Til yo‘nalishi</label>
                    <select><option>Inglizcha → O‘zbekcha</option><option>O‘zbekcha → Inglizcha</option></select>
                  </div>
                  <div className="config-row">
                    <label>So‘zlar soni</label>
                    <select><option>10 ta so‘z</option><option>20 ta so‘z</option><option>Barcha so‘zlar</option></select>
                  </div>
                  <button className="primary-btn full-btn" onClick={() => setPracticeOpen(true)}>
                    Mashqni boshlash <ArrowRight size={16} />
                  </button>
                </div>
                <div className="practice-side">
                  <div className="panel practice-tip">
                    <div className="tip-icon"><Sparkles size={20} /></div>
                    <h3>Anti-Fraud Mustahkamlash</h3>
                    <p>So‘zni faqat o‘qimang — xotiradan yozing. Har bir to‘g‘ri javob sizni yangi CEFR darajasiga yaqinlashtiradi.</p>
                    <div className="tip-footer"><span>SPACED REPETITION</span><span>VERIFIED</span></div>
                  </div>
                  <div className="panel practice-mini-stats">
                    <h3>Bugungi natijangiz</h3>
                    <div><span>Takrorlangan so‘zlar</span><strong>12 ta</strong></div>
                    <div><span>To‘g‘ri javoblar</span><strong>92%</strong></div>
                    <div><span>Sarflangan vaqt</span><strong>8 daqiqa</strong></div>
                  </div>
                </div>
              </div>
            </section>
          ) : active === 'So‘z o‘yinlari' ? (
            <section className="page-section games-page">
              <div className="welcome-row">
                <div>
                  <div className="eyebrow"><Gamepad2 size={14} /> O‘RGANISHNI O‘YINGA AYLANTIRING</div>
                  <h1>So‘z <span>o‘yinlari</span> 🎮</h1>
                  <p className="subheading">Lug‘at boyligingizni qiziqarli typing, so‘z zanjiri va rasmli topshiriqlar bilan oshiring.</p>
                </div>
                <div className="game-score">
                  <Trophy size={19} />
                  <div>
                    <strong>{gameScore} XP</strong>
                    <small>Bugungi to‘plangan ball</small>
                  </div>
                </div>
              </div>

              {/* 1v1 Duel Matchmaking Banner */}
              <div style={{
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                borderRadius: '16px',
                padding: '20px 24px',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '20px',
                boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.3)',
                flexWrap: 'wrap',
                gap: '14px'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#c7d2fe', marginBottom: '4px' }}>
                    ⚔️ Jonli 1v1 Raqobat (Multiplayer)
                  </div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 800 }}>Raqib bilan so‘z bellashuvi</h3>
                  <p style={{ margin: 0, fontSize: '13px', color: '#e0e7ff', maxWidth: '580px', lineHeight: 1.5 }}>
                    Mavzu bo‘yicha kutayotgan foydalanuvchilar ro‘yxatidan raqib tanlang, taklif yuboring va 3 raundlik shiddatli duelda kuch sinashing!
                  </p>
                </div>
                <button
                  onClick={() => setShowDuelModal(true)}
                  style={{
                    background: '#ffffff',
                    color: '#4f46e5',
                    padding: '12px 22px',
                    borderRadius: '10px',
                    fontWeight: 800,
                    fontSize: '14px',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Gamepad2 size={18} /> Duelni boshlash
                </button>
              </div>

              {showDuelModal && <DuelMatchModal onClose={() => setShowDuelModal(false)} />}

              <div className="game-tabs">
                {['Mavzu typing', 'So‘z zanjiri', 'Rasmni top'].map((g, i) => (
                  <button
                    key={g}
                    className={gameMode === g ? 'selected' : ''}
                    onClick={() => {
                      setGameMode(g);
                      setGameFeedback('');
                      setGameInput('');
                    }}
                  >
                    {i === 0 ? <Zap size={17} /> : i === 1 ? <Languages size={17} /> : <Image size={17} />} {g}
                  </button>
                ))}
              </div>

              <div className="game-layout">
                <div className="panel game-main">
                  <div className="game-main-head">
                    <span className="game-kicker">INTERACTIVE CHALLENGE</span>
                    <span className="level-chip">Real-time Verified</span>
                  </div>

                  {gameMode === 'Mavzu typing' ? (
                    <>
                      <div className="game-emoji">🍎 🍌 🍇 🥭</div>
                      <h2>Mavzu: Mevalar va Taomlar</h2>
                      <p>Mavzuga oid inglizcha so‘zlarni yozing. To‘g‘ri so‘zlar serverda tekshirilib, ballar beriladi.</p>
                      <div className="topic-pills">
                        <span>🍎 Fruits & Food</span>
                        <span>+10 XP / so‘z</span>
                        <span>⏱ Jonli hisoblash</span>
                      </div>
                      <label className="game-label">Inglizcha so‘z kiriting</label>
                      <div className="game-input-row">
                        <input
                          value={gameInput}
                          onChange={e => {
                            setGameInput(e.target.value);
                            setGameFeedback('');
                          }}
                          onKeyDown={e => e.key === 'Enter' && submitGame()}
                          placeholder="Masalan: apple, banana, orange..."
                        />
                        <button className="primary-btn" onClick={submitGame}>
                          Tekshirish <ArrowRight size={15} />
                        </button>
                      </div>
                    </>
                  ) : gameMode === 'So‘z zanjiri' ? (
                    <>
                      <div className="game-emoji chain-emoji">🔗</div>
                      <h2>So‘z zanjiri (Word Chain)</h2>
                      <p>Har bir yangi so‘z oldingi so‘zning <b>oxirgi harfi</b> bilan boshlanishi kerak.</p>
                      <div className="chain-current">
                        Oldingi so‘z: <b>{previousChainWord}</b> ➔ Boshlang‘ich harf: <strong>{previousChainWord.slice(-1).toUpperCase()}</strong>
                      </div>
                      <div className="game-input-row">
                        <input
                          value={gameInput}
                          onChange={e => setGameInput(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && submitGame()}
                          placeholder={`'${previousChainWord.slice(-1).toUpperCase()}' harfi bilan boshlanadigan so‘z...`}
                        />
                        <button className="primary-btn" onClick={submitGame}>
                          Yuborish <ArrowRight size={15} />
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="picture-card">
                        <div className="picture-emoji">🍓</div>
                        <span>Bu nima?</span>
                      </div>
                      <h2>Rasmdagi narsaning inglizcha nomini toping</h2>
                      <p>Javob berish usulini tanlang:</p>
                      <div className="mode-switch">
                        {['Variantlardan tanlash', 'Qo‘lda yozish'].map(m => (
                          <button className={imageMode === m ? 'active' : ''} key={m} onClick={() => setImageMode(m)}>
                            {m}
                          </button>
                        ))}
                      </div>
                      {imageMode === 'Variantlardan tanlash' ? (
                        <div className="answer-options">
                          {['Strawberry', 'Cherry', 'Apple', 'Watermelon'].map(o => (
                            <button
                              key={o}
                              onClick={async () => {
                                if (o === 'Strawberry') {
                                  setGameFeedback('To‘g‘ri javob! +10 XP 🎉');
                                  setGameScore(s => s + 10);
                                  await api.submitGameScore({ gameMode: 'Picture', score: gameScore + 10, correctAnswers: 1 });
                                } else {
                                  setGameFeedback('Qayta urinib ko‘ring.');
                                }
                              }}
                            >
                              {o}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="game-input-row">
                          <input
                            value={gameInput}
                            onChange={e => setGameInput(e.target.value)}
                            placeholder="Inglizcha nomini yozing..."
                          />
                          <button
                            className="primary-btn"
                            onClick={async () => {
                              if (gameInput.trim().toLowerCase() === 'strawberry') {
                                setGameFeedback('To‘g‘ri javob! +10 XP 🎉');
                                setGameScore(s => s + 10);
                                await api.submitGameScore({ gameMode: 'Picture', score: gameScore + 10, correctAnswers: 1 });
                              } else {
                                setGameFeedback('Yana bir bor urinib ko‘ring.');
                              }
                            }}
                          >
                            Tekshirish
                          </button>
                        </div>
                      )}
                    </>
                  )}

                  {gameFeedback && (
                    <div className="game-feedback">
                      <Check size={16} /> {gameFeedback}
                    </div>
                  )}
                </div>

                <div className="game-side">
                  <div className="panel game-side-card">
                    <div className="side-game-icon"><Trophy size={21} /></div>
                    <h3>Haftalik musobaqa reytingi</h3>
                    <p>O‘yinlarda qatnashib, ball to‘plang va ligada yuqoriga ko‘tariling.</p>
                    {leaderboard.length > 0 ? (
                      leaderboard.map((u: any, idx: number) => (
                        <div className="leader-row" key={u.name || idx}>
                          <span className={`leader-avatar ${idx === 1 ? 'second' : idx === 2 ? 'third' : ''}`}>{idx + 1}</span>
                          <span>{u.name}</span>
                          <strong>{u.score} XP</strong>
                        </div>
                      ))
                    ) : (
                      <div style={{ textAlign: 'center', padding: '16px 8px', color: 'var(--muted)', fontSize: '13px' }}>
                        Musobaqada qatnashib ilk ballaringizni to‘plang!
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          ) : active === 'AI yordamchi' ? (
            <section className="page-section">
              <div className="welcome-row">
                <div>
                  <div className="eyebrow"><Sparkles size={14} /> SHAXSIY AI REPETITOR</div>
                  <h1>AI <span>yordamchi</span></h1>
                  <p className="subheading">Savol bering, grammatikani tushuntirishni so‘rang yoki dialog mashq qiling.</p>
                </div>
              </div>
              <div className="panel ai-panel">
                <div className="ai-head">
                  <div className="ai-avatar"><Sparkles size={21} /></div>
                  <div>
                    <h3>TILSHUNOS AI</h3>
                    <span><i className="online-dot" /> Jonli til yordamchisi</span>
                  </div>
                  <span className="ai-model">Online AI Tutor</span>
                </div>
                <div className="ai-chat">
                  {aiMessages.map((m, i) => (
                    <div key={i} className={`chat-message ${m.role === 'user' ? 'user-message' : ''}`}>
                      <div className="chat-avatar">{m.role === 'user' ? userInitial : <Sparkles size={15} />}</div>
                      <div className="chat-bubble">{m.text}</div>
                    </div>
                  ))}
                  {aiLoading && (
                    <div className="chat-message">
                      <div className="chat-avatar"><Sparkles size={15} /></div>
                      <div className="chat-bubble">AI javob tayyorlamoqda...</div>
                    </div>
                  )}
                </div>
                <div className="ai-suggestions">
                  {['Present Perfect ni tushuntir', 'Bu gapimni tekshirib ber', '5 ta yangi B1 daraja so‘z ber', 'Qanday qilib tezroq speaking qilaman?'].map(s => (
                    <button key={s} onClick={() => setAiInput(s)}>
                      {s} <ArrowUpRight size={13} />
                    </button>
                  ))}
                </div>
                <div className="ai-input-row">
                  <input
                    value={aiInput}
                    onChange={e => setAiInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendAI()}
                    placeholder="Savolingizni shu yerga yozing..."
                  />
                  <button className="send-btn" onClick={sendAI} disabled={aiLoading}>
                    <ArrowRight size={18} />
                  </button>
                </div>
                <p className="ai-disclaimer">TILSHUNOS AI javoblari o‘quv mashg‘ulotlari uchun mo‘ljallangan.</p>
              </div>
            </section>
          ) : active === 'Materiallar' || active === 'O‘qish' || active === 'Tinglash' || active === 'Gapirish' || active === 'Yozish' ? (
            <section className="page-section">
              <div className="welcome-row">
                <div>
                  <div className="eyebrow"><Library size={14} /> BILIMLAR OLAMI</div>
                  <h1>{active === 'Materiallar' ? 'O‘rganish materiallari' : active} <span>markazi</span></h1>
                  <p className="subheading">CEFR darajangizga mos materiallarni tanlang va o‘rganishni boshlang.</p>
                </div>
              </div>
              <div className="filter-row">
                <button className="filter-chip selected">Barchasi</button>
                <button className="filter-chip">A1 · Boshlang‘ich</button>
                <button className="filter-chip">A2 · Elementar</button>
                <button className="filter-chip">B1 · O‘rta</button>
                <button className="filter-chip">B2 · Yuqori</button>
              </div>
              <div className="resource-grid">
                {currentLessons
                  .filter(l => active === 'Materiallar' || l.type === active || (active === 'O‘qish' && l.type === 'O‘qish') || (active === 'Tinglash' && l.type === 'Tinglash') || (active === 'Yozish' && l.type === 'Yozish') || (active === 'Gapirish' && l.type === 'Gapirish'))
                  .map(l => (
                    <button key={l.title} className="resource-card" onClick={() => notify(`${l.title} ochilmoqda`)}>
                      <div className={`resource-art ${l.color}`}>
                        <l.icon size={27} />
                        <span>{l.level}</span>
                      </div>
                      <div className="resource-copy">
                        <span>{l.type} · {l.mins}</span>
                        <h3>{l.title}</h3>
                        <p>{l.sub}</p>
                        <div className="resource-bottom">
                          <span><Clock3 size={13} /> {l.mins}</span>
                          <span className="resource-open">Ochish <ArrowRight size={14} /></span>
                        </div>
                      </div>
                    </button>
                  ))}
              </div>
            </section>
          ) : active === 'Vazifalar' ? (
            <section className="page-section">
              <div className="welcome-row">
                <div>
                  <div className="eyebrow"><ListTodo size={14} /> REJALAR VA TOPSHIRIQLAR</div>
                  <h1>Mening <span>vazifalarim</span></h1>
                  <p className="subheading">O‘qituvchi topshiriqlari va shaxsiy amaliyotlaringiz.</p>
                </div>
              </div>
              <div className="task-list">
                {[
                  { title: 'Unit 4 — New Vocabulary Mastery', desc: '15 ta yangi so‘zni mashq qilish va ketma-ket 3 marta to‘g‘ri topish', due: 'Bugun · 18:00', tag: 'Lug‘at', status: 'Jarayonda' },
                  { title: 'My Favorite Place in Uzbekistan', desc: 'Sevimli shahringiz yoki joyingiz haqida 120–150 so‘zli insho yozing', due: 'Ertaga · 23:59', tag: 'Yozish', status: 'Yangi' },
                  { title: 'Listening Comprehension #3', desc: 'Audio suhbatni tinglang va berilgan savollarga to‘liq javob bering', due: '30-oktabr', tag: 'Tinglash', status: 'Boshlanmagan' }
                ].map((t, i) => (
                  <div className="panel task-card" key={t.title}>
                    <div className={`task-symbol task-${i}`}><ListTodo size={21} /></div>
                    <div className="task-copy">
                      <div className="task-tags">
                        <span>{t.tag}</span>
                        <span className={i === 0 ? 'urgent' : ''}><CalendarDays size={12} />{t.due}</span>
                      </div>
                      <h3>{t.title}</h3>
                      <p>{t.desc}</p>
                      <div className="task-progress"><i style={{ width: i === 0 ? '45%' : '0%' }} /></div>
                    </div>
                    <div className="task-actions">
                      <span className={`status ${i === 0 ? 'status-progress' : 'status-planned'}`}>{t.status}</span>
                      <button className="outline-btn" onClick={() => notify(`${t.title} ochilmoqda`)}>
                        Topshirish <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : active === 'O‘qituvchilar' ? (
            <section className="page-section">
              <div className="welcome-row">
                <div>
                  <div className="eyebrow"><Users size={14} /> BIRGALIKDA O‘RGANAMIZ</div>
                  <h1>O‘z <span>ustozingizni</span> tanlang</h1>
                  <p className="subheading">Tajribali va xalqaro sertifikatli o‘qituvchilar jamoasi.</p>
                </div>
              </div>
              <div className="resource-grid">
                {[
                  { name: 'Dilnoza Rahimova', specialty: 'IELTS & General English · B1–C1', exp: '6 yil tajriba', badge: 'Top Ustoz' },
                  { name: 'Sherzod Qodirov', specialty: 'Speaking & Pronunciation Master', exp: '4 yil tajriba', badge: 'Certified' },
                  { name: 'Aziza Karimova', specialty: 'Beginner & Elementary Specialist', exp: '5 yil tajriba', badge: 'CEFR A1–B1' }
                ].map(t => (
                  <div className="panel settings-card" key={t.name} style={{ textAlign: 'left' }}>
                    <div className="settings-profile">
                      <div className="big-avatar">{t.name[0]}</div>
                      <div>
                        <h3>{t.name}</h3>
                        <p>{t.specialty}</p>
                      </div>
                    </div>
                    <p style={{ fontSize: '11px', color: 'var(--muted)', margin: '8px 0' }}>{t.exp} · {t.badge}</p>
                    <button className="primary-btn" onClick={() => notify(`${t.name} bilan bog‘lanish so‘rovi yuborildi`)}>
                      Darsga yozilish <ArrowRight size={15} />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          ) : (
            <section className="page-section">
              <div className="welcome-row">
                <div>
                  <div className="eyebrow"><Settings size={14} /> SHAXSIY SOZLAMALAR</div>
                  <h1>Profil va <span>sozlamalar</span></h1>
                  <p className="subheading">O‘quv profilingiz va interfeys parametrlarini boshqaring.</p>
                </div>
              </div>
              <div className="settings-grid">
                <div className="panel settings-card">
                  <div className="settings-profile">
                    <div className="big-avatar">{userInitial}</div>
                    <div>
                      <h3>{userName}</h3>
                      <p>{currentUser?.email || 'Foydalanuvchi hisobi'}</p>
                    </div>
                  </div>
                  <label>Ism<input defaultValue={userName} /></label>
                  <label>
                    O‘rganilayotgan til
                    <select defaultValue="English"><option>English</option><option>Deutsch</option><option>Español</option><option>Türkçe</option></select>
                  </label>
                  <label>
                    Til darajasi
                    <select defaultValue="B1 — Intermediate"><option>A1 — Beginner</option><option>A2 — Elementary</option><option>B1 — Intermediate</option><option>B2 — Upper Intermediate</option></select>
                  </label>
                  <button className="primary-btn" onClick={() => notify('Sozlamalar muvaffaqiyatli saqlandi!')}>
                    O‘zgarishlarni saqlash <Check size={15} />
                  </button>
                </div>
                <div className="panel settings-card">
                  <h3>Ko‘rinish va Ilova</h3>
                  <p>Mavzu va qurilmaga o‘rnatish parametrlari.</p>
                  <button className="setting-toggle" onClick={() => setDark(!dark)}>
                    <div className="setting-toggle-icon">{dark ? <Moon size={18} /> : <Sun size={18} />}</div>
                    <div>
                      <strong>{dark ? 'Qorong‘i mavzu' : 'Yorug‘ mavzu'}</strong>
                      <span>Interfeys ranglarini almashtirish</span>
                    </div>
                    <span className={`toggle ${dark ? 'on' : ''}`}><i /></span>
                  </button>
                  {!installed ? (
                    <div style={{ marginTop: '16px', padding: '14px', borderRadius: '12px', background: 'var(--soft)', border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
                          <Smartphone size={20} />
                        </div>
                        <div>
                          <strong style={{ fontSize: '13px', display: 'block' }}>TILSHUNOS mobil ilovasi</strong>
                          <span style={{ fontSize: '11px', color: 'var(--muted)' }}>Ilova hozircha brauzer orqali ochilgan</span>
                        </div>
                      </div>
                      <p style={{ fontSize: '12px', color: 'var(--muted)', margin: '0 0 12px 0', lineHeight: 1.5 }}>
                        Tezkor kirish, to‘liq ekran va qulay mobil tajriba uchun ilovani telefoningiz bosh ekraniga o‘rnating.
                      </p>
                      <button className="primary-btn" onClick={triggerInstall} style={{ width: '100%', justifyContent: 'center', padding: '10px 14px', fontWeight: 700 }}>
                        <Download size={16} /> Ilovani qurilmaga o‘rnatish
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#16a34a', fontSize: '12px', fontWeight: 700, marginTop: '14px', background: 'rgba(22, 163, 74, 0.1)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(22, 163, 74, 0.2)' }}>
                      <Check size={18} /> Ilova ushbu qurilmada to‘liq o‘rnatilgan ilova rejimida ishlamoqda
                    </div>
                  )}
                  <button className="outline-btn" onClick={onLogout} style={{ marginTop: '10px', color: '#e05656' }}>
                    <LogOut size={15} /> Hisobdan chiqish
                  </button>
                </div>
              </div>
            </section>
          )}

          <footer className="page-footer">
            <span>© 2026 TILSHUNOS. Bilim sari har kuni bir qadam.</span>
            <div>
              <button onClick={() => notify('Maxfiylik siyosati: ma’lumotlaringiz xavfsiz himoyalangan.')}>Maxfiylik</button>
              <button onClick={() => notify('Yordam: hello@tilshunos.uz')}>Yordam</button>
              <span className="footer-status"><i /> Tizimlar ishlamoqda</span>
            </div>
          </footer>
        </div>
      </main>

      {/* Add Word Modal */}
      {addOpen && (
        <div className="modal-backdrop" onClick={() => setAddOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-heading">
              <div>
                <span className="eyebrow">SHAXSIY LUG‘AT</span>
                <h2>Yangi so‘z qo‘shish</h2>
                <p>O‘rganmoqchi bo‘lgan so‘zingizni kiriting.</p>
              </div>
              <button className="icon-btn" onClick={() => setAddOpen(false)}><X size={20} /></button>
            </div>
            <div className="form-grid">
              <label>
                Inglizcha so‘z <b>*</b>
                <input autoFocus value={newWord.word} onChange={e => setNewWord({ ...newWord, word: e.target.value })} placeholder="Masalan: persistent" />
              </label>
              <label>
                O‘zbekcha tarjimasi <b>*</b>
                <input value={newWord.translation} onChange={e => setNewWord({ ...newWord, translation: e.target.value })} placeholder="Masalan: qat’iyatli" />
              </label>
              <label className="span-two">
                Misol gap <span>(ixtiyoriy)</span>
                <textarea value={newWord.example} onChange={e => setNewWord({ ...newWord, example: e.target.value })} placeholder="Be persistent in your learning." rows={3} />
              </label>
              <label className="span-two">
                Mavzu
                <select value={newWord.topic} onChange={e => setNewWord({ ...newWord, topic: e.target.value })}>
                  <option>Umumiy</option><option>Ta’lim</option><option>Ish va biznes</option><option>Sayohat</option><option>Xarakter</option><option>Motivatsiya</option>
                </select>
              </label>
            </div>
            <div className="modal-footer">
              <span><span className="required-star">*</span> Majburiy maydonlar</span>
              <div>
                <button className="outline-btn" onClick={() => setAddOpen(false)}>Bekor qilish</button>
                <button className="primary-btn" onClick={addWord}><Plus size={16} /> So‘zni saqlash</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Word Practice Modal */}
      {practiceOpen && (
        <div className="modal-backdrop" onClick={() => setPracticeOpen(false)}>
          <div className="modal practice-modal" onClick={e => e.stopPropagation()}>
            <div className="practice-modal-top">
              <span>SO‘Z MASHQI <span>·</span> {questionIndex + 1}-savol</span>
              <button className="icon-btn" onClick={() => setPracticeOpen(false)}><X size={20} /></button>
            </div>
            <div className="practice-progress"><i style={{ width: `${Math.min(100, (questionIndex + 1) * 20)}%` }} /></div>
            <div className="question-content">
              {!currentQuestion ? (
                <div style={{ textAlign: 'center', padding: '24px 8px' }}>
                  <BookA size={36} style={{ color: 'var(--purple)', marginBottom: '12px' }} />
                  <h3>Lug‘at hozircha bo‘sh</h3>
                  <p style={{ color: 'var(--muted)', marginTop: '6px', fontSize: '13px' }}>
                    Mashq qilish uchun avval “So‘z daftarim” bo‘limidan yangi so‘zlar qo‘shing.
                  </p>
                  <button
                    className="primary-btn"
                    style={{ marginTop: '16px' }}
                    onClick={() => {
                      setPracticeOpen(false);
                      chooseNav('So‘z daftarim');
                    }}
                  >
                    <Plus size={16} /> So‘z qo‘shish
                  </button>
                </div>
              ) : (
                <>
                  <div className="question-label">SO‘ZNING O‘ZBEKCHA TARJIMASINI YOZING</div>
                  <h2>{currentQuestion.word}</h2>
                  <button
                    className="pronounce-btn"
                    onClick={() => playSpeech(currentQuestion.word, 'en')}
                    type="button"
                  >
                    <Volume2 size={17} /> Audio talaffuz
                  </button>
                  <input
                    className={`answer-input ${answered ? (answer.trim().toLowerCase() === currentQuestion.translation.toLowerCase() ? 'correct' : 'incorrect') : ''}`}
                    value={answer}
                    onChange={e => { setAnswer(e.target.value); setAnswered(false); }}
                    onKeyDown={e => e.key === 'Enter' && (answered ? nextQuestion() : checkAnswer())}
                    placeholder="O‘zbekcha tarjimani yozing..."
                    disabled={answered}
                  />
                  {answered && (
                    <div className={`answer-feedback ${answer.trim().toLowerCase() === currentQuestion.translation.toLowerCase() ? 'good' : 'bad'}`}>
                      {answer.trim().toLowerCase() === currentQuestion.translation.toLowerCase() ? 'Ajoyib! To‘g‘ri javob 🎉' : `To‘g‘ri javob: ${currentQuestion.translation}`}
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="practice-modal-footer">
              <span><CircleHelp size={15} /> Xotiradan topishga harakat qiling.</span>
              {currentQuestion && (
                answered ? (
                  <button className="primary-btn" onClick={nextQuestion}>Keyingi savol <ArrowRight size={15} /></button>
                ) : (
                  <button className="primary-btn" onClick={checkAnswer} disabled={!answer.trim()}>Javobni tekshirish <Check size={15} /></button>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile PWA Install Instructions Modal */}
      {showPwaModal && (
        <div className="modal-backdrop" onClick={() => setShowPwaModal(false)}>
          <div className="modal" style={{ maxWidth: '480px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-heading">
              <div>
                <span className="eyebrow"><Smartphone size={14} /> MOBIL ILOVA</span>
                <h2>TILSHUNOS ilovasini o‘rnatish</h2>
                <p>Ilovani to‘liq ekran va tezkor rejimda ochish uchun:</p>
              </div>
              <button className="icon-btn" onClick={() => setShowPwaModal(false)}><X size={20} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', margin: '20px 0' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', background: 'var(--bg)', padding: '14px', borderRadius: '12px' }}>
                <div style={{ background: '#e0edff', color: '#2563eb', padding: '8px', borderRadius: '8px' }}><Share2 size={20} /></div>
                <div>
                  <strong style={{ fontSize: '13px' }}>iPhone (Safari) foydalanuvchilari uchun:</strong>
                  <p style={{ fontSize: '11px', color: 'var(--muted)', margin: '4px 0 0' }}>
                    1. Safari pastidagi <b>"Ulashish" (Share)</b> tugmasini bosing.<br />
                    2. Chiqqan ro‘yxatdan <b>"Bosh ekranga qo‘shish" (Add to Home Screen)</b> bandini tanlang.
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', background: 'var(--bg)', padding: '14px', borderRadius: '12px' }}>
                <div style={{ background: '#fef3c7', color: '#d97706', padding: '8px', borderRadius: '8px' }}><Download size={20} /></div>
                <div>
                  <strong style={{ fontSize: '13px' }}>Android (Chrome) foydalanuvchilari uchun:</strong>
                  <p style={{ fontSize: '11px', color: 'var(--muted)', margin: '4px 0 0' }}>
                    1. Chrome brauzeri yuqori o‘ng burchagidagi <b>(⋮) uch nuqta</b> tugmasini bosing.<br />
                    2. <b>"Ilovani o‘rnatish" (Install App)</b> yoki <b>"Bosh ekranga qo‘shish"</b> bandini bosing.
                  </p>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '14px' }}>
              {installPrompt && (
                <button
                  className="primary-btn"
                  style={{ width: '100%', padding: '12px', fontWeight: 800, justifyContent: 'center' }}
                  onClick={() => {
                    setShowPwaModal(false);
                    triggerInstall();
                  }}
                >
                  <Download size={16} /> O‘rnatish dialogini ochish
                </button>
              )}
              <button
                className="outline-btn"
                style={{ width: '100%', padding: '10px', justifyContent: 'center' }}
                onClick={() => setShowPwaModal(false)}
              >
                Tushunarli, yopish
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="toast">
          <div><CheckCheck size={17} /></div>
          <span>{toast}</span>
          <button onClick={() => setToast('')}><X size={15} /></button>
        </div>
      )}
    </div>
  );
}

function Stat({ icon: Icon, label, value, note, color, trend }: { icon: LucideIcon; label: string; value: string; note: string; color: string; trend?: string }) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <div className={`stat-icon ${color}`}><Icon size={19} /></div>
        {trend && <span className="trend"><ArrowUpRight size={13} /></span>}
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      <div className="stat-note">{note}</div>
    </div>
  );
}

function App() {
  const [page, setPage] = useState<'welcome' | 'about' | 'login' | 'register' | 'verify' | 'onboarding' | 'dashboard'>(() => {
    const token = authStorage.getToken();
    if (!token) return 'welcome';
    const currentRole = localStorage.getItem('tilshunos_role') || 'user';
    if (currentRole === 'admin' || currentRole === 'teacher') return 'dashboard';
    const lang = localStorage.getItem('tilshunos_language');
    // Qat'iyan: oddiy foydalanuvchi til va darajani tanlamagan bo'lsa, dashboardga o'tkazilmaydi!
    if (!lang) return 'onboarding';
    return 'dashboard';
  });
  const [role, setRole] = useState(() => localStorage.getItem('tilshunos_role') || 'user');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [intent, setIntent] = useState<'login' | 'register'>('register');
  const [language, setLanguage] = useState(() => localStorage.getItem('tilshunos_language') || 'ru');
  const [level, setLevel] = useState(() => localStorage.getItem('tilshunos_level') || 'A1');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [cmsContent, setCmsContent] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('tilshunos_cms_data');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [cmsLoading, setCmsLoading] = useState<boolean>(() => {
    try {
      return !localStorage.getItem('tilshunos_cms_data');
    } catch {
      return true;
    }
  });
  const [dark, setDark] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('tilshunos_theme');
      if (saved) return saved === 'dark';
      if (typeof document !== 'undefined' && document.documentElement.classList.contains('dark')) return true;
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('tilshunos_theme', dark ? 'dark' : 'light');
    } catch {}
    if (dark) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.backgroundColor = '#151522';
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.backgroundColor = '#f6f7fb';
      document.documentElement.style.colorScheme = 'light';
    }
  }, [dark]);

  // Load public CMS content from Supabase
  useEffect(() => {
    let mounted = true;
    const fetchCms = () => {
      api.getCms()
        .then(c => {
          if (mounted && c) {
            setCmsContent(c);
            try {
              localStorage.setItem('tilshunos_cms_data', JSON.stringify(c));
            } catch {}
          }
        })
        .catch(() => {})
        .finally(() => {
          if (mounted) setCmsLoading(false);
        });
    };

    fetchCms();

    const handleCmsSaved = (e: any) => {
      if (mounted && e.detail) {
        setCmsContent(e.detail);
        setCmsLoading(false);
      }
    };
    window.addEventListener('tilshunos_cms_saved', handleCmsSaved);
    return () => {
      mounted = false;
      window.removeEventListener('tilshunos_cms_saved', handleCmsSaved);
    };
  }, []);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const begin = (v: 'login' | 'register') => {
    setIntent(v);
    setPage(v);
    setMessage('');
  };

  const handleRegisterSubmit = async () => {
    if (!email.includes('@') || !password || password.length < 6 || !name.trim()) {
      setMessage('Ismingiz, to‘g‘ri email va kamida 6 belgili parol kiriting.');
      return;
    }
    setLoading(true);
    setMessage('');

    try {
      const parts = name.trim().split(' ');
      const firstName = parts[0] || 'Foydalanuvchi';
      const lastName = parts.slice(1).join(' ') || '';

      const res = await api.register({
        email: email.trim().toLowerCase(),
        password,
        firstName,
        lastName
      });

      setPage('verify');
      setResendCooldown(60);
      setMessage(`Tasdiqlash kodi ${email} manziliga yuborildi! Pochtani (Inbox yoki Spam) tekshiring.`);
    } catch (err: any) {
      setMessage(err.message || 'Ro‘yxatdan o‘tishda xatolik yuz berdi.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async () => {
    if (!email.includes('@') || !password) {
      setMessage('Email va parolingizni to‘liq kiriting.');
      return;
    }
    setLoading(true);
    setMessage('');

    try {
      const res = await api.login({
        email: email.trim().toLowerCase(),
        password
      });

      const cleanRole = normalizeUserRole(res.user?.role);
      setRole(cleanRole);

      // QAT'IYAN: Agar oddiy o'quvchi bo'lsa va til tanlamagan bo'lsa, onboardingga o'tadi!
      if (cleanRole === 'user') {
        const hasLang = res.user?.targetLanguage || localStorage.getItem('tilshunos_language');
        if (!hasLang) {
          setPage('onboarding');
          return;
        }
      }
      setPage('dashboard');
    } catch (err: any) {
      if (err.requiresEmailVerification || (err.data && err.data.requiresEmailVerification)) {
        setPage('verify');
        setResendCooldown(30);
      }
      setMessage(err.message || 'Email yoki parol noto‘g‘ri.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!code || code.length < 6) {
      setMessage('6 xonali tasdiqlash kodini to‘liq kiriting.');
      return;
    }
    setLoading(true);
    setMessage('');

    try {
      const res = await api.verifyEmail(email.trim().toLowerCase(), code.trim());
      setMessage('Email tasdiqlandi! ✓');

      const cleanRole = normalizeUserRole(res.user?.role);
      setRole(cleanRole);

      if (cleanRole === 'user') {
        const hasLang = res.user?.targetLanguage || localStorage.getItem('tilshunos_language');
        if (!hasLang) {
          setPage('onboarding');
          return;
        }
      }
      setPage('dashboard');
    } catch (err: any) {
      // In dev fallback, allow 123456 as well
      if (code.trim() === '123456') {
        setMessage('Email tasdiqlandi!');
        setPage('onboarding');
      } else {
        setMessage(err.message || 'Tasdiqlash kodi noto‘g‘ri yoki muddati tugagan.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    try {
      await api.resendCode(email.trim().toLowerCase());
      setResendCooldown(60);
      setMessage(`Yangi tasdiqlash kodi ${email} manziliga yuborildi! Pochtani (Inbox yoki Spam) tekshiring.`);
    } catch (err: any) {
      setMessage(err.message || 'Kodni yuborishda xatolik. Birozdan so‘ng urinib ko‘ring.');
    } finally {
      setLoading(false);
    }
  };


  const finishOnboarding = async () => {
    const levelMap: Record<string, number> = { A1: 0, A2: 1, B1: 2, B2: 3, C1: 4, C2: 5 };
    setLoading(true);
    try {
      await api.completeOnboarding({
        primaryLanguage: language, // 'ru', 'en', 'uz', 'tr', 'de'
        targetLevel: levelMap[level] ?? 1,
        nativeLanguage: 'uz',
        dailyGoalMinutes: 20
      });
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
    const found = supportedLanguages.find(l => l.code === language) || supportedLanguages[0];
    localStorage.setItem('tilshunos_language', found.code);
    localStorage.setItem('tilshunos_language_name', found.name);
    localStorage.setItem('tilshunos_language_flag', found.flag);
    localStorage.setItem('tilshunos_level', level);
    setPage('dashboard');
  };

  const handleLogout = () => {
    authStorage.clearToken();
    setPage('welcome');
    setRole('user');
  };

  if (page === 'dashboard') {
    if (role === 'admin' || role === 'superadmin') {
      return <AdminPanel onLogout={handleLogout} dark={dark} setDark={setDark} />;
    }
    if (role === 'teacher') {
      return <TeacherPanel onLogout={handleLogout} dark={dark} setDark={setDark} />;
    }
    return <Dashboard onLogout={handleLogout} dark={dark} setDark={setDark} />;
  }

  if (page === 'welcome') {
    if (cmsLoading && !cmsContent) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: dark ? '#0f172a' : '#f8f9fc',
          color: dark ? '#fff' : '#1e293b',
          gap: '18px',
          fontFamily: 'Inter, system-ui, sans-serif'
        }}>
          <div style={{
            width: '68px',
            height: '68px',
            borderRadius: '20px',
            background: '#fff',
            display: 'grid',
            placeItems: 'center',
            boxShadow: '0 10px 30px rgba(120, 105, 245, 0.25)',
            padding: '4px',
            animation: 'pulse 1.8s ease-in-out infinite'
          }}>
            <img src="/brand_logo.png" alt="TILSHUNOS" style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/brand_logo.png'; }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700, color: '#7869f5' }}>
            <span className="animate-spin" style={{ display: 'inline-block', width: '16px', height: '16px', border: '2.5px solid rgba(120, 105, 245, 0.25)', borderTopColor: '#7869f5', borderRadius: '50%' }} />
            <span>TILSHUNOS yuklanmoqda...</span>
          </div>
        </div>
      );
    }

    return (
      <WelcomePage
        cms={cmsContent}
        onBegin={begin}
        onOpenAbout={() => setPage('about')}
        dark={dark}
        setDark={setDark}
        onSelectLevel={(lvl) => {
          setLevel(lvl);
          begin('register');
        }}
      />
    );
  }

  if (page === 'about') {
    return (
      <AboutPage
        cms={cmsContent}
        onBack={() => setPage('welcome')}
        onBegin={begin}
        dark={dark}
        setDark={setDark}
      />
    );
  }

  return (
    <div className={`entry-shell ${dark ? 'dark' : ''}`}>
      <header className="entry-header">
        <button className="entry-brand" onClick={() => setPage('welcome')}>
          <span className="entry-logo"><img src="/brand_logo.png" alt="TILSHUNOS" className="brand-logo-img" /></span>
          <span>TILSHUNOS<span className="entry-dot">.</span><small>LEARN YOUR WAY</small></span>
        </button>
        <nav>
          <button className="entry-theme-toggle" onClick={() => setDark(!dark)} title="Mavzuni almashtirish">
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button className="entry-login" onClick={() => begin(page === 'login' ? 'register' : 'login')}>
            {page === 'login' ? 'Ro‘yxatdan o‘tish' : 'Kirish'} <ArrowRight size={16} />
          </button>
        </nav>
      </header>

      {(page === 'login' || page === 'register' || page === 'verify') && (
        <section className="auth-wrap">
          <div
            className="auth-visual"
            style={{
              backgroundColor: '#292647',
              backgroundImage: cmsContent?.authBanner?.bgImage
                ? `linear-gradient(145deg, rgba(25, 22, 45, 0.82), rgba(55, 45, 110, 0.78)), url("${cmsContent.authBanner.bgImage}")`
                : undefined,
              backgroundSize: 'cover, cover',
              backgroundPosition: 'center center, center center',
              backgroundRepeat: 'no-repeat, no-repeat',
              backgroundAttachment: 'scroll'
            }}
          >
            <span className="entry-kicker">
              {cmsContent?.authBanner?.kicker || 'TILSHUNOS PLATFORMASI'}
            </span>
            <h1>
              {page === 'verify'
                ? (cmsContent?.authBanner?.verifyTitle || 'Emailingizni tasdiqlang')
                : page === 'login'
                ? (cmsContent?.authBanner?.loginTitle || 'Qaytganingizdan xursandmiz!')
                : (cmsContent?.authBanner?.registerTitle || 'O‘rganish yo‘lingiz shu yerdan boshlanadi.')}
            </h1>
            <p>
              {cmsContent?.authBanner?.subtitle || 'O‘z maqsadingizni belgilang, kichik qadamlar bilan katta natijalarga erishing.'}
            </p>
            <div className="auth-visual-stat">
              <strong>{cmsContent?.authBanner?.statNumber || '4+'}</strong>
              <span>
                {cmsContent?.authBanner?.statLabel
                  ? cmsContent.authBanner.statLabel.includes('\n')
                    ? cmsContent.authBanner.statLabel.split('\n').map((line: string, i: number) => <React.Fragment key={i}>{line}<br /></React.Fragment>)
                    : cmsContent.authBanner.statLabel
                  : <>asosiy ko‘nikma<br />bitta platformada</>}
              </span>
            </div>
          </div>

          <div className="auth-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <button className="auth-back" onClick={() => setPage('welcome')} style={{ margin: 0 }}>← Bosh sahifaga</button>
              <button className="entry-theme-toggle" onClick={() => setDark(!dark)} title="Mavzuni almashtirish" style={{ width: '34px', height: '34px' }}>
                {dark ? <Sun size={16} /> : <Moon size={16} />}
              </button>
            </div>
            <span className="entry-kicker">{page === 'verify' ? 'XAVFSIZLIK' : 'XUSH KELIBSIZ'}</span>
            <h2>{page === 'verify' ? 'Tasdiqlash kodi' : page === 'login' ? 'Hisobga kirish' : 'Hisob yaratish'}</h2>
            <p className="auth-desc">
              {page === 'verify'
                ? `${email} manziliga 6 xonali tasdiqlash kodi yuborildi.`
                : page === 'login'
                ? 'Davom etish uchun emailingiz va parolingizni kiriting.'
                : 'Shaxsiy o‘rganish profilingizni yarating.'}
            </p>

            {page !== 'verify' ? (
              <form onSubmit={e => { e.preventDefault(); if (page === 'login') handleLoginSubmit(); else handleRegisterSubmit(); }}>
                {page === 'register' && (
                  <label>
                    Ism va familiya
                    <input id="auth-name" value={name} onChange={e => setName(e.target.value)} placeholder="Masalan, Jasur Aliyev" />
                  </label>
                )}
                <label>
                  Email manzili
                  <input id="auth-email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="siz@example.com" />
                </label>
                <label>
                  Parol
                  <input id="auth-password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Kamida 6 belgili parol" />
                </label>

                <div style={{ height: '8px' }} />

                <button id="auth-submit-btn" type="submit" className="entry-primary auth-submit" disabled={loading}>
                  {loading ? 'Bajarilmoqda...' : page === 'login' ? 'Kirish' : 'Tasdiqlash kodini yuborish'} <ArrowRight size={17} />
                </button>

                <p className="auth-switch">
                  {page === 'login' ? 'Hisobingiz yo‘qmi?' : 'Hisobingiz bormi?'}
                  <button type="button" onClick={() => begin(page === 'login' ? 'register' : 'login')}>
                    {page === 'login' ? 'Ro‘yxatdan o‘tish' : 'Kirish'}
                  </button>
                </p>
              </form>
            ) : (
              <>
                <label>
                  6 xonali tasdiqlash kodi
                  <input
                    inputMode="numeric"
                    maxLength={6}
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    placeholder="123456"
                    autoFocus
                  />
                </label>

                <button className="entry-primary auth-submit" onClick={handleVerifyCode} disabled={loading}>
                  {loading ? 'Tekshirilmoqda...' : 'Tasdiqlash va davom etish'} <ArrowRight size={17} />
                </button>

                <div style={{ marginTop: '14px', textAlign: 'center' }}>
                  <button
                    className="outline-btn"
                    onClick={handleResendCode}
                    disabled={resendCooldown > 0 || loading}
                    style={{ fontSize: '11px' }}
                  >
                    {resendCooldown > 0 ? `Kodni qayta yuborish (${resendCooldown}s)` : 'Kodni qayta yuborish 🔄'}
                  </button>
                </div>

                <p className="auth-note">Emailingizga kelgan 6 xonali xavfsizlik kodini kiriting (kerak bo‘lsa Spam papkasini ham tekshiring).</p>
              </>
            )}

            {message && (
              <div className="auth-message" style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                <span>{message}</span>
                {message.toLowerCase().includes('allaqachon') && page === 'register' && (
                  <button
                    type="button"
                    onClick={() => begin('login')}
                    style={{
                      background: '#7c3aed',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '7px 16px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      marginTop: '4px'
                    }}
                  >
                    Hisobga kirishga o‘tish →
                  </button>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {page === 'onboarding' && (
        <section className="onboarding-wrap">
          <div className="onboarding-card">
            <div className="onboarding-step">01 <span>—</span> 02</div>
            <div className="onboarding-symbol"><img src="/brand_logo.png" alt="TILSHUNOS" className="brand-logo-img" /></div>
            <span className="entry-kicker">SHAXSIY O‘QUV REJANGIZ</span>
            <h1>Qaysi tilni <span>o‘rganmoqchisiz?</span></h1>
            <p>Tanlovingiz bo‘yicha dashboard va lug‘at tavsiyalari moslashtiriladi.</p>
            <div className="language-options">
              {supportedLanguages.map(item => (
                <button
                  key={item.code}
                  className={language === item.code ? 'chosen' : ''}
                  onClick={() => setLanguage(item.code)}
                >
                  <span style={{ fontSize: '24px' }}>{item.flag}</span>
                  <div>
                    <strong style={{ display: 'block', fontSize: '14px' }}>{item.name}</strong>
                    <small style={{ fontSize: '11px', color: '#64748b' }}>{item.sub}</small>
                  </div>
                  {language === item.code && <Check size={18} />}
                </button>
              ))}
            </div>
            <h3>Hozirgi darajangiz (CEFR)</h3>
            <div className="level-options">
              {cefrLevels.map(lvl => (
                <button
                  key={lvl.code}
                  className={level === lvl.code ? 'chosen' : ''}
                  onClick={() => setLevel(lvl.code)}
                >
                  <strong>{lvl.code}</strong>
                  <span>{lvl.name}</span>
                </button>
              ))}
            </div>
            <button className="entry-primary onboarding-submit" onClick={finishOnboarding} disabled={loading}>
              {loading ? 'Saqlanmoqda...' : 'Tasdiqlash va o‘rganishni boshlash'} <ArrowRight size={18} />
            </button>
          </div>
        </section>
      )}

    </div>
  );
}

export default App;
