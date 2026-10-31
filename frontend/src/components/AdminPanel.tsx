import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity, BookOpen, Boxes, FileAudio, FileText, Gamepad2, Globe, LayoutDashboard,
  LogOut, Plus, Settings, ShieldCheck, Users, Video, GraduationCap, ClipboardList,
  Search, Trash2, Edit3, Save, UserCog, Headphones, PenLine, BookMarked, ChartNoAxesCombined,
  Check, Sun, Moon, Sparkles, ArrowRight, Menu, X, RefreshCw, Database, CheckCircle2,
  AlertCircle, ExternalLink, ShieldAlert, Clock, Layers, MessageSquare, Zap,
  Smartphone, Laptop, Image as ImageIcon, Upload, RotateCcw, Camera, ChevronDown,
  ArrowUp, ArrowDown, Bell, Calendar, TrendingUp, Home, ChevronRight
} from 'lucide-react';
import '../admin-neon.css';
import { api, authStorage } from '../api';
import {
  DEFAULT_PRACTICE_GUIDE, PracticeGuideConfig, LanguagePracticeGuide
} from '../data/practiceGuideData';
import { DEFAULT_LEARNING_PROCESS_STEPS, DEFAULT_LEARNING_PROCESS_CONFIG } from '../data/learningProcessData';
import { AdminTrialTestsTab } from './admin/AdminTrialTestsTab';

const adminNav = [
  ['Dashboard & Statistika', 'dashboard', LayoutDashboard],
  ['Welcome Sahifa / CMS', 'cms', Globe],
  ['Boşlanğiç Sinov Testlari', 'trial_tests', Sparkles],
  ['Foydalanuvçilar', 'users', Users],
  ['Umumiy Luğat', 'vocab', BookOpen],
  ['Öyin Mavzulari', 'games', Gamepad2],
  ['Reading Materiallari', 'reading', BookMarked],
  ['Writing Topşiriqlari', 'writing', PenLine],
  ['Listening Audio', 'listening', Headphones],
  ['Video Kutubxona', 'videos', Video],
  ['Tizim Sozlamalari', 'settings', Settings]
];

export function AdminPanel({ onLogout, dark, setDark }: { onLogout: () => void; dark: boolean; setDark: (d: boolean) => void }) {
  const [section, setSection] = useState('dashboard');

  const [toast, setToast] = useState<{ message: string; isError?: boolean } | null>(null);
  const [query, setQuery] = useState('');
  const [mobileNav, setMobileNav] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('');

  // Statistics & Level Distribution with Instant Local Cache
  const [stats, setStats] = useState<any>(() => {
    try {
      const cached = localStorage.getItem('tilshunos_admin_stats_cache');
      if (cached) return JSON.parse(cached);
    } catch {}
    return {
      totalUsers: 0,
      verifiedUsers: 0,
      activeTeachers: 0,
      learnersCount: 0,
      totalVocabularyEntries: 0,
      totalMaterials: 0,
      totalAssignments: 0,
      totalPracticeSessions: 0,
      totalAiConversations: 0,
      readingMaterialsCount: 0,
      writingMaterialsCount: 0,
      listeningMaterialsCount: 0,
      videoMaterialsCount: 0,
      studentsByLevel: { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0 },
      recentUsers: []
    };
  });

  // Students & All Users with Instant Local Cache
  const [users, setUsers] = useState<any[]>(() => {
    try {
      const cached = localStorage.getItem('tilshunos_admin_users_cache');
      if (cached) return JSON.parse(cached);
    } catch {}
    return [];
  });
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<any | null>(null);

  // Teachers with Instant Local Cache
  const [teachers, setTeachers] = useState<any[]>(() => {
    try {
      const cached = localStorage.getItem('tilshunos_admin_teachers_cache');
      if (cached) return JSON.parse(cached);
    } catch {}
    return [];
  });

  // CMS Content from Supabase
  const [cmsLoadedFromBackend, setCmsLoadedFromBackend] = useState(false);
  const [cms, setCms] = useState<any>(() => {
    try {
      const cached = localStorage.getItem('tilshunos_cms_data');
      if (cached) return JSON.parse(cached);
    } catch {}
    return {
      heroImage: 'https://yipexommqztxnvpckqyi.supabase.co/storage/v1/object/public/tilshunos-media/Global%20Language%20Learning%20Workspace_ba49fd.jpg',
      heroMobileImage: 'https://yipexommqztxnvpckqyi.supabase.co/storage/v1/object/public/tilshunos-media/Global%20Language%20Study%20Desk_195231.jpg',
      heroBgDesktop: 'https://yipexommqztxnvpckqyi.supabase.co/storage/v1/object/public/tilshunos-media/img_1793254439976_c6auer.webp',
      heroBgMobile: 'https://yipexommqztxnvpckqyi.supabase.co/storage/v1/object/public/tilshunos-media/img_1793254446169_xxtbf7.webp',
      hero: 'Yangi tilni erkin gapiring',
      heroBadge: '99 PERCENT',
      heroBadgeFull: 'TILŞUNOS 2.0 · ILĞOR TIL ÖRGANIŞ EKOTIZIMI',
      description: 'TILŞUNOS bilan har kuni tizimli örganing, CEFR standartlarida bilimingizni mustahkamlang va erkin muloqotga çiqing.',
      cta: 'Hoziroq Boşlaş',
      secondaryCta: 'Platformani örganiş',
      header: 'Imkoniyatlar, Biz haqimizda, Kiriş',
      heroFlags: ['🇬🇧', '🇷🇺', '🇩🇪', '🇺🇿'],
      heroFlagsCount: '5+',
      heroFlagsLabel: 'Tillarda',
      metrics: {
        useLiveStats: true,
        metric1Value: '3+',
        metric1Label: 'Öquv Materiallari',
        metric2Value: '50+',
        metric2Label: 'Luğat Sözlari',
        metric3Value: '4+',
        metric3Label: 'Jami Foydalanuvçilar'
      },
      authBanner: {
        kicker: 'TILŞUNOS PLATFORMASI',
        loginTitle: 'Qaytganingizdan xursandmiz!',
        registerTitle: 'Yangi til uchun yangi qadam!',
        verifyTitle: 'Emailingizni tasdiqlang',
        subtitle: 'Öz maqsadingizni belgilang, kiçik qadamlar bilan katta natijalarga erişing.',
        statNumber: '4+',
        statLabel: 'asosiy könikmalar TILŞUNOS platformasida',
        bgImage: 'https://avatars.mds.yandex.net/i?id=c545bee4d827964a82e6bb08c63a88ca65bd3bcc-5320607-images-thumbs&n=13'
      },
      floatingBadge1: {
        flag: '🇬🇧',
        title: 'Basic English',
        subtitle: '103 Lesson'
      },
      floatingBadge2: {
        title: '9 / 12 Quiz',
        subtitle: 'Speaking ✓'
      },
    previewSection: {
      kicker: 'AMALIY TAJRIBA',
      title: 'Platformaning haqiqiy imkoniyatlarini sinab ko‘ring',
      subtitle: 'Ro‘yxatdan o‘tishdan avval asosiy 3 ta modulimiz qanday ishlashini amalda ko‘ring.',
      vocabItems: [
        { word: 'Achieve', tr: 'Erishmoq, zabt etmoq', lvl: 'B1', ex: 'You can achieve any language goal with daily practice.', topic: 'Motivatsiya' },
        { word: 'Curious', tr: 'Qiziquvchan, yangilikka intiluvchan', lvl: 'A2', ex: 'Children are naturally curious about the world.', topic: 'Xarakter' },
        { word: 'Resilience', tr: 'Sabr-bardosh, chidamlilik', lvl: 'B2', ex: 'She showed great resilience in learning pronunciation.', topic: 'Psixologiya' }
      ],
      sampleLesson: {
        level: 'CEFR B1 · READING',
        time: '5 daqiqa',
        title: 'The Power of Tiny Daily Habits',
        article: 'Consistency is far more powerful than intensity. When learning a new language, practicing for just 15 minutes every single day wires the brain more effectively than studying for 4 hours once a week. The secret lies in frequent retrieval: each time you actively recall a word, the neural pathway strengthens.',
        question: 'Matnga ko‘ra, til o‘rganishda eng muhim omil nima?',
        choiceA: 'Har kuni muntazam 15 daqiqa shug‘ullanish (To‘g‘ri ✓)',
        choiceB: 'Faqat haftada bir marta 4 soat o‘rganish'
      }
    },
    practiceGuide: DEFAULT_PRACTICE_GUIDE,
    cefrSection: {
      kicker: 'XALQARO METODIKA',
      title: 'CEFR bo‘yicha aniq yo‘l xaritasi (A1–C2)',
      subtitle: 'O‘zingizga mos boshlang‘ich nuqtani tanlang va bosqichma-bosqich yuksaling.',
      levels: [
        { code: 'A1', name: 'Boshlang‘ich', desc: 'Oddiy so‘zlar, tanishuv va kundalik eng muhim iboralar.', color: '#3b82f6' },
        { code: 'A2', name: 'Elementar', desc: 'Xarid, transport va oddiy kundalik vaziyatlarda muloqot.', color: '#0ea5e9' },
        { code: 'B1', name: 'O‘rta daraja', desc: 'Sayohat, fikr bildirish va o‘z tajribasini erkin tushuntirish.', color: '#10b981' },
        { code: 'B2', name: 'Mustaqil', desc: 'Murakkab matnlar, insholar va mavzular bo‘yicha erkin bahslashish.', color: '#8b5cf6' },
        { code: 'C1', name: 'Ilg‘or', desc: 'Akademik va kasbiy darajada chuqur fikrlash hamda tahlil.', color: '#f59e0b' },
        { code: 'C2', name: 'Mukammal', desc: 'Ona tili darajasidagi ravonlik va nozik ma’nolarni anglash.', color: '#ec4899' }
      ]
    },
    skillsSection: {
      kicker: 'MUVOZANATLI RIVOJLANISH',
      title: '5 ta asosiy til ko‘nikmasini mustahkamlang',
      subtitle: 'Faqat qoidalar yodlash emas — har tomonlama tabiiy o‘rganish uslubi.',
      skills: [
        { key: 'reading', title: 'O‘qish (Reading)', desc: 'Darajangizga moslangan qiziqarli hikoyalar, badiiy parchalar va zamonaviy maqolalar.', color: '#356cf6' },
        { key: 'writing', title: 'Yozish (Writing)', desc: 'Insho va xatlar yozish, grammatik xatolarni sun’iy intellekt orqali darhol tekshirish.', color: '#8b5cf6' },
        { key: 'listening', title: 'Tinglash (Listening)', desc: 'Tabiiy tezlikdagi audio podkastlar, kundalik muloqot dialoglari va transkriptlar.', color: '#0ea5e9' },
        { key: 'speaking', title: 'Gapirish (Speaking)', desc: 'To‘g‘ri talaffuz va intonatsiya mashqlari bilan muloqotdagi to‘siqlarni yengish.', color: '#10b981' },
        { key: 'vocab', title: 'Lug‘at (Vocabulary)', desc: 'Shaxsiy so‘z daftari, kontekstual misollar va intervalli takrorlash metodikasi.', color: '#f59e0b' }
      ]
    },
    stepsSection: {
      ...DEFAULT_LEARNING_PROCESS_CONFIG
    },
    featuresSection: {
      kicker: 'ILG‘OR IMKONIYATLAR',
      title: 'Zamonaviy texnologiyalar xizmatingizda',
      subtitle: 'Biz til o‘rganishni nafaqat samarali, balki maroqli jarayonga aylantiramiz.',
      features: [
        { key: 'ai', color: 'purple', title: '24/7 AI Til Repetitori', desc: 'Istalgan savolingizni bering, grammatik xatolaringizni aniqlang va muloyim tushuntirishlar oling.' },
        { key: 'pvp', color: 'orange', title: '1v1 So‘z Bellashuvi', desc: 'Boshqa o‘quvchilar bilan real vaqtda so‘z boyligingizni sinang, XP to‘plang va yetakchilar safiga kiring.' },
        { key: 'anticheat', color: 'green', title: 'Anti-Cheat & Spaced Repetition', desc: 'So‘zlar tasodifiy takrorlanmaydi — ilmiy tasdiqlangan intervallar bilan uzoq muddatli xotiraga ko‘chadi.' },
        { key: 'teachers', color: 'blue', title: 'Malakali Ustozlar Nazorati', desc: 'Maxsus o‘qituvchilar tizimda sizning yozma insho va vazifalaringizni tekshirib, shaxsiy baho beradi.' }
      ]
    },
    finalCta: {
      kicker: 'BIZ BILAN O‘RGANING',
      title: 'Yangi tilni erkin gapirish vaqti keldi',
      desc: 'Til örganiş — yangi imkoniyatlar eşiklarini oçadi. Biz siz bilan birga bu yölda!',
      btnRegister: 'Bepul hisob yaratiş',
      btnLogin: 'Tizimga kiriş'
    },
    about: 'TILŞUNOS til örganişni tartibli, qiziqarli va şaxsiy maqsadlaringizga mos qiliş uçun yaratilayotgan ilğor platforma.',
    aboutButton: 'Batafsil ma’lumot',
    aboutDetailed: 'TILŞUNOS — xalqaro CEFR (A1–C2) standartlariga moslaştirilgan, sun’iy intellekt va professional ustozlar metodikasini özida mujassam etgan zamonaviy ta’lim platformasi. Bizning asosiy maqsadimiz — har bir foydalanuvçiga murakkab grammatik qoidalarsiz, interaktiv söz öyinlari, amaliy audio-dialoglar, yozma tahlil va real muloqot orqali tilni tabiiy özlaştiriş imkoniyatini taqdim etişdir.',
    founderName: 'Soxibjon Gaybullayev',
    founderTitle: 'LOYIHA ASOSÇISI VA RAHBARI',
    founderBio: 'TILŞUNOS platformasi asosçisi. Özbekiston yoşlariga jahon tillarini eng samarali va qulay usulda örganiş uçun innovatsion ekotizim yaratiş ustida işlaydi.',
    founderQuote: 'Bizning niyatimiz — Özbekiston yoşlariga jahonning istalgan tili böyiça eng sifatli ta’limni öz ona tilida va zamonaviy texnologiyalar bilan taqdim etiş.',
    founderPhoto: '',
    team: [
      { name: 'Soxibjon Gaybullayev', role: 'Asosçi & Boş Muhandis', bio: 'Til örganiş texnologiyalari va raqamli ta’lim böyiça mutaxassis.', avatar: 'S' },
      { name: 'Dilnoza Karimova', role: 'Boş Öqituvçi & Metodist', bio: 'IELTS va CEFR standartlari böyiça 8 yillik tajribaga ega ustoz.', avatar: 'D' },
      { name: 'Jasur Aliyev', role: 'Ta’lim Koordinator', bio: 'Talabalar bilan işlaş va interaktiv maşqlar mutaxassisi.', avatar: 'J' }
    ],
    contacts: {
      telegram: '@tilshunos',
      instagram: 'tilshunos_app',
      email: 'soxibgaybullayev439@gmail.com',
      phone: '+998 90 123 45 67',
      youtube: ''
    },
    footer: '© 2026 TILŞUNOS · Barça huquqlar himoyalangan',
    faqs: [
      { q: 'TILŞUNOS platformasidan foydalaniş bepulmi?', a: 'Ha, asosiy funksiyalar — söz yodlaş, maşqlar, CEFR reading va listening materiallari barça uçun bepul.' },
      { q: 'CEFR darajalarini qanday aniqlayman?', a: 'Röyxatdan ötiş çoğida darajangizni (A1–C2) özingiz belgilaşingiz yoki qisqa diagnostik test orqali aniqlab olişingiz mumkin.' },
      { q: 'Mobil qurilmalarda işlaydimi?', a: 'Ha, TILŞUNOS responsive veb-ilova va PWA (Progressive Web App) sifatida smartfon va planşetlarda qulay işlaydi.' },
      { q: 'Öqituvçi bilan qanday boğlanaman?', a: 'Platformadagi Öqituvçilar bölimi orqali tasdiqlangan ustozlar bilan boğlanib, şaxsiy topşiriqlar olişingiz mumkin.' }
    ]
  };
});
  const [cmsTab, setCmsTab] = useState<'hero' | 'stats' | 'auth' | 'preview' | 'curriculum' | 'features' | 'about' | 'faq' | 'footer'>('hero');
  const [authPreviewMode, setAuthPreviewMode] = useState<'login' | 'register' | 'verify'>('login');
  const [newTeamMember, setNewTeamMember] = useState({ name: '', role: '', bio: '', avatar: '' });
  const [editingTeamMemberIdx, setEditingTeamMemberIdx] = useState<number | null>(null);
  const [editingTeamMember, setEditingTeamMember] = useState({ name: '', role: '', bio: '', avatar: '' });
  const [uploadingFounder, setUploadingFounder] = useState(false);
  const [uploadingTeamPhoto, setUploadingTeamPhoto] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [guideEditLang, setGuideEditLang] = useState<string>('en');
  const [guideEditSkill, setGuideEditSkill] = useState<'vocab' | 'writing' | 'reading' | 'listening' | 'speaking' | 'grammar' | 'shadowing'>('vocab');
  const [uploadingGuideImage, setUploadingGuideImage] = useState(false);
  const [newFaq, setNewFaq] = useState({ q: '', a: '' });

  // Game Topics & Words from Supabase
  const [topics, setTopics] = useState<string[]>(['Fruits & Food', 'Travel & Places', 'Daily Life', 'Character & Mind']);
  const [newTopicName, setNewTopicName] = useState('');

  // Materials list from Supabase
  const [materials, setMaterials] = useState<any[]>([]);

  // Vocabulary list from Supabase
  const [generalVocab, setGeneralVocab] = useState<any[]>([]);
  const [vocabSearch, setVocabSearch] = useState('');

  // Specific Creation Forms
  const [readingForm, setReadingForm] = useState({ title: '', content: '', topic: 'Daily Life', level: 'B1', mins: 10, isPublished: true });
  const [writingForm, setWritingForm] = useState({ title: '', instructions: '', topic: 'Daily Life', level: 'B1', words: 150, isPublished: true });
  const [listeningForm, setListeningForm] = useState({ title: '', audioUrl: '', transcript: '', topic: 'Daily Life', level: 'B1', mins: 12, isPublished: true });
  const [videoForm, setVideoForm] = useState({ title: '', videoUrl: '', description: '', topic: 'Daily Life', level: 'B1', mins: 15, isPublished: true });
  const [vocabForm, setVocabForm] = useState({ word: '', translation: '', topic: 'Daily Life', level: 'B1', example: '' });
  const [teacherForm, setTeacherForm] = useState({ firstName: '', lastName: '', email: '', password: '', specialty: 'English · B1–C1', bio: '' });
  const [editingTeacher, setEditingTeacher] = useState<any | null>(null);
  const [editTeacherForm, setEditTeacherForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    specialty: 'English · B1–C1',
    bio: '',
    isActive: true,
    isApproved: true
  });

  // System latency test state
  const [pingLatency, setPingLatency] = useState<number | null>(null);
  const [testingPing, setTestingPing] = useState(false);

  const notify = (msg: string, isError = false) => {
    setToast({ message: msg, isError });
    setTimeout(() => setToast(null), 4000);
  };

  // Load real data from Supabase with two-stage priority loading
  const loadSupabaseData = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);

    try {
      // Stage 1: Critical Dashboard Data (Stats, Users, CMS) - instant updates
      const [statsRes, usersRes, cmsRes] = await Promise.allSettled([
        api.getAdminStats(),
        api.getAdminUsers(),
        api.getCms()
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value) {
        const safeRecent = (statsRes.value.recentUsers || []).filter((u: any) => !isSuperAdmin(u));
        const updatedStats = {
          ...statsRes.value,
          recentUsers: safeRecent
        };
        setStats(updatedStats);
        try {
          localStorage.setItem('tilshunos_admin_stats_cache', JSON.stringify(updatedStats));
        } catch {}
      }

      if (usersRes.status === 'fulfilled' && Array.isArray(usersRes.value)) {
        // Super Admin is never included in the general users list
        const normalUsers = usersRes.value.filter((u: any) => !isSuperAdmin(u));
        setUsers(normalUsers);
        try {
          localStorage.setItem('tilshunos_admin_users_cache', JSON.stringify(normalUsers));
        } catch {}
      }

      if (cmsRes.status === 'fulfilled' && cmsRes.value) {
        setCmsLoadedFromBackend(true);
        try {
          localStorage.setItem('tilshunos_cms_data', JSON.stringify(cmsRes.value));
        } catch {}
        setCms((prev: any) => ({
          ...prev,
          ...cmsRes.value,
          metrics: {
            useLiveStats: true,
            metric1Value: '3+',
            metric2Value: '50+',
            metric3Value: '4+',
            ...(prev?.metrics || {}),
            ...(cmsRes.value?.metrics || {}),
            metric1Label: (cmsRes.value?.metrics?.metric1Label && cmsRes.value.metrics.metric1Label !== 'App Downloads') ? cmsRes.value.metrics.metric1Label : 'O‘quv Materiallari',
            metric2Label: (cmsRes.value?.metrics?.metric2Label && cmsRes.value.metrics.metric2Label !== 'Learned monthly') ? cmsRes.value.metrics.metric2Label : 'Lug‘at So‘zlari',
            metric3Label: (cmsRes.value?.metrics?.metric3Label && cmsRes.value.metrics.metric3Label !== '177k Rating' && cmsRes.value.metrics.metric3Label !== 'Mashq Bajarildi') ? cmsRes.value.metrics.metric3Label : 'Jami Foydalanuvchilar'
          },
          authBanner: {
            kicker: 'TILSHUNOS PLATFORMASI',
            loginTitle: 'Qaytganingizdan xursandmiz!',
            registerTitle: 'O‘rganish yo‘lingiz shu yerdan boshlanadi.',
            verifyTitle: 'Emailingizni tasdiqlang',
            subtitle: 'O‘z maqsadingizni belgilang, kichik qadamlar bilan katta natijalarga erishing.',
            statNumber: '4+',
            statLabel: 'asosiy ko‘nikma bitta platformada',
            bgImage: '',
            ...(prev?.authBanner || {}),
            ...(cmsRes.value?.authBanner || {})
          },
          floatingBadge1: {
            flag: '🇬🇧',
            title: 'Basic English',
            subtitle: '103 Lesson',
            ...(prev?.floatingBadge1 || {}),
            ...(cmsRes.value?.floatingBadge1 || {})
          },
          floatingBadge2: {
            title: '9 / 12 Quiz',
            subtitle: 'Speaking ✓',
            ...(prev?.floatingBadge2 || {}),
            ...(cmsRes.value?.floatingBadge2 || {})
          },
          previewSection: {
            ...(prev?.previewSection || {}),
            ...(cmsRes.value?.previewSection || {})
          },
          practiceGuide: {
            ...DEFAULT_PRACTICE_GUIDE,
            ...(prev?.practiceGuide || {}),
            ...(cmsRes.value?.practiceGuide || {}),
            languages: {
              ...DEFAULT_PRACTICE_GUIDE.languages,
              ...(prev?.practiceGuide?.languages || {}),
              ...(cmsRes.value?.practiceGuide?.languages || {})
            }
          },
          cefrSection: {
            ...(prev?.cefrSection || {}),
            ...(cmsRes.value?.cefrSection || {})
          },
          skillsSection: {
            ...(prev?.skillsSection || {}),
            ...(cmsRes.value?.skillsSection || {})
          },
          stepsSection: {
            ...(prev?.stepsSection || {}),
            ...(cmsRes.value?.stepsSection || {})
          },
          featuresSection: {
            ...(prev?.featuresSection || {}),
            ...(cmsRes.value?.featuresSection || {})
          },
          finalCta: {
            ...(prev?.finalCta || {}),
            ...(cmsRes.value?.finalCta || {})
          },
          contacts: {
            ...prev?.contacts,
            ...(cmsRes.value?.contacts || {})
          },
          team: Array.isArray(cmsRes.value?.team) ? cmsRes.value.team : (prev?.team || []),
          faqs: Array.isArray(cmsRes.value?.faqs) ? cmsRes.value.faqs : (prev?.faqs || [])
        }));
      }

      const now = new Date();
      setLastSyncTime(now.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setLoading(false);

      if (isManualRefresh) {
        notify('Ma’lumotlar yangilandi! ✓');
      }

      // Stage 2: Background Secondary Modules (Teachers, Materials, Topics, Vocab)
      // Loaded asynchronously so they never block the main dashboard!
      Promise.allSettled([
        api.getTeachers(),
        api.getAllAdminMaterials(),
        api.getGameTopics(),
        api.getAdminVocabulary()
      ]).then(([teachersRes, materialsRes, topicsRes, vocabRes]) => {
        if (teachersRes.status === 'fulfilled' && Array.isArray(teachersRes.value)) {
          setTeachers(teachersRes.value);
          try {
            localStorage.setItem('tilshunos_admin_teachers_cache', JSON.stringify(teachersRes.value));
          } catch {}
        } else if (usersRes.status === 'fulfilled' && Array.isArray(usersRes.value)) {
          const teacherUsers = usersRes.value
            .filter((u: any) => u.role === 'Teacher' || u.role === 2 || (typeof u.role === 'string' && u.role.toLowerCase() === 'teacher'))
            .map((u: any) => ({
              id: u.id,
              userId: u.id,
              name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email,
              email: u.email,
              specialty: 'Ingliz tili mutaxassisi',
              qualifications: 'Ingliz tili mutaxassisi',
              students: 0,
              status: u.isActive !== false ? 'Faol' : 'Nofaol'
            }));
          setTeachers(teacherUsers);
        }

        if (materialsRes.status === 'fulfilled' && Array.isArray(materialsRes.value)) {
          setMaterials(materialsRes.value);
        }

        if (topicsRes.status === 'fulfilled' && Array.isArray(topicsRes.value) && topicsRes.value.length > 0) {
          setTopics(topicsRes.value.map((x: any) => typeof x === 'string' ? x : x.topic));
        }

        if (vocabRes.status === 'fulfilled' && Array.isArray(vocabRes.value)) {
          setGeneralVocab(vocabRes.value);
        }
      }).catch(() => {});

    } catch (err: any) {
      if (isManualRefresh) {
        notify('Ma’lumotlarni yangilashda xatolik yuz berdi.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadSupabaseData();
  }, []);

  const testSupabasePing = async () => {
    setTestingPing(true);
    const start = performance.now();
    try {
      await api.getAdminStats();
      const end = performance.now();
      const ms = Math.round(end - start);
      setPingLatency(ms);
      notify(`Supabase Pooler javob berish vaqti: ${ms} ms`);
    } catch {
      setPingLatency(null);
      notify('Aloqa tekshirishda xatolik');
    } finally {
      setTestingPing(false);
    }
  };

  const desktopFileInputRef = useRef<HTMLInputElement | null>(null);
  const mobileFileInputRef = useRef<HTMLInputElement | null>(null);
  const bgDesktopFileInputRef = useRef<HTMLInputElement | null>(null);
  const bgMobileFileInputRef = useRef<HTMLInputElement | null>(null);
  const authBgFileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadingDesktop, setUploadingDesktop] = useState(false);
  const [uploadingMobile, setUploadingMobile] = useState(false);
  const [uploadingBgDesktop, setUploadingBgDesktop] = useState(false);
  const [uploadingBgMobile, setUploadingBgMobile] = useState(false);
  const [uploadingAuthBg, setUploadingAuthBg] = useState(false);

  const handleDeviceFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'desktop' | 'mobile' | 'bgDesktop' | 'bgMobile' | 'authBg') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      notify('Faqat rasm fayllari (JPG, PNG, WebP) yuklanishi mumkin!');
      return;
    }

    if (target === 'desktop') setUploadingDesktop(true);
    else if (target === 'mobile') setUploadingMobile(true);
    else if (target === 'bgDesktop') setUploadingBgDesktop(true);
    else if (target === 'bgMobile') setUploadingBgMobile(true);
    else if (target === 'authBg') setUploadingAuthBg(true);

    try {
      // Direct upload exclusively to Supabase Storage Bucket ('tilshunos-media')
      let dataBase64 = '';
      try {
        dataBase64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => resolve('');
          reader.readAsDataURL(file);
        });
      } catch {}

      const res = await api.uploadCmsImage({
        file,
        dataBase64,
        fileName: file.name,
        contentType: file.type || 'image/jpeg'
      });
      if (!res || !res.url) {
        throw new Error('Supabase Storage bucketiga rasm yuklanmadi');
      }
      const finalUrl = res.url;

      // Update CMS state and local cache
      if (target === 'authBg') {
        setCms((prev: any) => {
          const next = {
            ...prev,
            authBanner: {
              ...(prev?.authBanner || {}),
              bgImage: finalUrl
            }
          };
          try {
            localStorage.setItem('tilshunos_cms_data', JSON.stringify(next));
          } catch {}
          return next;
        });
      } else {
        const fieldKey = target === 'desktop'
          ? 'heroImage'
          : target === 'mobile'
          ? 'heroMobileImage'
          : target === 'bgDesktop'
          ? 'heroBgDesktop'
          : 'heroBgMobile';

        setCms((prev: any) => {
          const next = {
            ...prev,
            [fieldKey]: finalUrl
          };
          try {
            localStorage.setItem('tilshunos_cms_data', JSON.stringify(next));
          } catch {}
          return next;
        });
      }

      notify('Rasm muvaffaqiyatli Supabase "tilshunos-media" bucketiga yuklandi! ✓');
    } catch (err: any) {
      let errMsg = err?.message || 'Rasm yuklashda xatolik yuz berdi';
      if (typeof errMsg === 'string' && (errMsg.includes('413') || errMsg.includes('Payload too large') || errMsg.includes('EntityTooLarge'))) {
        errMsg = 'Rasm hajmi chegaradan oshdi. Tizim uni avtomatik moslashtirmoqda, iltimos qayta urinib ko‘ring.';
      }
      notify(errMsg, true);
    } finally {
      if (target === 'desktop') setUploadingDesktop(false);
      else if (target === 'mobile') setUploadingMobile(false);
      else if (target === 'bgDesktop') setUploadingBgDesktop(false);
      else if (target === 'bgMobile') setUploadingBgMobile(false);
      else if (target === 'authBg') setUploadingAuthBg(false);
      if (e.target) e.target.value = '';
    }
  };

  const saveCmsChanges = async () => {
    try {
      let dataToSave = cms;
      if (!cmsLoadedFromBackend) {
        try {
          const fresh = await api.getCms();
          if (fresh) {
            dataToSave = { ...fresh, ...cms };
            setCms(dataToSave);
            setCmsLoadedFromBackend(true);
          }
        } catch {}
      }
      await api.saveCms(dataToSave);
      try {
        localStorage.setItem('tilshunos_cms_data', JSON.stringify(dataToSave));
      } catch {}
      notify('Welcome sahifasi va CMS ma’lumotlari Supabasega saqlandi! ✓');
    } catch (err: any) {
      notify(err.message || 'CMS o‘zgarishlarini saqlashda xatolik');
    }
  };

  const handleAddTeamMember = async () => {
    if (!newTeamMember.name || !newTeamMember.role) {
      notify('Ism va lavozimni kiriting');
      return;
    }
    const avatar = newTeamMember.avatar || newTeamMember.name.trim()[0].toUpperCase();
    const updatedTeam = [...(cms.team || []), { ...newTeamMember, avatar }];
    const updatedCms = { ...cms, team: updatedTeam };
    setCms(updatedCms);
    setNewTeamMember({ name: '', role: '', bio: '', avatar: '' });
    try {
      localStorage.setItem('tilshunos_cms_data', JSON.stringify(updatedCms));
      await api.saveCms(updatedCms);
      notify('Yangi a’zo qo‘shildi va Supabasega saqlandi! ✓');
    } catch {
      notify('Jamoa a’zosi ro‘yxatga qo‘shildi. Saqlash tugmasini bosing! ✓');
    }
  };

  const handleDeleteTeamMember = async (index: number) => {
    const updatedTeam = (cms.team || []).filter((_: any, i: number) => i !== index);
    const updatedCms = { ...cms, team: updatedTeam };
    setCms(updatedCms);
    try {
      localStorage.setItem('tilshunos_cms_data', JSON.stringify(updatedCms));
      await api.saveCms(updatedCms);
      notify('A’zo o‘chirildi va Supabasega saqlandi! ✓');
    } catch {
      notify('A’zo olib tashlandi. Saqlash tugmasini bosing! ✓');
    }
  };

  const handleBrandLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      notify('Faqat rasm fayllari (PNG, SVG, JPG, WebP) yuklanishi mumkin!');
      return;
    }
    setUploadingLogo(true);
    try {
      let dataBase64 = '';
      try {
        dataBase64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => resolve('');
          reader.readAsDataURL(file);
        });
      } catch {}

      const res = await api.uploadCmsImage({
        file,
        dataBase64,
        fileName: `brand-logo-${Date.now()}-${file.name}`,
        contentType: file.type || 'image/png'
      });
      if (!res || !res.url) throw new Error('Logo yuklanmadi');

      const updatedCms = { ...cms, brandLogo: res.url };
      setCms(updatedCms);
      localStorage.setItem('tilshunos_cms_data', JSON.stringify(updatedCms));
      await api.saveCms(updatedCms);
      notify('Loyiha Brand Logosi muvaffaqiyatli yuklandi va Supabasega saqlandi! ✓');
    } catch (err: any) {
      notify(err.message || 'Logo yuklashda xatolik yuz berdi', true);
    } finally {
      setUploadingLogo(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleFounderPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      notify('Faqat rasm fayllari (JPG, PNG, WebP) yuklanishi mumkin!');
      return;
    }
    setUploadingFounder(true);
    try {
      let dataBase64 = '';
      try {
        dataBase64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => resolve('');
          reader.readAsDataURL(file);
        });
      } catch {}

      const res = await api.uploadCmsImage({
        file,
        dataBase64,
        fileName: `founder-${Date.now()}-${file.name}`,
        contentType: file.type || 'image/jpeg'
      });
      if (!res || !res.url) throw new Error('Rasm yuklanmadi');

      const updatedCms = {
        ...cms,
        founderPhoto: res.url
      };
      setCms(updatedCms);
      localStorage.setItem('tilshunos_cms_data', JSON.stringify(updatedCms));
      await api.saveCms(updatedCms);
      notify('Super Admin / Loyiha asoschisi rasmi Supabasega saqlandi! ✓');
    } catch (err: any) {
      notify(err.message || 'Rasm yuklashda xatolik yuz berdi', true);
    } finally {
      setUploadingFounder(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleTeamMemberPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEditing = false) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      notify('Faqat rasm fayllari (JPG, PNG, WebP) yuklanishi mumkin!');
      return;
    }
    setUploadingTeamPhoto(true);
    try {
      let dataBase64 = '';
      try {
        dataBase64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => resolve('');
          reader.readAsDataURL(file);
        });
      } catch {}

      const res = await api.uploadCmsImage({
        file,
        dataBase64,
        fileName: `team-${Date.now()}-${file.name}`,
        contentType: file.type || 'image/jpeg'
      });
      if (!res || !res.url) throw new Error('Rasm yuklanmadi');

      if (isEditing) {
        setEditingTeamMember(prev => ({ ...prev, avatar: res.url }));
      } else {
        setNewTeamMember(prev => ({ ...prev, avatar: res.url }));
      }
      notify('Yetakchi rasmi muvaffaqiyatli yuklandi! ✓');
    } catch (err: any) {
      notify(err.message || 'Rasm yuklashda xatolik yuz berdi', true);
    } finally {
      setUploadingTeamPhoto(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleGuideCardImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, skillKey: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      notify('Faqat rasm fayllari (PNG, JPG, WebP) yuklanishi mumkin!');
      return;
    }
    setUploadingGuideImage(true);
    try {
      let dataBase64 = '';
      try {
        dataBase64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => resolve('');
          reader.readAsDataURL(file);
        });
      } catch {}

      const res = await api.uploadCmsImage({
        file,
        dataBase64,
        fileName: `guide-${guideEditLang}-${skillKey}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`,
        contentType: file.type || 'image/jpeg'
      });
      if (!res || !res.url) throw new Error('Rasm yuklanmadi');

      const currentPg = cms.practiceGuide || DEFAULT_PRACTICE_GUIDE;
      const currentLangObj = currentPg.languages?.[guideEditLang] || DEFAULT_PRACTICE_GUIDE.languages[guideEditLang] || DEFAULT_PRACTICE_GUIDE.languages.en;
      const currentSkillObj = (currentLangObj as any)[skillKey] || {};

      const updatedCms = {
        ...cms,
        practiceGuide: {
          ...currentPg,
          languages: {
            ...currentPg.languages,
            [guideEditLang]: {
              ...currentLangObj,
              [skillKey]: {
                ...currentSkillObj,
                image: res.url
              }
            }
          }
        }
      };
      setCms(updatedCms);
      localStorage.setItem('tilshunos_cms_data', JSON.stringify(updatedCms));
      await api.saveCms(updatedCms);
      notify(`"${skillKey.toUpperCase()}" kartasi uchun rasm yuklandi va Supabasega saqlandi! ✓`);
    } catch (err: any) {
      notify(err.message || 'Rasm yuklashda xatolik yuz berdi', true);
    } finally {
      setUploadingGuideImage(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleBottomBannerImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      notify('Faqat rasm fayllari (PNG, JPG, WebP) yuklanishi mumkin!');
      return;
    }
    setUploadingGuideImage(true);
    try {
      let dataBase64 = '';
      try {
        dataBase64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => resolve('');
          reader.readAsDataURL(file);
        });
      } catch {}

      const res = await api.uploadCmsImage({
        file,
        dataBase64,
        fileName: `guide-bottom-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`,
        contentType: file.type || 'image/jpeg'
      });
      if (!res || !res.url) throw new Error('Rasm yuklanmadi');

      const currentPg = cms.practiceGuide || DEFAULT_PRACTICE_GUIDE;
      const updatedCms = {
        ...cms,
        practiceGuide: {
          ...currentPg,
          bottomBannerImage: res.url
        }
      };
      setCms(updatedCms);
      localStorage.setItem('tilshunos_cms_data', JSON.stringify(updatedCms));
      await api.saveCms(updatedCms);
      notify('Amaliy qo‘llanma pastki card rasmi yuklandi va Supabasega saqlandi! ✓');
    } catch (err: any) {
      notify(err.message || 'Rasm yuklashda xatolik yuz berdi', true);
    } finally {
      setUploadingGuideImage(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleSaveEditedTeamMember = async () => {
    if (editingTeamMemberIdx === null) return;
    if (!editingTeamMember.name.trim() || !editingTeamMember.role.trim()) {
      notify('Ism va lavozimni kiriting', true);
      return;
    }
    const next = [...(cms.team || [])];
    next[editingTeamMemberIdx] = { ...editingTeamMember };
    const updatedCms = { ...cms, team: next };
    setCms(updatedCms);
    setEditingTeamMemberIdx(null);
    try {
      localStorage.setItem('tilshunos_cms_data', JSON.stringify(updatedCms));
      await api.saveCms(updatedCms);
      notify('Yetakchi ma’lumotlari yangilandi va Supabasega saqlandi! ✓');
    } catch {
      notify('Yetakchi ma’lumotlari yangilandi. Saqlash tugmasini bosing! ✓');
    }
  };

  const handleAddFaq = async () => {
    if (!newFaq.q || !newFaq.a) {
      notify('Savol va javob matnini kiriting');
      return;
    }
    const updatedFaqs = [...(cms.faqs || []), { ...newFaq }];
    const updatedCms = { ...cms, faqs: updatedFaqs };
    setCms(updatedCms);
    setNewFaq({ q: '', a: '' });
    try {
      localStorage.setItem('tilshunos_cms_data', JSON.stringify(updatedCms));
      await api.saveCms(updatedCms);
      notify('FAQ savoli qo‘shildi va Supabasega saqlandi! ✓');
    } catch {
      notify('FAQ savoli qo‘shildi. Saqlash tugmasini bosing! ✓');
    }
  };

  const handleDeleteFaq = async (index: number) => {
    const updatedFaqs = (cms.faqs || []).filter((_: any, i: number) => i !== index);
    const updatedCms = { ...cms, faqs: updatedFaqs };
    setCms(updatedCms);
    try {
      localStorage.setItem('tilshunos_cms_data', JSON.stringify(updatedCms));
      await api.saveCms(updatedCms);
      notify('FAQ o‘chirildi va Supabasega saqlandi! ✓');
    } catch {
      notify('FAQ olib tashlandi. Saqlash tugmasini bosing! ✓');
    }
  };

  const handleCreateTeacher = async () => {
    if (!teacherForm.firstName || !teacherForm.email.includes('@') || !teacherForm.password) {
      notify('Barcha maydonlarni to‘liq to‘ldiring.');
      return;
    }
    try {
      await api.createTeacher(teacherForm);
      notify('Yangi o‘qituvchi Supabasega muvaffaqiyatli saqlandi!');
      setTeacherForm({ firstName: '', lastName: '', email: '', password: '', specialty: 'English · B1–C1', bio: '' });
      loadSupabaseData(true);
    } catch (err: any) {
      notify(err.message || 'O‘qituvchi qo‘shishda xatolik', true);
    }
  };

  const openEditTeacher = (t: any) => {
    const parts = (t.name || t.fullName || '').split(' ');
    const fName = t.firstName || parts[0] || '';
    const lName = t.lastName || parts.slice(1).join(' ') || '';

    setEditingTeacher(t);
    setEditTeacherForm({
      firstName: fName,
      lastName: lName,
      email: t.email || '',
      password: '',
      specialty: t.specialty || t.qualifications || 'English · B1–C1',
      bio: t.bio || '',
      isActive: t.isActive !== false && t.status !== 'Nofaol',
      isApproved: t.isApproved !== false
    });
  };

  const handleUpdateTeacher = async () => {
    if (!editingTeacher) return;
    const teacherId = editingTeacher.id || editingTeacher.userId;
    if (!teacherId) return;

    if (!editTeacherForm.firstName.trim() || !editTeacherForm.email.includes('@')) {
      notify('O‘qituvchi ismi va to‘g‘ri email manzilini kiriting.', true);
      return;
    }

    try {
      await api.updateTeacher(teacherId, {
        firstName: editTeacherForm.firstName.trim(),
        lastName: editTeacherForm.lastName.trim(),
        email: editTeacherForm.email.trim(),
        password: editTeacherForm.password.trim() || undefined,
        specialty: editTeacherForm.specialty.trim(),
        bio: editTeacherForm.bio.trim(),
        isActive: editTeacherForm.isActive,
        isApproved: editTeacherForm.isApproved
      });
      notify('O‘qituvchi ma’lumotlari muvaffaqiyatli yangilandi! ✓');
      setEditingTeacher(null);
      loadSupabaseData(true);
    } catch (err: any) {
      notify(err.message || 'O‘qituvchini yangilashda xatolik', true);
    }
  };

  const handleDeleteTeacher = async (teacherId: string, nameOrEmail: string) => {
    if (!window.confirm(`${nameOrEmail} o‘qituvchisini tizimdan va Supabase bazasidan butunlay o‘chirib tashlashni tasdiqlaysizmi?`)) {
      return;
    }
    try {
      await api.deleteTeacher(teacherId);
      notify('O‘qituvchi muvaffaqiyatli o‘chirildi! ✓');
      setTeachers(prev => prev.filter(t => (t.id || t.userId) !== teacherId));
      loadSupabaseData(true);
    } catch (err: any) {
      notify(err.message || 'O‘qituvchini o‘chirishda xatolik', true);
    }
  };

  const levelToNumber = (lvl: string) => {
    switch (lvl) {
      case 'A1': return 0;
      case 'A2': return 1;
      case 'B1': return 2;
      case 'B2': return 3;
      case 'C1': return 4;
      case 'C2': return 5;
      default: return 0;
    }
  };

  const handleAddReading = async () => {
    if (!readingForm.title || !readingForm.content) {
      notify('Sarlavha va matnni kiriting');
      return;
    }
    try {
      await api.createReadingMaterial({
        title: readingForm.title,
        content: readingForm.content,
        level: levelToNumber(readingForm.level),
        estimatedMinutes: readingForm.mins,
        isPublished: readingForm.isPublished
      });
      notify('Reading materiali Supabasega saqlandi! ✓');
      setReadingForm({ title: '', content: '', topic: 'Daily Life', level: 'B1', mins: 10, isPublished: true });
      loadSupabaseData();
    } catch (err: any) {
      notify(err.message || 'Xatolik yuz berdi');
    }
  };

  const handleAddWriting = async () => {
    if (!writingForm.title || !writingForm.instructions) {
      notify('Sarlavha va yo‘riqnomani kiriting');
      return;
    }
    try {
      await api.createWritingMaterial({
        title: writingForm.title,
        instructions: writingForm.instructions,
        level: levelToNumber(writingForm.level),
        isPublished: writingForm.isPublished
      });
      notify('Writing topshirig‘i Supabasega saqlandi! ✓');
      setWritingForm({ title: '', instructions: '', topic: 'Daily Life', level: 'B1', words: 150, isPublished: true });
      loadSupabaseData();
    } catch (err: any) {
      notify(err.message || 'Xatolik yuz berdi');
    }
  };

  const handleAddListening = async () => {
    if (!listeningForm.title || !listeningForm.audioUrl) {
      notify('Sarlavha va audio havolasini kiriting');
      return;
    }
    try {
      await api.createListeningMaterial({
        title: listeningForm.title,
        audioUrl: listeningForm.audioUrl,
        transcript: listeningForm.transcript,
        level: levelToNumber(listeningForm.level),
        estimatedMinutes: listeningForm.mins,
        isPublished: listeningForm.isPublished
      });
      notify('Listening audio materiali Supabasega saqlandi! ✓');
      setListeningForm({ title: '', audioUrl: '', transcript: '', topic: 'Daily Life', level: 'B1', mins: 12, isPublished: true });
      loadSupabaseData();
    } catch (err: any) {
      notify(err.message || 'Xatolik yuz berdi');
    }
  };

  const handleAddVideo = async () => {
    if (!videoForm.title || !videoForm.videoUrl) {
      notify('Sarlavha va video havolasini kiriting');
      return;
    }
    try {
      await api.createVideoMaterial({
        title: videoForm.title,
        videoUrl: videoForm.videoUrl,
        description: videoForm.description,
        level: levelToNumber(videoForm.level),
        estimatedMinutes: videoForm.mins,
        isPublished: videoForm.isPublished
      });
      notify('Video darslik Supabasega saqlandi! ✓');
      setVideoForm({ title: '', videoUrl: '', description: '', topic: 'Daily Life', level: 'B1', mins: 15, isPublished: true });
      loadSupabaseData();
    } catch (err: any) {
      notify(err.message || 'Xatolik yuz berdi');
    }
  };

  const handleDeleteMaterial = async (id: string, title: string) => {
    if (!window.confirm(`"${title}" materialini Supabasedan butunlay o‘chirmoqchimisiz?`)) return;
    try {
      await api.deleteMaterial(id);
      notify('Material muvaffaqiyatli o‘chirildi');
      setMaterials(m => m.filter(x => x.id !== id));
      loadSupabaseData();
    } catch (err: any) {
      notify(err.message || 'O‘chirishda xatolik yuz berdi');
    }
  };

  const handleAddTopic = async () => {
    if (!newTopicName.trim()) return;
    try {
      await api.addGameTopic({ topic: newTopicName.trim(), sampleWords: [] });
      setTopics(t => [...t, newTopicName.trim()]);
      setNewTopicName('');
      notify('Yangi o‘yin mavzusi Supabasega saqlandi! ✓');
    } catch {
      setTopics(t => [...t, newTopicName.trim()]);
      setNewTopicName('');
      notify('Mavzu qo‘shildi');
    }
  };

  const handleAddVocab = async () => {
    if (!vocabForm.word || !vocabForm.translation) {
      notify('So‘z va tarjimani kiriting');
      return;
    }
    try {
      await api.addVocabulary({
        targetWord: vocabForm.word.trim(),
        nativeTranslation: vocabForm.translation.trim(),
        exampleSentence: vocabForm.example.trim(),
        topic: vocabForm.topic
      });
      notify('So‘z Supabase lug‘atiga saqlandi! ✓');
      setVocabForm({ word: '', translation: '', topic: 'Daily Life', level: 'B1', example: '' });
      loadSupabaseData();
    } catch (err: any) {
      notify(err.message || 'So‘z qo‘shishda xatolik');
    }
  };

  const handleDeleteVocab = async (id: string, word: string) => {
    if (!window.confirm(`"${word}" so‘zini o‘chirishni tasdiqlaysizmi?`)) return;
    try {
      await api.deleteVocabulary(id);
      setGeneralVocab(v => v.filter(x => x.id !== id));
      notify('So‘z bazadan o‘chirildi');
    } catch (err: any) {
      notify(err.message || 'O‘chirishda xatolik');
    }
  };

  // Helper to identify protected Super Admin
  const isSuperAdmin = (u: any) => {
    if (!u) return false;
    const email = (u.email || '').toLowerCase().trim();
    return email === 'soxibgaybullayev439@gmail.com' ||
           u.role === 'SuperAdmin' ||
           u.role === 4;
  };

  const handleUpdateUserRole = async (userId: string, newRole: number, newIsActive: boolean) => {
    const userToEdit = users.find(x => x.id === userId);
    if (userToEdit && isSuperAdmin(userToEdit)) {
      notify('Super Admin hisobini o‘zgartirish qat’iyan taqiqlangan!');
      return;
    }
    if (newRole === 4) {
      notify('Tizimda faqat 1 ta Super Admin bo‘ladi. Boshqa Super Admin tayinlanmaydi!');
      return;
    }
    try {
      await api.updateUserRole(userId, { role: newRole, isActive: newIsActive });
      notify('Foydalanuvchi roli va holati Supabaseda yangilandi! ✓');
      setSelectedUserForEdit(null);
      loadSupabaseData(true);
    } catch (err: any) {
      notify(err.message || 'Rolni o‘zgartirishda xatolik yuz berdi');
    }
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    if (email?.toLowerCase() === 'soxibgaybullayev439@gmail.com') {
      notify('Super Admin hisobini o‘chirish qat’iyan taqiqlangan! U daxlsizdir.');
      return;
    }
    if (!window.confirm(`${email} foydalanuvchisini Supabasedan butunlay o‘chirib yuborishni tasdiqlaysizmi?`)) return;
    try {
      await api.deleteUser(userId);
      notify('Foydalanuvchi Supabasedan o‘chirildi');
      setUsers(u => u.filter(x => x.id !== userId));
      loadSupabaseData(true);
    } catch (err: any) {
      notify(err.message || 'Foydalanuvchini o‘chirishda xatolik');
    }
  };

  // FAQAT O‘quvchilar (Learners) — Adminlar va O‘qituvchilar bu yerda bo‘lmaydi!
  const learners = useMemo(() => {
    return users.filter(u => {
      if (isSuperAdmin(u)) return false;
      const roleStr = String(u.role || '').toLowerCase();
      return roleStr === 'learner' || u.role === 1;
    });
  }, [users]);

  // Saylangan Moderator Adminlar
  const subAdmins = useMemo(() => {
    return users.filter(u => {
      if (isSuperAdmin(u)) return false;
      const roleStr = String(u.role || '').toLowerCase();
      return roleStr === 'admin' || u.role === 3;
    });
  }, [users]);

  // O‘quvchilar filtri (holat bo‘yicha)
  const [studentStatusFilter, setStudentStatusFilter] = useState<'all' | 'verified' | 'unverified' | 'active'>('all');

  const filteredLearners = useMemo(() => {
    return learners.filter(u => {
      const matchQuery = !query ||
        u.email?.toLowerCase().includes(query.toLowerCase()) ||
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(query.toLowerCase());

      let matchStatus = true;
      if (studentStatusFilter === 'verified') matchStatus = Boolean(u.emailConfirmed);
      else if (studentStatusFilter === 'unverified') matchStatus = !u.emailConfirmed;
      else if (studentStatusFilter === 'active') matchStatus = u.isActive !== false;

      return matchQuery && matchStatus;
    });
  }, [learners, query, studentStatusFilter]);

  // ==========================================
  // FOYDALANUVCHILAR (USERS) YAGONA BO‘LIMI
  // ==========================================
  const [usersSubTab, setUsersSubTab] = useState<'all' | 'learners' | 'teachers' | 'admins'>('all');
  const [usersRoleFilter, setUsersRoleFilter] = useState<'all' | 'learners' | 'teachers' | 'admins'>('all');
  const [usersStatusFilter, setUsersStatusFilter] = useState<'all' | 'verified' | 'unverified' | 'active'>('all');
  const [allUsersSearch, setAllUsersSearch] = useState('');
  const [teacherSearch, setTeacherSearch] = useState('');

  // Appoint Teacher Modal states
  const [appointTeacherModalOpen, setAppointTeacherModalOpen] = useState(false);
  const [selectedUserToAppointTeacher, setSelectedUserToAppointTeacher] = useState('');
  const [appointTeacherSearch, setAppointTeacherSearch] = useState('');
  const [appointTeacherSpecialty, setAppointTeacherSpecialty] = useState('English · B1–C1');
  const [appointTeacherBio, setAppointTeacherBio] = useState('Ingliz tili va xalqaro imtihonlar (IELTS / CEFR) bo‘yicha tajribali o‘qituvchi.');

  // Appoint Admin search state
  const [appointAdminSearch, setAppointAdminSearch] = useState('');

  // Helper to render role badge
  const renderUserRoleBadge = (u: any) => {
    if (isSuperAdmin(u)) {
      return (
        <span className="badge-role-admin" style={{ background: 'linear-gradient(135deg, #7869f5, #5b4bf0)', color: '#fff', fontWeight: 800 }}>
          👑 Super Admin
        </span>
      );
    }
    const roleStr = String(u.role || '').toLowerCase();
    if (roleStr === 'admin' || u.role === 3) {
      return <span className="badge-role-admin">🛡️ Moderator Admin</span>;
    }
    if (roleStr === 'teacher' || u.role === 2) {
      return <span className="badge-role-teacher">👨‍🏫 O‘qituvchi</span>;
    }
    return <span className="badge-role-learner">🎓 O‘quvchi</span>;
  };

  // Tab 1: All Users filter
  const filteredAllUsers = useMemo(() => {
    return users.filter(u => {
      if (allUsersSearch) {
        const q = allUsersSearch.toLowerCase();
        const name = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase();
        const email = (u.email || '').toLowerCase();
        return name.includes(q) || email.includes(q);
      }
      return true;
    });
  }, [users, allUsersSearch]);

  // Tab 3: Teachers filter
  const filteredTeachers = useMemo(() => {
    return teachers.filter((t: any) => {
      if (!teacherSearch) return true;
      const q = teacherSearch.toLowerCase();
      const name = (t.name || t.fullName || '').toLowerCase();
      const email = (t.email || '').toLowerCase();
      const spec = (t.specialty || t.qualifications || '').toLowerCase();
      return name.includes(q) || email.includes(q) || spec.includes(q);
    });
  }, [teachers, teacherSearch]);

  // Eligible users for Teacher appointment (from existing registered users)
  const eligibleUsersForTeacher = useMemo(() => {
    return users.filter(u => {
      if (isSuperAdmin(u)) return false;
      const roleStr = String(u.role || '').toLowerCase();
      if (roleStr === 'teacher' || u.role === 2) return false;
      if (appointTeacherSearch) {
        const q = appointTeacherSearch.toLowerCase();
        const name = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase();
        const email = (u.email || '').toLowerCase();
        return name.includes(q) || email.includes(q);
      }
      return true;
    });
  }, [users, appointTeacherSearch]);

  // Eligible users for Admin appointment (from existing registered users)
  const eligibleUsersForAdmin = useMemo(() => {
    return users.filter(u => {
      if (isSuperAdmin(u)) return false;
      const roleStr = String(u.role || '').toLowerCase();
      if (roleStr === 'admin' || u.role === 3) return false;
      if (appointAdminSearch) {
        const q = appointAdminSearch.toLowerCase();
        const name = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase();
        const email = (u.email || '').toLowerCase();
        return name.includes(q) || email.includes(q);
      }
      return true;
    });
  }, [users, appointAdminSearch]);

  // Appoint Teacher Handler
  const handleAppointTeacher = async () => {
    if (!selectedUserToAppointTeacher) {
      notify('Iltimos, o‘qituvchilikka tayinlash uchun ro‘yxatdan foydalanuvchini tanlang');
      return;
    }
    const targetUser = users.find(u => u.id === selectedUserToAppointTeacher);
    if (!targetUser) {
      notify('Tanlangan foydalanuvchi topilmadi');
      return;
    }
    if (isSuperAdmin(targetUser)) {
      notify('Super Admin hisobining rolini o‘zgartirish taqiqlangan!');
      return;
    }
    try {
      await api.updateUserRole(selectedUserToAppointTeacher, { role: 2, isActive: true });
      await api.updateTeacher(selectedUserToAppointTeacher, {
        specialty: appointTeacherSpecialty.trim() || 'English · B1–C1',
        bio: appointTeacherBio.trim() || 'Ingliz tili va xalqaro imtihonlar bo‘yicha tajribali o‘qituvchi.',
        isActive: true,
        isApproved: true
      });
      notify(`${targetUser.firstName || targetUser.email} muvaffaqiyatli O‘qituvchi qilib tayinlandi! ✓`);
      setAppointTeacherModalOpen(false);
      setSelectedUserToAppointTeacher('');
      setAppointTeacherSearch('');
      loadSupabaseData(true);
    } catch (err: any) {
      notify(err.message || 'O‘qituvchi tayinlashda xatolik yuz berdi', true);
    }
  };

  // Demote Teacher back to Learner Handler
  const handleDemoteTeacher = async (teacherId: string, nameOrEmail: string) => {
    if (!window.confirm(`${nameOrEmail} o‘qituvchisini ustozlik maqomidan chiqarib, oddiy O‘quvchi roliga qaytarishni tasdiqlaysizmi?`)) {
      return;
    }
    try {
      await api.updateUserRole(teacherId, { role: 1, isActive: true });
      notify('O‘qituvchi muvaffaqiyatli oddiy O‘quvchi roliga o‘tkazildi! ✓');
      loadSupabaseData(true);
    } catch (err: any) {
      notify(err.message || 'Xatolik yuz berdi', true);
    }
  };

  // Admin permissions state (Super Admin boshqaradigan ruxsatlar)
  const [adminPerms, setAdminPerms] = useState<Record<string, { canVocab: boolean; canTeachers: boolean; canCMS: boolean; canMaterials: boolean; canStudents: boolean }>>(() => {
    try {
      return JSON.parse(localStorage.getItem('tilshunos_admin_permissions') || '{}');
    } catch {
      return {};
    }
  });
  const [appointModalOpen, setAppointModalOpen] = useState(false);
  const [selectedUserToAppoint, setSelectedUserToAppoint] = useState('');
  const [permsModalAdmin, setPermsModalAdmin] = useState<any | null>(null);

  const handleAppointAdmin = async () => {
    if (!selectedUserToAppoint) {
      notify('Iltimos, adminlikka tayinlash uchun foydalanuvchini tanlang');
      return;
    }
    const targetUser = users.find(u => u.id === selectedUserToAppoint);
    if (!targetUser) {
      notify('Tanlangan foydalanuvchi topilmadi');
      return;
    }
    if (isSuperAdmin(targetUser)) {
      notify('Bu foydalanuvchi allaqachon Super Admin hisoblanadi!');
      return;
    }
    try {
      await api.updateUserRole(selectedUserToAppoint, { role: 3, isActive: true });
      const updated = {
        ...adminPerms,
        [selectedUserToAppoint]: { canVocab: true, canTeachers: false, canCMS: true, canMaterials: true, canStudents: true }
      };
      setAdminPerms(updated);
      localStorage.setItem('tilshunos_admin_permissions', JSON.stringify(updated));
      notify(`${targetUser.firstName || targetUser.email} muvaffaqiyatli Moderator Admin saylandi! ✓`);
      setAppointModalOpen(false);
      setSelectedUserToAppoint('');
      setAppointAdminSearch('');
      loadSupabaseData(true);
    } catch (err: any) {
      notify(err.message || 'Admin tayinlashda xatolik yuz berdi');
    }
  };

  const handleToggleAdminPerm = (adminId: string, permKey: 'canVocab' | 'canTeachers' | 'canCMS' | 'canMaterials' | 'canStudents') => {
    const current = adminPerms[adminId] || { canVocab: true, canTeachers: false, canCMS: true, canMaterials: true, canStudents: true };
    const updated = {
      ...adminPerms,
      [adminId]: {
        ...current,
        [permKey]: !current[permKey]
      }
    };
    setAdminPerms(updated);
    localStorage.setItem('tilshunos_admin_permissions', JSON.stringify(updated));
    notify('Admin ruxsati yangilandi! ✓');
  };

  const handleDemoteAdmin = async (userId: string, email: string) => {
    if (!window.confirm(`${email} adminini administratorlik huquqidan mahrum qilib, oddiy O‘quvchi roliga qaytarishni tasdiqlaysizmi?`)) return;
    try {
      await api.updateUserRole(userId, { role: 1, isActive: true });
      notify('Admin muvaffaqiyatli oddiy O‘quvchi roliga o‘tkazildi! ✓');
      loadSupabaseData(true);
    } catch (err: any) {
      notify(err.message || 'Xatolik yuz berdi');
    }
  };

  // Filtered vocabulary
  const filteredVocab = useMemo(() => {
    return generalVocab.filter(v => {
      if (!vocabSearch) return true;
      const term = vocabSearch.toLowerCase();
      return (v.word || v.targetWord || '').toLowerCase().includes(term) ||
        (v.translation || v.nativeTranslation || '').toLowerCase().includes(term) ||
        (v.topic || '').toLowerCase().includes(term);
    });
  }, [generalVocab, vocabSearch]);

  const totalStudents = learners.length;
  const levelDist = (totalStudents > 0 && stats.studentsByLevel)
    ? stats.studentsByLevel
    : { A1: totalStudents > 0 ? totalStudents : 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0 };
  const verifiedPercent = stats.totalUsers > 0 ? Math.round(((stats.verifiedUsers || 0) / stats.totalUsers) * 100) : 100;

  const todayFormatted = useMemo(() => {
    const months = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];
    const now = new Date();
    return `${now.getDate()} ${months[now.getMonth()]}, ${now.getFullYear()}`;
  }, []);

  const cefrLevelsConfig = [
    { code: 'A1', label: 'A1 DARAJA', color: '#8b5cf6' },
    { code: 'A2', label: 'A2 DARAJA', color: '#06b6d4' },
    { code: 'B1', label: 'B1 DARAJA', color: '#10b981' },
    { code: 'B2', label: 'B2 DARAJA', color: '#f59e0b' },
    { code: 'C1', label: 'C1 DARAJA', color: '#ec4899' },
    { code: 'C2', label: 'C2 DARAJA', color: '#3b82f6' }
  ];

  const formatUserDate = (dateStr?: string) => {
    if (!dateStr) return '25.04.2025 14:32';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '25.04.2025 14:32';
      const pad = (n: number) => n.toString().padStart(2, '0');
      return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch {
      return '25.04.2025 14:32';
    }
  };

  return (
    <div className={`app admin-neon-theme ${dark ? 'dark' : ''}`}>
      {mobileNav && <div className="scrim" onClick={() => setMobileNav(false)} />}

      <aside className={`sidebar ${mobileNav ? 'mobile-open' : ''}`}>
        <div className="brand" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '6px 8px 24px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #4f46e5 100%)',
            display: 'grid',
            placeItems: 'center',
            boxShadow: '0 0 20px rgba(59, 130, 246, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
            color: '#ffffff',
            flexShrink: 0
          }}>
            <BookOpen size={22} strokeWidth={2.2} />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div className="brand-name" style={{ fontSize: '18px', fontWeight: 900, color: '#ffffff', letterSpacing: '0.8px', display: 'flex', alignItems: 'center' }}>
              TILŞUNOS<span style={{ color: '#38bdf8' }}>.</span>
            </div>
            <div style={{ fontSize: '9px', fontWeight: 800, color: '#38bdf8', letterSpacing: '1.4px', marginTop: '2px', textTransform: 'uppercase' }}>
              A.D. BOŞQARUV MARKAZI
            </div>
          </div>
          <button className="icon-btn mobile-close" onClick={() => setMobileNav(false)} aria-label="Menyuni yopiş">
            <X size={18} />
          </button>
        </div>

        <div className="profile-mini neon-profile-pill" style={{
          background: 'rgba(15, 23, 42, 0.75)',
          border: '1px solid rgba(59, 130, 246, 0.25)',
          borderRadius: '16px',
          padding: '10px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '11px',
          marginBottom: '20px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)'
        }}>
          <div style={{ position: 'relative', width: '36px', height: '36px', flexShrink: 0 }}>
            <div className="avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#fff', overflow: 'hidden', display: 'grid', placeItems: 'center', border: '1.5px solid rgba(59, 130, 246, 0.4)' }}>
              {cms.founderPhoto ? (
                <img src={cms.founderPhoto} alt="Super Admin" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: '14px' }}>👑</span>
              )}
            </div>
            <span className="online-dot" style={{ position: 'absolute', bottom: '0px', right: '0px', width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', border: '1.5px solid #0a1026', boxShadow: '0 0 6px #10b981' }} />
          </div>
          <div className="profile-copy" style={{ minWidth: 0, flex: 1 }}>
            <strong style={{ color: '#ffffff', fontSize: '13px', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
              {cms.founderName || 'Soxibjon Gaybullayev'}
            </strong>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
              <span className="online-dot" style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
              <span style={{ color: '#38bdf8', fontWeight: 600 }}>Super Admin</span>
            </span>
          </div>
        </div>

        <nav className="nav-list" style={{ marginTop: '4px', flex: 1, overflowY: 'auto' }}>
          {adminNav.map(([label, key, Icon]: any) => {
            const isActive = section === key;
            return (
              <button
                key={key}
                onClick={() => {
                  setSection(key);
                  setMobileNav(false);
                }}
                className={`nav-item neon-nav-item ${isActive ? 'active' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: '14px',
                  margin: '3px 0',
                  border: isActive ? '1px solid rgba(167, 139, 250, 0.45)' : '1px solid transparent',
                  background: isActive
                    ? 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)'
                    : 'transparent',
                  color: isActive ? '#ffffff' : '#94a3b8',
                  boxShadow: isActive ? '0 4px 20px rgba(124, 58, 237, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.2)' : 'none',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} style={{ color: isActive ? '#ffffff' : '#94a3b8', flexShrink: 0 }} />
                <span style={{ flex: 1, textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
                {key === 'users' && users.length > 0 && (
                  <span style={{
                    background: isActive ? 'rgba(255, 255, 255, 0.25)' : '#6366f1',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '11px',
                    padding: '2px 8px',
                    borderRadius: '999px',
                    boxShadow: '0 0 10px rgba(99, 102, 241, 0.4)'
                  }}>
                    {users.length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom" style={{ marginTop: 'auto', paddingTop: '16px' }}>
          <button
            className="nav-item neon-logout-btn"
            onClick={onLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              width: '100%',
              padding: '11px 14px',
              borderRadius: '14px',
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1.5px solid rgba(239, 68, 68, 0.35)',
              color: '#f87171',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <LogOut size={18} strokeWidth={2} style={{ color: '#f87171' }} />
            <span>Tizimdan çiqiş</span>
          </button>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="topbar-left" style={{ gap: '12px', display: 'flex', alignItems: 'center' }}>
            <button className="icon-btn hamburger topbar-neon-btn" onClick={() => setMobileNav(true)} aria-label="Menyuni oçiş">
              <Menu size={20} />
            </button>
            <div className="breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
              <Home size={15} style={{ color: '#38bdf8' }} />
              <span style={{ color: '#94a3b8' }}>Boşqaruv</span>
              <ChevronRight size={13} style={{ color: '#475569' }} />
              <strong style={{ color: '#ffffff', fontWeight: 700 }}>
                {String(adminNav.find(x => x[1] === section)?.[0] || 'Dashboard')}
              </strong>
            </div>
          </div>
          <div className="topbar-right" style={{ gap: '12px', display: 'flex', alignItems: 'center' }}>
            {/* Notification Bell with red unread counter badge */}
            <button
              className="icon-btn topbar-neon-btn"
              title="Bildirişnomalar"
              style={{ position: 'relative' }}
            >
              <Bell size={18} />
              <span style={{
                position: 'absolute',
                top: '-3px',
                right: '-3px',
                width: '17px',
                height: '17px',
                borderRadius: '50%',
                background: '#ef4444',
                color: '#ffffff',
                fontSize: '10px',
                fontWeight: 800,
                display: 'grid',
                placeItems: 'center',
                boxShadow: '0 0 10px rgba(239, 68, 68, 0.8)'
              }}>3</span>
            </button>

            {/* Manual refresh button */}
            <button
              className="icon-btn topbar-neon-btn"
              onClick={() => loadSupabaseData(true)}
              title="Supabasedan yangilaş"
              disabled={refreshing}
            >
              <RefreshCw size={17} className={refreshing ? 'animate-spin' : ''} />
            </button>

            {/* Theme switcher */}
            <button
              className="icon-btn topbar-neon-btn"
              onClick={() => setDark(!dark)}
              title="Mavzuni almaştiriş"
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Avatar with online dot */}
            <div style={{ position: 'relative', width: '38px', height: '38px', flexShrink: 0 }}>
              <div className="top-avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(59, 130, 246, 0.5)', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', display: 'grid', placeItems: 'center' }}>
                {cms.founderPhoto ? (
                  <img src={cms.founderPhoto} alt="Super Admin" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: '15px' }}>👑</span>
                )}
              </div>
              <span className="online-dot" style={{ position: 'absolute', bottom: '1px', right: '1px', width: '9px', height: '9px', borderRadius: '50%', background: '#10b981', border: '2px solid #060914', boxShadow: '0 0 8px #10b981' }} />
            </div>
          </div>
        </header>

        <div className="page-content">
          {/* DASHBOARD SECTION */}
          {section === 'dashboard' && (
            <>
              {/* ROW 1: Hero Banner (Left) + Today & Quote Card (Right) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2.2fr) minmax(280px, 1fr)', gap: '20px', marginBottom: '22px' }}>
                {/* Hero Card */}
                <div className="neon-card neon-hero-card">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="neon-kicker-pill">
                      <ShieldCheck size={13} />
                      <span>ASSOSIY STATISTIKA VA TAHLIL</span>
                    </div>
                    <h1 style={{ fontSize: '32px', fontWeight: 900, color: '#ffffff', margin: '4px 0 10px', lineHeight: 1.25, letterSpacing: '-0.5px' }}>
                      Platforma <span style={{ background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Körsatkiçlari</span>
                    </h1>
                    <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: 1.6, maxWidth: '480px', margin: 0 }}>
                      Bu yerda siz platformaning umumiy faoliyati va foydalanuvçilar haqidagi muhim ma’lumotlarni kuzatişingiz mumkin.
                    </p>
                  </div>

                  {/* 3D Isometric Neon Laptop & Books Illustration */}
                  <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="220" height="145" viewBox="0 0 220 145" fill="none" xmlns="http://www.w3.org/2000/svg" className="neon-hero-illustration">
                      <defs>
                        <linearGradient id="laptopScreenGrad" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#0b112c" />
                          <stop offset="100%" stopColor="#1e1b4b" />
                        </linearGradient>
                        <linearGradient id="neonCyanPurple" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#06b6d4" />
                          <stop offset="100%" stopColor="#a855f7" />
                        </linearGradient>
                      </defs>
                      {/* Books stacked left */}
                      <g transform="translate(10, 60)">
                        <path d="M10 40 L60 22 L75 28 L25 46 Z" fill="#3b82f6" fillOpacity="0.85" />
                        <path d="M10 40 L25 46 L25 52 L10 46 Z" fill="#1d4ed8" />
                        <path d="M25 46 L75 28 L75 34 L25 52 Z" fill="#2563eb" />
                        <path d="M12 30 L58 14 L70 19 L24 35 Z" fill="#06b6d4" fillOpacity="0.9" />
                        <path d="M12 30 L24 35 L24 40 L12 35 Z" fill="#0891b2" />
                        <path d="M24 35 L70 19 L70 24 L24 40 Z" fill="#0e7490" />
                        <path d="M15 22 L55 8 L65 12 L25 26 Z" fill="#8b5cf6" />
                        <path d="M15 22 L25 26 L25 30 L15 26 Z" fill="#7c3aed" />
                        <path d="M25 26 L65 12 L65 16 L25 30 Z" fill="#6d28d9" />
                      </g>
                      {/* Laptop */}
                      <g transform="translate(56, 15)">
                        <rect x="25" y="10" width="105" height="70" rx="8" fill="#0a0f29" stroke="url(#neonCyanPurple)" strokeWidth="2.5" style={{ filter: 'drop-shadow(0 0 14px rgba(99, 102, 241, 0.45))' }} />
                        <rect x="30" y="15" width="95" height="60" rx="5" fill="url(#laptopScreenGrad)" />
                        {/* Chart Bars */}
                        <rect x="38" y="46" width="8" height="22" rx="2" fill="#06b6d4" style={{ filter: 'drop-shadow(0 0 4px #06b6d4)' }} />
                        <rect x="50" y="36" width="8" height="32" rx="2" fill="#3b82f6" style={{ filter: 'drop-shadow(0 0 4px #3b82f6)' }} />
                        <rect x="62" y="26" width="8" height="42" rx="2" fill="#8b5cf6" style={{ filter: 'drop-shadow(0 0 4px #8b5cf6)' }} />
                        <rect x="74" y="42" width="8" height="26" rx="2" fill="#a855f7" style={{ filter: 'drop-shadow(0 0 4px #a855f7)' }} />
                        <rect x="86" y="32" width="8" height="36" rx="2" fill="#06b6d4" style={{ filter: 'drop-shadow(0 0 4px #06b6d4)' }} />
                        {/* Trend Curve */}
                        <path d="M42 42 Q56 26 70 34 T100 24" fill="none" stroke="#f472b6" strokeWidth="2" strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 5px #f472b6)' }} />
                        <line x1="38" y1="22" x2="65" y2="22" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
                        <circle cx="115" cy="22" r="3" fill="#34d399" />
                        {/* Laptop Base */}
                        <path d="M12 80 L142 80 L160 98 L-4 98 Z" fill="#111827" stroke="rgba(99, 102, 241, 0.5)" strokeWidth="1.5" />
                        <rect x="65" y="86" width="28" height="8" rx="2" fill="#1f2937" stroke="rgba(147, 197, 253, 0.3)" strokeWidth="0.8" />
                      </g>
                      {/* Floating Graduation Cap */}
                      <g transform="translate(150, 8)">
                        <polygon points="35,5 65,18 35,31 5,18" fill="#1e1b4b" stroke="#38bdf8" strokeWidth="2" style={{ filter: 'drop-shadow(0 0 10px rgba(56, 189, 248, 0.7))' }} />
                        <path d="M20 25 C20 38 50 38 50 25 Z" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
                        <path d="M35 18 C48 18 52 28 54 36" fill="none" stroke="#f59e0b" strokeWidth="1.5" />
                        <circle cx="54" cy="38" r="2.5" fill="#f59e0b" style={{ filter: 'drop-shadow(0 0 4px #f59e0b)' }} />
                      </g>
                      {/* Ambient stars */}
                      <circle cx="28" cy="35" r="2" fill="#a855f7" opacity="0.8" style={{ filter: 'drop-shadow(0 0 4px #a855f7)' }} />
                      <circle cx="198" cy="65" r="2.5" fill="#06b6d4" opacity="0.9" style={{ filter: 'drop-shadow(0 0 5px #06b6d4)' }} />
                    </svg>
                  </div>
                </div>

                {/* Today & Encouragement Card */}
                <div className="neon-card" style={{ padding: '24px 26px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                      <div style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '12px',
                        background: 'rgba(139, 92, 246, 0.18)',
                        border: '1px solid rgba(139, 92, 246, 0.4)',
                        display: 'grid',
                        placeItems: 'center',
                        color: '#c4b5fd',
                        boxShadow: '0 0 14px rgba(139, 92, 246, 0.25)',
                        flexShrink: 0
                      }}>
                        <Calendar size={20} />
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700 }}>Bugungi sana</div>
                        <div style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', letterSpacing: '0.2px' }}>{todayFormatted}</div>
                      </div>
                    </div>

                    <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px', fontWeight: 600 }}>
                      Yaxşi natijalar davom etadi!
                    </div>

                    <div style={{ fontSize: '13px', fontStyle: 'italic', color: '#cbd5e1', lineHeight: 1.5, background: 'rgba(255, 255, 255, 0.03)', padding: '10px 14px', borderRadius: '12px', borderLeft: '3px solid #8b5cf6' }}>
                      "Har bir kiçik qadam katta maqsad sari olib boradi."
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                    <button
                      className="neon-circle-arrow-btn"
                      onClick={() => { setSection('users'); setUsersSubTab('learners'); }}
                      title="Öquvçilar röyxatiga ötiş"
                    >
                      <ArrowRight size={15} />
                    </button>
                  </div>
                </div>
              </div>

              {/* ROW 2: 4 Metric Cards */}
              <div className="neon-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '18px', marginBottom: '22px' }}>
                {/* Metric 1: Faol O'quvchilar */}
                <div
                  className="neon-card metric-card-neon"
                  style={{ cursor: 'pointer' }}
                  onClick={() => { setSection('users'); setUsersSubTab('learners'); }}
                  title="Öquvçilar röyxatiga ötiş"
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div className="metric-icon-badge" style={{ background: 'rgba(139, 92, 246, 0.18)', border: '1px solid rgba(139, 92, 246, 0.4)', color: '#c4b5fd', boxShadow: '0 0 14px rgba(139, 92, 246, 0.25)' }}>
                      <Users size={20} />
                    </div>
                    <div style={{ flex: 1, marginLeft: '12px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8' }}>Faol Öquvçilar</div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '2px' }}>
                        <span style={{ fontSize: '30px', fontWeight: 900, color: '#ffffff', lineHeight: 1 }}>{totalStudents}</span>
                        <span className="metric-trend-pill" style={{ background: 'rgba(16, 185, 129, 0.16)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                          ▲ +20%
                        </span>
                      </div>
                    </div>
                    <button className="neon-circle-arrow-btn" tabIndex={-1}>
                      <ArrowRight size={14} />
                    </button>
                  </div>

                  {/* Sparkline wave */}
                  <div className="neon-sparkline-wrap">
                    <svg viewBox="0 0 120 28" preserveAspectRatio="none" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                      <path d="M0,20 Q30,5 60,18 T120,8" fill="none" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 6px rgba(139, 92, 246, 0.7))' }} />
                    </svg>
                  </div>

                  <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>
                    Jami tizim hisoblari: {stats.totalUsers || users.length} ta
                  </div>
                </div>

                {/* Metric 2: O'qituvchilar */}
                <div
                  className="neon-card metric-card-neon"
                  style={{ cursor: 'pointer' }}
                  onClick={() => { setSection('users'); setUsersSubTab('teachers'); }}
                  title="Öqituvçilar röyxatiga ötiş"
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div className="metric-icon-badge" style={{ background: 'rgba(59, 130, 246, 0.18)', border: '1px solid rgba(59, 130, 246, 0.4)', color: '#93c5fd', boxShadow: '0 0 14px rgba(59, 130, 246, 0.25)' }}>
                      <GraduationCap size={20} />
                    </div>
                    <div style={{ flex: 1, marginLeft: '12px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8' }}>Öqituvçilar</div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '2px' }}>
                        <span style={{ fontSize: '30px', fontWeight: 900, color: '#ffffff', lineHeight: 1 }}>{stats.activeTeachers || 1}</span>
                        <span className="metric-trend-pill" style={{ background: 'rgba(6, 182, 212, 0.16)', color: '#38bdf8', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
                          ▲ +0%
                        </span>
                      </div>
                    </div>
                    <button className="neon-circle-arrow-btn" tabIndex={-1}>
                      <ArrowRight size={14} />
                    </button>
                  </div>

                  <div className="neon-sparkline-wrap">
                    <svg viewBox="0 0 120 28" preserveAspectRatio="none" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                      <path d="M0,18 Q35,24 70,12 T120,16" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 6px rgba(59, 130, 246, 0.7))' }} />
                    </svg>
                  </div>

                  <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>
                    {totalStudents} ta öquvçiga biriktirilgan
                  </div>
                </div>

                {/* Metric 3: O'quv Materiallari */}
                <div
                  className="neon-card metric-card-neon"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSection('reading')}
                  title="Materiallar bölimiga ötiş"
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div className="metric-icon-badge" style={{ background: 'rgba(16, 185, 129, 0.18)', border: '1px solid rgba(16, 185, 129, 0.4)', color: '#6ee7b7', boxShadow: '0 0 14px rgba(16, 185, 129, 0.25)' }}>
                      <BookOpen size={20} />
                    </div>
                    <div style={{ flex: 1, marginLeft: '12px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8' }}>Öquv Materiallari</div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '2px' }}>
                        <span style={{ fontSize: '30px', fontWeight: 900, color: '#ffffff', lineHeight: 1 }}>{stats.totalMaterials || 3}</span>
                        <span className="metric-trend-pill" style={{ background: 'rgba(16, 185, 129, 0.16)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                          ▲ +50%
                        </span>
                      </div>
                    </div>
                    <button className="neon-circle-arrow-btn" tabIndex={-1}>
                      <ArrowRight size={14} />
                    </button>
                  </div>

                  <div className="neon-sparkline-wrap">
                    <svg viewBox="0 0 120 28" preserveAspectRatio="none" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                      <path d="M0,22 Q40,10 75,20 T120,6" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 6px rgba(16, 185, 129, 0.7))' }} />
                    </svg>
                  </div>

                  <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>
                    Reading: {stats.readingMaterialsCount || 1} · Writing: {stats.writingMaterialsCount || 0}
                  </div>
                </div>

                {/* Metric 4: Shaxsiy Lug'at So'zlari */}
                <div
                  className="neon-card metric-card-neon"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSection('vocab')}
                  title="Luğat bölimiga ötiş"
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div className="metric-icon-badge" style={{ background: 'rgba(236, 72, 153, 0.18)', border: '1px solid rgba(236, 72, 153, 0.4)', color: '#f472b6', boxShadow: '0 0 14px rgba(236, 72, 153, 0.25)' }}>
                      <TrendingUp size={20} />
                    </div>
                    <div style={{ flex: 1, marginLeft: '12px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8' }}>Şaxsiy Luğat Sözlari</div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '2px' }}>
                        <span style={{ fontSize: '30px', fontWeight: 900, color: '#ffffff', lineHeight: 1 }}>{stats.totalVocabularyEntries || 0}</span>
                        <span className="metric-trend-pill" style={{ background: 'rgba(236, 72, 153, 0.16)', color: '#f472b6', border: '1px solid rgba(236, 72, 153, 0.3)' }}>
                          ▲ +0%
                        </span>
                      </div>
                    </div>
                    <button className="neon-circle-arrow-btn" tabIndex={-1}>
                      <ArrowRight size={14} />
                    </button>
                  </div>

                  <div className="neon-sparkline-wrap">
                    <svg viewBox="0 0 120 28" preserveAspectRatio="none" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                      <path d="M0,15 Q30,6 60,18 T120,10" fill="none" stroke="#ec4899" strokeWidth="2.5" strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 6px rgba(236, 72, 153, 0.7))' }} />
                    </svg>
                  </div>

                  <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>
                    {stats.totalPracticeSessions || 0} ta test seksiyasi
                  </div>
                </div>
              </div>

              {/* ROW 3: CEFR Level Distribution Card */}
              <div className="neon-card" style={{ padding: '26px 28px', marginBottom: '22px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '12px',
                      background: 'rgba(139, 92, 246, 0.18)',
                      border: '1px solid rgba(139, 92, 246, 0.4)',
                      display: 'grid',
                      placeItems: 'center',
                      color: '#c4b5fd',
                      boxShadow: '0 0 14px rgba(139, 92, 246, 0.25)',
                      flexShrink: 0
                    }}>
                      <Layers size={20} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                        Öquvçilarning CEFR Darajalari Taqsimoti (Haqiqiy Supabase ma’lumotlari)
                      </h3>
                      <p style={{ fontSize: '12px', color: '#94a3b8', margin: '3px 0 0' }}>
                        Foydalanuvçilar qaysi darajada ekanligi va real foiz körsatkiçlari
                      </p>
                    </div>
                  </div>

                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 14px',
                    borderRadius: '999px',
                    background: 'rgba(59, 130, 246, 0.12)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    color: '#93c5fd',
                    fontSize: '12px',
                    fontWeight: 700
                  }}>
                    <Users size={14} style={{ color: '#38bdf8' }} />
                    <span>Jami hisoblangan: {totalStudents} nafar öquvçi</span>
                  </div>
                </div>

                {/* 6 Circular Donut Ring Gauges */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))', gap: '16px' }}>
                  {cefrLevelsConfig.map(({ code, label, color }) => {
                    const numCount = Number(levelDist[code]) || 0;
                    const pct = totalStudents > 0 ? Math.round((numCount / totalStudents) * 100) : 0;
                    // Circle circumference for r=34 is 2 * PI * 34 = 213.63
                    const circumference = 213.63;
                    const strokeDashoffset = circumference - (circumference * pct) / 100;

                    return (
                      <div key={code} className="cefr-gauge-card">
                        <span style={{ fontSize: '11px', fontWeight: 800, color: color, letterSpacing: '0.6px', textTransform: 'uppercase' }}>
                          {label}
                        </span>

                        <div className="cefr-donut-container">
                          <svg width="84" height="84" viewBox="0 0 84 84">
                            {/* Background Track Circle */}
                            <circle
                              cx="42"
                              cy="42"
                              r="34"
                              fill="none"
                              stroke="rgba(255, 255, 255, 0.08)"
                              strokeWidth="6"
                            />
                            {/* Animated / Colored Arc */}
                            <circle
                              cx="42"
                              cy="42"
                              r="34"
                              fill="none"
                              stroke={color}
                              strokeWidth="6"
                              strokeDasharray={circumference}
                              strokeDashoffset={strokeDashoffset}
                              strokeLinecap="round"
                              transform="rotate(-90 42 42)"
                              style={{
                                filter: numCount > 0 ? `drop-shadow(0 0 6px ${color})` : 'none',
                                transition: 'stroke-dashoffset 0.6s ease'
                              }}
                            />
                          </svg>
                          <div className="cefr-donut-center">
                            <strong>{numCount}</strong>
                            <span>ta</span>
                          </div>
                        </div>

                        {/* Bottom Capsule Progress Bar */}
                        <div style={{ width: '85%', height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '6px', overflow: 'hidden', marginBottom: '8px' }}>
                          <div style={{
                            height: '100%',
                            width: `${pct}%`,
                            background: color,
                            boxShadow: numCount > 0 ? `0 0 8px ${color}` : 'none',
                            transition: 'width 0.4s ease'
                          }} />
                        </div>

                        <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700 }}>
                          {pct}% öquvçi
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ROW 4: Kontent Turlari Taqsimoti & So'nggi Ro'yxatdan O'tganlar */}
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '20px', marginBottom: '22px' }}>
                {/* Left: Kontent Turlari Taqsimoti */}
                <div className="neon-card" style={{ padding: '26px 28px', position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '12px',
                        background: 'rgba(59, 130, 246, 0.18)',
                        border: '1px solid rgba(59, 130, 246, 0.4)',
                        display: 'grid',
                        placeItems: 'center',
                        color: '#93c5fd',
                        boxShadow: '0 0 14px rgba(59, 130, 246, 0.25)',
                        flexShrink: 0
                      }}>
                        <BookMarked size={19} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                          Kontent Turlari Taqsimoti
                        </h3>
                        <p style={{ fontSize: '12px', color: '#94a3b8', margin: '3px 0 0' }}>
                          Supabaseda mavjud barça ta’lim materiallari
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Stacked 3D Books decoration in bottom right */}
                  <div style={{ position: 'absolute', right: '18px', bottom: '16px', pointerEvents: 'none', opacity: 0.18 }}>
                    <svg width="75" height="65" viewBox="0 0 75 65" fill="none">
                      <path d="M10 45 L45 28 L60 34 L25 50 Z" fill="#3b82f6" />
                      <path d="M10 45 L25 50 L25 55 L10 50 Z" fill="#1d4ed8" />
                      <path d="M25 50 L60 34 L60 39 L25 55 Z" fill="#2563eb" />
                      <path d="M12 36 L48 20 L58 25 L22 41 Z" fill="#06b6d4" />
                      <path d="M12 36 L22 41 L22 45 L12 41 Z" fill="#0891b2" />
                      <path d="M22 41 L58 25 L58 29 L22 45 Z" fill="#0e7490" />
                      <path d="M15 28 L44 14 L52 18 L23 32 Z" fill="#8b5cf6" />
                      <path d="M15 28 L23 32 L23 35 L15 32 Z" fill="#7c3aed" />
                      <path d="M23 32 L52 18 L52 21 L23 35 Z" fill="#6d28d9" />
                    </svg>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative', zIndex: 1 }}>
                    {[
                      {
                        label: 'Reading (Hikoyalar va Maqolalar)',
                        count: stats.readingMaterialsCount || (stats.totalMaterials > 0 ? 1 : 0),
                        color: '#8b5cf6',
                        icon: BookMarked,
                        targetSection: 'reading'
                      },
                      {
                        label: 'Writing (Inşo va Grammatika)',
                        count: stats.writingMaterialsCount || 0,
                        color: '#ea580c',
                        icon: PenLine,
                        targetSection: 'writing'
                      },
                      {
                        label: 'Listening (Podcast va Audiolar)',
                        count: stats.listeningMaterialsCount || 0,
                        color: '#06b6d4',
                        icon: Headphones,
                        targetSection: 'listening'
                      },
                      {
                        label: 'Video (Darsliklar va Suhbatlar)',
                        count: stats.videoMaterialsCount || 0,
                        color: '#10b981',
                        icon: Video,
                        targetSection: 'videos'
                      }
                    ].map(item => {
                      const totalMat = Math.max(1, stats.totalMaterials || 3);
                      const pct = Math.round((item.count / totalMat) * 100);
                      const Icon = item.icon;
                      return (
                        <div
                          key={item.label}
                          style={{
                            background: 'rgba(15, 23, 42, 0.7)',
                            padding: '12px 16px',
                            borderRadius: '14px',
                            border: '1px solid rgba(59, 130, 246, 0.18)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '14px'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '180px' }}>
                            <div style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '10px',
                              background: `${item.color}22`,
                              border: `1px solid ${item.color}55`,
                              display: 'grid',
                              placeItems: 'center',
                              color: item.color,
                              flexShrink: 0
                            }}>
                              <Icon size={16} />
                            </div>
                            <span style={{ fontSize: '12px', fontWeight: 700, color: '#f1f5f9' }}>
                              {item.label}
                            </span>
                          </div>

                          <div style={{ flex: 1, maxWidth: '140px', height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '6px', overflow: 'hidden' }}>
                            <div style={{
                              height: '100%',
                              width: `${pct}%`,
                              background: item.color,
                              boxShadow: item.count > 0 ? `0 0 8px ${item.color}` : 'none'
                            }} />
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <strong style={{ fontSize: '13px', color: '#ffffff', minWidth: '65px', textAlign: 'right' }}>
                              {item.count} ta ({pct}%)
                            </strong>
                            <button
                              className="neon-circle-arrow-btn"
                              onClick={() => setSection(item.targetSection)}
                              title={`${item.label} bölimiga ötiş`}
                            >
                              <ArrowRight size={13} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right: Sönggi Röyxatdan Ötganlar (Supabase) */}
                <div className="neon-card" style={{ padding: '26px 28px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '12px',
                        background: 'rgba(139, 92, 246, 0.18)',
                        border: '1px solid rgba(139, 92, 246, 0.4)',
                        display: 'grid',
                        placeItems: 'center',
                        color: '#c4b5fd',
                        boxShadow: '0 0 14px rgba(139, 92, 246, 0.25)',
                        flexShrink: 0
                      }}>
                        <Clock size={19} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                          Sönggi Röyxatdan Ötganlar (Supabase)
                        </h3>
                        <p style={{ fontSize: '12px', color: '#94a3b8', margin: '3px 0 0' }}>
                          Tizimga yaqinda qöşilgan foydalanuvçilar
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => { setSection('users'); setUsersSubTab('all'); }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#38bdf8',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: 0
                      }}
                    >
                      Barçasi ({users.length || 8}) →
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
                    {(users.length > 0 ? users.slice(0, 5) : [
                      { id: '1', firstName: 'Soxib', lastName: 'Gaybullayev', email: 'gaybullayev2024@gmail.com', role: 'Learner', created_at: '2025-04-25T14:32:00Z' }
                    ]).map((u: any) => (
                      <div
                        key={u.id || u.email}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '11px 14px',
                          background: 'rgba(15, 23, 42, 0.7)',
                          borderRadius: '14px',
                          border: '1px solid rgba(59, 130, 246, 0.18)',
                          gap: '12px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                          <div style={{ position: 'relative', width: '34px', height: '34px', flexShrink: 0 }}>
                            <div className="avatar" style={{
                              width: '100%',
                              height: '100%',
                              fontSize: '12px',
                              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                              color: '#fff',
                              borderRadius: '50%',
                              display: 'grid',
                              placeItems: 'center',
                              fontWeight: 800,
                              border: '1px solid rgba(59, 130, 246, 0.3)'
                            }}>
                              {(u.firstName?.[0] || u.email?.[0] || 'U').toUpperCase()}
                            </div>
                            <span className="online-dot" style={{ position: 'absolute', bottom: '0px', right: '0px', width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', border: '1.5px solid #0a1026', boxShadow: '0 0 6px #10b981' }} />
                          </div>

                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {u.firstName || u.lastName ? `${u.firstName || ''} ${u.lastName || ''}`.trim() : u.email.split('@')[0]}
                            </div>
                            <div style={{ fontSize: '11px', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {u.email}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                          <span className={u.role === 'SuperAdmin' || u.role === 1 ? 'badge-role-admin' : u.role === 'Teacher' || u.role === 2 ? 'badge-role-teacher' : 'badge-role-learner'} style={{ fontSize: '11px' }}>
                            {String(u.role || 'Learner')}
                          </span>
                          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
                            {formatUserDate(u.created_at || u.createdAt)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* YAGONA FOYDALANUVCHILAR BO‘LIMI (4 TA SUB-TAB: ALL, LEARNERS, TEACHERS, ADMINS) */}
          {section === 'users' && (
            <>
              {/* Header */}
              <div className="welcome-row">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="eyebrow"><Users size={14} /> FOYDALANUVCHILAR VA XAVFSIZLIK MARKAZI</div>
                  <h1 style={{ wordBreak: 'break-word' }}>Foydalanuvchilar <span>Boshqaruvi</span></h1>
                  <p className="subheading">
                    Supabase PostgreSQL bazasidagi barcha foydalanuvchilar, o‘quvchilar, o‘qituvchilar va moderator adminlar yagona boshqaruvi.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0, flexWrap: 'wrap' }}>
                  <button className="primary-btn" onClick={() => loadSupabaseData(true)} disabled={refreshing}>
                    <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
                    Yangilash
                  </button>
                </div>
              </div>

              {/* Segmented Sub-Tab Bar */}
              <div style={{
                display: 'flex',
                gap: '8px',
                background: 'var(--panel)',
                padding: '6px',
                borderRadius: '14px',
                border: '1px solid var(--border)',
                overflowX: 'auto',
                marginBottom: '20px',
                scrollbarWidth: 'none'
              }}>
                {[
                  ['all', 'Umumiy Foydalanuvchilar', Users, users.length],
                  ['learners', 'O‘quvchilar', Boxes, learners.length],
                  ['teachers', 'O‘qituvchilar', GraduationCap, teachers.length],
                  ['admins', 'Adminlar & Ruxsatlar', UserCog, subAdmins.length]
                ].map(([tabKey, label, TabIcon, count]: any) => (
                  <button
                    key={tabKey}
                    onClick={() => setUsersSubTab(tabKey)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 16px',
                      borderRadius: '10px',
                      border: 'none',
                      background: usersSubTab === tabKey ? 'var(--purple)' : 'transparent',
                      color: usersSubTab === tabKey ? '#fff' : 'var(--muted)',
                      fontWeight: 700,
                      fontSize: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <TabIcon size={15} />
                    <span>{label}</span>
                    <span style={{
                      background: usersSubTab === tabKey ? 'rgba(255,255,255,0.25)' : 'var(--soft)',
                      color: usersSubTab === tabKey ? '#fff' : 'var(--purple)',
                      padding: '2px 7px',
                      borderRadius: '10px',
                      fontSize: '11px',
                      fontWeight: 800
                    }}>
                      {count}
                    </span>
                  </button>
                ))}
              </div>

              {/* SUB-TAB 1: UMUMIY FOYDALANUVCHILAR */}
              {usersSubTab === 'all' && (
                <>
                  <div className="panel" style={{ padding: '14px 18px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', width: '100%' }}>
                      <Search size={18} style={{ color: 'var(--muted)', flexShrink: 0 }} />
                      <input
                        value={allUsersSearch}
                        onChange={e => setAllUsersSearch(e.target.value)}
                        placeholder="Foydalanuvchi ismi, familiyasi yoki email bo‘yicha qidirish..."
                        style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', color: 'var(--text)' }}
                      />
                      {allUsersSearch && (
                        <button onClick={() => setAllUsersSearch('')} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: '4px' }}>
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="panel" style={{ padding: '20px' }}>
                    {filteredAllUsers.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--muted)' }}>
                        Foydalanuvchilar topilmadi.
                      </div>
                    ) : (
                      <>
                        <div className="admin-desktop-table admin-table-container">
                          <table className="admin-table">
                            <thead>
                              <tr>
                                <th>Foydalanuvchi</th>
                                <th>Email Manzili</th>
                                <th>Roli</th>
                                <th>Email Holati</th>
                                <th>Ro‘yxatdan O‘tgan</th>
                                <th>Holat</th>
                                <th style={{ textAlign: 'right' }}>Amallar</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredAllUsers.map((u: any) => (
                                <tr key={u.id}>
                                  <td style={{ fontWeight: 700 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                      <div className="avatar" style={{ width: '32px', height: '32px', fontSize: '12px', background: 'var(--soft)', color: 'var(--purple)', flexShrink: 0 }}>
                                        {(u.firstName?.[0] || u.email?.[0] || 'U').toUpperCase()}
                                      </div>
                                      <div>
                                        {u.firstName || u.lastName ? `${u.firstName || ''} ${u.lastName || ''}`.trim() : u.email.split('@')[0]}
                                      </div>
                                    </div>
                                  </td>
                                  <td style={{ color: 'var(--muted)' }}>{u.email}</td>
                                  <td>{renderUserRoleBadge(u)}</td>
                                  <td>
                                    {u.emailConfirmed ? (
                                      <span className="badge-verified"><CheckCircle2 size={12} /> Tasdiqlangan</span>
                                    ) : (
                                      <span className="badge-unverified"><AlertCircle size={12} /> Tasdiqlanmagan</span>
                                    )}
                                  </td>
                                  <td style={{ color: 'var(--muted)', fontSize: '11px' }}>
                                    {u.createdAtUtc ? new Date(u.createdAtUtc).toLocaleDateString('uz-UZ') : '—'}
                                  </td>
                                  <td>
                                    <span className={`status ${u.isActive !== false ? 'status-learned' : 'status-planned'}`}>
                                      {u.isActive !== false ? 'Faol' : 'Nofaol'}
                                    </span>
                                  </td>
                                  <td style={{ textAlign: 'right' }}>
                                    {isSuperAdmin(u) ? (
                                      <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 700, padding: '4px 10px', background: '#dcfce7', borderRadius: '12px' }}>
                                        Daxlsiz 👑
                                      </span>
                                    ) : (
                                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                                        <button
                                          className="outline-btn"
                                          onClick={() => setSelectedUserForEdit(u)}
                                          title="Rolni o‘zgartirish"
                                          style={{ padding: '6px 9px', fontSize: '11px' }}
                                        >
                                          <UserCog size={14} /> Rol
                                        </button>
                                        <button
                                          onClick={() => handleDeleteUser(u.id, u.email)}
                                          title="O‘chirish"
                                          style={{ background: 'none', border: 0, color: '#e05656', cursor: 'pointer', padding: '6px' }}
                                        >
                                          <Trash2 size={15} />
                                        </button>
                                      </div>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        <div className="mobile-cards-grid">
                          {filteredAllUsers.map((u: any) => (
                            <div key={u.id} className="learner-card">
                              <div className="learner-card-header">
                                <div className="avatar" style={{ width: '36px', height: '36px', fontSize: '13px', background: 'var(--soft)', color: 'var(--purple)', flexShrink: 0 }}>
                                  {(u.firstName?.[0] || u.email?.[0] || 'U').toUpperCase()}
                                </div>
                                <div style={{ minWidth: 0, flex: 1 }}>
                                  <strong style={{ fontSize: '13px', display: 'block', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {u.firstName || u.lastName ? `${u.firstName || ''} ${u.lastName || ''}`.trim() : u.email.split('@')[0]}
                                  </strong>
                                  <span style={{ fontSize: '11px', color: 'var(--muted)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {u.email}
                                  </span>
                                </div>
                              </div>

                              <div className="learner-card-body">
                                {renderUserRoleBadge(u)}
                                {u.emailConfirmed ? (
                                  <span className="badge-verified"><CheckCircle2 size={11} /> Tasdiqlangan</span>
                                ) : (
                                  <span className="badge-unverified"><AlertCircle size={11} /> Tasdiqlanmagan</span>
                                )}
                                <span style={{ fontSize: '10px', color: 'var(--muted)', marginLeft: 'auto' }}>
                                  {u.createdAtUtc ? new Date(u.createdAtUtc).toLocaleDateString('uz-UZ') : ''}
                                </span>
                              </div>

                              <div className="learner-card-actions">
                                {isSuperAdmin(u) ? (
                                  <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 700, padding: '4px 10px', background: '#dcfce7', borderRadius: '12px' }}>
                                    Daxlsiz Super Admin 👑
                                  </span>
                                ) : (
                                  <>
                                    <button
                                      className="outline-btn"
                                      onClick={() => setSelectedUserForEdit(u)}
                                      style={{ padding: '6px 12px', fontSize: '11px' }}
                                    >
                                      <UserCog size={13} /> Rolni o‘zgartirish
                                    </button>
                                    <button
                                      onClick={() => handleDeleteUser(u.id, u.email)}
                                      style={{ background: 'none', border: 0, color: '#e05656', cursor: 'pointer', padding: '6px' }}
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </>
              )}

              {/* SUB-TAB 2: O‘QUVCHILAR (LEARNERS) */}
              {usersSubTab === 'learners' && (
                <>
                  <div className="panel" style={{ padding: '14px 18px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flex: 1, minWidth: '220px' }}>
                        <Search size={18} style={{ color: 'var(--muted)', flexShrink: 0 }} />
                        <input
                          value={query}
                          onChange={e => setQuery(e.target.value)}
                          placeholder="O‘quvchi ismi, familiyasi yoki email bo‘yicha qidirish..."
                          style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: '12px', color: 'var(--text)' }}
                        />
                        {query && (
                          <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}>
                            <X size={16} />
                          </button>
                        )}
                      </div>

                      <div className="admin-filters-scroll">
                        {[
                          ['all', `Barcha O‘quvchilar (${learners.length})`],
                          ['verified', 'Tasdiqlanganlar'],
                          ['unverified', 'Tasdiqlanmaganlar'],
                          ['active', 'Faol O‘quvchilar']
                        ].map(([f, label]) => (
                          <button
                            key={f}
                            onClick={() => setStudentStatusFilter(f as any)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '8px',
                              border: studentStatusFilter === f ? '1px solid var(--purple)' : '1px solid var(--border)',
                              background: studentStatusFilter === f ? 'var(--soft)' : 'var(--panel)',
                              color: studentStatusFilter === f ? 'var(--purple)' : 'var(--muted)',
                              fontSize: '11px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              whiteSpace: 'nowrap',
                              flexShrink: 0
                            }}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="panel" style={{ padding: '20px' }}>
                    {filteredLearners.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--muted)' }}>
                        O‘quvchilar topilmadi.
                      </div>
                    ) : (
                      <>
                        <div className="admin-desktop-table admin-table-container">
                          <table className="admin-table">
                            <thead>
                              <tr>
                                <th>O‘quvchi</th>
                                <th>Email Manzili</th>
                                <th>Roli</th>
                                <th>Email Holati</th>
                                <th>Ro‘yxatdan O‘tgan</th>
                                <th style={{ textAlign: 'right' }}>Amallar</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredLearners.map((u: any) => (
                                <tr key={u.id}>
                                  <td style={{ fontWeight: 700 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                      <div className="avatar" style={{ width: '32px', height: '32px', fontSize: '12px', background: 'var(--soft)', color: 'var(--purple)', flexShrink: 0 }}>
                                        {(u.firstName?.[0] || u.email?.[0] || 'O').toUpperCase()}
                                      </div>
                                      <div>
                                        {u.firstName || u.lastName ? `${u.firstName || ''} ${u.lastName || ''}`.trim() : 'O‘quvchi'}
                                      </div>
                                    </div>
                                  </td>
                                  <td style={{ color: 'var(--muted)' }}>{u.email}</td>
                                  <td>
                                    <span className="badge-role-learner">
                                      Learner (O‘quvchi)
                                    </span>
                                  </td>
                                  <td>
                                    {u.emailConfirmed ? (
                                      <span className="badge-verified">
                                        <CheckCircle2 size={12} /> Tasdiqlangan
                                      </span>
                                    ) : (
                                      <span className="badge-unverified">
                                        <AlertCircle size={12} /> Tasdiqlanmagan
                                      </span>
                                    )}
                                  </td>
                                  <td style={{ color: 'var(--muted)', fontSize: '11px' }}>
                                    {u.createdAtUtc ? new Date(u.createdAtUtc).toLocaleDateString('uz-UZ') : '—'}
                                  </td>
                                  <td style={{ textAlign: 'right' }}>
                                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                                      <button
                                        onClick={() => handleDeleteUser(u.id, u.email)}
                                        title="O‘chirish"
                                        style={{ background: 'none', border: 0, color: '#e05656', cursor: 'pointer', padding: '6px' }}
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        <div className="mobile-cards-grid">
                          {filteredLearners.map((u: any) => (
                            <div key={u.id} className="learner-card">
                              <div className="learner-card-header">
                                <div className="avatar" style={{ width: '36px', height: '36px', fontSize: '13px', background: 'var(--soft)', color: 'var(--purple)', flexShrink: 0 }}>
                                  {(u.firstName?.[0] || u.email?.[0] || 'O').toUpperCase()}
                                </div>
                                <div style={{ minWidth: 0, flex: 1 }}>
                                  <strong style={{ fontSize: '13px', display: 'block', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {u.firstName || u.lastName ? `${u.firstName || ''} ${u.lastName || ''}`.trim() : 'O‘quvchi'}
                                  </strong>
                                  <span style={{ fontSize: '11px', color: 'var(--muted)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {u.email}
                                  </span>
                                </div>
                              </div>

                              <div className="learner-card-body">
                                <span className="badge-role-learner">O‘quvchi</span>
                                {u.emailConfirmed ? (
                                  <span className="badge-verified"><CheckCircle2 size={11} /> Tasdiqlangan</span>
                                ) : (
                                  <span className="badge-unverified"><AlertCircle size={11} /> Tasdiqlanmagan</span>
                                )}
                                <span style={{ fontSize: '10px', color: 'var(--muted)', marginLeft: 'auto' }}>
                                  {u.createdAtUtc ? new Date(u.createdAtUtc).toLocaleDateString('uz-UZ') : ''}
                                </span>
                              </div>

                              <div className="learner-card-actions" style={{ justifyContent: 'flex-end' }}>
                                <button
                                  onClick={() => handleDeleteUser(u.id, u.email)}
                                  title="O‘chirish"
                                  style={{ background: 'none', border: 0, color: '#e05656', cursor: 'pointer', padding: '6px' }}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </>
              )}

              {/* SUB-TAB 3: O‘QITUVCHILAR (TEACHERS) */}
              {usersSubTab === 'teachers' && (
                <>
                  {/* Teachers Search & Table */}
                  <div className="panel" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                      <h3 style={{ margin: 0 }}>Mavjud O‘qituvchilar Ro‘yxati ({teachers.length} ta)</h3>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', minWidth: '220px' }}>
                        <Search size={16} style={{ color: 'var(--muted)' }} />
                        <input
                          value={teacherSearch}
                          onChange={e => setTeacherSearch(e.target.value)}
                          placeholder="Ustoz ismi yoki mutaxassisligi..."
                          style={{ padding: '6px 10px', fontSize: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
                        />
                      </div>
                    </div>

                    <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>ISMI</th>
                            <th>EMAIL</th>
                            <th>MUTAXASSISLIK</th>
                            <th>O‘QUVCHILAR</th>
                            <th>HOLAT</th>
                            <th style={{ textAlign: 'right' }}>AMALLAR</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredTeachers.length === 0 ? (
                            <tr>
                              <td colSpan={6} style={{ textAlign: 'center', padding: '28px', color: 'var(--muted)' }}>
                                O‘qituvchilar topilmadi.
                              </td>
                            </tr>
                          ) : (
                            filteredTeachers.map((t: any) => (
                              <tr key={t.id || t.userId}>
                                <td style={{ fontWeight: 700 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div className="avatar" style={{ width: '32px', height: '32px', fontSize: '12px', background: 'var(--soft)', color: 'var(--purple)', flexShrink: 0 }}>
                                      {(t.name?.[0] || t.fullName?.[0] || t.email?.[0] || 'U').toUpperCase()}
                                    </div>
                                    <div>{t.name || t.fullName || 'O‘qituvchi'}</div>
                                  </div>
                                </td>
                                <td style={{ color: 'var(--muted)' }}>{t.email || '-'}</td>
                                <td>{t.specialty || t.qualifications || 'Ingliz tili'}</td>
                                <td>{t.students || 0} ta</td>
                                <td>
                                  <span className={`status ${t.status === 'Faol' || t.isApproved ? 'status-learned' : 'status-planned'}`}>
                                    {t.status || (t.isApproved ? 'Faol' : 'Nofaol')}
                                  </span>
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                  <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                                    <button
                                      className="outline-btn"
                                      title="Tahrirlash"
                                      onClick={() => openEditTeacher(t)}
                                      style={{ padding: '6px 10px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                    >
                                      <Edit3 size={13} /> Tahrirlash
                                    </button>
                                    <button
                                      className="outline-btn"
                                      title="O‘quvchilikka qaytarish"
                                      onClick={() => handleDemoteTeacher(t.id || t.userId, t.name || t.fullName || t.email)}
                                      style={{ padding: '6px 10px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                    >
                                      <RotateCcw size={13} /> O‘quvchi qilish
                                    </button>
                                    <button
                                      onClick={() => handleDeleteTeacher(t.id || t.userId, t.name || t.fullName || t.email)}
                                      title="O‘chirish"
                                      style={{ background: 'none', border: 0, color: '#e05656', cursor: 'pointer', padding: '6px' }}
                                    >
                                      <Trash2 size={15} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}

              {/* SUB-TAB 4: ADMINLAR & RUXSATLAR (ADMINS) */}
              {usersSubTab === 'admins' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                  {/* Super Admin Status Card */}
                  <div className="panel" style={{
                    padding: '24px',
                    background: 'linear-gradient(135deg, rgba(120, 105, 245, 0.08), rgba(91, 75, 240, 0.04))',
                    border: '1.5px solid rgba(120, 105, 245, 0.3)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                        <div style={{ position: 'relative', width: '56px', height: '56px', flexShrink: 0 }}>
                          {cms.founderPhoto ? (
                            <img
                              src={cms.founderPhoto}
                              alt={cms.founderName || 'Super Admin'}
                              style={{ width: '56px', height: '56px', borderRadius: '16px', objectFit: 'cover', border: '2px solid #7869f5', boxShadow: '0 4px 14px rgba(120, 105, 245, 0.35)' }}
                            />
                          ) : (
                            <div style={{
                              width: '56px',
                              height: '56px',
                              borderRadius: '16px',
                              background: 'linear-gradient(135deg, #7869f5, #5b4bf0)',
                              color: '#fff',
                              display: 'grid',
                              placeItems: 'center',
                              fontWeight: 800,
                              fontSize: '24px',
                              boxShadow: '0 4px 14px rgba(120, 105, 245, 0.35)'
                            }}>
                              👑
                            </div>
                          )}
                          <span style={{
                            position: 'absolute',
                            bottom: '-4px',
                            right: '-4px',
                            background: '#fff',
                            borderRadius: '50%',
                            padding: '2px',
                            fontSize: '12px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.18)',
                            lineHeight: 1
                          }}>👑</span>
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--text)' }}>{cms.founderName || 'Soxibjon Gaybullayev'}</h3>
                            <span style={{
                              background: '#7869f5',
                              color: '#fff',
                              fontSize: '10px',
                              fontWeight: 800,
                              padding: '3px 8px',
                              borderRadius: '6px'
                            }}>
                              YAGONA SUPER ADMIN (1 NAFAR)
                            </span>
                            <span className="badge-verified">Daxlsiz</span>
                          </div>
                          <p style={{ margin: '4px 0 8px', fontSize: '12px', color: 'var(--muted)' }}>
                            Platforma asoschisi va yagona to‘liq boshqaruvchisi. Uni hech kim tizimdan chiqara yoki o‘chira olmaydi.
                          </p>
                          <label className="outline-btn" style={{ fontSize: '11px', padding: '5px 10px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                            <Camera size={13} />
                            {uploadingFounder ? 'Yuklanmoqda...' : 'Super Admin Rasmini Yuklash / O‘zgartirish'}
                            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFounderPhotoUpload} disabled={uploadingFounder} />
                          </label>
                        </div>
                      </div>
                      <div style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#16a34a',
                        background: '#dcfce7',
                        padding: '8px 14px',
                        borderRadius: '20px'
                      }}>
                        To‘liq cheksiz boshqaruv huquqi ✓
                      </div>
                    </div>
                  </div>

                  {/* Sub-Admins Table & Permissions */}
                  <div className="panel" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
                      <div>
                        <h2 style={{ margin: '0 0 4px', fontSize: '17px' }}>Saylangan Moderator Adminlar ({subAdmins.length})</h2>
                        <p style={{ margin: 0, fontSize: '11px', color: 'var(--muted)' }}>
                          Umumiy foydalanuvchilar orasidan Super Admin tomonidan tayinlangan moderatorlar va ularning faol ruxsatlari.
                        </p>
                      </div>
                    </div>

                    {subAdmins.length === 0 ? (
                      <div style={{
                        padding: '36px 20px',
                        textAlign: 'center',
                        background: 'var(--bg)',
                        borderRadius: '12px',
                        border: '1px dashed var(--border)'
                      }}>
                        <ShieldAlert size={32} style={{ color: 'var(--muted)', margin: '0 auto 10px' }} />
                        <strong style={{ display: 'block', fontSize: '13px', color: 'var(--text)', marginBottom: '4px' }}>
                          Hozircha qo‘shimcha admin tayinlanmagan
                        </strong>
                        <p style={{ margin: 0, fontSize: '11px', color: 'var(--muted)' }}>
                          Super Admin sifatida <strong>"Umumiy Foydalanuvchilar"</strong> ro‘yxatidan istalgan foydalanuvchini moderator admin qilib tayinlashingiz mumkin.
                        </p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {subAdmins.map((admin: any) => {
                          const perms = adminPerms[admin.id] || { canVocab: true, canTeachers: false, canCMS: true, canMaterials: true, canStudents: true };
                          const permItems = [
                            { key: 'canVocab', label: 'Umumiy Lug‘at', icon: '📚' },
                            { key: 'canCMS', label: 'Welcome (CMS)', icon: '🌐' },
                            { key: 'canTeachers', label: 'O‘qituvchilar', icon: '🎓' },
                            { key: 'canMaterials', label: 'Materiallar', icon: '✍️' },
                            { key: 'canStudents', label: 'Reestr / O‘quvchilar', icon: '📊' }
                          ];
                          const activePerms = permItems.filter(p => Boolean((perms as any)[p.key]));

                          return (
                            <div key={admin.id} style={{
                              background: 'var(--bg)',
                              border: '1px solid var(--border)',
                              borderRadius: '14px',
                              padding: '16px 18px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '12px'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  <div className="avatar" style={{ width: '40px', height: '40px', fontSize: '15px', background: 'var(--soft)', color: 'var(--purple)', flexShrink: 0 }}>
                                    {(admin.firstName?.[0] || admin.email?.[0] || 'A').toUpperCase()}
                                  </div>
                                  <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <strong style={{ fontSize: '13.5px', color: 'var(--text)' }}>
                                        {admin.firstName || admin.lastName ? `${admin.firstName || ''} ${admin.lastName || ''}`.trim() : 'Admin'}
                                      </strong>
                                      <span className="badge-role-admin">
                                        Moderator Admin
                                      </span>
                                    </div>
                                    <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{admin.email}</span>
                                  </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                  <button
                                    className="outline-btn"
                                    onClick={() => setPermsModalAdmin(admin)}
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '6px',
                                      padding: '7px 12px',
                                      fontSize: '11.5px',
                                      fontWeight: 700,
                                      color: 'var(--purple)',
                                      borderColor: 'var(--purple)',
                                      borderRadius: '8px',
                                      background: 'rgba(120, 105, 245, 0.06)'
                                    }}
                                  >
                                    <ShieldCheck size={14} /> Admin Ruxsatlari
                                  </button>
                                  <button
                                    onClick={() => handleDemoteAdmin(admin.id, admin.email)}
                                    style={{
                                      padding: '7px 12px',
                                      border: '1px solid #fee2e2',
                                      background: '#fef2f2',
                                      color: '#b91c1c',
                                      borderRadius: '8px',
                                      fontSize: '11.5px',
                                      fontWeight: 700,
                                      cursor: 'pointer'
                                    }}
                                  >
                                    Adminlikdan olish
                                  </button>
                                </div>
                              </div>

                              {/* Active permissions summary badges row */}
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                flexWrap: 'wrap',
                                paddingTop: '8px',
                                borderTop: '1px solid var(--border)'
                              }}>
                                <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600 }}>Faol ruxsatlar:</span>
                                {activePerms.length === 0 ? (
                                  <span style={{ fontSize: '11px', color: '#e05656', fontWeight: 600 }}>Hech qanday ruxsat yo‘q</span>
                                ) : (
                                  activePerms.map(p => (
                                    <span
                                      key={p.key}
                                      style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        fontSize: '11px',
                                        padding: '2px 8px',
                                        borderRadius: '6px',
                                        background: 'var(--panel)',
                                        border: '1px solid var(--border)',
                                        color: 'var(--text)'
                                      }}
                                    >
                                      <span>{p.icon}</span>
                                      <span>{p.label}</span>
                                    </span>
                                  ))
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* LUG‘AT BOZASI SECTION */}
          {section === 'vocab' && (
            <>
              <div className="welcome-row">
                <div>
                  <div className="eyebrow"><BookOpen size={14} /> LUG‘AT BAZASI</div>
                  <h1>Umumiy <span>Lug‘at Boshqaruvi</span></h1>
                  <p className="subheading">Supabase bazasida saqlanuvchi barcha lug‘at so‘zlari ({generalVocab.length} ta so‘z).</p>
                </div>
              </div>

              <div className="panel" style={{ padding: '24px', marginBottom: '24px' }}>
                <h3 style={{ marginBottom: '14px' }}>Yangi So‘z Qo‘shish (Supabasega yoziladi)</h3>
                <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
                  <label>Inglizcha so‘z<input value={vocabForm.word} onChange={e => setVocabForm({ ...vocabForm, word: e.target.value })} placeholder="resilience" /></label>
                  <label>Tarjimasi<input value={vocabForm.translation} onChange={e => setVocabForm({ ...vocabForm, translation: e.target.value })} placeholder="chidamlilik" /></label>
                  <label>Daraja
                    <select value={vocabForm.level} onChange={e => setVocabForm({ ...vocabForm, level: e.target.value })}>
                      <option>A1</option><option>A2</option><option>B1</option><option>B2</option><option>C1</option><option>C2</option>
                    </select>
                  </label>
                  <label>Mavzu
                    <select value={vocabForm.topic} onChange={e => setVocabForm({ ...vocabForm, topic: e.target.value })}>
                      {topics.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </label>
                  <label className="span-two">Misol jumla (ixtiyoriy)<input value={vocabForm.example} onChange={e => setVocabForm({ ...vocabForm, example: e.target.value })} placeholder="He showed great resilience." /></label>
                </div>
                <button className="primary-btn" onClick={handleAddVocab} style={{ marginTop: '16px' }}>
                  <Plus size={16} /> So‘zni Supabasega Qo‘shish
                </button>
              </div>

              <div className="panel" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0 }}>Bazadagi So‘zlar ({filteredVocab.length} ta)</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid var(--border)', borderRadius: '8px', padding: '6px 10px', width: '220px' }}>
                    <Search size={14} style={{ color: 'var(--muted)' }} />
                    <input
                      value={vocabSearch}
                      onChange={e => setVocabSearch(e.target.value)}
                      placeholder="Qidirish..."
                      style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '11px', width: '100%', color: 'var(--text)' }}
                    />
                  </div>
                </div>

                <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>SO‘Z</th>
                        <th>TARJIMA</th>
                        <th>DARAJA</th>
                        <th>MAVZU</th>
                        <th>MISOL</th>
                        <th style={{ textAlign: 'right' }}>AMAL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredVocab.length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--muted)' }}>
                            So‘zlar topilmadi.
                          </td>
                        </tr>
                      ) : (
                        filteredVocab.map((v: any) => (
                          <tr key={v.id}>
                            <td style={{ fontWeight: 800 }}>{v.word || v.targetWord}</td>
                            <td>{v.translation || v.nativeTranslation}</td>
                            <td><span className="status status-progress">{v.level || 'B1'}</span></td>
                            <td style={{ color: 'var(--muted)' }}>{v.topic || 'General'}</td>
                            <td style={{ color: 'var(--muted)', fontSize: '11px', fontStyle: 'italic' }}>{v.example || '—'}</td>
                            <td style={{ textAlign: 'right' }}>
                              <button
                                onClick={() => handleDeleteVocab(v.id, v.word || v.targetWord)}
                                style={{ background: 'none', border: 0, color: '#e05656', cursor: 'pointer' }}
                                title="O‘chirish"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* O‘YIN MAVZULARI SECTION */}
          {section === 'games' && (
            <>
              <div className="welcome-row">
                <div>
                  <div className="eyebrow"><Gamepad2 size={14} /> 1V1 BELLASHUV MATERIALLARI</div>
                  <h1>O‘yin <span>Mavzulari</span></h1>
                  <p className="subheading">1v1 So‘z bellashuvi uchun Supabase mavzulari va so‘z to‘plamlari.</p>
                </div>
              </div>

              <div className="panel" style={{ padding: '24px', marginBottom: '24px' }}>
                <h3 style={{ marginBottom: '14px' }}>Yangi O‘yin Mavzusi Yaratish</h3>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    value={newTopicName}
                    onChange={e => setNewTopicName(e.target.value)}
                    placeholder="Masalan: Science & Space, Technology & AI"
                    style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
                  />
                  <button className="primary-btn" onClick={handleAddTopic}>
                    <Plus size={16} /> Mavzuni Qo‘shish
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                {topics.map(t => (
                  <div key={t} className="panel" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ margin: 0, fontSize: '15px' }}>{t}</h3>
                      <button onClick={() => setTopics(ts => ts.filter(x => x !== t))} style={{ background: 'none', border: 0, color: '#e05656', cursor: 'pointer' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <p style={{ fontSize: '11px', color: 'var(--muted)', margin: '8px 0 16px' }}>1v1 Bellashuvlar uchun faol mavzu</p>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <input placeholder="So‘z qo‘shish..." style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '11px', background: 'var(--bg)', color: 'var(--text)' }} />
                      <button className="primary-btn" style={{ padding: '8px 12px', fontSize: '10px' }} onClick={() => notify('So‘z mavzuga biriktirildi')}>
                        Qo‘shish
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* READING STUDIO */}
          {section === 'reading' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="panel" style={{ padding: '28px' }}>
                <div className="modal-heading">
                  <div>
                    <span className="eyebrow"><BookMarked size={14} /> READING STUDIO</span>
                    <h2>Reading Materiali Qo‘shish</h2>
                    <p>O‘quvchilar darajasiga mos hikoya, maqola yoki matnlarni Supabasega kiriting.</p>
                  </div>
                </div>
                <div className="form-grid" style={{ gap: '16px' }}>
                  <label>Sarlavha<input value={readingForm.title} onChange={e => setReadingForm({ ...readingForm, title: e.target.value })} placeholder="The Power of Habits" /></label>
                  <label>Daraja
                    <select value={readingForm.level} onChange={e => setReadingForm({ ...readingForm, level: e.target.value })}>
                      <option>A1</option><option>A2</option><option>B1</option><option>B2</option><option>C1</option><option>C2</option>
                    </select>
                  </label>
                  <label>Mavzu
                    <select value={readingForm.topic} onChange={e => setReadingForm({ ...readingForm, topic: e.target.value })}>
                      {topics.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </label>
                  <label>Taxminiy o‘qish vaqti (daqiqa)<input type="number" value={readingForm.mins} onChange={e => setReadingForm({ ...readingForm, mins: Number(e.target.value) })} /></label>
                  <label className="span-two">Matn (Story / Article)<textarea rows={6} value={readingForm.content} onChange={e => setReadingForm({ ...readingForm, content: e.target.value })} placeholder="Reading matnini to‘liq shu yerga kiriting..." /></label>
                </div>
                <button className="primary-btn" onClick={handleAddReading} style={{ marginTop: '20px' }}>
                  <Save size={16} /> Reading Materialini Saqlash
                </button>
              </div>

              {/* Existing Reading Materials */}
              <div className="panel" style={{ padding: '24px' }}>
                <h3 style={{ marginBottom: '14px' }}>Supabaseda Mavjud Reading Materiallari</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {materials.filter(m => m.contentType === 'Story' || m.contentType === 0).length === 0 ? (
                    <p style={{ color: 'var(--muted)', fontSize: '12px' }}>Hozircha Reading materiallari yo‘q.</p>
                  ) : (
                    materials.filter(m => m.contentType === 'Story' || m.contentType === 0).map(m => (
                      <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--bg)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                        <div>
                          <strong>{m.title}</strong>
                          <span style={{ marginLeft: '8px', fontSize: '11px', color: 'var(--purple)', fontWeight: 700 }}>{m.level || 'B1'}</span>
                          <p style={{ margin: '4px 0 0', fontSize: '11px', color: 'var(--muted)' }}>{m.estimatedMinutes || 10} daqiqa · {m.isPublished ? 'Nashr etilgan' : 'Qoralama'}</p>
                        </div>
                        <button onClick={() => handleDeleteMaterial(m.id, m.title)} style={{ background: 'none', border: 0, color: '#e05656', cursor: 'pointer' }}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* WRITING STUDIO */}
          {section === 'writing' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="panel" style={{ padding: '28px' }}>
                <div className="modal-heading">
                  <div>
                    <span className="eyebrow"><PenLine size={14} /> WRITING STUDIO</span>
                    <h2>Writing Topshirig‘i Yaratish</h2>
                    <p>Insho mavzulari, talab qilinadigan so‘zlar soni va topshiriq yo‘riqnomasini kiriting.</p>
                  </div>
                </div>
                <div className="form-grid" style={{ gap: '16px' }}>
                  <label>Topshiriq Sarlavhasi<input value={writingForm.title} onChange={e => setWritingForm({ ...writingForm, title: e.target.value })} placeholder="My Favorite City" /></label>
                  <label>Daraja
                    <select value={writingForm.level} onChange={e => setWritingForm({ ...writingForm, level: e.target.value })}>
                      <option>A1</option><option>A2</option><option>B1</option><option>B2</option><option>C1</option><option>C2</option>
                    </select>
                  </label>
                  <label>Mavzu
                    <select value={writingForm.topic} onChange={e => setWritingForm({ ...writingForm, topic: e.target.value })}>
                      {topics.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </label>
                  <label>So‘zlar miqdori (me’yori)<input type="number" value={writingForm.words} onChange={e => setWritingForm({ ...writingForm, words: Number(e.target.value) })} /></label>
                  <label className="span-two">Yo‘riqnoma va talablar<textarea rows={5} value={writingForm.instructions} onChange={e => setWritingForm({ ...writingForm, instructions: e.target.value })} placeholder="O‘quvchi nimalar haqida yozishi kerakligini tushuntiring..." /></label>
                </div>
                <button className="primary-btn" onClick={handleAddWriting} style={{ marginTop: '20px' }}>
                  <Save size={16} /> Writing Topshirig‘ini Saqlash
                </button>
              </div>

              {/* Existing Writing Tasks */}
              <div className="panel" style={{ padding: '24px' }}>
                <h3 style={{ marginBottom: '14px' }}>Supabaseda Mavjud Writing Topshiriqlari</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {materials.filter(m => m.contentType === 'GrammarLesson' || m.contentType === 1).length === 0 ? (
                    <p style={{ color: 'var(--muted)', fontSize: '12px' }}>Hozircha Writing topshiriqlari yo‘q.</p>
                  ) : (
                    materials.filter(m => m.contentType === 'GrammarLesson' || m.contentType === 1).map(m => (
                      <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--bg)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                        <div>
                          <strong>{m.title}</strong>
                          <span style={{ marginLeft: '8px', fontSize: '11px', color: 'var(--purple)', fontWeight: 700 }}>{m.level || 'B1'}</span>
                          <p style={{ margin: '4px 0 0', fontSize: '11px', color: 'var(--muted)' }}>{m.description || 'Writing inshosi'}</p>
                        </div>
                        <button onClick={() => handleDeleteMaterial(m.id, m.title)} style={{ background: 'none', border: 0, color: '#e05656', cursor: 'pointer' }}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* LISTENING STUDIO */}
          {section === 'listening' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="panel" style={{ padding: '28px' }}>
                <div className="modal-heading">
                  <div>
                    <span className="eyebrow"><Headphones size={14} /> LISTENING STUDIO</span>
                    <h2>Listening Audio Qo‘shish</h2>
                    <p>Audio havola (MP3) va transkriptini Supabasega kiriting.</p>
                  </div>
                </div>
                <div className="form-grid" style={{ gap: '16px' }}>
                  <label>Audio Sarlavhasi<input value={listeningForm.title} onChange={e => setListeningForm({ ...listeningForm, title: e.target.value })} placeholder="At the Coffee Shop" /></label>
                  <label>Audio URL (MP3 havola)<input value={listeningForm.audioUrl} onChange={e => setListeningForm({ ...listeningForm, audioUrl: e.target.value })} placeholder="https://example.com/audio.mp3" /></label>
                  <label>Daraja
                    <select value={listeningForm.level} onChange={e => setListeningForm({ ...listeningForm, level: e.target.value })}>
                      <option>A1</option><option>A2</option><option>B1</option><option>B2</option><option>C1</option><option>C2</option>
                    </select>
                  </label>
                  <label>Tinglash davomiyligi (daqiqa)<input type="number" value={listeningForm.mins} onChange={e => setListeningForm({ ...listeningForm, mins: Number(e.target.value) })} /></label>
                  <label className="span-two">Audio Matni / Transkript<textarea rows={5} value={listeningForm.transcript} onChange={e => setListeningForm({ ...listeningForm, transcript: e.target.value })} placeholder="Suhbat matnini shu yerga joylang..." /></label>
                </div>
                <button className="primary-btn" onClick={handleAddListening} style={{ marginTop: '20px' }}>
                  <Save size={16} /> Listening Materialini Saqlash
                </button>
              </div>

              {/* Existing Listening Materials */}
              <div className="panel" style={{ padding: '24px' }}>
                <h3 style={{ marginBottom: '14px' }}>Supabaseda Mavjud Listening Audiolari</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {materials.filter(m => m.contentType === 'AudioPodcast' || m.contentType === 2).length === 0 ? (
                    <p style={{ color: 'var(--muted)', fontSize: '12px' }}>Hozircha Listening audiolari yo‘q.</p>
                  ) : (
                    materials.filter(m => m.contentType === 'AudioPodcast' || m.contentType === 2).map(m => (
                      <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--bg)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                        <div>
                          <strong>{m.title}</strong>
                          <span style={{ marginLeft: '8px', fontSize: '11px', color: 'var(--purple)', fontWeight: 700 }}>{m.level || 'A2'}</span>
                          <p style={{ margin: '4px 0 0', fontSize: '11px', color: 'var(--muted)' }}>URL: {m.audioUrl || 'Audio havola'}</p>
                        </div>
                        <button onClick={() => handleDeleteMaterial(m.id, m.title)} style={{ background: 'none', border: 0, color: '#e05656', cursor: 'pointer' }}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* VIDEO STUDIO */}
          {section === 'videos' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="panel" style={{ padding: '28px' }}>
                <div className="modal-heading">
                  <div>
                    <span className="eyebrow"><Video size={14} /> VIDEO STUDIO</span>
                    <h2>Video Darslik Joylash</h2>
                    <p>YouTube yoki to‘g‘ridan-to‘g‘ri video havolasini Supabasega saqlang.</p>
                  </div>
                </div>
                <div className="form-grid" style={{ gap: '16px' }}>
                  <label>Video Sarlavhasi<input value={videoForm.title} onChange={e => setVideoForm({ ...videoForm, title: e.target.value })} placeholder="English Pronunciation Secrets" /></label>
                  <label>Video URL (YouTube yoki MP4)<input value={videoForm.videoUrl} onChange={e => setVideoForm({ ...videoForm, videoUrl: e.target.value })} placeholder="https://youtube.com/watch?v=..." /></label>
                  <label>Daraja
                    <select value={videoForm.level} onChange={e => setVideoForm({ ...videoForm, level: e.target.value })}>
                      <option>A1</option><option>A2</option><option>B1</option><option>B2</option><option>C1</option><option>C2</option>
                    </select>
                  </label>
                  <label>Vaqt (daqiqa)<input type="number" value={videoForm.mins} onChange={e => setVideoForm({ ...videoForm, mins: Number(e.target.value) })} /></label>
                  <label className="span-two">Video Tavsifi<textarea rows={4} value={videoForm.description} onChange={e => setVideoForm({ ...videoForm, description: e.target.value })} placeholder="Video dars haqida qisqacha ma’lumot..." /></label>
                </div>
                <button className="primary-btn" onClick={handleAddVideo} style={{ marginTop: '20px' }}>
                  <Save size={16} /> Video Darslikni Saqlash
                </button>
              </div>

              {/* Existing Video Materials */}
              <div className="panel" style={{ padding: '24px' }}>
                <h3 style={{ marginBottom: '14px' }}>Supabaseda Mavjud Video Darsliklar</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {materials.filter(m => m.contentType === 'VideoLesson' || m.contentType === 3).length === 0 ? (
                    <p style={{ color: 'var(--muted)', fontSize: '12px' }}>Hozircha Video darsliklari yo‘q.</p>
                  ) : (
                    materials.filter(m => m.contentType === 'VideoLesson' || m.contentType === 3).map(m => (
                      <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--bg)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                        <div>
                          <strong>{m.title}</strong>
                          <span style={{ marginLeft: '8px', fontSize: '11px', color: 'var(--purple)', fontWeight: 700 }}>{m.level || 'B1'}</span>
                          <p style={{ margin: '4px 0 0', fontSize: '11px', color: 'var(--muted)' }}>URL: {m.videoUrl}</p>
                        </div>
                        <button onClick={() => handleDeleteMaterial(m.id, m.title)} style={{ background: 'none', border: 0, color: '#e05656', cursor: 'pointer' }}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* CMS / WELCOME SAHIFA SECTION */}
          {section === 'cms' && (
            <>
              <div className="welcome-row">
                <div>
                  <div className="eyebrow"><Globe size={14} /> SAYT KONTENTI VA DASTUR SOZLAMALARI</div>
                  <h1>Welcome Sahifa <span>Boshqaruvi (CMS)</span></h1>
                  <p className="subheading">
                    Welcome sahifasining har bir bo‘limi, tugmalari, "Biz haqimizda" maqolasi, jamoa a’zolari, asoschi ma’lumotlari va kontaktlarini to‘liq tahrirlang. Barcha o‘zgarishlar Supabase PostgreSQL bazasida saqlanadi.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="primary-btn" onClick={saveCmsChanges} style={{ padding: '10px 18px', fontWeight: 700 }}>
                    <Save size={16} /> Supabasega Saqlash
                  </button>
                </div>
              </div>

              {/* CMS Section Selector (Dropdown Select) */}
              <div className="panel" style={{
                padding: '14px 18px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                flexWrap: 'wrap',
                borderRadius: '14px',
                border: '1px solid var(--border)',
                background: 'var(--panel)',
                boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '11px',
                    background: 'linear-gradient(135deg, rgba(120, 105, 245, 0.16), rgba(99, 88, 232, 0.08))',
                    color: 'var(--purple)',
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0
                  }}>
                    <Layers size={20} />
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '11px', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Sozlamalar Bo‘limi
                    </span>
                    <strong style={{ fontSize: '14px', color: 'var(--text)' }}>
                      {[
                        { id: 'hero', label: '🚀 Hero & Tugmalar' },
                        { id: 'stats', label: '📊 Statistika & Metrikalar' },
                        { id: 'auth', label: '🔐 Kirish Vizuali (Auth)' },
                        { id: 'preview', label: '📖 Amaliy Qo‘llanma (7 Ko‘nikma)' },
                        { id: 'curriculum', label: '🗺️ CEFR, Ko‘nikma & Qadamlar' },
                        { id: 'features', label: '⚡ Ilg‘or Imkoniyatlar' },
                        { id: 'about', label: '👥 Biz Haqimizda & Jamoa' },
                        { id: 'faq', label: '❓ FAQ Savol-Javoblar' },
                        { id: 'footer', label: '🌐 Footer, Asoschi & Kontaktlar' }
                      ].find(t => t.id === cmsTab)?.label || '🚀 Hero & Tugmalar'}
                    </strong>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 320px', maxWidth: '420px', justifyContent: 'flex-end' }}>
                  <div style={{ position: 'relative', width: '100%' }}>
                    <select
                      id="cms-section-select"
                      value={cmsTab}
                      onChange={e => setCmsTab(e.target.value as any)}
                      style={{
                        width: '100%',
                        padding: '11px 40px 11px 16px',
                        borderRadius: '11px',
                        border: '1.5px solid var(--purple)',
                        background: 'var(--bg)',
                        color: 'var(--text)',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        outline: 'none',
                        appearance: 'none',
                        WebkitAppearance: 'none',
                        boxShadow: '0 2px 8px rgba(120, 105, 245, 0.12)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <option value="hero">🚀 Hero & Tugmalar</option>
                      <option value="stats">📊 Statistika & Metrikalar</option>
                      <option value="auth">🔐 Kirish Vizuali (Auth)</option>
                      <option value="preview">📖 Amaliy Qo‘llanma (7 Ko‘nikma)</option>
                      <option value="curriculum">🗺️ CEFR, Ko‘nikma & Qadamlar</option>
                      <option value="features">⚡ Ilg‘or Imkoniyatlar</option>
                      <option value="about">👥 Biz Haqimizda & Jamoa</option>
                      <option value="faq">❓ FAQ Savol-Javoblar</option>
                      <option value="footer">🌐 Footer, Asoschi & Kontaktlar</option>
                    </select>
                    <div style={{
                      position: 'absolute',
                      right: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      pointerEvents: 'none',
                      color: 'var(--purple)',
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <ChevronDown size={18} strokeWidth={2.5} />
                    </div>
                  </div>
                </div>
              </div>

              {/* TAB 1: HERO & TUGMALAR */}
              {cmsTab === 'hero' && (
                <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                  {/* Brand Logo Uploader Card */}
                  <div className="panel" style={{ padding: '24px', gridColumn: '1 / -1' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                          width: '56px',
                          height: '56px',
                          borderRadius: '14px',
                          background: '#ffffff',
                          display: 'grid',
                          placeItems: 'center',
                          padding: '6px',
                          border: '2px solid var(--border)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                          flexShrink: 0
                        }}>
                          <img
                            src={cms.brandLogo || '/brand_logo.png'}
                            alt="TILSHUNOS Logo"
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/brand_logo.png'; }}
                          />
                        </div>
                        <div>
                          <h3 style={{ margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <ShieldCheck size={18} style={{ color: 'var(--purple)' }} /> Loyiha Brand Logosi (Platforma Logotipi)
                          </h3>
                          <p style={{ margin: 0, fontSize: '12px', color: 'var(--muted)' }}>
                            Platformaning barcha sahifalari, navbar, admin panel va mobil versiyasidagi rasmiy logoni yangilang.
                          </p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <label className="primary-btn" style={{ cursor: 'pointer', padding: '9px 16px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <Upload size={14} /> {uploadingLogo ? 'Yuklanmoqda...' : 'Yangi Logo Yuklash (PNG/SVG)'}
                          <input type="file" accept="image/*" onChange={handleBrandLogoUpload} style={{ display: 'none' }} disabled={uploadingLogo} />
                        </label>
                        {cms.brandLogo && (
                          <button
                            className="secondary-btn"
                            onClick={async () => {
                              const updated = { ...cms, brandLogo: '' };
                              setCms(updated);
                              localStorage.setItem('tilshunos_cms_data', JSON.stringify(updated));
                              await api.saveCms(updated);
                              notify('Standart loyiha logosiga qaytarildi! ✓');
                            }}
                            style={{ padding: '9px 14px', fontSize: '12px' }}
                          >
                            Standartga Qaytarish
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="panel" style={{ padding: '24px' }}>
                    <h3 style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Sparkles size={18} style={{ color: 'var(--purple)' }} /> Asosiy Hero Matnlari
                    </h3>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
                      <b style={{ fontSize: '12px' }}>Bosh Sarlavha (Headline):</b>
                      <input
                        value={cms.hero || ''}
                        onChange={e => setCms({ ...cms, hero: e.target.value })}
                        placeholder="Yangi til. Yangi imkoniyatlar."
                      />
                    </label>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
                      <b style={{ fontSize: '12px' }}>Qisqa Tavsif (Subtitle):</b>
                      <textarea
                        value={cms.description || ''}
                        onChange={e => setCms({ ...cms, description: e.target.value })}
                        rows={4}
                        placeholder="Platforma haqida qisqa va ta’sirchan kirish so‘zi..."
                      />
                    </label>
                  </div>

                  <div className="panel" style={{ padding: '24px' }}>
                    <h3 style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Zap size={18} style={{ color: 'var(--purple)' }} /> Tugmalar & Menyu Matnlari
                    </h3>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
                      <b style={{ fontSize: '12px' }}>Asosiy Boshlash Tugmasi Matni (Primary CTA):</b>
                      <input
                        value={cms.cta || ''}
                        onChange={e => setCms({ ...cms, cta: e.target.value })}
                        placeholder="Bepul boshlash"
                      />
                    </label>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
                      <b style={{ fontSize: '12px' }}>Ikkinchi Tugma Matni (Secondary CTA):</b>
                      <input
                        value={cms.secondaryCta || ''}
                        onChange={e => setCms({ ...cms, secondaryCta: e.target.value })}
                        placeholder="Platformani o‘rganish"
                      />
                    </label>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
                      <b style={{ fontSize: '12px' }}>Yuqori Menyu Anchor Matnlari (Vergul bilan ajrating):</b>
                      <input
                        value={cms.header || ''}
                        onChange={e => setCms({ ...cms, header: e.target.value })}
                        placeholder="Imkoniyatlar, Biz haqimizda, Kirish"
                      />
                      <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                        Saytning eng yuqori navigatsiya panelidagi menyu bo‘limlari nomlari.
                      </span>
                    </label>

                    <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
                      <b style={{ fontSize: '12px' }}>Bosh Sahifa Bayroqlari (Emoji yoki kodlar, vergul bilan):</b>
                      <input
                        value={Array.isArray(cms.heroFlags) ? cms.heroFlags.join(', ') : (cms.heroFlags || '🇬🇧, 🇷🇺, 🇩🇪, 🇺🇿')}
                        onChange={e => {
                          const val = e.target.value;
                          const flagsArr = val.split(',').map(s => s.trim()).filter(Boolean);
                          setCms({ ...cms, heroFlags: flagsArr });
                        }}
                        placeholder="🇬🇧, 🇷🇺, 🇩🇪, 🇺🇿"
                      />
                      <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                        Tugmalar yonidagi bayroqlar ro‘yxati (xohlagan bayroqni qo‘shishingiz yoki o‘chirishingiz mumkin).
                      </span>
                    </label>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                      <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <b style={{ fontSize: '12px' }}>Bayroqlar hisoblagichi (Count):</b>
                        <input
                          value={cms.heroFlagsCount !== undefined ? cms.heroFlagsCount : '150+'}
                          onChange={e => setCms({ ...cms, heroFlagsCount: e.target.value })}
                          placeholder="150+"
                        />
                      </label>
                      <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <b style={{ fontSize: '12px' }}>Bayroqlar izohi (Label):</b>
                        <input
                          value={cms.heroFlagsLabel !== undefined ? cms.heroFlagsLabel : 'Tillarda'}
                          onChange={e => setCms({ ...cms, heroFlagsLabel: e.target.value })}
                          placeholder="Tillarda"
                        />
                      </label>
                    </div>
                    <div style={{ marginTop: '20px', padding: '12px', background: 'var(--soft)', borderRadius: '10px', fontSize: '11px', color: 'var(--muted)' }}>
                      💡 <em>Barcha tugmalar real harakatlarga ulangan: Asosiy tugma ro‘yxatdan o‘tishga, ikkinchi tugma interaktiv demonstratsiyaga yo‘naltiradi.</em>
                    </div>
                  </div>

                  {/* 2. HEADER & HERO BACKGROUND IMAGES (DESKTOP & MOBILE) */}
                  <div className="panel" style={{ padding: '24px', gridColumn: '1 / -1' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                      <div>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 4px' }}>
                          <ImageIcon size={19} style={{ color: 'var(--purple)' }} /> Header & Hero Orqa Fon Rasmlari (Desktop & Mobile)
                        </h3>
                        <p style={{ margin: 0, fontSize: '12px', color: 'var(--muted)' }}>
                          Header va bosh sahifa kirish qismi uchun orqa fon rasmini o‘rnating. Desktop va smartfonlar uchun alohida rasm yuklashingiz mumkin.
                        </p>
                      </div>
                    </div>

                    {/* Presets Row for Background */}
                    <div className="admin-presets-container">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--purple)', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Sparkles size={14} /> 1-Bosishda Zamonaviy Fon Variantlari:
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          className={`admin-preset-pill ${cms.heroBgDesktop?.includes('1519681393784') ? 'active' : ''}`}
                          onClick={() => setCms({
                            ...cms,
                            heroBgDesktop: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1920&q=80',
                            heroBgMobile: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=750&q=80'
                          })}
                        >
                          🌌 Yulduzli Tog‘lar (Tungi Fon)
                        </button>
                        <button
                          type="button"
                          className={`admin-preset-pill ${cms.heroBgDesktop?.includes('1497633762265') ? 'active' : ''}`}
                          onClick={() => setCms({
                            ...cms,
                            heroBgDesktop: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1920&q=80',
                            heroBgMobile: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=750&q=80'
                          })}
                        >
                          📚 Kitoblar & Zamonaviy Kutubxona
                        </button>
                        <button
                          type="button"
                          className={`admin-preset-pill ${cms.heroBgDesktop?.includes('1522071820081') ? 'active' : ''}`}
                          onClick={() => setCms({
                            ...cms,
                            heroBgDesktop: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1920&q=80',
                            heroBgMobile: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=750&q=80'
                          })}
                        >
                          💼 Jamoaviy Hamkorlik & Ofis
                        </button>
                        <button
                          type="button"
                          className="admin-preset-pill reset"
                          onClick={() => setCms({ ...cms, heroBgDesktop: '', heroBgMobile: '' })}
                        >
                          <Trash2 size={13} /> Standart Toza Fonga Qaytarish (O‘chirish)
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                      {/* Desktop Background Image */}
                      <div className="admin-media-card">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                          <b style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Laptop size={16} style={{ color: '#6366f1' }} /> Desktop Orqa Fon Rasmi:
                          </b>
                          <input
                            type="file"
                            ref={bgDesktopFileInputRef}
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={(e) => handleDeviceFileUpload(e, 'bgDesktop')}
                          />
                          <button
                            type="button"
                            className="admin-upload-btn"
                            disabled={uploadingBgDesktop}
                            onClick={() => bgDesktopFileInputRef.current?.click()}
                          >
                            <Upload size={14} />
                            {uploadingBgDesktop ? 'Yuklanmoqda...' : '📁 Qurilmadan Fon Yuklash'}
                          </button>
                        </div>
                        <div className="admin-input-group">
                          <input
                            value={cms.heroBgDesktop || ''}
                            onChange={e => setCms({ ...cms, heroBgDesktop: e.target.value })}
                            placeholder="https://... yoki qurilmadan yuklangan havola"
                          />
                          {cms.heroBgDesktop && (
                            <button
                              type="button"
                              className="admin-clear-action-btn"
                              onClick={() => setCms({ ...cms, heroBgDesktop: '' })}
                              title="O‘chirish"
                            >
                              <Trash2 size={13} /> O‘chirish
                            </button>
                          )}
                        </div>
                        <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                          Katta ekranlar uchun keng (1920x1080 va undan yuqori) rasm tavsiya etiladi.
                        </span>
                        {/* Preview */}
                        {cms.heroBgDesktop ? (
                          <div style={{
                            marginTop: '6px',
                            height: '130px',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            border: '1px solid var(--border)',
                            position: 'relative',
                            boxShadow: '0 4px 14px rgba(0,0,0,0.08)'
                          }}>
                            <img
                              src={cms.heroBgDesktop}
                              alt="Desktop Background Preview"
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            <div style={{
                              position: 'absolute',
                              bottom: '8px',
                              left: '10px',
                              background: 'rgba(15, 23, 42, 0.78)',
                              backdropFilter: 'blur(6px)',
                              color: '#fff',
                              fontSize: '11px',
                              padding: '3px 10px',
                              borderRadius: '7px',
                              fontWeight: 700,
                              letterSpacing: '0.3px'
                            }}>
                              Desktop Fon Ko‘rinishi
                            </div>
                          </div>
                        ) : (
                          <div style={{
                            marginTop: '6px',
                            padding: '24px 16px',
                            border: '1.5px dashed var(--border)',
                            borderRadius: '12px',
                            textAlign: 'center',
                            fontSize: '11.5px',
                            color: 'var(--muted)',
                            background: 'var(--panel)'
                          }}>
                            Standart oq/qora fon qo‘llanilmoqda
                          </div>
                        )}
                      </div>

                      {/* Mobile Background Image */}
                      <div className="admin-media-card">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                          <b style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Smartphone size={16} style={{ color: '#10b981' }} /> Mobil Orqa Fon Rasmi:
                          </b>
                          <input
                            type="file"
                            ref={bgMobileFileInputRef}
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={(e) => handleDeviceFileUpload(e, 'bgMobile')}
                          />
                          <button
                            type="button"
                            className="admin-upload-btn emerald"
                            disabled={uploadingBgMobile}
                            onClick={() => bgMobileFileInputRef.current?.click()}
                          >
                            <Upload size={14} />
                            {uploadingBgMobile ? 'Yuklanmoqda...' : '📱 Mobil Fon Yuklash'}
                          </button>
                        </div>
                        <div className="admin-input-group">
                          <input
                            value={cms.heroBgMobile || ''}
                            onChange={e => setCms({ ...cms, heroBgMobile: e.target.value })}
                            placeholder="https://... yoki smartfon uchun havola"
                          />
                          {cms.heroBgMobile && (
                            <button
                              type="button"
                              className="admin-clear-action-btn"
                              onClick={() => setCms({ ...cms, heroBgMobile: '' })}
                              title="O‘chirish"
                            >
                              <Trash2 size={13} /> O‘chirish
                            </button>
                          )}
                        </div>
                        <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                          Smartfonlar uchun vertikal (masalan: 1080x1920) rasm yuklang. Bo‘sh qolsa, desktop foni ishlatiladi.
                        </span>
                        {/* Preview */}
                        {cms.heroBgMobile ? (
                          <div style={{
                            marginTop: '6px',
                            height: '130px',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            border: '1px solid var(--border)',
                            position: 'relative',
                            boxShadow: '0 4px 14px rgba(0,0,0,0.08)'
                          }}>
                            <img
                              src={cms.heroBgMobile}
                              alt="Mobile Background Preview"
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            <div style={{
                              position: 'absolute',
                              bottom: '8px',
                              left: '10px',
                              background: 'rgba(15, 23, 42, 0.78)',
                              backdropFilter: 'blur(6px)',
                              color: '#fff',
                              fontSize: '11px',
                              padding: '3px 10px',
                              borderRadius: '7px',
                              fontWeight: 700,
                              letterSpacing: '0.3px'
                            }}>
                              Mobil Fon Ko‘rinishi
                            </div>
                          </div>
                        ) : (
                          <div style={{
                            marginTop: '6px',
                            padding: '24px 16px',
                            border: '1.5px dashed var(--border)',
                            borderRadius: '12px',
                            textAlign: 'center',
                            fontSize: '11.5px',
                            color: 'var(--muted)',
                            background: 'var(--panel)'
                          }}>
                            Desktop foni mobilga ham avtomatik moslashadi
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 3. HERO IMAGES (MAC LAPTOP & MOBILE PHONE) */}
                  <div className="panel" style={{ padding: '24px', gridColumn: '1 / -1' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                      <div>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 4px' }}>
                          <ImageIcon size={19} style={{ color: 'var(--purple)' }} /> Hero Rasmlari (Desktop Mac & Mobile Telefon)
                        </h3>
                        <p style={{ margin: 0, fontSize: '12px', color: 'var(--muted)' }}>
                          Desktop ekranda Mac noutbuk, mobil smartfonlarda esa iPhone korpusidagi rasm chiqadi. Har ikkalasini erkin o‘zgartiring.
                        </p>
                      </div>
                    </div>

                    {/* Presets Row */}
                    <div className="admin-presets-container">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--purple)', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Sparkles size={14} /> 1-Bosishda Tayyor Rasm Variantlari:
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          className={`admin-preset-pill ${cms.heroImage === '/hero-tutor.jpg' ? 'active' : ''}`}
                          onClick={() => setCms({ ...cms, heroImage: '/hero-tutor.jpg', heroMobileImage: '/hero-tutor.jpg' })}
                        >
                          👔 Standart Erkak Ustoz
                        </button>
                        <button
                          type="button"
                          className={`admin-preset-pill ${cms.heroImage?.includes('1573496359142') ? 'active' : ''}`}
                          onClick={() => {
                            const img = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1000&q=80';
                            setCms({ ...cms, heroImage: img, heroMobileImage: img });
                          }}
                        >
                          👩‍🏫 Professional Ayol Ustoz
                        </button>
                        <button
                          type="button"
                          className={`admin-preset-pill ${cms.heroImage?.includes('1534528741775') ? 'active' : ''}`}
                          onClick={() => {
                            const img = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=80';
                            setCms({ ...cms, heroImage: img, heroMobileImage: img });
                          }}
                        >
                          🌍 Chet El Mutaxassisi
                        </button>
                        <button
                          type="button"
                          className={`admin-preset-pill ${cms.heroImage?.includes('1522202176988') ? 'active' : ''}`}
                          onClick={() => {
                            const img = 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1000&q=80';
                            setCms({ ...cms, heroImage: img, heroMobileImage: img });
                          }}
                        >
                          🎓 Talabalar & Dars Jarayoni
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                      {/* Desktop Mac Image */}
                      <div className="admin-media-card">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                          <b style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Laptop size={16} style={{ color: '#6366f1' }} /> Desktop Mac Rasmi:
                          </b>
                          {/* Device file upload button for desktop */}
                          <input
                            type="file"
                            ref={desktopFileInputRef}
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={(e) => handleDeviceFileUpload(e, 'desktop')}
                          />
                          <button
                            type="button"
                            className="admin-upload-btn"
                            disabled={uploadingDesktop}
                            onClick={() => desktopFileInputRef.current?.click()}
                          >
                            <Upload size={14} />
                            {uploadingDesktop ? 'Yuklanmoqda...' : '📁 Qurilmadan Rasm Yuklash'}
                          </button>
                        </div>
                        <div className="admin-input-group">
                          <input
                            value={cms.heroImage || ''}
                            onChange={e => setCms({ ...cms, heroImage: e.target.value })}
                            placeholder="/hero-tutor.jpg yoki qurilmadan yuklangan havola..."
                          />
                          {cms.heroImage && cms.heroImage !== '/hero-tutor.jpg' && (
                            <button
                              type="button"
                              className="admin-clear-action-btn"
                              onClick={() => setCms({ ...cms, heroImage: '/hero-tutor.jpg' })}
                              title="Standart rasmga qaytarish"
                            >
                              <RotateCcw size={13} /> Standart
                            </button>
                          )}
                        </div>
                        <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                          Mac noutbuk ekrani uchun gorizontal yoki kvadrat rasm tavsiya etiladi.
                        </span>
                        {/* Desktop Preview */}
                        <div style={{
                          marginTop: '6px',
                          border: '1.5px dashed var(--border)',
                          borderRadius: '12px',
                          padding: '12px',
                          background: 'var(--panel)',
                          textAlign: 'center'
                        }}>
                          <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--purple)', display: 'block', marginBottom: '8px', letterSpacing: '0.4px' }}>
                            💻 MAC KO‘RINISHI (PREVIEW):
                          </span>
                          <div style={{
                            width: '100%',
                            maxWidth: '260px',
                            margin: '0 auto',
                            aspectRatio: '16/11',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            boxShadow: '0 6px 18px rgba(0,0,0,0.22)',
                            background: '#000'
                          }}>
                            <img
                              src={cms.heroImage || '/hero-tutor.jpg'}
                              alt="Mac preview"
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={(e) => { (e.target as any).src = '/hero-tutor.jpg'; }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Mobile Smartphone Image */}
                      <div className="admin-media-card">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                          <b style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Smartphone size={16} style={{ color: '#10b981' }} /> Mobile Telefon Rasmi:
                          </b>
                          {/* Device file upload button for mobile */}
                          <input
                            type="file"
                            ref={mobileFileInputRef}
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={(e) => handleDeviceFileUpload(e, 'mobile')}
                          />
                          <button
                            type="button"
                            className="admin-upload-btn emerald"
                            disabled={uploadingMobile}
                            onClick={() => mobileFileInputRef.current?.click()}
                          >
                            <Upload size={14} />
                            {uploadingMobile ? 'Yuklanmoqda...' : '📱 Qurilmadan Rasm Yuklash'}
                          </button>
                        </div>
                        <div className="admin-input-group">
                          <input
                            value={cms.heroMobileImage || ''}
                            onChange={e => setCms({ ...cms, heroMobileImage: e.target.value })}
                            placeholder="Bo‘sh qolsa Desktop rasmi ishlatiladi..."
                          />
                          {cms.heroMobileImage && (
                            <button
                              type="button"
                              className="admin-clear-action-btn"
                              onClick={() => setCms({ ...cms, heroMobileImage: '' })}
                              title="O‘chirish"
                            >
                              <Trash2 size={13} /> O‘chirish
                            </button>
                          )}
                        </div>
                        <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                          Smartfon ekrani (9:16) uchun vertikal portret rasm eng chiroyli ko‘rinadi.
                        </span>
                        {/* Mobile Preview */}
                        <div style={{
                          marginTop: '6px',
                          border: '1.5px dashed var(--border)',
                          borderRadius: '12px',
                          padding: '12px',
                          background: 'var(--panel)',
                          textAlign: 'center'
                        }}>
                          <span style={{ fontSize: '10px', fontWeight: 800, color: '#10b981', display: 'block', marginBottom: '8px', letterSpacing: '0.4px' }}>
                            📱 SMARTFON KO‘RINISHI (PREVIEW):
                          </span>
                          <div style={{
                            position: 'relative',
                            width: '115px',
                            margin: '0 auto',
                            aspectRatio: '9/18.8',
                            borderRadius: '18px',
                            overflow: 'hidden',
                            border: '3px solid #0f172a',
                            boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
                            background: '#000'
                          }}>
                            <img
                              src={cms.heroMobileImage || cms.heroImage || '/hero-tutor.jpg'}
                              alt="Mobile phone preview"
                              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={(e) => { (e.target as any).src = '/hero-tutor.jpg'; }}
                            />
                            {/* Dynamic Island Overlay */}
                            <div style={{
                              position: 'absolute',
                              top: '5px',
                              left: '50%',
                              transform: 'translateX(-50%)',
                              width: '34px',
                              height: '9px',
                              background: '#000',
                              borderRadius: '8px',
                              zIndex: 2
                            }} />
                            {/* Home Indicator Overlay */}
                            <div style={{
                              position: 'absolute',
                              bottom: '3px',
                              left: '50%',
                              transform: 'translateX(-50%)',
                              width: '38px',
                              height: '2px',
                              background: 'rgba(255,255,255,0.8)',
                              borderRadius: '2px',
                              zIndex: 2
                            }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: STATISTIKA & METRIKALAR */}
              {cmsTab === 'stats' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Real Live Database Counters Panel */}
                  <div className="panel" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                      <div>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 4px' }}>
                          <Database size={19} style={{ color: 'var(--purple)' }} /> Supabase Jonli Hisoblagichlari (Hozirgi paytdagi holat)
                        </h3>
                        <p style={{ margin: 0, fontSize: '12px', color: 'var(--muted)' }}>
                          Ushbu ko‘rsatkichlar Supabase PostgreSQL bazasidan real vaqt rejimida avtomatik hisoblab chiqilgan.
                        </p>
                      </div>
                      <span className="badge-role-learner" style={{ padding: '6px 12px', fontSize: '11px' }}>
                        ● Jonli PostgreSQL aloqasi
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px', marginBottom: '16px' }}>
                      <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                        <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 700 }}>JAMI O‘QUVCHILAR</span>
                        <h2 style={{ fontSize: '26px', margin: '8px 0 2px', fontWeight: 800, color: 'var(--purple)' }}>
                          {cms.liveStats?.usersCount ?? stats.totalUsers ?? 0}
                        </h2>
                        <small style={{ fontSize: '11px', color: 'var(--muted)' }}>nafar foydalanuvchi</small>
                      </div>

                      <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                        <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 700 }}>LUG‘ATDAGI SO‘ZLAR</span>
                        <h2 style={{ fontSize: '26px', margin: '8px 0 2px', fontWeight: 800, color: '#10b981' }}>
                          {cms.liveStats?.wordsCount ?? stats.totalVocabularyEntries ?? 0}
                        </h2>
                        <small style={{ fontSize: '11px', color: 'var(--muted)' }}>ta lug‘at boyligi</small>
                      </div>

                      <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                        <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 700 }}>BAJARILGAN MASHQLAR</span>
                        <h2 style={{ fontSize: '26px', margin: '8px 0 2px', fontWeight: 800, color: '#3b82f6' }}>
                          {cms.liveStats?.practicesCount ?? stats.totalPracticeSessions ?? 0}
                        </h2>
                        <small style={{ fontSize: '11px', color: 'var(--muted)' }}>marta mashq qilindi</small>
                      </div>

                      <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                        <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 700 }}>O‘QUV MATERIALLARI</span>
                        <h2 style={{ fontSize: '26px', margin: '8px 0 2px', fontWeight: 800, color: '#f59e0b' }}>
                          {cms.liveStats?.materialsCount ?? stats.totalMaterials ?? 0}
                        </h2>
                        <small style={{ fontSize: '11px', color: 'var(--muted)' }}>reading & listening</small>
                      </div>

                      <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                        <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 700 }}>USTOZLAR</span>
                        <h2 style={{ fontSize: '26px', margin: '8px 0 2px', fontWeight: 800, color: '#ec4899' }}>
                          {cms.liveStats?.teachersCount ?? stats.activeTeachers ?? 0}
                        </h2>
                        <small style={{ fontSize: '11px', color: 'var(--muted)' }}>tasdiqlangan mutaxassis</small>
                      </div>
                    </div>
                  </div>

                  {/* Mode Selector: Live vs Manual Numbers */}
                  <div className="panel" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginBottom: '20px', padding: '14px 18px', background: 'var(--soft)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                      <div>
                        <strong style={{ fontSize: '14px', display: 'block', marginBottom: '2px' }}>
                          Haqiqiy Supabase statistikasidan foydalanish (Avtomatik hisoblash)
                        </strong>
                        <p style={{ margin: 0, fontSize: '12px', color: 'var(--muted)' }}>
                          Yoqilgan bo‘lsa, Welcome sahifasida yuqoridagi haqiqiy raqamlar dinamik chiqadi. O‘chirsangiz, pastda o‘zingiz kiritgan raqamlar aks etadi.
                        </p>
                      </div>
                      <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '13px' }}>
                        <input
                          type="checkbox"
                          checked={cms.metrics?.useLiveStats ?? true}
                          onChange={e => setCms({
                            ...cms,
                            metrics: {
                              ...cms.metrics,
                              useLiveStats: e.target.checked
                            }
                          })}
                          style={{ width: '18px', height: '18px', accentColor: 'var(--purple)' }}
                        />
                        <span>{(cms.metrics?.useLiveStats ?? true) ? 'Haqiqiy Statistika (Faol)' : 'Qo‘lda kiritilgan'}</span>
                      </label>
                    </div>

                    <h3 style={{ marginBottom: '14px', fontSize: '14px' }}>Welcome Sahifasi 3 ta Metrikasi (Pastki chiziq)</h3>
                    <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                      {/* Metric 1 */}
                      <div style={{ background: 'var(--bg)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                        <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--purple)', display: 'block', marginBottom: '8px' }}>1-METRIKA (Chap) · O‘QUV MATERIALLARI</span>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
                          <b style={{ fontSize: '11px' }}>Qiymat (agar qo‘lda bo‘lsa):</b>
                          <input
                            value={cms.metrics?.metric1Value || ''}
                            onChange={e => setCms({
                              ...cms,
                              metrics: { ...cms.metrics, metric1Value: e.target.value }
                            })}
                            placeholder="3+ yoki 120+"
                          />
                        </label>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <b style={{ fontSize: '11px' }}>Yozuv / Nom:</b>
                          <input
                            value={cms.metrics?.metric1Label || ''}
                            onChange={e => setCms({
                              ...cms,
                              metrics: { ...cms.metrics, metric1Label: e.target.value }
                            })}
                            placeholder="O‘quv Materiallari"
                          />
                        </label>
                      </div>

                      {/* Metric 2 */}
                      <div style={{ background: 'var(--bg)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                        <span style={{ fontSize: '11px', fontWeight: 800, color: '#10b981', display: 'block', marginBottom: '8px' }}>2-METRIKA (O‘rta) · LUG‘AT SO‘ZLARI</span>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
                          <b style={{ fontSize: '11px' }}>Qiymat (agar qo‘lda bo‘lsa):</b>
                          <input
                            value={cms.metrics?.metric2Value || ''}
                            onChange={e => setCms({
                              ...cms,
                              metrics: { ...cms.metrics, metric2Value: e.target.value }
                            })}
                            placeholder="50+ yoki 5000+"
                          />
                        </label>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <b style={{ fontSize: '11px' }}>Yozuv / Nom:</b>
                          <input
                            value={cms.metrics?.metric2Label || ''}
                            onChange={e => setCms({
                              ...cms,
                              metrics: { ...cms.metrics, metric2Label: e.target.value }
                            })}
                            placeholder="Lug‘at So‘zlari"
                          />
                        </label>
                      </div>

                      {/* Metric 3 */}
                      <div style={{ background: 'var(--bg)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                        <span style={{ fontSize: '11px', fontWeight: 800, color: '#f59e0b', display: 'block', marginBottom: '8px' }}>3-METRIKA (O‘ng) · FOYDALANUVCHILAR SONI</span>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
                          <b style={{ fontSize: '11px' }}>Qiymat (agar qo‘lda bo‘lsa):</b>
                          <input
                            value={cms.metrics?.metric3Value || ''}
                            onChange={e => setCms({
                              ...cms,
                              metrics: { ...cms.metrics, metric3Value: e.target.value }
                            })}
                            placeholder="4+ yoki 10K+"
                          />
                          <small style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '2px' }}>
                            Avtomatik rejimda bazadagi jami foydalanuvchilar ({cms.liveStats?.usersCount ?? stats.totalUsers ?? 0} nafar) o‘z-o‘zidan hisoblanib chiqadi.
                          </small>
                        </label>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <b style={{ fontSize: '11px' }}>Yozuv / Nom:</b>
                          <input
                            value={cms.metrics?.metric3Label || ''}
                            onChange={e => setCms({
                              ...cms,
                              metrics: { ...cms.metrics, metric3Label: e.target.value }
                            })}
                            placeholder="Jami Foydalanuvchilar"
                          />
                        </label>
                      </div>
                    </div>

                    <h3 style={{ marginBottom: '14px', fontSize: '14px' }}>Suzuvchi Kartochkalar (Noutbuk va Smartfon atrofida)</h3>
                    <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                      <div style={{ background: 'var(--bg)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                        <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--purple)', display: 'block', marginBottom: '8px' }}>1-SUZUVCHI KARTA (Kurs / Darslik)</span>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '8px' }}>
                          <b style={{ fontSize: '11px' }}>Bayroq belgisi (Emoji):</b>
                          <input
                            value={cms.floatingBadge1?.flag || ''}
                            onChange={e => setCms({
                              ...cms,
                              floatingBadge1: { ...cms.floatingBadge1, flag: e.target.value }
                            })}
                            placeholder="🇬🇧"
                          />
                        </label>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '8px' }}>
                          <b style={{ fontSize: '11px' }}>Sarlavha:</b>
                          <input
                            value={cms.floatingBadge1?.title || ''}
                            onChange={e => setCms({
                              ...cms,
                              floatingBadge1: { ...cms.floatingBadge1, title: e.target.value }
                            })}
                            placeholder="Basic English"
                          />
                        </label>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <b style={{ fontSize: '11px' }}>Taglavha (Darslar soni):</b>
                          <input
                            value={cms.floatingBadge1?.subtitle || ''}
                            onChange={e => setCms({
                              ...cms,
                              floatingBadge1: { ...cms.floatingBadge1, subtitle: e.target.value }
                            })}
                            placeholder="103 Darslik"
                          />
                        </label>
                      </div>

                      <div style={{ background: 'var(--bg)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                        <span style={{ fontSize: '11px', fontWeight: 800, color: '#3b82f6', display: 'block', marginBottom: '8px' }}>2-SUZUVCHI KARTA (Progress & Quiz)</span>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '8px' }}>
                          <b style={{ fontSize: '11px' }}>Sarlavha / Natija:</b>
                          <input
                            value={cms.floatingBadge2?.title || ''}
                            onChange={e => setCms({
                              ...cms,
                              floatingBadge2: { ...cms.floatingBadge2, title: e.target.value }
                            })}
                            placeholder="9 / 12 Quiz"
                          />
                        </label>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <b style={{ fontSize: '11px' }}>Qo‘shimcha tasdiq:</b>
                          <input
                            value={cms.floatingBadge2?.subtitle || ''}
                            onChange={e => setCms({
                              ...cms,
                              floatingBadge2: { ...cms.floatingBadge2, subtitle: e.target.value }
                            })}
                            placeholder="Speaking ✓"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: KIRISH / RO‘YXATDAN O‘TISH VIZUALI (AUTH BANNER) */}
              {cmsTab === 'auth' && (
                <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
                  {/* Left Column: Form Controls */}
                  <div className="panel" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                      <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Sparkles size={18} style={{ color: 'var(--purple)' }} /> Kirish / Ro‘yxatdan O‘tish Vizual Kartasi
                      </h3>
                      <button className="primary-btn" onClick={saveCmsChanges} style={{ padding: '8px 14px', fontSize: '12px', fontWeight: 700 }}>
                        <Save size={14} /> Saqlash
                      </button>
                    </div>
                    <p style={{ margin: '0 0 16px', fontSize: '12px', color: 'var(--muted)', lineHeight: '1.6' }}>
                      Foydalanuvchi tizimga kirish, ro‘yxatdan o‘tish va pochtani tasdiqlash sahifalarini ochganda chap tomonda chiqadigan vizual banner va uning orqa fon rasmini shu yerdan to‘liq boshqarasiz.
                    </p>

                    {/* Background image section */}
                    <div style={{
                      padding: '16px',
                      background: 'var(--bg)',
                      borderRadius: '12px',
                      border: '1px solid var(--border)',
                      marginBottom: '18px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                        <strong style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <ImageIcon size={15} style={{ color: 'var(--purple)' }} /> Orqa Fon Rasmi (Background Image)
                        </strong>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            type="button"
                            className="outline-btn"
                            style={{ fontSize: '11px', padding: '5px 10px', cursor: 'pointer' }}
                            onClick={() => authBgFileInputRef.current?.click()}
                            disabled={uploadingAuthBg}
                          >
                            <Upload size={13} />
                            {uploadingAuthBg ? 'Yuklanmoqda...' : '📁 Qurilmadan Yuklash'}
                          </button>
                          <input
                            ref={authBgFileInputRef}
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={(e) => handleDeviceFileUpload(e, 'authBg')}
                          />
                          {cms.authBanner?.bgImage && (
                            <button
                              type="button"
                              className="outline-btn"
                              style={{ fontSize: '11px', padding: '5px 10px', color: '#e05656', borderColor: '#e0565655', cursor: 'pointer' }}
                              onClick={() => {
                                setCms({
                                  ...cms,
                                  authBanner: { ...cms.authBanner, bgImage: '' }
                                });
                                notify('Fon rasmi tozalandi (standart gradientga qaytarildi)');
                              }}
                            >
                              <RotateCcw size={13} /> O‘chirish
                            </button>
                          )}
                        </div>
                      </div>

                      <div style={{ marginBottom: '10px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--muted)', display: 'block', marginBottom: '6px' }}>
                          1-bosishda tayyor zamonaviy fon variantlari:
                        </span>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {[
                            ['🌌 Yulduzli Tun', 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80'],
                            ['📚 Qulay Kutubxona', 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80'],
                            ['💼 Zamonaviy IT Ofis', 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80'],
                            ['🎨 Minimal Toza Fon', '']
                          ].map(([title, url]) => (
                            <button
                              key={title}
                              type="button"
                              className="outline-btn"
                              style={{ fontSize: '11px', padding: '4px 9px' }}
                              onClick={() => {
                                setCms({
                                  ...cms,
                                  authBanner: { ...cms.authBanner, bgImage: url }
                                });
                                notify(`${title} o‘rnatildi ✓`);
                              }}
                            >
                              {title}
                            </button>
                          ))}
                        </div>
                      </div>

                      <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <b style={{ fontSize: '11px' }}>Rasm Havolasi (URL):</b>
                        <input
                          value={cms.authBanner?.bgImage || ''}
                          onChange={e => setCms({
                            ...cms,
                            authBanner: { ...cms.authBanner, bgImage: e.target.value }
                          })}
                          placeholder="https://images.unsplash.com/... yoki yuqoridagi tugmadan yuklang"
                        />
                      </label>
                    </div>

                    {/* Texts section */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <b style={{ fontSize: '12px' }}>Kichik Kicker (Yuqori yozuv):</b>
                        <input
                          value={cms.authBanner?.kicker || ''}
                          onChange={e => setCms({
                            ...cms,
                            authBanner: { ...cms.authBanner, kicker: e.target.value }
                          })}
                          placeholder="TILSHUNOS PLATFORMASI"
                        />
                      </label>

                      <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <b style={{ fontSize: '12px' }}>Kirish Sahifasi Sarlavhasi (Login):</b>
                        <input
                          value={cms.authBanner?.loginTitle || ''}
                          onChange={e => setCms({
                            ...cms,
                            authBanner: { ...cms.authBanner, loginTitle: e.target.value }
                          })}
                          placeholder="Qaytganingizdan xursandmiz!"
                        />
                      </label>

                      <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <b style={{ fontSize: '12px' }}>Ro‘yxatdan O‘tish Sarlavhasi (Register):</b>
                        <input
                          value={cms.authBanner?.registerTitle || ''}
                          onChange={e => setCms({
                            ...cms,
                            authBanner: { ...cms.authBanner, registerTitle: e.target.value }
                          })}
                          placeholder="O‘rganish yo‘lingiz shu yerdan boshlanadi."
                        />
                      </label>

                      <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <b style={{ fontSize: '12px' }}>Emailni Tasdiqlash Sarlavhasi (Verify OTP):</b>
                        <input
                          value={cms.authBanner?.verifyTitle || ''}
                          onChange={e => setCms({
                            ...cms,
                            authBanner: { ...cms.authBanner, verifyTitle: e.target.value }
                          })}
                          placeholder="Emailingizni tasdiqlang"
                        />
                      </label>

                      <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <b style={{ fontSize: '12px' }}>Tavsif (Subtitle):</b>
                        <textarea
                          rows={2}
                          value={cms.authBanner?.subtitle || ''}
                          onChange={e => setCms({
                            ...cms,
                            authBanner: { ...cms.authBanner, subtitle: e.target.value }
                          })}
                          placeholder="O‘z maqsadingizni belgilang, kichik qadamlar bilan katta natijalarga erishing."
                        />
                      </label>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <b style={{ fontSize: '12px' }}>Ko‘rsatkich Raqami:</b>
                          <input
                            value={cms.authBanner?.statNumber || ''}
                            onChange={e => setCms({
                              ...cms,
                              authBanner: { ...cms.authBanner, statNumber: e.target.value }
                            })}
                            placeholder="4+"
                          />
                        </label>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <b style={{ fontSize: '12px' }}>Ko‘rsatkich Matni:</b>
                          <input
                            value={cms.authBanner?.statLabel || ''}
                            onChange={e => setCms({
                              ...cms,
                              authBanner: { ...cms.authBanner, statLabel: e.target.value }
                            })}
                            placeholder="asosiy ko‘nikma bitta platformada"
                          />
                        </label>
                      </div>
                    </div>

                    <button className="primary-btn" onClick={saveCmsChanges} style={{ marginTop: '20px', width: '100%', padding: '12px', fontWeight: 700 }}>
                      <Save size={16} /> O‘zgarishlarni Saqlash
                    </button>
                  </div>

                  {/* Right Column: Live Visual Preview */}
                  <div className="panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                        <h3 style={{ margin: 0, fontSize: '14px' }}>Jonli Ko‘rinish (Live Preview)</h3>
                        <div style={{ display: 'flex', gap: '4px', background: 'var(--bg)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                          <button
                            type="button"
                            onClick={() => setAuthPreviewMode('login')}
                            style={{
                              padding: '4px 10px',
                              borderRadius: '6px',
                              border: 0,
                              fontSize: '11px',
                              fontWeight: authPreviewMode === 'login' ? 700 : 500,
                              background: authPreviewMode === 'login' ? 'var(--purple)' : 'transparent',
                              color: authPreviewMode === 'login' ? '#fff' : 'var(--text)',
                              cursor: 'pointer'
                            }}
                          >
                            Kirish
                          </button>
                          <button
                            type="button"
                            onClick={() => setAuthPreviewMode('register')}
                            style={{
                              padding: '4px 10px',
                              borderRadius: '6px',
                              border: 0,
                              fontSize: '11px',
                              fontWeight: authPreviewMode === 'register' ? 700 : 500,
                              background: authPreviewMode === 'register' ? 'var(--purple)' : 'transparent',
                              color: authPreviewMode === 'register' ? '#fff' : 'var(--text)',
                              cursor: 'pointer'
                            }}
                          >
                            Ro‘yxatdan o‘tish
                          </button>
                          <button
                            type="button"
                            onClick={() => setAuthPreviewMode('verify')}
                            style={{
                              padding: '4px 10px',
                              borderRadius: '6px',
                              border: 0,
                              fontSize: '11px',
                              fontWeight: authPreviewMode === 'verify' ? 700 : 500,
                              background: authPreviewMode === 'verify' ? 'var(--purple)' : 'transparent',
                              color: authPreviewMode === 'verify' ? '#fff' : 'var(--text)',
                              cursor: 'pointer'
                            }}
                          >
                            Tasdiqlash
                          </button>
                        </div>
                      </div>

                      {/* Preview Card matching exact style */}
                      <div
                        style={{
                          borderRadius: '24px',
                          padding: '36px 30px',
                          backgroundColor: '#292647',
                          backgroundImage: cms.authBanner?.bgImage
                            ? `linear-gradient(145deg, rgba(25, 22, 45, 0.82), rgba(55, 45, 110, 0.78)), url("${cms.authBanner.bgImage}")`
                            : 'linear-gradient(145deg, #292647, #5d51a0 75%, #8472ed)',
                          backgroundSize: 'cover, cover',
                          backgroundPosition: 'center center, center center',
                          backgroundRepeat: 'no-repeat, no-repeat',
                          backgroundAttachment: 'scroll',
                          color: '#ffffff',
                          minHeight: '380px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          position: 'relative',
                          overflow: 'hidden',
                          boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
                          border: '1px solid rgba(255,255,255,0.15)'
                        }}
                      >
                        {/* Decorative circles if no background image */}
                        {!cms.authBanner?.bgImage && (
                          <div style={{
                            position: 'absolute',
                            width: '260px',
                            height: '260px',
                            border: '1px solid rgba(255,255,255,0.22)',
                            borderRadius: '50%',
                            right: '-70px',
                            bottom: '-80px',
                            boxShadow: '0 0 0 30px rgba(255,255,255,0.04), 0 0 0 65px rgba(255,255,255,0.03)',
                            pointerEvents: 'none'
                          }} />
                        )}

                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          fontSize: '10px',
                          letterSpacing: '1.8px',
                          fontWeight: 800,
                          color: '#d4ceff',
                          marginBottom: '16px',
                          textTransform: 'uppercase'
                        }}>
                          {cms.authBanner?.kicker || 'TILSHUNOS PLATFORMASI'}
                        </span>

                        <h2 style={{
                          fontSize: '30px',
                          lineHeight: '1.18',
                          letterSpacing: '-1px',
                          margin: '0 0 14px',
                          fontWeight: 800,
                          color: '#ffffff'
                        }}>
                          {authPreviewMode === 'verify'
                            ? (cms.authBanner?.verifyTitle || 'Emailingizni tasdiqlang')
                            : authPreviewMode === 'login'
                            ? (cms.authBanner?.loginTitle || 'Qaytganingizdan xursandmiz!')
                            : (cms.authBanner?.registerTitle || 'O‘rganish yo‘lingiz shu yerdan boshlanadi.')}
                        </h2>

                        <p style={{
                          fontSize: '13px',
                          lineHeight: '1.8',
                          color: '#dedbf6',
                          margin: '0 0 24px',
                          maxWidth: '340px'
                        }}>
                          {cms.authBanner?.subtitle || 'O‘z maqsadingizni belgilang, kichik qadamlar bilan katta natijalarga erishing.'}
                        </p>

                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '14px',
                          marginTop: 'auto',
                          paddingTop: '16px',
                          borderTop: '1px solid rgba(255,255,255,0.12)'
                        }}>
                          <strong style={{ fontSize: '38px', lineHeight: 1, fontWeight: 900, color: '#ffffff' }}>
                            {cms.authBanner?.statNumber || '4+'}
                          </strong>
                          <span style={{ fontSize: '11px', lineHeight: '1.6', color: '#e1ddff', whiteSpace: 'pre-line' }}>
                            {cms.authBanner?.statLabel || 'asosiy ko‘nikma\nbitta platformada'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ marginTop: '16px', padding: '12px 14px', background: 'var(--bg)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                      <p style={{ margin: 0, fontSize: '11px', color: 'var(--muted)', lineHeight: '1.6' }}>
                        💡 <strong>Maslahat:</strong> Rasm yuklaganingizda yoki havola kiritganingizda, matnlar o‘qilishi uchun avtomatik yarim shaffof qorong‘i qatlam (overlay) qo‘llaniladi. Foydalanuvchilar kirish sahifasini ochishi bilanoq ushbu dizaynni ko‘rishadi.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: AMALIY QO'LLANMA (7 KO'NIKMA) */}
              {cmsTab === 'preview' && (() => {
                const pg = cms.practiceGuide || DEFAULT_PRACTICE_GUIDE;
                const activeLangObj = pg.languages?.[guideEditLang] || DEFAULT_PRACTICE_GUIDE.languages[guideEditLang] || DEFAULT_PRACTICE_GUIDE.languages.en;

                const updatePgField = (field: keyof PracticeGuideConfig, value: any) => {
                  setCms({
                    ...cms,
                    practiceGuide: {
                      ...pg,
                      [field]: value
                    }
                  });
                };

                const updateSkillData = (skillKey: string, field: string, value: any) => {
                  const currentSkill = (activeLangObj as any)[skillKey] || {};
                  setCms({
                    ...cms,
                    practiceGuide: {
                      ...pg,
                      languages: {
                        ...pg.languages,
                        [guideEditLang]: {
                          ...activeLangObj,
                          [skillKey]: {
                            ...currentSkill,
                            [field]: value
                          }
                        }
                      }
                    }
                  });
                };

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* General Header Settings */}
                    <div className="panel" style={{ padding: '24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                        <div>
                          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>Amaliy Qo‘llanma — Umumiy Sozlamalar</h3>
                          <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--muted)' }}>
                            Welcome sahifadagi sarlavha va "O‘zingizni sinab ko‘ring" tugmasini tahrirlash
                          </p>
                        </div>
                        <button
                          onClick={async () => {
                            try {
                              localStorage.setItem('tilshunos_cms_data', JSON.stringify(cms));
                              await api.saveCms(cms);
                              notify('Amaliy qo‘llanma sozlamalari saqlandi! ✓');
                            } catch {
                              notify('Saqlashda xatolik yuz berdi', true);
                            }
                          }}
                          className="primary-btn"
                          style={{ padding: '8px 16px', fontSize: '12px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                        >
                          <Save size={14} />
                          <span>Saqlash</span>
                        </button>
                      </div>

                      <div className="form-grid" style={{ gap: '14px' }}>
                        <label>
                          <b style={{ fontSize: '12px' }}>Yuqori Kicker:</b>
                          <input
                            value={pg.kicker || ''}
                            onChange={e => updatePgField('kicker', e.target.value)}
                            placeholder="AMALIY QO‘LLANMA"
                          />
                        </label>
                        <label>
                          <b style={{ fontSize: '12px' }}>Asosiy Sarlavha:</b>
                          <input
                            value={pg.title || ''}
                            onChange={e => updatePgField('title', e.target.value)}
                            placeholder="Amaliy qo‘llanma"
                          />
                        </label>
                        <label className="span-two">
                          <b style={{ fontSize: '12px' }}>Tavsif (Subtitle):</b>
                          <input
                            value={pg.subtitle || ''}
                            onChange={e => updatePgField('subtitle', e.target.value)}
                            placeholder="O‘rganmoqchi bo‘lgan tilingizni tanlang va har bir ko‘nikma moduli bo‘yicha interaktiv mashqlarni bajaring."
                          />
                        </label>
                        <label className="span-two">
                          <b style={{ fontSize: '12px' }}>CTA Tugma Matni:</b>
                          <input
                            value={pg.ctaButtonText || ''}
                            onChange={e => updatePgField('ctaButtonText', e.target.value)}
                            placeholder="O‘zingizni sinab ko‘ring"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Pastki Karta (Amaliy Qo'llanma / Sinab Ko'rish) Sozlamalari & Rasm yuklash */}
                    <div className="panel" style={{ padding: '24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                        <div>
                          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>Pastki Card Sozlamalari (Amaliy qo‘llanma — Sinab ko‘rish)</h3>
                          <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--muted)' }}>
                            Slide kartalarining eng ostida chiqadigan "O‘zingizni amalda sinab ko‘ring" kartasining matnlari va rasmi
                          </p>
                        </div>
                        <button
                          onClick={async () => {
                            try {
                              localStorage.setItem('tilshunos_cms_data', JSON.stringify(cms));
                              await api.saveCms(cms);
                              notify('Pastki amaliy qo‘llanma kartasi sozlamalari saqlandi! ✓');
                            } catch {
                              notify('Saqlashda xatolik yuz berdi', true);
                            }
                          }}
                          className="primary-btn"
                          style={{ padding: '8px 16px', fontSize: '12px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                        >
                          <Save size={14} />
                          <span>Saqlash</span>
                        </button>
                      </div>

                      <div className="form-grid" style={{ gap: '14px' }}>
                        <label>
                          <b style={{ fontSize: '12px' }}>Kicker nishoni (Badge):</b>
                          <input
                            value={pg.bottomBannerKicker || ''}
                            onChange={e => updatePgField('bottomBannerKicker', e.target.value)}
                            placeholder="AMALIY QO‘LLANMA"
                          />
                        </label>
                        <label>
                          <b style={{ fontSize: '12px' }}>Karta Sarlavhasi (Title):</b>
                          <input
                            value={pg.bottomBannerTitle || ''}
                            onChange={e => updatePgField('bottomBannerTitle', e.target.value)}
                            placeholder="O‘zingizni amalda sinab ko‘ring"
                          />
                        </label>
                        <label className="span-two">
                          <b style={{ fontSize: '12px' }}>Karta Tavsifi (Description):</b>
                          <textarea
                            rows={2}
                            value={pg.bottomBannerDesc || ''}
                            onChange={e => updatePgField('bottomBannerDesc', e.target.value)}
                            placeholder="7 ta ko‘nikma moduli bo‘yicha to‘liq interaktiv mashqlar, AI repetitor va shaxsiy testlarni boshlang."
                            style={{ resize: 'vertical' }}
                          />
                        </label>
                        <label className="span-two">
                          <b style={{ fontSize: '12px' }}>Tugma Matni (Button text):</b>
                          <input
                            value={pg.bottomBannerBtnText || ''}
                            onChange={e => updatePgField('bottomBannerBtnText', e.target.value)}
                            placeholder="O‘zingizni sinab ko‘ring"
                          />
                        </label>

                        {/* Image upload row */}
                        <div className="span-two" style={{ marginTop: '6px', padding: '16px', background: 'var(--bg)', borderRadius: '14px', border: '1px solid var(--border)' }}>
                          <b style={{ fontSize: '13px', display: 'block', marginBottom: '10px' }}>Karta Muqova Rasmi:</b>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                            <div style={{
                              width: '130px',
                              height: '82px',
                              borderRadius: '10px',
                              overflow: 'hidden',
                              border: '1.5px solid var(--border)',
                              background: '#000',
                              flexShrink: 0
                            }}>
                              <img
                                src={pg.bottomBannerImage || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80"}
                                alt="Bottom Card"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80';
                                }}
                              />
                            </div>
                            <div style={{ flex: 1, minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              <input
                                value={pg.bottomBannerImage || ''}
                                onChange={e => updatePgField('bottomBannerImage', e.target.value)}
                                placeholder="https://images.unsplash.com/... yoki qurilmadan rasm yuklang"
                                style={{ fontSize: '12.5px' }}
                              />
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                <label
                                  className="outline-btn"
                                  style={{
                                    padding: '7px 14px',
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    cursor: uploadingGuideImage ? 'wait' : 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    margin: 0
                                  }}
                                >
                                  <ImageIcon size={14} />
                                  <span>{uploadingGuideImage ? 'Yuklanmoqda...' : 'Qurilmadan rasm yuklash (Storage)'}</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleBottomBannerImageUpload}
                                    style={{ display: 'none' }}
                                    disabled={uploadingGuideImage}
                                  />
                                </label>
                                {pg.bottomBannerImage && (
                                  <button
                                    type="button"
                                    onClick={() => updatePgField('bottomBannerImage', '')}
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      color: 'var(--muted)',
                                      fontSize: '12px',
                                      cursor: 'pointer',
                                      textDecoration: 'underline'
                                    }}
                                  >
                                    Asl holatga qaytarish
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Language and Skill Selector Tabs */}
                    <div className="panel" style={{ padding: '24px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
                        {/* Language Selector */}
                        <div>
                          <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                            1. Tahrirlanadigan Tilni Tanlang:
                          </span>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {[
                              { code: 'en', name: 'English', flag: '🇬🇧' },
                              { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
                              { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
                              { code: 'ru', name: 'Русский', flag: '🇷🇺' },
                              { code: 'uz', name: 'O‘zbek', flag: '🇺🇿' }
                            ].map(lang => (
                              <button
                                key={lang.code}
                                type="button"
                                onClick={() => setGuideEditLang(lang.code)}
                                style={{
                                  padding: '8px 16px',
                                  borderRadius: '10px',
                                  border: guideEditLang === lang.code ? '1.5px solid var(--purple)' : '1px solid var(--border)',
                                  background: guideEditLang === lang.code ? 'rgba(120, 105, 245, 0.12)' : 'var(--bg)',
                                  color: guideEditLang === lang.code ? 'var(--purple)' : 'var(--text)',
                                  fontWeight: guideEditLang === lang.code ? 800 : 600,
                                  fontSize: '13px',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px'
                                }}
                              >
                                <span>{lang.flag}</span>
                                <span>{lang.name}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* 7 Skills Selector */}
                        <div>
                          <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                            2. Tahrirlanadigan Ko‘nikma Modulini Tanlang:
                          </span>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {[
                              { key: 'vocab', label: '📖 Vocab (Lug‘at)' },
                              { key: 'writing', label: '✍️ Writing (Yozish)' },
                              { key: 'reading', label: '📑 Reading (O‘qish)' },
                              { key: 'listening', label: '🎧 Listening (Tinglash)' },
                              { key: 'speaking', label: '🎙️ Speaking (Nutq)' },
                              { key: 'grammar', label: '⚡ Grammar (Grammatika)' },
                              { key: 'shadowing', label: '🏆 Shadowing (Soya)' }
                            ].map(skill => (
                              <button
                                key={skill.key}
                                type="button"
                                onClick={() => setGuideEditSkill(skill.key as any)}
                                style={{
                                  padding: '8px 14px',
                                  borderRadius: '9px',
                                  border: guideEditSkill === skill.key ? '1px solid transparent' : '1px solid var(--border)',
                                  background: guideEditSkill === skill.key ? 'var(--purple)' : 'var(--bg)',
                                  color: guideEditSkill === skill.key ? '#fff' : 'var(--text)',
                                  fontWeight: guideEditSkill === skill.key ? 800 : 600,
                                  fontSize: '12px',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease'
                                }}
                              >
                                {skill.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* SKILL EDITOR FORMS */}
                      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                        {/* 1. VOCAB CARD EDITOR */}
                        {guideEditSkill === 'vocab' && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>
                                📖 Vocab Karta Sozlamalari ({activeLangObj.flag} {activeLangObj.langName})
                              </h4>
                            </div>

                            {/* Image row */}
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', background: 'var(--bg)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                              <img
                                src={activeLangObj.vocab?.image}
                                alt="Vocab"
                                style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border)' }}
                                onError={(e) => { (e.currentTarget as any).src = 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=400&q=80'; }}
                              />
                              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label style={{ fontSize: '11px', fontWeight: 700 }}>Rasm URL:</label>
                                <input
                                  value={activeLangObj.vocab?.image || ''}
                                  onChange={e => updateSkillData('vocab', 'image', e.target.value)}
                                  placeholder="https://..."
                                  style={{ fontSize: '12px' }}
                                />
                              </div>
                              <div>
                                <label className="admin-upload-btn" style={{ padding: '8px 12px', fontSize: '11px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                  <Upload size={13} />
                                  <span>{uploadingGuideImage ? 'Yuklanmoqda...' : 'Qurilmadan Yuklash'}</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    onChange={e => handleGuideCardImageUpload(e, 'vocab')}
                                    disabled={uploadingGuideImage}
                                  />
                                </label>
                              </div>
                            </div>

                            <div className="form-grid" style={{ gap: '14px' }}>
                              <label>
                                <b style={{ fontSize: '11px' }}>So‘z:</b>
                                <input
                                  value={activeLangObj.vocab?.word || ''}
                                  onChange={e => updateSkillData('vocab', 'word', e.target.value)}
                                  placeholder="Persevere"
                                />
                              </label>
                              <label>
                                <b style={{ fontSize: '11px' }}>O‘zbekcha Tarjimasi:</b>
                                <input
                                  value={activeLangObj.vocab?.translation || ''}
                                  onChange={e => updateSkillData('vocab', 'translation', e.target.value)}
                                  placeholder="Matonat bilan davom etmoq"
                                />
                              </label>
                              <label className="span-two">
                                <b style={{ fontSize: '11px' }}>Izoh:</b>
                                <textarea
                                  value={activeLangObj.vocab?.explanation || ''}
                                  onChange={e => updateSkillData('vocab', 'explanation', e.target.value)}
                                  rows={2}
                                  placeholder="So‘z haqida izoh..."
                                />
                              </label>
                              <label className="span-two">
                                <b style={{ fontSize: '11px' }}>Misol Jumla (Example Phrase):</b>
                                <textarea
                                  value={activeLangObj.vocab?.examplePhrase || ''}
                                  onChange={e => updateSkillData('vocab', 'examplePhrase', e.target.value)}
                                  rows={2}
                                  placeholder="Misol jumla..."
                                />
                              </label>
                            </div>
                          </div>
                        )}

                        {/* 2. WRITING CARD EDITOR */}
                        {guideEditSkill === 'writing' && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>
                              ✍️ Writing Karta Sozlamalari ({activeLangObj.flag} {activeLangObj.langName})
                            </h4>

                            {/* Image row */}
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', background: 'var(--bg)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                              <img
                                src={activeLangObj.writing?.image}
                                alt="Writing"
                                style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border)' }}
                                onError={(e) => { (e.currentTarget as any).src = 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=400&q=80'; }}
                              />
                              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label style={{ fontSize: '11px', fontWeight: 700 }}>Rasm URL:</label>
                                <input
                                  value={activeLangObj.writing?.image || ''}
                                  onChange={e => updateSkillData('writing', 'image', e.target.value)}
                                  placeholder="https://..."
                                  style={{ fontSize: '12px' }}
                                />
                              </div>
                              <div>
                                <label className="admin-upload-btn" style={{ padding: '8px 12px', fontSize: '11px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                  <Upload size={13} />
                                  <span>{uploadingGuideImage ? 'Yuklanmoqda...' : 'Qurilmadan Yuklash'}</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    onChange={e => handleGuideCardImageUpload(e, 'writing')}
                                    disabled={uploadingGuideImage}
                                  />
                                </label>
                              </div>
                            </div>

                            <div className="form-grid" style={{ gap: '14px' }}>
                              <label className="span-two">
                                <b style={{ fontSize: '11px' }}>Xat Sarlavhasi (Letter Title):</b>
                                <input
                                  value={activeLangObj.writing?.letterTitle || ''}
                                  onChange={e => updateSkillData('writing', 'letterTitle', e.target.value)}
                                  placeholder="Formal Academic Inquiry"
                                />
                              </label>
                              <label className="span-two">
                                <b style={{ fontSize: '11px' }}>Xat Matni ({activeLangObj.langName}):</b>
                                <textarea
                                  value={activeLangObj.writing?.letterContent || ''}
                                  onChange={e => updateSkillData('writing', 'letterContent', e.target.value)}
                                  rows={5}
                                  placeholder="Dear Admissions Committee..."
                                />
                              </label>
                              <label className="span-two">
                                <b style={{ fontSize: '11px' }}>O‘zbekcha Tarjimasi (Tarjimani ko‘rish tugmasi bosilganda ochiladi):</b>
                                <textarea
                                  value={activeLangObj.writing?.letterTranslation || ''}
                                  onChange={e => updateSkillData('writing', 'letterTranslation', e.target.value)}
                                  rows={5}
                                  placeholder="Hurmatli Qabul Komissiyasi..."
                                />
                              </label>
                            </div>
                          </div>
                        )}

                        {/* 3. READING CARD EDITOR */}
                        {guideEditSkill === 'reading' && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>
                              📑 Reading Karta Sozlamalari ({activeLangObj.flag} {activeLangObj.langName})
                            </h4>

                            {/* Image row */}
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', background: 'var(--bg)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                              <img
                                src={activeLangObj.reading?.image}
                                alt="Reading"
                                style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border)' }}
                                onError={(e) => { (e.currentTarget as any).src = 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80'; }}
                              />
                              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label style={{ fontSize: '11px', fontWeight: 700 }}>Rasm URL:</label>
                                <input
                                  value={activeLangObj.reading?.image || ''}
                                  onChange={e => updateSkillData('reading', 'image', e.target.value)}
                                  placeholder="https://..."
                                  style={{ fontSize: '12px' }}
                                />
                              </div>
                              <div>
                                <label className="admin-upload-btn" style={{ padding: '8px 12px', fontSize: '11px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                  <Upload size={13} />
                                  <span>{uploadingGuideImage ? 'Yuklanmoqda...' : 'Qurilmadan Yuklash'}</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    onChange={e => handleGuideCardImageUpload(e, 'reading')}
                                    disabled={uploadingGuideImage}
                                  />
                                </label>
                              </div>
                            </div>

                            <div className="form-grid" style={{ gap: '14px' }}>
                              <label className="span-two">
                                <b style={{ fontSize: '11px' }}>Matn Sarlavhasi:</b>
                                <input
                                  value={activeLangObj.reading?.title || ''}
                                  onChange={e => updateSkillData('reading', 'title', e.target.value)}
                                  placeholder="The Architecture of Language Learning"
                                />
                              </label>
                              <label className="span-two">
                                <b style={{ fontSize: '11px' }}>
                                  Reading Matni (Urg‘u beriladigan so‘zlarni &lt;b&gt;so‘z&lt;/b&gt; ko‘rinishida belgilang):
                                </b>
                                <textarea
                                  value={activeLangObj.reading?.readingText || ''}
                                  onChange={e => updateSkillData('reading', 'readingText', e.target.value)}
                                  rows={4}
                                  placeholder="The human brain possesses an extraordinary capacity called <b>neuroplasticity</b>..."
                                />
                              </label>
                            </div>

                            {/* Reading Questions */}
                            <div style={{ marginTop: '10px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <b style={{ fontSize: '12px' }}>Reading Bo‘yicha Savollar va Javoblar:</b>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const currQ = activeLangObj.reading?.questions || [];
                                    updateSkillData('reading', 'questions', [
                                      ...currQ,
                                      { question: `${currQ.length + 1}. Yangi savol?`, answer: 'Javob' }
                                    ]);
                                  }}
                                  className="secondary-btn"
                                  style={{ padding: '5px 10px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                >
                                  <Plus size={13} />
                                  <span>Savol Qo‘shish</span>
                                </button>
                              </div>

                              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {(activeLangObj.reading?.questions || []).map((qItem: any, qIdx: number) => (
                                  <div key={qIdx} style={{ display: 'flex', gap: '10px', alignItems: 'center', background: 'var(--bg)', padding: '10px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                      <input
                                        value={qItem.question || ''}
                                        onChange={e => {
                                          const nextQ = [...(activeLangObj.reading?.questions || [])];
                                          nextQ[qIdx] = { ...nextQ[qIdx], question: e.target.value };
                                          updateSkillData('reading', 'questions', nextQ);
                                        }}
                                        placeholder="Savol matni..."
                                        style={{ fontSize: '12px' }}
                                      />
                                      <input
                                        value={qItem.answer || ''}
                                        onChange={e => {
                                          const nextQ = [...(activeLangObj.reading?.questions || [])];
                                          nextQ[qIdx] = { ...nextQ[qIdx], answer: e.target.value };
                                          updateSkillData('reading', 'questions', nextQ);
                                        }}
                                        placeholder="Javob (qavs ichida rangli chiqadi)..."
                                        style={{ fontSize: '12px', color: '#10b981', fontWeight: 600 }}
                                      />
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const nextQ = (activeLangObj.reading?.questions || []).filter((_: any, i: number) => i !== qIdx);
                                        updateSkillData('reading', 'questions', nextQ);
                                      }}
                                      style={{ color: '#ef4444', background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px' }}
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 4. LISTENING CARD EDITOR */}
                        {guideEditSkill === 'listening' && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>
                              🎧 Listening Karta Sozlamalari ({activeLangObj.flag} {activeLangObj.langName})
                            </h4>

                            {/* Image row */}
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', background: 'var(--bg)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                              <img
                                src={activeLangObj.listening?.image}
                                alt="Listening"
                                style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border)' }}
                                onError={(e) => { (e.currentTarget as any).src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80'; }}
                              />
                              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label style={{ fontSize: '11px', fontWeight: 700 }}>Rasm URL:</label>
                                <input
                                  value={activeLangObj.listening?.image || ''}
                                  onChange={e => updateSkillData('listening', 'image', e.target.value)}
                                  placeholder="https://..."
                                  style={{ fontSize: '12px' }}
                                />
                              </div>
                              <div>
                                <label className="admin-upload-btn" style={{ padding: '8px 12px', fontSize: '11px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                  <Upload size={13} />
                                  <span>{uploadingGuideImage ? 'Yuklanmoqda...' : 'Qurilmadan Yuklash'}</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    onChange={e => handleGuideCardImageUpload(e, 'listening')}
                                    disabled={uploadingGuideImage}
                                  />
                                </label>
                              </div>
                            </div>

                            <div className="form-grid" style={{ gap: '14px' }}>
                              <label className="span-two">
                                <b style={{ fontSize: '11px' }}>Audio Darslik Sarlavhasi:</b>
                                <input
                                  value={activeLangObj.listening?.title || ''}
                                  onChange={e => updateSkillData('listening', 'title', e.target.value)}
                                  placeholder="The Secrets of Native Fluency"
                                />
                              </label>
                              <label className="span-two">
                                <b style={{ fontSize: '11px' }}>
                                  Matn (Bo‘sh joylarni [so‘z] qavslari ichiga olib yozing):
                                </b>
                                <textarea
                                  value={activeLangObj.listening?.textWithGaps || ''}
                                  onChange={e => updateSkillData('listening', 'textWithGaps', e.target.value)}
                                  rows={3}
                                  placeholder="True language fluency is achieved through [communication] and [connections]."
                                />
                              </label>
                              <label className="span-two">
                                <b style={{ fontSize: '11px' }}>
                                  To‘g‘ri Javoblar Ro‘yxati (Vergul bilan ajratib yozing):
                                </b>
                                <input
                                  value={(activeLangObj.listening?.gapsAnswers || []).join(', ')}
                                  onChange={e => {
                                    const parsed = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                                    updateSkillData('listening', 'gapsAnswers', parsed);
                                  }}
                                  placeholder="communication, connections"
                                />
                              </label>
                              <label className="span-two">
                                <b style={{ fontSize: '11px' }}>
                                  YouTube Audio Havolasi (Video yashirinib faqat audio qilib ijro etiladi):
                                </b>
                                <input
                                  value={activeLangObj.listening?.youtubeAudioUrl || ''}
                                  onChange={e => updateSkillData('listening', 'youtubeAudioUrl', e.target.value)}
                                  placeholder="https://www.youtube.com/watch?v=..."
                                />
                              </label>
                            </div>
                          </div>
                        )}

                        {/* 5. SPEAKING CARD EDITOR */}
                        {guideEditSkill === 'speaking' && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>
                              🎙️ Speaking Karta Sozlamalari ({activeLangObj.flag} {activeLangObj.langName})
                            </h4>

                            {/* Image row */}
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', background: 'var(--bg)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                              <img
                                src={activeLangObj.speaking?.image}
                                alt="Speaking"
                                style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border)' }}
                                onError={(e) => { (e.currentTarget as any).src = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80'; }}
                              />
                              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label style={{ fontSize: '11px', fontWeight: 700 }}>Rasm URL:</label>
                                <input
                                  value={activeLangObj.speaking?.image || ''}
                                  onChange={e => updateSkillData('speaking', 'image', e.target.value)}
                                  placeholder="https://..."
                                  style={{ fontSize: '12px' }}
                                />
                              </div>
                              <div>
                                <label className="admin-upload-btn" style={{ padding: '8px 12px', fontSize: '11px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                  <Upload size={13} />
                                  <span>{uploadingGuideImage ? 'Yuklanmoqda...' : 'Qurilmadan Yuklash'}</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    onChange={e => handleGuideCardImageUpload(e, 'speaking')}
                                    disabled={uploadingGuideImage}
                                  />
                                </label>
                              </div>
                            </div>

                            <label>
                              <b style={{ fontSize: '11px' }}>Sarlavha:</b>
                              <input
                                value={activeLangObj.speaking?.title || ''}
                                onChange={e => updateSkillData('speaking', 'title', e.target.value)}
                                placeholder="Conversational Interview"
                              />
                            </label>

                            {/* Speaking Questions List */}
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <div>
                                  <b style={{ fontSize: '12px' }}>Speaking Savollari:</b>
                                  <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'var(--muted)' }}>
                                    Faqatgina hamma savollarga javob berilgandan so‘ng "Umumiy ballni ko‘rish" tugmasi chiqadi.
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const currQ = activeLangObj.speaking?.questions || [];
                                    updateSkillData('speaking', 'questions', [
                                      ...currQ,
                                      {
                                        id: Date.now(),
                                        question: 'Yangi speaking savoli?',
                                        hint: 'Maslahat',
                                        expectedKeywords: ['speak', 'learn']
                                      }
                                    ]);
                                  }}
                                  className="secondary-btn"
                                  style={{ padding: '5px 10px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                >
                                  <Plus size={13} />
                                  <span>Savol Qo‘shish</span>
                                </button>
                              </div>

                              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {(activeLangObj.speaking?.questions || []).map((qItem: any, qIdx: number) => (
                                  <div key={qItem.id || qIdx} style={{ background: 'var(--bg)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                      <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--purple)' }}>
                                        {qIdx + 1}-SAVOL
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const nextQ = (activeLangObj.speaking?.questions || []).filter((_: any, i: number) => i !== qIdx);
                                          updateSkillData('speaking', 'questions', nextQ);
                                        }}
                                        style={{ color: '#ef4444', background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }}
                                      >
                                        <Trash2 size={15} />
                                      </button>
                                    </div>
                                    <input
                                      value={qItem.question || ''}
                                      onChange={e => {
                                        const nextQ = [...(activeLangObj.speaking?.questions || [])];
                                        nextQ[qIdx] = { ...nextQ[qIdx], question: e.target.value };
                                        updateSkillData('speaking', 'questions', nextQ);
                                      }}
                                      placeholder="Savol matni..."
                                      style={{ fontSize: '12px' }}
                                    />
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                      <input
                                        value={qItem.hint || ''}
                                        onChange={e => {
                                          const nextQ = [...(activeLangObj.speaking?.questions || [])];
                                          nextQ[qIdx] = { ...nextQ[qIdx], hint: e.target.value };
                                          updateSkillData('speaking', 'questions', nextQ);
                                        }}
                                        placeholder="Hint / Maslahat..."
                                        style={{ fontSize: '12px' }}
                                      />
                                      <input
                                        value={(qItem.expectedKeywords || []).join(', ')}
                                        onChange={e => {
                                          const nextQ = [...(activeLangObj.speaking?.questions || [])];
                                          nextQ[qIdx] = {
                                            ...nextQ[qIdx],
                                            expectedKeywords: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                                          };
                                          updateSkillData('speaking', 'questions', nextQ);
                                        }}
                                        placeholder="Kalit so‘zlar (vergul bilan)..."
                                        style={{ fontSize: '12px' }}
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 6. GRAMMAR CARD EDITOR */}
                        {guideEditSkill === 'grammar' && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>
                              ⚡ Grammar Karta Sozlamalari ({activeLangObj.flag} {activeLangObj.langName})
                            </h4>

                            {/* Image row */}
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', background: 'var(--bg)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                              <img
                                src={activeLangObj.grammar?.image}
                                alt="Grammar"
                                style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border)' }}
                                onError={(e) => { (e.currentTarget as any).src = 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=400&q=80'; }}
                              />
                              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label style={{ fontSize: '11px', fontWeight: 700 }}>Rasm URL:</label>
                                <input
                                  value={activeLangObj.grammar?.image || ''}
                                  onChange={e => updateSkillData('grammar', 'image', e.target.value)}
                                  placeholder="https://..."
                                  style={{ fontSize: '12px' }}
                                />
                              </div>
                              <div>
                                <label className="admin-upload-btn" style={{ padding: '8px 12px', fontSize: '11px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                  <Upload size={13} />
                                  <span>{uploadingGuideImage ? 'Yuklanmoqda...' : 'Qurilmadan Yuklash'}</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    onChange={e => handleGuideCardImageUpload(e, 'grammar')}
                                    disabled={uploadingGuideImage}
                                  />
                                </label>
                              </div>
                            </div>

                            <div className="form-grid" style={{ gap: '14px' }}>
                              <label className="span-two">
                                <b style={{ fontSize: '11px' }}>Grammatik Mavzu Nomi:</b>
                                <input
                                  value={activeLangObj.grammar?.topicName || ''}
                                  onChange={e => updateSkillData('grammar', 'topicName', e.target.value)}
                                  placeholder="Present Perfect vs. Past Simple"
                                />
                              </label>
                              <label className="span-two">
                                <b style={{ fontSize: '11px' }}>Mavzu Qoidasi / Izohi:</b>
                                <textarea
                                  value={activeLangObj.grammar?.topicExplanation || ''}
                                  onChange={e => updateSkillData('grammar', 'topicExplanation', e.target.value)}
                                  rows={3}
                                  placeholder="Grammatika qoidasini batafsil tushuntirish..."
                                />
                              </label>
                              <label>
                                <b style={{ fontSize: '11px', color: '#ef4444' }}>Noto‘g‘ri Matn (Xatolik ko‘rsatilgan):</b>
                                <input
                                  value={activeLangObj.grammar?.incorrectText || ''}
                                  onChange={e => updateSkillData('grammar', 'incorrectText', e.target.value)}
                                  placeholder="I have seen that movie yesterday."
                                />
                              </label>
                              <label>
                                <b style={{ fontSize: '11px', color: '#10b981' }}>To‘g‘rilangan Matn (Corrected Text):</b>
                                <input
                                  value={activeLangObj.grammar?.correctedText || ''}
                                  onChange={e => updateSkillData('grammar', 'correctedText', e.target.value)}
                                  placeholder="I saw that movie yesterday."
                                />
                              </label>
                              <label className="span-two">
                                <b style={{ fontSize: '11px' }}>Xatolikni Tuzatish Uchun O‘rganish Kerak Bo‘lgan Qoida (Rule Tip):</b>
                                <input
                                  value={activeLangObj.grammar?.ruleTip || ''}
                                  onChange={e => updateSkillData('grammar', 'ruleTip', e.target.value)}
                                  placeholder="Qoida maslahati..."
                                />
                              </label>
                            </div>
                          </div>
                        )}

                        {/* 7. SHADOWING CARD EDITOR */}
                        {guideEditSkill === 'shadowing' && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>
                              🏆 Shadowing Karta Sozlamalari ({activeLangObj.flag} {activeLangObj.langName})
                            </h4>

                            <div className="form-grid" style={{ gap: '14px' }}>
                              <label className="span-two">
                                <b style={{ fontSize: '11px' }}>YouTube Video Havolasi:</b>
                                <input
                                  value={activeLangObj.shadowing?.videoUrl || ''}
                                  onChange={e => updateSkillData('shadowing', 'videoUrl', e.target.value)}
                                  placeholder="https://www.youtube.com/watch?v=..."
                                />
                              </label>
                              <label className="span-two">
                                <b style={{ fontSize: '11px' }}>Sarlavha:</b>
                                <input
                                  value={activeLangObj.shadowing?.title || ''}
                                  onChange={e => updateSkillData('shadowing', 'title', e.target.value)}
                                  placeholder="Winston Churchill — The Power of Courage"
                                />
                              </label>
                              <label className="span-two">
                                <b style={{ fontSize: '11px' }}>
                                  Shadowing Matni (O‘quvchi mikrofonga gapirganda har bir so‘z ketma-ket solishtiriladi):
                                </b>
                                <textarea
                                  value={activeLangObj.shadowing?.shadowingText || ''}
                                  onChange={e => updateSkillData('shadowing', 'shadowingText', e.target.value)}
                                  rows={4}
                                  placeholder="Success is not final, failure is not fatal..."
                                />
                              </label>
                              <label className="span-two">
                                <b style={{ fontSize: '11px' }}>Audio Qilib Eshitish Matni:</b>
                                <textarea
                                  value={activeLangObj.shadowing?.audioText || ''}
                                  onChange={e => updateSkillData('shadowing', 'audioText', e.target.value)}
                                  rows={3}
                                  placeholder="Audioni eshitish tugmasi bosilganda ijro etiladigan matn..."
                                />
                              </label>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Bottom Save button */}
                      <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                          onClick={async () => {
                            try {
                              localStorage.setItem('tilshunos_cms_data', JSON.stringify(cms));
                              await api.saveCms(cms);
                              notify('Amaliy qo‘llanma o‘zgarishlari Supabasega muvaffaqiyatli saqlandi! ✓');
                            } catch {
                              notify('Saqlashda xatolik yuz berdi', true);
                            }
                          }}
                          className="primary-btn"
                          style={{ padding: '10px 22px', fontSize: '13px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                        >
                          <Save size={15} />
                          <span>Amaliy Qo‘llanmani Saqlash</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* TAB 4: CEFR, KO‘NIKMALAR & QADAMLAR */}
              {cmsTab === 'curriculum' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* CEFR Levels */}
                  <div className="panel" style={{ padding: '24px' }}>
                    <h3 style={{ marginBottom: '14px' }}>1. CEFR Xalqaro Yo‘l Xaritasi (A1–C2)</h3>
                    <div className="form-grid" style={{ gap: '12px', marginBottom: '16px' }}>
                      <label>
                        <b style={{ fontSize: '11px' }}>Kicker:</b>
                        <input
                          value={cms.cefrSection?.kicker || ''}
                          onChange={e => setCms({ ...cms, cefrSection: { ...cms.cefrSection, kicker: e.target.value } })}
                          placeholder="XALQARO METODIKA"
                        />
                      </label>
                      <label>
                        <b style={{ fontSize: '11px' }}>Sarlavha:</b>
                        <input
                          value={cms.cefrSection?.title || ''}
                          onChange={e => setCms({ ...cms, cefrSection: { ...cms.cefrSection, title: e.target.value } })}
                          placeholder="CEFR bo‘yicha aniq yo‘l xaritasi (A1–C2)"
                        />
                      </label>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                      {(cms.cefrSection?.levels || []).map((lvl: any, idx: number) => (
                        <div key={lvl.code || idx} style={{ background: 'var(--bg)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <span style={{ padding: '2px 8px', borderRadius: '6px', background: `${lvl.color || '#3b82f6'}20`, color: lvl.color || '#3b82f6', fontWeight: 800, fontSize: '12px' }}>
                              {lvl.code}
                            </span>
                            <input
                              value={lvl.name || ''}
                              onChange={e => {
                                const updated = [...(cms.cefrSection?.levels || [])];
                                updated[idx] = { ...updated[idx], name: e.target.value };
                                setCms({ ...cms, cefrSection: { ...cms.cefrSection, levels: updated } });
                              }}
                              style={{ fontWeight: 700, fontSize: '12px' }}
                              placeholder="Daraja nomi"
                            />
                          </div>
                          <textarea
                            value={lvl.desc || ''}
                            onChange={e => {
                              const updated = [...(cms.cefrSection?.levels || [])];
                              updated[idx] = { ...updated[idx], desc: e.target.value };
                              setCms({ ...cms, cefrSection: { ...cms.cefrSection, levels: updated } });
                            }}
                            rows={2}
                            style={{ fontSize: '11px' }}
                            placeholder="Daraja tavsifi..."
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 5 Learning Skills */}
                  <div className="panel" style={{ padding: '24px' }}>
                    <h3 style={{ marginBottom: '14px' }}>2. 5 Ta Asosiy Til Ko‘nikmasi</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                      {(cms.skillsSection?.skills || []).map((skill: any, idx: number) => (
                        <div key={skill.key || idx} style={{ background: 'var(--bg)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                          <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '8px' }}>
                            <b style={{ fontSize: '11px', color: 'var(--purple)' }}>{idx + 1}-Ko‘nikma Sarlavhasi:</b>
                            <input
                              value={skill.title || ''}
                              onChange={e => {
                                const updated = [...(cms.skillsSection?.skills || [])];
                                updated[idx] = { ...updated[idx], title: e.target.value };
                                setCms({ ...cms, skillsSection: { ...cms.skillsSection, skills: updated } });
                              }}
                              placeholder="Ko‘nikma nomi"
                            />
                          </label>
                          <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <b style={{ fontSize: '11px' }}>Tavsifi:</b>
                            <textarea
                              value={skill.desc || ''}
                              onChange={e => {
                                const updated = [...(cms.skillsSection?.skills || [])];
                                updated[idx] = { ...updated[idx], desc: e.target.value };
                                setCms({ ...cms, skillsSection: { ...cms.skillsSection, skills: updated } });
                              }}
                              rows={3}
                              placeholder="Ko‘nikma tavsifi..."
                            />
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 3. O‘rganish Jarayoni: Ketma-Ket Qadamlar & Tushuntirishlar */}
                  {(() => {
                    const currentSteps = (cms.stepsSection?.steps && cms.stepsSection.steps.length > 0)
                      ? cms.stepsSection.steps
                      : DEFAULT_LEARNING_PROCESS_STEPS;

                    const handleAddStep = () => {
                      const nextNum = currentSteps.length + 1;
                      const nextStepStr = String(nextNum).padStart(2, '0');
                      const newStep = {
                        step: nextStepStr,
                        title: `${nextNum}-bosqich: Yangi o‘quv jarayoni`,
                        desc: 'Ushbu bosqichda o‘quvchilar yangi bilim va ko‘nikmalarni chuqur o‘rganishadi hamda amaliy mashg‘ulotlar bajarishadi.',
                        badge: `BOSQICH ${nextStepStr}`,
                        imageDesktop: '',
                        imageMobile: ''
                      };
                      const updated = [...currentSteps, newStep];
                      setCms({ ...cms, stepsSection: { ...cms.stepsSection, steps: updated } });
                      notify(`Yangi ${nextNum}-bosqich muvaffaqiyatli qo‘shildi! 🎉`);
                    };

                    const handleMoveUp = (idx: number) => {
                      if (idx <= 0) return;
                      const updated = [...currentSteps];
                      const temp = updated[idx];
                      updated[idx] = updated[idx - 1];
                      updated[idx - 1] = temp;
                      setCms({ ...cms, stepsSection: { ...cms.stepsSection, steps: updated } });
                      notify(`${idx + 1}-qadam yuqoriga surildi`);
                    };

                    const handleMoveDown = (idx: number) => {
                      if (idx >= currentSteps.length - 1) return;
                      const updated = [...currentSteps];
                      const temp = updated[idx];
                      updated[idx] = updated[idx + 1];
                      updated[idx + 1] = temp;
                      setCms({ ...cms, stepsSection: { ...cms.stepsSection, steps: updated } });
                      notify(`${idx + 1}-qadam pastga surildi`);
                    };

                    const handleDeleteStep = (idx: number) => {
                      if (confirm(`${idx + 1}-qadam (${currentSteps[idx].title || ''}) rostdan ham o‘chirilsinmi?`)) {
                        const updated = currentSteps.filter((_: any, i: number) => i !== idx);
                        setCms({ ...cms, stepsSection: { ...cms.stepsSection, steps: updated } });
                        notify(`${idx + 1}-qadam o‘chirildi`);
                      }
                    };

                    const handleRenumberSteps = () => {
                      const updated = currentSteps.map((s: any, i: number) => ({
                        ...s,
                        step: String(i + 1).padStart(2, '0')
                      }));
                      setCms({ ...cms, stepsSection: { ...cms.stepsSection, steps: updated } });
                      notify('Barcha qadamlar raqamlari (01, 02, ...) qayta tartiblandi! 🎉');
                    };

                    const handleResetDefaults = () => {
                      if (confirm('O‘rganish jarayoni barcha standart sozlamalar va 7 ta qadamga qaytarilsinmi?')) {
                        const updatedCms = {
                          ...cms,
                          stepsSection: {
                            ...DEFAULT_LEARNING_PROCESS_CONFIG
                          }
                        };
                        setCms(updatedCms);
                        try {
                          localStorage.setItem('tilshunos_cms_data', JSON.stringify(updatedCms));
                        } catch {}
                        api.saveCms(updatedCms).catch(() => {});
                        notify('Standart 7 ta qadam va sozlamalar tiklandi! 🎉');
                      }
                    };

                    const handleSaveSteps = async () => {
                      try {
                        localStorage.setItem('tilshunos_cms_data', JSON.stringify(cms));
                        window.dispatchEvent(new CustomEvent('tilshunos_cms_saved', { detail: cms }));
                        await api.saveCms(cms);
                        notify('O‘rganish jarayoni ma’lumotlari saqlandi! 🎉');
                      } catch {
                        notify('Saqlashda xatolik yuz berdi', true);
                      }
                    };

                    return (
                      <div className="panel" style={{ padding: '24px' }}>
                        {/* Section Header & Main Actions */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800 }}>
                                3. O‘rganish Jarayoni: Qadamlar & Tushuntirishlar
                              </h3>
                              <span style={{ fontSize: '11px', fontWeight: 800, background: 'rgba(59, 130, 246, 0.15)', color: '#38bdf8', padding: '3px 9px', borderRadius: '20px' }}>
                                Jami: {currentSteps.length} ta bosqich
                              </span>
                            </div>
                            <p style={{ margin: '4px 0 0', fontSize: '12.5px', color: 'var(--muted)' }}>
                              Bo‘lim umumiy dizayni, talaba rasmi, bayroqlar va har bir qadam uchun matnlar hamda Desktop/Mobil screenshotlarni boshqaring.
                            </p>
                          </div>

                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                            <button
                              type="button"
                              className="primary-btn"
                              onClick={handleAddStep}
                              style={{ padding: '7px 14px', fontSize: '12px', fontWeight: 700, background: '#10b981', borderColor: '#10b981', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                            >
                              <Plus size={14} /> Yangi Qadam Qo‘shish
                            </button>

                            <button
                              type="button"
                              className="outline-btn"
                              onClick={handleRenumberSteps}
                              title="01, 02, 03... qilib qayta tartiblash"
                              style={{ padding: '7px 12px', fontSize: '11px' }}
                            >
                              🔢 Raqamlarni tartiblash
                            </button>

                            <button
                              type="button"
                              className="outline-btn"
                              onClick={handleResetDefaults}
                              style={{ padding: '7px 12px', fontSize: '11px' }}
                            >
                              🔄 Standart 7 qadamni tiklash
                            </button>

                            <button
                              type="button"
                              className="primary-btn"
                              onClick={handleSaveSteps}
                              style={{ padding: '7px 16px', fontSize: '12px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                            >
                              <Save size={14} /> Saqlash
                            </button>
                          </div>
                        </div>

                        {/* General Section Settings: Kicker, Title, Subtitle, Student Image, Floating Flags, Bottom Quote */}
                        <div style={{ background: 'var(--bg)', padding: '18px', borderRadius: '14px', border: '1px solid var(--border)', marginBottom: '22px' }}>
                          <h4 style={{ margin: '0 0 14px', fontSize: '14px', fontWeight: 800, color: 'var(--purple)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Sparkles size={16} /> Bo‘limning Asosiy Dizayni va Matnlari
                          </h4>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                            <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <b style={{ fontSize: '11px' }}>Bo‘lim Kicker (Kichik sarlavha):</b>
                              <input
                                value={cms.stepsSection?.kicker ?? 'ODDIY VA TUSHUNARLI'}
                                onChange={e => setCms({
                                  ...cms,
                                  stepsSection: { ...cms.stepsSection, kicker: e.target.value }
                                })}
                                placeholder="ODDIY VA TUSHUNARLI"
                              />
                            </label>

                            <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <b style={{ fontSize: '11px' }}>Bo‘lim Asosiy Sarlavhasi:</b>
                              <input
                                value={cms.stepsSection?.title ?? 'O‘rganish jarayoni qanday kechadi?'}
                                onChange={e => setCms({
                                  ...cms,
                                  stepsSection: { ...cms.stepsSection, title: e.target.value }
                                })}
                                placeholder="O‘rganish jarayoni qanday kechadi?"
                              />
                            </label>

                            <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <b style={{ fontSize: '11px' }}>Bo‘lim Ostki Matni / Tavsifi:</b>
                              <input
                                value={cms.stepsSection?.subtitle ?? '7 ta oson qadam orqali maqsadingiz sari ishonch bilan yo‘l oling.'}
                                onChange={e => setCms({
                                  ...cms,
                                  stepsSection: { ...cms.stepsSection, subtitle: e.target.value }
                                })}
                                placeholder="7 ta oson qadam orqali maqsadingiz sari ishonch bilan yo‘l oling."
                              />
                            </label>

                            <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <b style={{ fontSize: '11px' }}>Pastki Motivatsion Qo‘lyozma Yozuvi:</b>
                              <input
                                value={cms.stepsSection?.bottomQuote ?? 'Katta imkoniyatlar sizni kutmoqda!'}
                                onChange={e => setCms({
                                  ...cms,
                                  stepsSection: { ...cms.stepsSection, bottomQuote: e.target.value }
                                })}
                                placeholder="Katta imkoniyatlar sizni kutmoqda!"
                              />
                            </label>
                          </div>

                          {/* Hero Visual: Student Image & Floating Flags */}
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', marginTop: '14px', paddingTop: '14px', borderTop: '1px dashed var(--border)' }}>
                            {/* Student Image Upload */}
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                                <b style={{ fontSize: '11px' }}>Hero Talaba Rasmi (Chap tomondagi visual):</b>
                                {cms.stepsSection?.studentImage && (
                                  <button
                                    type="button"
                                    onClick={() => setCms({
                                      ...cms,
                                      stepsSection: { ...cms.stepsSection, studentImage: '' }
                                    })}
                                    style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '11px', cursor: 'pointer' }}
                                  >
                                    Tozalash
                                  </button>
                                )}
                              </div>
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <input
                                  value={cms.stepsSection?.studentImage ?? ''}
                                  onChange={e => setCms({
                                    ...cms,
                                    stepsSection: { ...cms.stepsSection, studentImage: e.target.value }
                                  })}
                                  placeholder="Talaba rasmi URL (bo‘sh bo‘lsa standart rasm chiqadi)"
                                  style={{ flex: 1, fontSize: '12px' }}
                                />
                                <input
                                  type="file"
                                  id="upload-lp-student-hero"
                                  accept="image/*"
                                  style={{ display: 'none' }}
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    try {
                                      const reader = new FileReader();
                                      reader.onload = async () => {
                                        const dataBase64 = reader.result as string;
                                        const cleanName = `student-hero-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
                                        const res = await api.uploadCmsImage({
                                          file,
                                          dataBase64,
                                          fileName: cleanName,
                                          contentType: file.type || 'image/jpeg'
                                        });
                                        if (res?.url) {
                                          setCms({
                                            ...cms,
                                            stepsSection: { ...cms.stepsSection, studentImage: res.url }
                                          });
                                          notify('Talaba rasmi muvaffaqiyatli yuklandi! 🎉');
                                        }
                                      };
                                      reader.readAsDataURL(file);
                                    } catch (err: any) {
                                      notify(err.message || 'Rasm yuklashda xatolik', true);
                                    }
                                  }}
                                />
                                <label
                                  htmlFor="upload-lp-student-hero"
                                  className="outline-btn"
                                  style={{ padding: '6px 10px', fontSize: '11px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                >
                                  <Upload size={13} /> Yuklash
                                </label>
                              </div>
                              {cms.stepsSection?.studentImage && (
                                <img
                                  src={cms.stepsSection.studentImage}
                                  alt="Student preview"
                                  style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', marginTop: '6px', border: '2px solid var(--purple)' }}
                                />
                              )}
                            </div>

                            {/* Floating Flags */}
                            <div>
                              <b style={{ fontSize: '11px', display: 'block', marginBottom: '6px' }}>
                                Suzib yuruvchi Bayroqlar (vergul bilan ajrating):
                              </b>
                              <input
                                value={(cms.stepsSection?.floatingFlags && Array.isArray(cms.stepsSection.floatingFlags))
                                  ? cms.stepsSection.floatingFlags.join(', ')
                                  : '🇬🇧, 🇫🇷, 🇩🇪, 🇰🇷'}
                                onChange={e => {
                                  const flags = e.target.value.split(',').map((f: string) => f.trim()).filter(Boolean);
                                  setCms({
                                    ...cms,
                                    stepsSection: { ...cms.stepsSection, floatingFlags: flags }
                                  });
                                }}
                                placeholder="🇬🇧, 🇫🇷, 🇩🇪, 🇰🇷"
                                style={{ width: '100%', fontSize: '13px' }}
                              />
                              <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                                {(cms.stepsSection?.floatingFlags && Array.isArray(cms.stepsSection.floatingFlags) && cms.stepsSection.floatingFlags.length > 0
                                  ? cms.stepsSection.floatingFlags
                                  : ['🇬🇧', '🇫🇷', '🇩🇪', '🇰🇷']
                                ).map((flag: string, idx: number) => (
                                  <span key={idx} style={{ fontSize: '16px', background: 'var(--border)', padding: '2px 8px', borderRadius: '6px' }}>
                                    {flag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Steps Cards List */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          {currentSteps.map((step: any, idx: number) => (
                            <div
                              key={step.step || idx}
                              style={{
                                background: 'var(--bg)',
                                padding: '18px',
                                borderRadius: '14px',
                                border: '1px solid var(--border)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '12px',
                                position: 'relative'
                              }}
                            >
                              {/* Step Card Top Bar */}
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <span style={{
                                    width: '34px',
                                    height: '34px',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, var(--purple) 0%, #38bdf8 100%)',
                                    color: '#ffffff',
                                    display: 'grid',
                                    placeItems: 'center',
                                    fontSize: '13px',
                                    fontWeight: 900
                                  }}>
                                    {step.step || String(idx + 1).padStart(2, '0')}
                                  </span>
                                  <div>
                                    <strong style={{ fontSize: '14.5px' }}>{step.title || `${idx + 1}-Qadam`}</strong>
                                    <span style={{ display: 'block', fontSize: '11px', color: 'var(--muted)', fontWeight: 600 }}>
                                      {idx % 2 === 0 ? '📐 Matn Chapda · Rasm O‘ngda' : '📐 Rasm Chapda · Matn O‘ngda'}
                                    </span>
                                  </div>
                                </div>

                                {/* Step Ordering & Delete Buttons */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <button
                                    type="button"
                                    onClick={() => handleMoveUp(idx)}
                                    disabled={idx === 0}
                                    title="Yuqoriga surish"
                                    style={{
                                      padding: '5px 8px',
                                      fontSize: '11px',
                                      background: 'var(--border)',
                                      border: 'none',
                                      borderRadius: '6px',
                                      cursor: idx === 0 ? 'not-allowed' : 'pointer',
                                      opacity: idx === 0 ? 0.4 : 1,
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '3px'
                                    }}
                                  >
                                    <ArrowUp size={13} /> Yuqoriga
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleMoveDown(idx)}
                                    disabled={idx === currentSteps.length - 1}
                                    title="Pastga surish"
                                    style={{
                                      padding: '5px 8px',
                                      fontSize: '11px',
                                      background: 'var(--border)',
                                      border: 'none',
                                      borderRadius: '6px',
                                      cursor: idx === currentSteps.length - 1 ? 'not-allowed' : 'pointer',
                                      opacity: idx === currentSteps.length - 1 ? 0.4 : 1,
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '3px'
                                    }}
                                  >
                                    <ArrowDown size={13} /> Pastga
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleDeleteStep(idx)}
                                    title="Ushbu qadamni o‘chirish"
                                    style={{
                                      padding: '5px 8px',
                                      fontSize: '11px',
                                      background: 'rgba(239, 68, 68, 0.1)',
                                      color: '#ef4444',
                                      border: '1px solid rgba(239, 68, 68, 0.2)',
                                      borderRadius: '6px',
                                      cursor: 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '3px',
                                      marginLeft: '4px'
                                    }}
                                  >
                                    <Trash2 size={13} /> O‘chirish
                                  </button>
                                </div>
                              </div>

                              {/* Form Inputs for Step */}
                              <div style={{ display: 'grid', gridTemplateColumns: '80px 1.5fr 1fr', gap: '12px' }}>
                                <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                  <b style={{ fontSize: '11px' }}>Kodi:</b>
                                  <input
                                    value={step.step || ''}
                                    onChange={e => {
                                      const updated = [...currentSteps];
                                      updated[idx] = { ...updated[idx], step: e.target.value };
                                      setCms({ ...cms, stepsSection: { ...cms.stepsSection, steps: updated } });
                                    }}
                                    placeholder="01"
                                    style={{ textAlign: 'center', fontWeight: 800 }}
                                  />
                                </label>

                                <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                  <b style={{ fontSize: '11px' }}>Qadam Sarlavhasi:</b>
                                  <input
                                    value={step.title || ''}
                                    onChange={e => {
                                      const updated = [...currentSteps];
                                      updated[idx] = { ...updated[idx], title: e.target.value };
                                      setCms({ ...cms, stepsSection: { ...cms.stepsSection, steps: updated } });
                                    }}
                                    placeholder="Qadam nomi"
                                    style={{ fontWeight: 600 }}
                                  />
                                </label>

                                <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                  <b style={{ fontSize: '11px' }}>Kicker / Badge matni:</b>
                                  <input
                                    value={step.badge || ''}
                                    onChange={e => {
                                      const updated = [...currentSteps];
                                      updated[idx] = { ...updated[idx], badge: e.target.value };
                                      setCms({ ...cms, stepsSection: { ...cms.stepsSection, steps: updated } });
                                    }}
                                    placeholder="Masalan: BOSHLANG‘ICH QADAM"
                                  />
                                </label>
                              </div>

                              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <b style={{ fontSize: '11px' }}>Qadam Tavsifi / Tushuntirish matni:</b>
                                <textarea
                                  value={step.desc || ''}
                                  onChange={e => {
                                    const updated = [...currentSteps];
                                    updated[idx] = { ...updated[idx], desc: e.target.value };
                                    setCms({ ...cms, stepsSection: { ...cms.stepsSection, steps: updated } });
                                  }}
                                  rows={2}
                                  placeholder="Ushbu qadam haqida batafsil tushuntirish..."
                                />
                              </label>

                              {/* Desktop & Mobile Screenshots Dual Upload */}
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', marginTop: '6px', padding: '14px', background: 'rgba(0,0,0,0.03)', borderRadius: '10px' }}>
                                {/* Desktop Screenshot */}
                                <div>
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                                    <b style={{ fontSize: '11.5px', color: 'var(--purple)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                      <Laptop size={14} /> Desktop (Kompyuter) Rasmi:
                                    </b>
                                    {step.imageDesktop && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const updated = [...currentSteps];
                                          updated[idx] = { ...updated[idx], imageDesktop: '' };
                                          setCms({ ...cms, stepsSection: { ...cms.stepsSection, steps: updated } });
                                        }}
                                        style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '11px', cursor: 'pointer' }}
                                      >
                                        Tozalash
                                      </button>
                                    )}
                                  </div>
                                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <input
                                      value={step.imageDesktop || ''}
                                      onChange={e => {
                                        const updated = [...currentSteps];
                                        updated[idx] = { ...updated[idx], imageDesktop: e.target.value };
                                        setCms({ ...cms, stepsSection: { ...cms.stepsSection, steps: updated } });
                                      }}
                                      placeholder="Desktop rasm URL (ixtiyoriy)"
                                      style={{ flex: 1, fontSize: '12px' }}
                                    />
                                    <input
                                      type="file"
                                      id={`upload-step-desktop-${idx}`}
                                      accept="image/*"
                                      style={{ display: 'none' }}
                                      onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        try {
                                          const reader = new FileReader();
                                          reader.onload = async () => {
                                            const dataBase64 = reader.result as string;
                                            const cleanName = `step-${idx + 1}-desktop-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
                                            const res = await api.uploadCmsImage({
                                              file,
                                              dataBase64,
                                              fileName: cleanName,
                                              contentType: file.type || 'image/jpeg'
                                            });
                                            if (res?.url) {
                                              const updated = [...currentSteps];
                                              updated[idx] = { ...updated[idx], imageDesktop: res.url };
                                              setCms({ ...cms, stepsSection: { ...cms.stepsSection, steps: updated } });
                                              notify(`${idx + 1}-qadam uchun Desktop rasm yuklandi! 🎉`);
                                            }
                                          };
                                          reader.readAsDataURL(file);
                                        } catch (err: any) {
                                          notify(err.message || 'Rasm yuklashda xatolik', true);
                                        }
                                      }}
                                    />
                                    <label
                                      htmlFor={`upload-step-desktop-${idx}`}
                                      className="outline-btn"
                                      style={{ padding: '6px 10px', fontSize: '11px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                    >
                                      <Upload size={13} /> Yuklash
                                    </label>
                                  </div>
                                  {step.imageDesktop && (
                                    <img
                                      src={step.imageDesktop}
                                      alt="Desktop preview"
                                      style={{ height: '64px', width: 'auto', borderRadius: '6px', marginTop: '6px', border: '1px solid var(--border)', objectFit: 'cover' }}
                                    />
                                  )}
                                </div>

                                {/* Mobile Screenshot */}
                                <div>
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                                    <b style={{ fontSize: '11.5px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                      <Smartphone size={14} /> Mobil (Responsive) Rasmi:
                                    </b>
                                    {step.imageMobile && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const updated = [...currentSteps];
                                          updated[idx] = { ...updated[idx], imageMobile: '' };
                                          setCms({ ...cms, stepsSection: { ...cms.stepsSection, steps: updated } });
                                        }}
                                        style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '11px', cursor: 'pointer' }}
                                      >
                                        Tozalash
                                      </button>
                                    )}
                                  </div>
                                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <input
                                      value={step.imageMobile || ''}
                                      onChange={e => {
                                        const updated = [...currentSteps];
                                        updated[idx] = { ...updated[idx], imageMobile: e.target.value };
                                        setCms({ ...cms, stepsSection: { ...cms.stepsSection, steps: updated } });
                                      }}
                                      placeholder="Mobil rasm URL (ixtiyoriy)"
                                      style={{ flex: 1, fontSize: '12px' }}
                                    />
                                    <input
                                      type="file"
                                      id={`upload-step-mobile-${idx}`}
                                      accept="image/*"
                                      style={{ display: 'none' }}
                                      onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        try {
                                          const reader = new FileReader();
                                          reader.onload = async () => {
                                            const dataBase64 = reader.result as string;
                                            const cleanName = `step-${idx + 1}-mobile-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
                                            const res = await api.uploadCmsImage({
                                              file,
                                              dataBase64,
                                              fileName: cleanName,
                                              contentType: file.type || 'image/jpeg'
                                            });
                                            if (res?.url) {
                                              const updated = [...currentSteps];
                                              updated[idx] = { ...updated[idx], imageMobile: res.url };
                                              setCms({ ...cms, stepsSection: { ...cms.stepsSection, steps: updated } });
                                              notify(`${idx + 1}-qadam uchun Mobil rasm yuklandi! 🎉`);
                                            }
                                          };
                                          reader.readAsDataURL(file);
                                        } catch (err: any) {
                                          notify(err.message || 'Rasm yuklashda xatolik', true);
                                        }
                                      }}
                                    />
                                    <label
                                      htmlFor={`upload-step-mobile-${idx}`}
                                      className="outline-btn"
                                      style={{ padding: '6px 10px', fontSize: '11px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                    >
                                      <Upload size={13} /> Yuklash
                                    </label>
                                  </div>
                                  {step.imageMobile && (
                                    <img
                                      src={step.imageMobile}
                                      alt="Mobile preview"
                                      style={{ height: '64px', width: 'auto', borderRadius: '6px', marginTop: '6px', border: '1px solid var(--border)', objectFit: 'cover' }}
                                    />
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Bottom Action Bar */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                          <button
                            type="button"
                            className="primary-btn"
                            onClick={handleAddStep}
                            style={{ padding: '8px 18px', fontSize: '13px', fontWeight: 700, background: '#10b981', borderColor: '#10b981', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                          >
                            <Plus size={16} /> Yangi Qadam / Tushuntirish Qo‘shish
                          </button>

                          <button
                            type="button"
                            className="primary-btn"
                            onClick={handleSaveSteps}
                            style={{ padding: '8px 20px', fontSize: '13px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                          >
                            <Save size={16} /> O‘rganish Jarayonini Saqlash
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* TAB 5: ILG‘OR IMKONIYATLAR & FINAL CTA */}
              {cmsTab === 'features' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div className="panel" style={{ padding: '24px' }}>
                    <h3 style={{ marginBottom: '14px' }}>Bo‘lim Sarlavhalari</h3>
                    <div className="form-grid" style={{ gap: '12px', marginBottom: '16px' }}>
                      <label>
                        <b style={{ fontSize: '11px' }}>Kicker:</b>
                        <input
                          value={cms.featuresSection?.kicker || ''}
                          onChange={e => setCms({ ...cms, featuresSection: { ...cms.featuresSection, kicker: e.target.value } })}
                          placeholder="ILG‘OR IMKONIYATLAR"
                        />
                      </label>
                      <label>
                        <b style={{ fontSize: '11px' }}>Sarlavha:</b>
                        <input
                          value={cms.featuresSection?.title || ''}
                          onChange={e => setCms({ ...cms, featuresSection: { ...cms.featuresSection, title: e.target.value } })}
                          placeholder="Zamonaviy texnologiyalar xizmatingizda"
                        />
                      </label>
                      <label className="span-two">
                        <b style={{ fontSize: '11px' }}>Tavsif (Subtitle):</b>
                        <input
                          value={cms.featuresSection?.subtitle || ''}
                          onChange={e => setCms({ ...cms, featuresSection: { ...cms.featuresSection, subtitle: e.target.value } })}
                          placeholder="Biz til o‘rganishni nafaqat samarali, balki maroqli jarayonga aylantiramiz."
                        />
                      </label>
                    </div>

                    <h4 style={{ margin: '18px 0 12px', fontSize: '13px' }}>4 Ta Asosiy Innovatsion Karta</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                      {(cms.featuresSection?.features || []).map((feat: any, idx: number) => (
                        <div key={feat.key || idx} style={{ background: 'var(--bg)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                          <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--purple)', display: 'block', marginBottom: '6px' }}>
                            {idx + 1}-XUSUSIYAT ({feat.key?.toUpperCase()})
                          </span>
                          <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '8px' }}>
                            <b style={{ fontSize: '11px' }}>Sarlavha:</b>
                            <input
                              value={feat.title || ''}
                              onChange={e => {
                                const updated = [...(cms.featuresSection?.features || [])];
                                updated[idx] = { ...updated[idx], title: e.target.value };
                                setCms({ ...cms, featuresSection: { ...cms.featuresSection, features: updated } });
                              }}
                              placeholder="Xususiyat nomi"
                            />
                          </label>
                          <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <b style={{ fontSize: '11px' }}>Tavsifi:</b>
                            <textarea
                              value={feat.desc || ''}
                              onChange={e => {
                                const updated = [...(cms.featuresSection?.features || [])];
                                updated[idx] = { ...updated[idx], desc: e.target.value };
                                setCms({ ...cms, featuresSection: { ...cms.featuresSection, features: updated } });
                              }}
                              rows={3}
                              placeholder="Xususiyat haqida tavsif..."
                            />
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Final Call to Action */}
                  <div className="panel" style={{ padding: '24px' }}>
                    <h3 style={{ marginBottom: '14px' }}>Pastki Ro‘yxatdan O‘tish Chaqiruvi (Final CTA)</h3>
                    <div className="form-grid" style={{ gap: '14px' }}>
                      <label>
                        <b style={{ fontSize: '11px' }}>Kicker:</b>
                        <input
                          value={cms.finalCta?.kicker || ''}
                          onChange={e => setCms({ ...cms, finalCta: { ...cms.finalCta, kicker: e.target.value } })}
                          placeholder="BIZ BILAN O‘RGANING"
                        />
                      </label>
                      <label>
                        <b style={{ fontSize: '11px' }}>Asosiy Sarlavha:</b>
                        <input
                          value={cms.finalCta?.title || ''}
                          onChange={e => setCms({ ...cms, finalCta: { ...cms.finalCta, title: e.target.value } })}
                          placeholder="Yangi tilni erkin gapirish vaqti keldi"
                        />
                      </label>
                      <label className="span-two">
                        <b style={{ fontSize: '11px' }}>Tavsif:</b>
                        <textarea
                          value={cms.finalCta?.desc || ''}
                          onChange={e => setCms({ ...cms, finalCta: { ...cms.finalCta, desc: e.target.value } })}
                          rows={2}
                          placeholder="Til o‘rganish — yangi imkoniyatlar eshiklarini ochadi. Biz siz bilan birga bu yo‘lda!"
                        />
                      </label>
                      <label>
                        <b style={{ fontSize: '11px' }}>Asosiy Tugma (Ro‘yxatdan o‘tish):</b>
                        <input
                          value={cms.finalCta?.btnRegister || ''}
                          onChange={e => setCms({ ...cms, finalCta: { ...cms.finalCta, btnRegister: e.target.value } })}
                          placeholder="Bepul hisob yaratish"
                        />
                      </label>
                      <label>
                        <b style={{ fontSize: '11px' }}>Ikkinchi Tugma (Kirish):</b>
                        <input
                          value={cms.finalCta?.btnLogin || ''}
                          onChange={e => setCms({ ...cms, finalCta: { ...cms.finalCta, btnLogin: e.target.value } })}
                          placeholder="Tizimga kirish"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: BIZ HAQIMIZDA & JAMOA */}
              {cmsTab === 'about' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div className="panel" style={{ padding: '24px' }}>
                    <h3 style={{ marginBottom: '14px' }}>Biz Haqimizda — Maqola va Tugmalar</h3>
                    <div className="form-grid" style={{ gap: '16px' }}>
                      <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <b style={{ fontSize: '12px' }}>Bosh Sahifadagi Qisqa Tavsif:</b>
                        <textarea
                          value={cms.about || ''}
                          onChange={e => setCms({ ...cms, about: e.target.value })}
                          rows={3}
                          placeholder="TILSHUNOS til o‘rganishni tartibli, qiziqarli va shaxsiy maqsadlaringizga mos qilish uchun yaratilayotgan platforma."
                        />
                      </label>
                      <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <b style={{ fontSize: '12px' }}>"Batafsil" Tugmasi Matni:</b>
                        <input
                          value={cms.aboutButton || ''}
                          onChange={e => setCms({ ...cms, aboutButton: e.target.value })}
                          placeholder="Batafsil ma’lumot"
                        />
                      </label>
                      <label className="span-two" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <b style={{ fontSize: '12px' }}>To‘liq Maqola Matni (Batafsil bosilganda ochiladigan alohida maqola):</b>
                        <textarea
                          value={cms.aboutDetailed || ''}
                          onChange={e => setCms({ ...cms, aboutDetailed: e.target.value })}
                          rows={6}
                          placeholder="TILSHUNOS platformasi tarixi, missiyasi, metodikasi va kelajakdagi maqsadlari haqida to‘liq maqola yozing..."
                        />
                      </label>
                    </div>
                  </div>

                  {/* Team Members List */}
                  <div className="panel" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                      <div>
                        <h3>Sayt Faollari va Jamoa A’zolari ({cms.team?.length || 0} nafar)</h3>
                        <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--muted)' }}>
                          Welcome va "Biz haqimizda" sahifasida ko‘rinadigan yetakchilar va ularning rasmlari.
                        </p>
                      </div>
                      <button className="primary-btn" onClick={saveCmsChanges} style={{ padding: '8px 16px', fontSize: '12px', fontWeight: 700 }}>
                        <Save size={15} /> Supabasega Saqlash
                      </button>
                    </div>

                    {/* Member Edit Modal if active */}
                    {editingTeamMemberIdx !== null && (
                      <div style={{
                        padding: '18px',
                        background: 'var(--soft)',
                        borderRadius: '14px',
                        border: '1.5px solid var(--purple)',
                        marginBottom: '20px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 800, color: 'var(--purple)' }}>
                            ✏️ Yetakchi Ma’lumotlarini Tahrirlash: {editingTeamMember.name}
                          </h4>
                          <button onClick={() => setEditingTeamMemberIdx(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}>
                            <X size={16} />
                          </button>
                        </div>
                        <div className="form-grid" style={{ gap: '12px' }}>
                          <label>
                            Ism va familiya:
                            <input
                              value={editingTeamMember.name}
                              onChange={e => setEditingTeamMember({ ...editingTeamMember, name: e.target.value })}
                            />
                          </label>
                          <label>
                            Lavozim / Rol:
                            <input
                              value={editingTeamMember.role}
                              onChange={e => setEditingTeamMember({ ...editingTeamMember, role: e.target.value })}
                            />
                          </label>
                          <label className="span-two">
                            Qisqa biografiya / Mas’uliyati:
                            <textarea
                              value={editingTeamMember.bio}
                              onChange={e => setEditingTeamMember({ ...editingTeamMember, bio: e.target.value })}
                              rows={2}
                            />
                          </label>
                          <div className="span-two" style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <div style={{
                              width: '52px',
                              height: '52px',
                              borderRadius: '12px',
                              background: '#14243A',
                              color: '#fff',
                              overflow: 'hidden',
                              display: 'grid',
                              placeItems: 'center',
                              fontWeight: 800,
                              fontSize: '18px',
                              border: '1px solid var(--border)'
                            }}>
                              {editingTeamMember.avatar && (editingTeamMember.avatar.startsWith('http') || editingTeamMember.avatar.startsWith('data:') || editingTeamMember.avatar.startsWith('/')) ? (
                                <img src={editingTeamMember.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                editingTeamMember.avatar || 'F'
                              )}
                            </div>
                            <div style={{ flex: 1, minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              <label style={{ fontSize: '11px', fontWeight: 700 }}>Yetakchi Rasmi:</label>
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                                <label className="admin-upload-btn" style={{ padding: '7px 12px', fontSize: '11px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                  <Upload size={13} />
                                  {uploadingTeamPhoto ? 'Yuklanmoqda...' : 'Qurilmadan Rasm Tanlash'}
                                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleTeamMemberPhotoUpload(e, true)} disabled={uploadingTeamPhoto} />
                                </label>
                                <input
                                  value={editingTeamMember.avatar}
                                  onChange={e => setEditingTeamMember({ ...editingTeamMember, avatar: e.target.value })}
                                  placeholder="Yoki to‘g‘ridan-to‘g‘ri rasm URL havolasi..."
                                  style={{ flex: 1, minWidth: '180px', padding: '6px 10px', fontSize: '11px' }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '14px' }}>
                          <button className="outline-btn" onClick={() => setEditingTeamMemberIdx(null)}>Bekor qilish</button>
                          <button className="primary-btn" onClick={handleSaveEditedTeamMember}>
                            <Save size={14} /> O‘zgarishlarni Saqlash
                          </button>
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', marginBottom: '24px' }}>
                      {(cms.team || []).map((member: any, idx: number) => (
                        <div
                          key={idx}
                          style={{
                            padding: '16px',
                            background: 'var(--bg)',
                            borderRadius: '12px',
                            border: '1px solid var(--border)',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between'
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                              <div
                                style={{
                                  width: '46px',
                                  height: '46px',
                                  borderRadius: '12px',
                                  background: 'linear-gradient(135deg, #14243A, #356CF6)',
                                  color: '#fff',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: 800,
                                  fontSize: '16px',
                                  overflow: 'hidden',
                                  flexShrink: 0,
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                }}
                              >
                                {member.avatar && (member.avatar.startsWith('http') || member.avatar.startsWith('data:') || member.avatar.startsWith('/')) ? (
                                  <img src={member.avatar} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                  member.avatar || member.name?.[0]?.toUpperCase() || 'F'
                                )}
                              </div>
                              <div style={{ minWidth: 0, flex: 1 }}>
                                <strong style={{ fontSize: '13px', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{member.name}</strong>
                                <span style={{ fontSize: '11px', color: 'var(--purple)', fontWeight: 600 }}>{member.role}</span>
                              </div>
                            </div>
                            <p style={{ margin: '6px 0 0', fontSize: '11px', color: 'var(--muted)', lineHeight: '1.45' }}>{member.bio}</p>
                          </div>

                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', marginTop: '12px', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
                            <button
                              onClick={() => {
                                setEditingTeamMemberIdx(idx);
                                setEditingTeamMember({
                                  name: member.name || '',
                                  role: member.role || '',
                                  bio: member.bio || '',
                                  avatar: member.avatar || ''
                                });
                              }}
                              className="outline-btn"
                              style={{ padding: '5px 10px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            >
                              <Edit3 size={13} /> Tahrirlash & Rasm
                            </button>
                            <button
                              onClick={() => handleDeleteTeamMember(idx)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#e05656',
                                cursor: 'pointer',
                                padding: '5px'
                              }}
                              title="O‘chirish"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add Team Member Form */}
                    <div style={{ padding: '18px', background: 'var(--soft)', borderRadius: '12px', border: '1px dashed var(--border)' }}>
                      <h4 style={{ margin: '0 0 12px', fontSize: '12px', fontWeight: 700 }}>+ Yangi Faol / Mutaxassis Qo‘shish</h4>
                      <div className="form-grid" style={{ gap: '12px' }}>
                        <label>
                          Ism va familiya:
                          <input
                            value={newTeamMember.name}
                            onChange={e => setNewTeamMember({ ...newTeamMember, name: e.target.value })}
                            placeholder="Masalan, Soxibjon Gaybullayev"
                          />
                        </label>
                        <label>
                          Lavozim / Rol:
                          <input
                            value={newTeamMember.role}
                            onChange={e => setNewTeamMember({ ...newTeamMember, role: e.target.value })}
                            placeholder="Masalan, Bosh Dasturchi"
                          />
                        </label>
                        <label className="span-two">
                          Qisqa biografiya / Mas’uliyati:
                          <textarea
                            value={newTeamMember.bio}
                            onChange={e => setNewTeamMember({ ...newTeamMember, bio: e.target.value })}
                            rows={2}
                            placeholder="Mutaxassis haqida qisqa ma’lumot..."
                          />
                        </label>
                        <div className="span-two" style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
                          <div style={{
                            width: '46px',
                            height: '46px',
                            borderRadius: '10px',
                            background: '#14243A',
                            color: '#fff',
                            overflow: 'hidden',
                            display: 'grid',
                            placeItems: 'center',
                            fontWeight: 800,
                            fontSize: '16px',
                            border: '1px solid var(--border)'
                          }}>
                            {newTeamMember.avatar && (newTeamMember.avatar.startsWith('http') || newTeamMember.avatar.startsWith('data:') || newTeamMember.avatar.startsWith('/')) ? (
                              <img src={newTeamMember.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              newTeamMember.avatar || (newTeamMember.name?.[0]?.toUpperCase() || '+')
                            )}
                          </div>
                          <div style={{ flex: 1, minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontSize: '11px', fontWeight: 700 }}>Rasm yuklash:</label>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                              <label className="admin-upload-btn" style={{ padding: '7px 12px', fontSize: '11px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                <Upload size={13} />
                                {uploadingTeamPhoto ? 'Yuklanmoqda...' : 'Qurilmadan Rasm Tanlash'}
                                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleTeamMemberPhotoUpload(e, false)} disabled={uploadingTeamPhoto} />
                              </label>
                              <input
                                value={newTeamMember.avatar}
                                onChange={e => setNewTeamMember({ ...newTeamMember, avatar: e.target.value })}
                                placeholder="Yoki rasm URL havolasi..."
                                style={{ flex: 1, minWidth: '180px', padding: '6px 10px', fontSize: '11px' }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <button
                        className="outline-btn"
                        onClick={handleAddTeamMember}
                        style={{ marginTop: '14px', background: 'var(--panel)' }}
                      >
                        <Plus size={15} /> Ro‘yxatga Kiritish
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: FAQ SAVOL-JAVOBLAR */}
              {cmsTab === 'faq' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div className="panel" style={{ padding: '24px' }}>
                    <h3 style={{ marginBottom: '8px' }}>Tez-tez Beriladigan Savollar (FAQ)</h3>
                    <p style={{ margin: '0 0 18px', fontSize: '12px', color: 'var(--muted)' }}>
                      Foydalanuvchilar eng ko‘p qiziqqan savollar va ularning batafsil javoblarini tahrirlang.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
                      {(cms.faqs || []).map((faq: any, idx: number) => (
                        <div
                          key={idx}
                          style={{
                            padding: '16px',
                            background: 'var(--bg)',
                            borderRadius: '12px',
                            border: '1px solid var(--border)'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <b style={{ fontSize: '11px', color: 'var(--purple)' }}>Savol #{idx + 1}:</b>
                                <input
                                  value={faq.q}
                                  onChange={e => {
                                    const next = [...cms.faqs];
                                    next[idx] = { ...next[idx], q: e.target.value };
                                    setCms({ ...cms, faqs: next });
                                  }}
                                />
                              </label>
                              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <b style={{ fontSize: '11px', color: 'var(--muted)' }}>Javob:</b>
                                <textarea
                                  rows={2}
                                  value={faq.a}
                                  onChange={e => {
                                    const next = [...cms.faqs];
                                    next[idx] = { ...next[idx], a: e.target.value };
                                    setCms({ ...cms, faqs: next });
                                  }}
                                />
                              </label>
                            </div>
                            <button
                              onClick={() => handleDeleteFaq(idx)}
                              style={{ background: 'none', border: 'none', color: '#e05656', cursor: 'pointer', padding: '6px' }}
                              title="O‘chirish"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add FAQ Form */}
                    <div style={{ padding: '18px', background: 'var(--soft)', borderRadius: '12px', border: '1px dashed var(--border)' }}>
                      <h4 style={{ margin: '0 0 12px', fontSize: '12px', fontWeight: 700 }}>+ Yangi FAQ Qo‘shish</h4>
                      <div className="form-grid" style={{ gap: '12px' }}>
                        <label className="span-two">
                          Savol:
                          <input
                            value={newFaq.q}
                            onChange={e => setNewFaq({ ...newFaq, q: e.target.value })}
                            placeholder="Masalan, TILSHUNOS platformasida sertifikat beriladimi?"
                          />
                        </label>
                        <label className="span-two">
                          Javob:
                          <textarea
                            value={newFaq.a}
                            onChange={e => setNewFaq({ ...newFaq, a: e.target.value })}
                            rows={3}
                            placeholder="Savolga aniq va qisqa javob kiriting..."
                          />
                        </label>
                      </div>
                      <button
                        className="outline-btn"
                        onClick={handleAddFaq}
                        style={{ marginTop: '12px', background: 'var(--panel)' }}
                      >
                        <Plus size={15} /> FAQ Ro‘yxatiga Qo‘shish
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: FOOTER, ASOSCHI & KONTAKTLAR */}
              {cmsTab === 'footer' && (
                <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                  <div className="panel" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                      <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ShieldCheck size={18} style={{ color: 'var(--purple)' }} /> Sayt Asoschisi Ma’lumotlari & Rasmi
                      </h3>
                      <button className="primary-btn" onClick={saveCmsChanges} style={{ padding: '6px 14px', fontSize: '11px', fontWeight: 700 }}>
                        <Save size={14} /> Saqlash
                      </button>
                    </div>
                    <p style={{ margin: '0 0 16px', fontSize: '11px', color: 'var(--muted)' }}>
                      "Biz haqimizda" sahifasida va Admin paneldagi Super Admin kartasida aks etuvchi asoschi ma’lumotlari.
                    </p>

                    {/* Founder Photo Preview and Upload */}
                    <div style={{
                      display: 'flex',
                      gap: '16px',
                      alignItems: 'center',
                      padding: '14px',
                      background: 'var(--bg)',
                      borderRadius: '12px',
                      border: '1px solid var(--border)',
                      marginBottom: '16px',
                      flexWrap: 'wrap'
                    }}>
                      <div style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '14px',
                        background: '#14243A',
                        color: '#fff',
                        display: 'grid',
                        placeItems: 'center',
                        overflow: 'hidden',
                        fontWeight: 800,
                        fontSize: '22px',
                        border: '2px solid var(--purple)',
                        boxShadow: '0 4px 12px rgba(120, 105, 245, 0.25)',
                        flexShrink: 0
                      }}>
                        {cms.founderPhoto ? (
                          <img src={cms.founderPhoto} alt="Asoschi" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          cms.founderName?.[0]?.toUpperCase() || 'S'
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <b style={{ fontSize: '12px' }}>Asoschi Rasmi (Avatar):</b>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                          <label className="admin-upload-btn" style={{ padding: '7px 12px', fontSize: '11px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <Upload size={13} />
                            {uploadingFounder ? 'Yuklanmoqda...' : 'Qurilmadan Rasm Yuklash'}
                            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFounderPhotoUpload} disabled={uploadingFounder} />
                          </label>
                          <input
                            value={cms.founderPhoto || ''}
                            onChange={e => setCms({ ...cms, founderPhoto: e.target.value })}
                            placeholder="https://... rasm havolasi"
                            style={{ flex: 1, minWidth: '180px', padding: '6px 10px', fontSize: '11px' }}
                          />
                          {cms.founderPhoto && (
                            <button
                              type="button"
                              onClick={() => setCms({ ...cms, founderPhoto: '' })}
                              className="text-action"
                              style={{ color: '#e05656', fontSize: '11px' }}
                            >
                              O‘chirish
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
                      <b style={{ fontSize: '12px' }}>Asoschi Ismi-sharifi:</b>
                      <input
                        value={cms.founderName || ''}
                        onChange={e => setCms({ ...cms, founderName: e.target.value })}
                        placeholder="Soxibjon Gaybullayev"
                      />
                    </label>

                    <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
                      <b style={{ fontSize: '12px' }}>Lavozimi / Unvoni:</b>
                      <input
                        value={cms.founderTitle || ''}
                        onChange={e => setCms({ ...cms, founderTitle: e.target.value })}
                        placeholder="LOYIHA ASOSCHISI VA RAHBARI"
                      />
                    </label>

                    <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
                      <b style={{ fontSize: '12px' }}>Asoschi Biografiyasi va Missiyasi:</b>
                      <textarea
                        value={cms.founderBio || ''}
                        onChange={e => setCms({ ...cms, founderBio: e.target.value })}
                        rows={4}
                        placeholder="Platforma asoschisi haqida qisqa ma’lumot va loyiha maqsadi..."
                      />
                    </label>

                    <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
                      <b style={{ fontSize: '12px' }}>Asoschi Shiori / Iqtibosi (Quote):</b>
                      <textarea
                        value={cms.founderQuote || ''}
                        onChange={e => setCms({ ...cms, founderQuote: e.target.value })}
                        rows={3}
                        placeholder="Bizning niyatimiz — O‘zbekiston yoshlariga jahonning istalgan tili bo‘yicha..."
                      />
                    </label>

                    <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <b style={{ fontSize: '12px' }}>Footer Mualliflik Huquqi Matni (Copyright):</b>
                      <input
                        value={cms.footer || ''}
                        onChange={e => setCms({ ...cms, footer: e.target.value })}
                        placeholder="© 2026 TILSHUNOS · Barcha huquqlar himoyalangan"
                      />
                    </label>
                  </div>

                  <div className="panel" style={{ padding: '24px' }}>
                    <h3 style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MessageSquare size={18} style={{ color: 'var(--purple)' }} /> Ijtimoiy Tarmoqlar & Aloqa (Contacts)
                    </h3>
                    <div style={{ padding: '10px 12px', background: 'var(--soft)', borderRadius: '8px', fontSize: '11px', color: 'var(--muted)', marginBottom: '14px' }}>
                      📌 <em>Faqat kiritilgan aloqa turlari footerda ko‘rinadi. Masalan, Telegram kiritilsa faqat Telegram chiqadi; Instagram qo‘shilsa u ham darhol ko‘rinadi. Bo‘sh qoldirilganlari yashiriladi.</em>
                    </div>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
                      <b style={{ fontSize: '12px' }}>Telegram (Username yoki Havola):</b>
                      <input
                        value={cms.contacts?.telegram || ''}
                        onChange={e => setCms({ ...cms, contacts: { ...cms.contacts, telegram: e.target.value } })}
                        placeholder="@tilshunos yoki https://t.me/tilshunos"
                      />
                    </label>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
                      <b style={{ fontSize: '12px' }}>Instagram (Username yoki Havola):</b>
                      <input
                        value={cms.contacts?.instagram || ''}
                        onChange={e => setCms({ ...cms, contacts: { ...cms.contacts, instagram: e.target.value } })}
                        placeholder="tilshunos_app yoki https://instagram.com/tilshunos_app"
                      />
                    </label>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
                      <b style={{ fontSize: '12px' }}>Email Manzili:</b>
                      <input
                        type="email"
                        value={cms.contacts?.email || ''}
                        onChange={e => setCms({ ...cms, contacts: { ...cms.contacts, email: e.target.value } })}
                        placeholder="hello@tilshunos.uz"
                      />
                    </label>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
                      <b style={{ fontSize: '12px' }}>Telefon Raqam:</b>
                      <input
                        value={cms.contacts?.phone || ''}
                        onChange={e => setCms({ ...cms, contacts: { ...cms.contacts, phone: e.target.value } })}
                        placeholder="+998 90 123 45 67"
                      />
                    </label>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <b style={{ fontSize: '12px' }}>YouTube Kanal:</b>
                      <input
                        value={cms.contacts?.youtube || ''}
                        onChange={e => setCms({ ...cms, contacts: { ...cms.contacts, youtube: e.target.value } })}
                        placeholder="https://youtube.com/@tilshunos (agar mavjud bo‘lsa)"
                      />
                    </label>
                  </div>
                </div>
              )}
            </>
          )}

          {/* BOSHLANG‘ICH SINOV (TRIAL TESTS) SOZLAMALARI */}
          {section === 'trial_tests' && (
            <AdminTrialTestsTab
              cms={cms}
              onSaveCms={async (updatedCms) => {
                setCms(updatedCms);
                try {
                  localStorage.setItem('tilshunos_cms_data', JSON.stringify(updatedCms));
                } catch {}
                await api.saveCms(updatedCms);
                window.dispatchEvent(new CustomEvent('tilshunos_cms_saved', { detail: updatedCms }));
              }}
              notify={notify}
              dark={dark}
            />
          )}

          {/* TIZIM SOZLAMALARI & SUPABASE STATUS */}
          {section === 'settings' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* SUPER ADMIN PLATFORMA EGASI HIMOYA KARTASI */}
              <div className="panel" style={{
                padding: '24px',
                background: 'linear-gradient(135deg, rgba(120, 105, 245, 0.08), rgba(91, 75, 240, 0.03))',
                border: '1.5px solid rgba(120, 105, 245, 0.35)',
                borderRadius: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', width: '56px', height: '56px', flexShrink: 0 }}>
                      {cms.founderPhoto ? (
                        <img
                          src={cms.founderPhoto}
                          alt={cms.founderName || 'Super Admin'}
                          style={{ width: '56px', height: '56px', borderRadius: '16px', objectFit: 'cover', border: '2px solid #7869f5', boxShadow: '0 4px 14px rgba(120, 105, 245, 0.35)' }}
                        />
                      ) : (
                        <div style={{
                          width: '56px',
                          height: '56px',
                          borderRadius: '16px',
                          background: 'linear-gradient(135deg, #7869f5, #5b4bf0)',
                          color: '#fff',
                          display: 'grid',
                          placeItems: 'center',
                          fontWeight: 800,
                          fontSize: '24px',
                          boxShadow: '0 4px 14px rgba(120, 105, 245, 0.35)'
                        }}>
                          👑
                        </div>
                      )}
                      <span style={{
                        position: 'absolute',
                        bottom: '-4px',
                        right: '-4px',
                        background: '#fff',
                        borderRadius: '50%',
                        padding: '2px',
                        fontSize: '12px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.18)',
                        lineHeight: 1
                      }}>👑</span>
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <h3 style={{ margin: 0, fontSize: '17px', color: 'var(--text)' }}>{cms.founderName || 'Soxibjon Gaybullayev'}</h3>
                        <span style={{
                          background: '#7869f5',
                          color: '#fff',
                          fontSize: '10px',
                          fontWeight: 800,
                          padding: '3px 8px',
                          borderRadius: '6px'
                        }}>
                          TIZIM YAGONA SUPER ADMINI
                        </span>
                        <span className="badge-verified">Daxlsiz & Himoyalangan</span>
                      </div>
                      <p style={{ margin: '5px 0 8px', fontSize: '12px', color: 'var(--muted)', lineHeight: '1.5' }}>
                        Ushbu hisob platformaning yagona egasi hisoblanadi. U umumiy o‘quvchilar ro‘yxatida ko‘rinmaydi va hech kim uni tizimdan chiqara olmaydi. Boshqa adminlarni saylash va ularning huquqlarini taqsimlash faqat Super Admin ixtiyorida.
                      </p>
                      <label className="outline-btn" style={{ fontSize: '11px', padding: '5px 10px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        <Camera size={13} />
                        {uploadingFounder ? 'Yuklanmoqda...' : 'Super Admin Rasmini O‘zgartirish'}
                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFounderPhotoUpload} disabled={uploadingFounder} />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="panel" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <h2 style={{ margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Database size={20} style={{ color: '#24b47e' }} />
                      Supabase Cloud Ma’lumotlar Bazasi Holati
                    </h2>
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--muted)' }}>
                      AWS Tokyo (aws-0-ap-northeast-1) PostgreSQL Pooler ulanishi
                    </p>
                  </div>
                  <button
                    className="outline-btn"
                    onClick={testSupabasePing}
                    disabled={testingPing}
                  >
                    <Zap size={14} style={{ color: '#eab308' }} />
                    {testingPing ? 'Tekshirilmoqda...' : 'Ping Test'}
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginTop: '16px' }}>
                  <div style={{ background: 'var(--bg)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '10px', color: 'var(--muted)', fontWeight: 700 }}>DATABASE HOST</span>
                    <strong style={{ display: 'block', fontSize: '12px', marginTop: '4px', wordBreak: 'break-all' }}>aws-0-ap-northeast-1.pooler.supabase.com</strong>
                  </div>
                  <div style={{ background: 'var(--bg)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '10px', color: 'var(--muted)', fontWeight: 700 }}>DATABASE PORT & SSL</span>
                    <strong style={{ display: 'block', fontSize: '12px', marginTop: '4px' }}>Port 5432 · SSL Faol (Require)</strong>
                  </div>
                  <div style={{ background: 'var(--bg)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '10px', color: 'var(--muted)', fontWeight: 700 }}>RENDER BACKEND API</span>
                    <strong style={{ display: 'block', fontSize: '12px', marginTop: '4px', color: '#16a34a' }}>https://tilshunos.onrender.com/api/v1</strong>
                  </div>
                  <div style={{ background: 'var(--bg)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '10px', color: 'var(--muted)', fontWeight: 700 }}>ALOQA TEZLIGI (PING)</span>
                    <strong style={{ display: 'block', fontSize: '12px', marginTop: '4px', color: pingLatency ? '#16a34a' : 'var(--text)' }}>
                      {pingLatency ? `${pingLatency} ms (Tezkor ✓)` : 'Tayyor'}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="panel" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h2 style={{ margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ShieldCheck size={20} style={{ color: '#22c55e' }} />
                      Platforma Xavfsizlik va Arxitektura Monitori
                    </h2>
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--muted)' }}>
                      Backend (ASP.NET Core & Supabase PostgreSQL) darajasida avtomatik ishlovchi asosiy himoya va mantiqiy qoidalar holati.
                    </p>
                  </div>
                  <span style={{ fontSize: '11px', background: 'rgba(34, 197, 94, 0.12)', color: '#16a34a', padding: '4px 10px', borderRadius: '8px', fontWeight: 700, border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                    Barcha Himoyalar Faol ✓
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px', marginTop: '18px' }}>
                  {[
                    {
                      title: 'Email Tasdiqlash Kodi (Resend OTP)',
                      desc: 'Foydalanuvchi hisobini botlardan himoyalash va haqiqiy foydalanuvchini aniqlash uchun 6 xonali OTP yuborish.',
                      badge: 'Faol & Majburiy',
                      color: '#22c55e'
                    },
                    {
                      title: 'Mavjud Hisobni Tekshirish (Anti-Duplicate)',
                      desc: 'Bazada bitta email bilan faqat bitta hisob ochilishini PostgreSQL unikal indekslari orqali qatʼiy taʼminlaydi.',
                      badge: 'Himoyalangan',
                      color: '#22c55e'
                    },
                    {
                      title: 'Standart Email & Parol Shifrlash',
                      desc: 'Parollar xom holda saqlanmaydi, xavfsiz PBKDF2/BCrypt hashing algoritmi orqali shifrlanadi.',
                      badge: 'Shifrlangan',
                      color: '#22c55e'
                    },
                    {
                      title: '1v1 Bellashuvda CEFR Daraja Moslashuvi',
                      desc: 'Foydalanuvchilarga teng raqobatchi va o‘z bilim darajasiga (A1-C2) mos so‘zlar tanlanishini nazorat qiladi.',
                      badge: 'Avtomatik',
                      color: '#3b82f6'
                    },
                    {
                      title: 'Yangi Materiallar Holati (IsPublished)',
                      desc: 'O‘qituvchilar qo‘shgan reading, writing va lug‘at materiallari o‘quvchilarga ko‘rinishi uchun nashr statusi nazorati.',
                      badge: 'Boshqaruvda',
                      color: '#3b82f6'
                    },
                    {
                      title: 'Anti-Cheat & Anti-Fraud Nazorati',
                      desc: 'Test mashqlari va lug‘at viktorinalarida sunʼiy tezkor bot javoblarini va natijalarni soxtalashtirishni cheklaydi.',
                      badge: 'Faol Nazorat',
                      color: '#22c55e'
                    }
                  ].map((rule, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '14px 16px',
                        background: 'var(--bg)',
                        borderRadius: '12px',
                        border: '1px solid var(--border)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '8px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                        <strong style={{ fontSize: '13px', color: 'var(--text)', lineHeight: '1.4' }}>{rule.title}</strong>
                        <span style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '6px',
                          background: `${rule.color}15`,
                          color: rule.color,
                          border: `1px solid ${rule.color}35`,
                          whiteSpace: 'nowrap'
                        }}>
                          {rule.badge}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '11px', color: 'var(--muted)', lineHeight: '1.5' }}>
                        {rule.desc}
                      </p>
                    </div>
                  ))}
                </div>

                {/* RESEND EMAIL MA’LUMOT QUTISI */}
                <div style={{
                  marginTop: '20px',
                  padding: '16px',
                  background: 'rgba(99, 102, 241, 0.06)',
                  border: '1px solid rgba(99, 102, 241, 0.25)',
                  borderRadius: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '16px' }}>✉️</span>
                    <strong style={{ fontSize: '13px', color: 'var(--text)' }}>Resend Email Xizmati (OTP Tasdiqlash)</strong>
                    <span style={{ fontSize: '10px', background: '#22c55e', color: '#fff', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>Faol Ulanish</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '11px', color: 'var(--muted)', lineHeight: '1.6' }}>
                    Foydalanuvchi ro‘yxatdan o‘tganda yoki kodni qayta so‘raganda 6 xonali tasdiqlash kodi Resend API orqali yuboriladi. Sozlamalar: <code>Resend:ApiKey</code> (re_...) va <code>Resend:FromEmail</code> (masalan: <code>onboarding@resend.dev</code> yoki shaxsiy domen).
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* YANGI ADMIN SAYLASH MODAL (SUPER ADMIN UCHUN) */}
      {appointModalOpen && (
        <div className="modal-backdrop" onClick={() => setAppointModalOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '460px' }}>
            <div className="modal-heading">
              <div>
                <h2>Yangi Moderator Admin Saylash</h2>
                <p>Mavjud umumiy foydalanuvchilar orasidan moderator admin tayinlang.</p>
              </div>
              <button className="icon-btn" onClick={() => setAppointModalOpen(false)}><X size={18} /></button>
            </div>

            <div style={{ margin: '18px 0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                  Foydalanuvchini qidirish:
                </label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', border: '1px solid var(--border)', borderRadius: '10px', padding: '8px 12px', background: 'var(--bg)' }}>
                  <Search size={16} style={{ color: 'var(--muted)' }} />
                  <input
                    value={appointAdminSearch}
                    onChange={e => setAppointAdminSearch(e.target.value)}
                    placeholder="Ism yoki email bo‘yicha filtr..."
                    style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: '12px', color: 'var(--text)' }}
                  />
                  {appointAdminSearch && (
                    <button onClick={() => setAppointAdminSearch('')} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}>
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                  Foydalanuvchini tanlang:
                </label>
                <select
                  value={selectedUserToAppoint}
                  onChange={e => setSelectedUserToAppoint(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '12px' }}
                >
                  <option value="">-- Tanlang ({eligibleUsersForAdmin.length} ta nomzod) --</option>
                  {eligibleUsersForAdmin.map((u: any) => (
                    <option key={u.id} value={u.id}>
                      {u.firstName || u.lastName ? `${u.firstName || ''} ${u.lastName || ''}`.trim() : u.email.split('@')[0]} ({u.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <button className="outline-btn" onClick={() => setAppointModalOpen(false)}>Bekor qilish</button>
              <button className="primary-btn" onClick={handleAppointAdmin}>
                <UserCog size={15} /> Admin qilib tayinlash
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOYDALANUVCHILAR ORASIDAN O‘QITUVCHI TAYINLASH MODAL */}
      {appointTeacherModalOpen && (
        <div className="modal-backdrop" onClick={() => setAppointTeacherModalOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-heading">
              <div>
                <h2>Foydalanuvchilar Orasidan O‘qituvchi Tayinlash</h2>
                <p>Mavjud ro‘yxatdan o‘tgan foydalanuvchini tanlang va unga o‘qituvchi maqomini bering.</p>
              </div>
              <button className="icon-btn" onClick={() => setAppointTeacherModalOpen(false)}><X size={18} /></button>
            </div>

            <div style={{ margin: '18px 0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                  Foydalanuvchini qidirish:
                </label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', border: '1px solid var(--border)', borderRadius: '10px', padding: '8px 12px', background: 'var(--bg)' }}>
                  <Search size={16} style={{ color: 'var(--muted)' }} />
                  <input
                    value={appointTeacherSearch}
                    onChange={e => setAppointTeacherSearch(e.target.value)}
                    placeholder="Ism yoki email bo‘yicha filtr..."
                    style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: '12px', color: 'var(--text)' }}
                  />
                  {appointTeacherSearch && (
                    <button onClick={() => setAppointTeacherSearch('')} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}>
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                  Foydalanuvchini tanlang:
                </label>
                <select
                  value={selectedUserToAppointTeacher}
                  onChange={e => setSelectedUserToAppointTeacher(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '12px' }}
                >
                  <option value="">-- Tanlang ({eligibleUsersForTeacher.length} ta nomzod) --</option>
                  {eligibleUsersForTeacher.map((u: any) => (
                    <option key={u.id} value={u.id}>
                      {u.firstName || u.lastName ? `${u.firstName || ''} ${u.lastName || ''}`.trim() : u.email.split('@')[0]} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                  Mutaxassislik / Yo‘nalish:
                </label>
                <input
                  value={appointTeacherSpecialty}
                  onChange={e => setAppointTeacherSpecialty(e.target.value)}
                  placeholder="Masalan: English · B1–C1, IELTS & Speaking"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '12px' }}
                />
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                  {['English · B1–C1', 'IELTS & CEFR', 'Grammatika & Lug‘at', 'Bolalar uchun ingliz tili'].map(preset => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAppointTeacherSpecialty(preset)}
                      style={{
                        fontSize: '10px',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        border: '1px solid var(--border)',
                        background: appointTeacherSpecialty === preset ? 'var(--soft)' : 'var(--panel)',
                        color: appointTeacherSpecialty === preset ? 'var(--purple)' : 'var(--muted)',
                        cursor: 'pointer'
                      }}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                  Qisqacha bio:
                </label>
                <textarea
                  value={appointTeacherBio}
                  onChange={e => setAppointTeacherBio(e.target.value)}
                  rows={2}
                  placeholder="Tajribali ustoz va repetitor..."
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '12px', resize: 'vertical' }}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="outline-btn" onClick={() => setAppointTeacherModalOpen(false)}>Bekor qilish</button>
              <button className="primary-btn" onClick={handleAppointTeacher}>
                <GraduationCap size={15} /> O‘qituvchi qilib tayinlash
              </button>
            </div>
          </div>
        </div>
      )}

      {/* USER ROLE EDIT MODAL (SUPER ADMIN CANNOT BE CHOSEN HERE) */}
      {selectedUserForEdit && (
        <div className="modal-backdrop" onClick={() => setSelectedUserForEdit(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="modal-heading">
              <div>
                <h2>Foydalanuvchi Rolini O‘zgartirish</h2>
                <p>{selectedUserForEdit.email}</p>
              </div>
              <button className="icon-btn" onClick={() => setSelectedUserForEdit(null)}><X size={18} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', margin: '20px 0' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', fontWeight: 700 }}>
                Yangi Rol:
                <select
                  id="user-new-role-select"
                  defaultValue={selectedUserForEdit.role === 'Admin' || selectedUserForEdit.role === 3 ? '3' : selectedUserForEdit.role === 'Teacher' || selectedUserForEdit.role === 2 ? '2' : '1'}
                  style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
                >
                  <option value="1">Learner (O‘quvchi)</option>
                  <option value="2">Teacher (O‘qituvchi)</option>
                  <option value="3">Admin (Moderator / Administrator)</option>
                </select>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  id="user-is-active-check"
                  defaultChecked={selectedUserForEdit.isActive !== false}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--purple)' }}
                />
                Hisob faol holatda (IsActive)
              </label>
            </div>

            <div className="modal-footer" style={{ marginTop: '20px' }}>
              <button className="outline-btn" onClick={() => setSelectedUserForEdit(null)}>Bekor qilish</button>
              <button
                className="primary-btn"
                onClick={() => {
                  const roleSelect = document.getElementById('user-new-role-select') as HTMLSelectElement;
                  const activeCheck = document.getElementById('user-is-active-check') as HTMLInputElement;
                  handleUpdateUserRole(selectedUserForEdit.id, Number(roleSelect.value), activeCheck.checked);
                }}
              >
                Saqlash
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TEACHER EDIT MODAL */}
      {editingTeacher && (
        <div className="modal-backdrop" onClick={() => setEditingTeacher(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px', width: '95%' }}>
            <div className="modal-heading">
              <div>
                <h2>O‘qituvchi Ma’lumotlarini Tahrirlash</h2>
                <p>{editingTeacher.email}</p>
              </div>
              <button className="icon-btn" onClick={() => setEditingTeacher(null)}><X size={18} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', margin: '20px 0' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', fontWeight: 700 }}>
                  Ism:
                  <input
                    value={editTeacherForm.firstName}
                    onChange={e => setEditTeacherForm({ ...editTeacherForm, firstName: e.target.value })}
                    placeholder="Ism"
                    style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
                  />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', fontWeight: 700 }}>
                  Familiya:
                  <input
                    value={editTeacherForm.lastName}
                    onChange={e => setEditTeacherForm({ ...editTeacherForm, lastName: e.target.value })}
                    placeholder="Familiya"
                    style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
                  />
                </label>
              </div>

              <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', fontWeight: 700 }}>
                Email:
                <input
                  type="email"
                  value={editTeacherForm.email}
                  onChange={e => setEditTeacherForm({ ...editTeacherForm, email: e.target.value })}
                  placeholder="teacher@tilshunos.app"
                  style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
                />
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', fontWeight: 700 }}>
                Yangi Parol (ixtiyoriy, agar o‘zgartirilmasa bo‘sh qoldiring):
                <input
                  type="password"
                  value={editTeacherForm.password}
                  onChange={e => setEditTeacherForm({ ...editTeacherForm, password: e.target.value })}
                  placeholder="Kamida 6 belgi"
                  style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
                />
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', fontWeight: 700 }}>
                Mutaxassislik:
                <input
                  value={editTeacherForm.specialty}
                  onChange={e => setEditTeacherForm({ ...editTeacherForm, specialty: e.target.value })}
                  placeholder="IELTS & B1–C1 Mutaxassisi"
                  style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
                />
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', fontWeight: 700 }}>
                Qisqacha Bio:
                <textarea
                  rows={3}
                  value={editTeacherForm.bio}
                  onChange={e => setEditTeacherForm({ ...editTeacherForm, bio: e.target.value })}
                  placeholder="Tajribali ustoz..."
                  style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', resize: 'vertical' }}
                />
              </label>

              <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginTop: '6px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={editTeacherForm.isActive}
                    onChange={e => setEditTeacherForm({ ...editTeacherForm, isActive: e.target.checked })}
                    style={{ width: '16px', height: '16px', accentColor: 'var(--purple)' }}
                  />
                  Hisob Faol (IsActive)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={editTeacherForm.isApproved}
                    onChange={e => setEditTeacherForm({ ...editTeacherForm, isApproved: e.target.checked })}
                    style={{ width: '16px', height: '16px', accentColor: 'var(--purple)' }}
                  />
                  Tasdiqlangan Ustoz (IsApproved)
                </label>
              </div>
            </div>

            <div className="modal-footer" style={{ marginTop: '20px' }}>
              <button className="outline-btn" onClick={() => setEditingTeacher(null)}>Bekor qilish</button>
              <button className="primary-btn" onClick={handleUpdateTeacher}>
                <Save size={16} /> Saqlash
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN PERMISSIONS MODAL */}
      {permsModalAdmin && (
        <div className="modal-backdrop" onClick={() => setPermsModalAdmin(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px', width: '95%' }}>
            <div className="modal-heading">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'rgba(120, 105, 245, 0.12)',
                  color: 'var(--purple)',
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0
                }}>
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '17px' }}>Admin Ruxsatlarini Sozlash</h2>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--muted)' }}>
                    {permsModalAdmin.firstName || permsModalAdmin.email} uchun tizim imkoniyatlarini yoqing yoki o‘chiring
                  </p>
                </div>
              </div>
              <button className="icon-btn" onClick={() => setPermsModalAdmin(null)} aria-label="Yopish"><X size={18} /></button>
            </div>

            <div style={{ margin: '18px 0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { key: 'canVocab', title: 'Umumiy Lug‘atni boshqarish', desc: 'Yangi so‘zlar qo‘shish, tahrirlash va o‘chirish ruxsati', icon: '📚' },
                { key: 'canCMS', title: 'Welcome Sahifa (CMS)', desc: 'Bosh sahifa matnlari, bannerlar, fon rasmlarini sozlash', icon: '🌐' },
                { key: 'canTeachers', title: 'O‘qituvchilarni boshqarish', desc: 'O‘qituvchilar ma’lumotlarini ko‘rish va tahrirlash', icon: '🎓' },
                { key: 'canMaterials', title: 'O‘quv Materiallari', desc: 'Reading, Writing, Listening va Video darslarni boshqarish', icon: '✍️' },
                { key: 'canStudents', title: 'Foydalanuvchilar reestrini ko‘rish', desc: 'O‘quvchilar ro‘yxati, hisoblar va statistikalarni kuzatish', icon: '📊' }
              ].map(opt => {
                const currentPerms = adminPerms[permsModalAdmin.id] || { canVocab: true, canTeachers: false, canCMS: true, canMaterials: true, canStudents: true };
                const isChecked = Boolean((currentPerms as any)[opt.key]);
                return (
                  <div
                    key={opt.key}
                    onClick={() => handleToggleAdminPerm(permsModalAdmin.id, opt.key as any)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      border: isChecked ? '1.5px solid var(--purple)' : '1px solid var(--border)',
                      background: isChecked ? 'rgba(120, 105, 245, 0.05)' : 'var(--bg)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '20px' }}>{opt.icon}</span>
                      <div>
                        <strong style={{ display: 'block', fontSize: '13px', color: 'var(--text)' }}>
                          {opt.title}
                        </strong>
                        <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                          {opt.desc}
                        </span>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      readOnly
                      style={{ width: '18px', height: '18px', accentColor: 'var(--purple)', pointerEvents: 'none', flexShrink: 0 }}
                    />
                  </div>
                );
              })}
            </div>

            <div className="modal-footer" style={{ marginTop: '20px' }}>
              <button
                className="primary-btn"
                onClick={() => setPermsModalAdmin(null)}
                style={{ width: '100%', justifyContent: 'center', padding: '10px 16px' }}
              >
                <Check size={16} /> Saqlash va Yopish
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="toast" style={toast.isError ? { background: '#ef4444', color: '#fff', borderColor: '#b91c1c' } : undefined}>
          <div>{toast.isError ? <AlertCircle size={16} /> : <Check size={16} />}</div>
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
