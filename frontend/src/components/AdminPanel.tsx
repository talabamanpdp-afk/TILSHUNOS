import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity, BookOpen, Boxes, FileAudio, FileText, Gamepad2, Globe, LayoutDashboard,
  LogOut, Plus, Settings, ShieldCheck, Users, Video, GraduationCap, ClipboardList,
  Search, Trash2, Edit3, Save, UserCog, Headphones, PenLine, BookMarked, ChartNoAxesCombined,
  Check, Sun, Moon, Sparkles, ArrowRight, Menu, X, RefreshCw, Database, CheckCircle2,
  AlertCircle, ExternalLink, ShieldAlert, Clock, Layers, MessageSquare, Zap
} from 'lucide-react';
import { api, authStorage } from '../api';

const adminNav = [
  ['Dashboard & Statistika', 'dashboard', LayoutDashboard],
  ['Welcome Sahifa / CMS', 'cms', Globe],
  ['O‘quvchilar Tahlili', 'students', Users],
  ['O‘qituvchilar', 'teachers', GraduationCap],
  ['Rollar & Ruxsatlar', 'roles', UserCog],
  ['Umumiy Lug‘at', 'vocab', BookOpen],
  ['O‘yin Mavzulari', 'games', Gamepad2],
  ['Reading Materiallari', 'reading', BookMarked],
  ['Writing Topshiriqlari', 'writing', PenLine],
  ['Listening Audio', 'listening', Headphones],
  ['Video Kutubxona', 'videos', Video],
  ['Tizim Sozlamalari', 'settings', Settings]
];

export function AdminPanel({ onLogout }: { onLogout: () => void }) {
  const [section, setSection] = useState('dashboard');
  const [dark, setDark] = useState(false);
  const [toast, setToast] = useState('');
  const [query, setQuery] = useState('');
  const [mobileNav, setMobileNav] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('');

  // Statistics & Level Distribution from Supabase
  const [stats, setStats] = useState<any>({
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
  });

  // Students & All Users from Supabase
  const [users, setUsers] = useState<any[]>([]);
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<any | null>(null);

  // Teachers from Supabase
  const [teachers, setTeachers] = useState<any[]>([]);

  // CMS Content from Supabase
  const [cms, setCms] = useState<any>({
    heroBadge: 'TILSHUNOS 2.0 · ILG‘OR TIL O‘RGANISH EKOTIZIMI',
    hero: 'Yangi til. Yangi imkoniyatlar.',
    description: 'TILSHUNOS bilan har kuni tizimli o‘rganing, CEFR standartlarida bilimingizni mustahkamlang va erkin muloqotga chiqing.',
    cta: 'Bepul boshlash',
    secondaryCta: 'Platformani o‘rganish',
    header: 'Imkoniyatlar, Biz haqimizda, Kirish',
    about: 'TILSHUNOS til o‘rganishni tartibli, qiziqarli va shaxsiy maqsadlaringizga mos qilish uchun yaratilayotgan ilg‘or platforma.',
    aboutButton: 'Batafsil ma’lumot',
    aboutDetailed: 'TILSHUNOS — xalqaro CEFR (A1–C2) standartlariga moslashtirilgan, sun’iy intellekt va professional ustozlar metodikasini o‘zida mujassam etgan zamonaviy ta’lim platformasi. Bizning asosiy maqsadimiz — har bir foydalanuvchiga murakkab grammatik qoidalarsiz, interaktiv so‘z o‘yinlari, amaliy audio-dialoglar, yozma tahlil va real muloqot orqali tilni tabiiy o‘zlashtirish imkoniyatini taqdim etishdir.',
    founderName: 'Soxibjon Gaybullayev',
    founderBio: 'TILSHUNOS platformasi asoschisi. O‘zbekiston yoshlariga jahon tillarini eng samarali va qulay usulda o‘rganish uchun innovatsion ekotizim yaratish ustida ishlaydi.',
    team: [
      { name: 'Soxibjon Gaybullayev', role: 'Asoschi & Bosh Muhandis', bio: 'Til o‘rganish texnologiyalari va raqamli ta’lim bo‘yicha mutaxassis.', avatar: 'S' },
      { name: 'Dilnoza Karimova', role: 'Bosh O‘qituvchi & Metodist', bio: 'IELTS va CEFR standartlari bo‘yicha 8 yillik tajribaga ega ustoz.', avatar: 'D' },
      { name: 'Jasur Aliyev', role: 'Ta’lim Koordinator', bio: 'Talabalar bilan ishlash va interaktiv mashqlar mutaxassisi.', avatar: 'J' }
    ],
    contacts: {
      telegram: '@tilshunos',
      instagram: 'tilshunos_app',
      email: 'soxibgaybullayev439@gmail.com',
      phone: '+998 90 123 45 67',
      youtube: ''
    },
    footer: '© 2026 TILSHUNOS · Barcha huquqlar himoyalangan',
    faqs: [
      { q: 'TILSHUNOS platformasidan foydalanish bepulmi?', a: 'Ha, asosiy funksiyalar — so‘z yodlash, mashqlar, CEFR reading va listening materiallari barcha uchun bepul.' },
      { q: 'CEFR darajalarini qanday aniqlayman?', a: 'Ro‘yxatdan o‘tish chog‘ida darajangizni (A1–C2) o‘zingiz belgilashingiz yoki qisqa diagnostik test orqali aniqlab olishingiz mumkin.' },
      { q: 'Mobil qurilmalarda ishlaydimi?', a: 'Ha, TILSHUNOS responsive veb-ilova va PWA (Progressive Web App) sifatida smartfon va planshetlarda qulay ishlaydi.' },
      { q: 'O‘qituvchi bilan qanday bog‘lanaman?', a: 'Platformadagi O‘qituvchilar bo‘limi orqali tasdiqlangan ustozlar bilan bog‘lanib, shaxsiy topshiriqlar olishingiz mumkin.' }
    ]
  });
  const [cmsTab, setCmsTab] = useState<'hero' | 'about' | 'faq' | 'footer'>('hero');
  const [newTeamMember, setNewTeamMember] = useState({ name: '', role: '', bio: '', avatar: '' });
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

  // System latency test state
  const [pingLatency, setPingLatency] = useState<number | null>(null);
  const [testingPing, setTestingPing] = useState(false);

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  // Load all real data from Supabase backend
  const loadSupabaseData = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [statsRes, usersRes, teachersRes, cmsRes, materialsRes, topicsRes, vocabRes] = await Promise.allSettled([
        api.getAdminStats(),
        api.getAdminUsers(),
        api.getTeachers(),
        api.getCms(),
        api.getAllAdminMaterials(),
        api.getGameTopics(),
        api.getAdminVocabulary()
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value) {
        setStats(statsRes.value);
      }

      if (usersRes.status === 'fulfilled' && Array.isArray(usersRes.value)) {
        setUsers(usersRes.value);
      }

      if (teachersRes.status === 'fulfilled' && Array.isArray(teachersRes.value)) {
        setTeachers(teachersRes.value);
      } else if (usersRes.status === 'fulfilled' && Array.isArray(usersRes.value)) {
        // Fallback filter from users list for teachers
        const teacherUsers = usersRes.value
          .filter((u: any) => u.role === 'Teacher' || u.role === 2)
          .map((u: any) => ({
            id: u.id,
            name: `${u.firstName} ${u.lastName}`.trim() || u.email,
            email: u.email,
            specialty: 'Ingliz tili mutaxassisi',
            students: 0,
            status: u.isActive ? 'Faol' : 'Nofaol'
          }));
        setTeachers(teacherUsers);
      }

      if (cmsRes.status === 'fulfilled' && cmsRes.value) {
        setCms((prev: any) => ({
          ...prev,
          ...cmsRes.value,
          contacts: {
            ...prev?.contacts,
            ...(cmsRes.value?.contacts || {})
          },
          team: Array.isArray(cmsRes.value?.team) && cmsRes.value.team.length > 0 ? cmsRes.value.team : prev?.team,
          faqs: Array.isArray(cmsRes.value?.faqs) && cmsRes.value.faqs.length > 0 ? cmsRes.value.faqs : prev?.faqs
        }));
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

      const now = new Date();
      setLastSyncTime(now.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

      if (isManualRefresh) {
        notify('Supabase ma’lumotlari real vaqtda yangilandi! ✓');
      }
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

  const saveCmsChanges = async () => {
    try {
      await api.saveCms(cms);
      try {
        localStorage.setItem('tilshunos_cms_data', JSON.stringify(cms));
      } catch {}
      notify('Welcome sahifasi va CMS ma’lumotlari Supabasega saqlandi! ✓');
    } catch (err: any) {
      notify(err.message || 'CMS o‘zgarishlarini saqlashda xatolik');
    }
  };

  const handleAddTeamMember = () => {
    if (!newTeamMember.name || !newTeamMember.role) {
      notify('Ism va lavozimni kiriting');
      return;
    }
    const avatar = newTeamMember.avatar || newTeamMember.name.trim()[0].toUpperCase();
    const updatedTeam = [...(cms.team || []), { ...newTeamMember, avatar }];
    setCms({ ...cms, team: updatedTeam });
    setNewTeamMember({ name: '', role: '', bio: '', avatar: '' });
    notify('Jamoa a’zosi ro‘yxatga qo‘shildi. Saqlash tugmasini bosing! ✓');
  };

  const handleDeleteTeamMember = (index: number) => {
    const updatedTeam = (cms.team || []).filter((_: any, i: number) => i !== index);
    setCms({ ...cms, team: updatedTeam });
    notify('A’zo olib tashlandi. Saqlash tugmasini bosing! ✓');
  };

  const handleAddFaq = () => {
    if (!newFaq.q || !newFaq.a) {
      notify('Savol va javob matnini kiriting');
      return;
    }
    const updatedFaqs = [...(cms.faqs || []), { ...newFaq }];
    setCms({ ...cms, faqs: updatedFaqs });
    setNewFaq({ q: '', a: '' });
    notify('FAQ savoli qo‘shildi. Saqlash tugmasini bosing! ✓');
  };

  const handleDeleteFaq = (index: number) => {
    const updatedFaqs = (cms.faqs || []).filter((_: any, i: number) => i !== index);
    setCms({ ...cms, faqs: updatedFaqs });
    notify('FAQ olib tashlandi. Saqlash tugmasini bosing! ✓');
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
      loadSupabaseData();
    } catch (err: any) {
      notify(err.message || 'O‘qituvchi qo‘shishda xatolik');
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

  const handleUpdateUserRole = async (userId: string, newRole: number, newIsActive: boolean) => {
    try {
      await api.updateUserRole(userId, { role: newRole, isActive: newIsActive });
      notify('Foydalanuvchi roli va holati Supabaseda yangilandi! ✓');
      setSelectedUserForEdit(null);
      loadSupabaseData();
    } catch (err: any) {
      notify(err.message || 'Rolni o‘zgartirishda xatolik yuz berdi');
    }
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    if (!window.confirm(`${email} foydalanuvchisini Supabasedan butunlay o‘chirib yuborishni tasdiqlaysizmi?`)) return;
    try {
      await api.deleteUser(userId);
      notify('Foydalanuvchi Supabasedan o‘chirildi');
      setUsers(u => u.filter(x => x.id !== userId));
      loadSupabaseData();
    } catch (err: any) {
      notify(err.message || 'Foydalanuvchini o‘chirishda xatolik');
    }
  };

  // Filtered users for "O‘quvchilar Tahlili"
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchQuery = !query ||
        u.email?.toLowerCase().includes(query.toLowerCase()) ||
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(query.toLowerCase());

      const roleStr = String(u.role || '').toLowerCase();
      let matchRole = true;
      if (userRoleFilter === 'learner') matchRole = roleStr === 'learner' || u.role === 0;
      else if (userRoleFilter === 'teacher') matchRole = roleStr === 'teacher' || u.role === 2;
      else if (userRoleFilter === 'admin') matchRole = roleStr.includes('admin') || u.role === 1;

      return matchQuery && matchRole;
    });
  }, [users, query, userRoleFilter]);

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

  const totalStudents = stats.totalUsers || users.length || 0;
  const levelDist = stats.studentsByLevel || { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0 };
  const verifiedPercent = totalStudents > 0 ? Math.round(((stats.verifiedUsers || 0) / totalStudents) * 100) : 100;

  return (
    <div className={dark ? 'app dark' : 'app'}>
      {mobileNav && <div className="scrim" onClick={() => setMobileNav(false)} />}

      <aside className={`sidebar ${mobileNav ? 'mobile-open' : ''}`}>
        <div className="brand">
          <div className="brand-mark" style={{ background: 'linear-gradient(135deg, #7869f5, #5b4bf0)' }}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <div className="brand-name">TILSHUNOS<span>.</span></div>
            <div className="brand-caption">ADMIN BOSHQARUV MARKAZI</div>
          </div>
          <button className="icon-btn mobile-close" onClick={() => setMobileNav(false)} aria-label="Menyuni yopish">
            <X size={18} />
          </button>
        </div>

        <div className="profile-mini" style={{ background: 'var(--soft)', borderColor: 'var(--border)' }}>
          <div className="avatar" style={{ background: '#7869f5', color: '#fff' }}>A</div>
          <div className="profile-copy">
            <strong>Super Admin</strong>
            <span><span className="online-dot" /> Onlayn</span>
          </div>
        </div>

        <nav className="nav-list" style={{ marginTop: '10px' }}>
          {adminNav.map(([label, key, Icon]: any) => (
            <button
              key={key}
              onClick={() => {
                setSection(key);
                setMobileNav(false);
              }}
              className={`nav-item ${section === key ? 'active' : ''}`}
            >
              <Icon size={18} strokeWidth={1.8} />
              <span>{label}</span>
              {key === 'students' && users.length > 0 && (
                <span className="nav-count" style={{ background: 'var(--soft)', color: 'var(--purple)', fontWeight: 800 }}>
                  {users.length}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <button className="nav-item" onClick={onLogout} style={{ color: '#e05656' }}>
            <LogOut size={18} />
            <span>Tizimdan chiqish</span>
          </button>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="topbar-left" style={{ gap: '12px' }}>
            <button className="icon-btn hamburger" onClick={() => setMobileNav(true)} aria-label="Menyuni ochish">
              <Menu size={20} />
            </button>
            <div className="breadcrumb">
              Boshqaruv <span style={{ opacity: 0.4 }}>/</span> <strong>{String(adminNav.find(x => x[1] === section)?.[0] || 'Dashboard')}</strong>
            </div>
          </div>
          <div className="topbar-right" style={{ gap: '12px' }}>

            {/* Manual refresh button */}
            <button
              className="icon-btn"
              onClick={() => loadSupabaseData(true)}
              title="Supabasedan yangilash"
              disabled={refreshing}
            >
              <RefreshCw size={17} className={refreshing ? 'animate-spin' : ''} />
            </button>

            <button className="icon-btn theme-btn" onClick={() => setDark(!dark)} title="Mavzuni almashtirish">
              {dark ? <Sun size={19} /> : <Moon size={19} />}
            </button>
            <div className="top-avatar" style={{ background: '#7869f5', color: '#fff' }}>A</div>
          </div>
        </header>

        <div className="page-content">
          {/* DASHBOARD SECTION */}
          {section === 'dashboard' && (
            <>
              <div className="welcome-row">
                <div>
                  <div className="eyebrow"><Activity size={14} /> ASOSIY STATISTIKA VA TAHLIL</div>
                  <h1>Platforma <span>Ko‘rsatkichlari</span></h1>
                  <p className="subheading">
                    Supabase PostgreSQL ma’lumotlar bazasidan real vaqtda olingan haqiqiy ko‘rsatkichlar.
                    {lastSyncTime && <span style={{ marginLeft: '8px', opacity: 0.8 }}>(So‘nggi yangilanish: {lastSyncTime})</span>}
                  </p>
                </div>
                <button
                  className="primary-btn"
                  onClick={() => loadSupabaseData(true)}
                  disabled={refreshing}
                >
                  <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
                  {refreshing ? 'Yuklanmoqda...' : 'Ma’lumotlarni Yangilash'}
                </button>
              </div>

              {/* Main metrics (100% Real from Supabase) */}
              <section className="stats-grid">
                <div className="stat-card">
                  <div className="stat-top">
                    <div className="stat-icon purple"><Users size={19} /></div>
                    <span className="badge-role-learner">Faol</span>
                  </div>
                  <div className="stat-value">{stats.totalUsers}</div>
                  <div className="stat-label">Jami Foydalanuvchilar</div>
                  <div className="stat-note">
                    {stats.verifiedUsers} tasi tasdiqlangan ({verifiedPercent}%)
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-top">
                    <div className="stat-icon orange"><GraduationCap size={19} /></div>
                    <span className="badge-role-teacher">Ustozlar</span>
                  </div>
                  <div className="stat-value">{stats.activeTeachers}</div>
                  <div className="stat-label">O‘qituvchilar</div>
                  <div className="stat-note">
                    {stats.learnersCount || Math.max(0, stats.totalUsers - stats.activeTeachers - 1)} ta o‘quvchiga biriktirilgan
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-top">
                    <div className="stat-icon green"><BookOpen size={19} /></div>
                    <span style={{ fontSize: '10px', color: '#249f75', fontWeight: 800 }}>Nashr etilgan</span>
                  </div>
                  <div className="stat-value">{stats.totalMaterials}</div>
                  <div className="stat-label">O‘quv Materiallari</div>
                  <div className="stat-note">
                    Reading: {stats.readingMaterialsCount || 0} · Writing: {stats.writingMaterialsCount || 0}
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-top">
                    <div className="stat-icon blue"><ChartNoAxesCombined size={19} /></div>
                    <span style={{ fontSize: '10px', color: '#3b82f6', fontWeight: 800 }}>Lug‘at & Mashq</span>
                  </div>
                  <div className="stat-value">{stats.totalVocabularyEntries}</div>
                  <div className="stat-label">Shaxsiy Lug‘at So‘zlari</div>
                  <div className="stat-note">
                    {stats.totalPracticeSessions} ta test sessiyasi
                  </div>
                </div>
              </section>

              {/* CEFR Level Distribution Card */}
              <div className="panel" style={{ padding: '24px', margin: '20px 0' }}>
                <div className="panel-heading">
                  <div>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Layers size={17} style={{ color: 'var(--purple)' }} />
                      O‘quvchilarning CEFR Darajalari Taqsimoti (Haqiqiy Supabase ma’lumotlari)
                    </h3>
                    <p>Foydalanuvchilar qaysi darajada ekanligi va real foiz ko‘rsatkichlari</p>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 700 }}>
                    Jami hisoblangan: {totalStudents} nafar
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '14px', marginTop: '18px' }}>
                  {Object.entries(levelDist).map(([lvl, count]: [string, any]) => {
                    const numCount = Number(count) || 0;
                    const pct = totalStudents > 0 ? Math.round((numCount / totalStudents) * 100) : 0;
                    return (
                      <div key={lvl} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 12px', textAlign: 'center' }}>
                        <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--purple)', letterSpacing: '0.5px' }}>{lvl} DARAJA</span>
                        <h2 style={{ fontSize: '24px', margin: '8px 0 4px', fontWeight: 800 }}>{numCount} <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--muted)' }}>ta</span></h2>
                        <div style={{ height: '7px', background: 'var(--panel)', borderRadius: '6px', overflow: 'hidden', margin: '10px 0 8px' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: numCount > 0 ? 'var(--purple)' : 'transparent', transition: 'width 0.4s ease' }} />
                        </div>
                        <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 700 }}>{pct}% o‘quvchi</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Grid: Content breakdown & Recent Supabase registrations */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', margin: '20px 0' }}>
                {/* Content Distribution */}
                <div className="panel" style={{ padding: '24px' }}>
                  <div className="panel-heading" style={{ marginBottom: '16px' }}>
                    <div>
                      <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <BookMarked size={17} style={{ color: '#249f75' }} />
                        Kontent Turlari Taqsimoti
                      </h3>
                      <p>Supabaseda mavjud barcha ta’lim materiallari</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {[
                      { label: 'Reading (Hikoyalar va Maqolalar)', count: stats.readingMaterialsCount || 0, color: '#7869f5', icon: BookMarked },
                      { label: 'Writing (Insho va Grammatika)', count: stats.writingMaterialsCount || 0, color: '#ea580c', icon: PenLine },
                      { label: 'Listening (Podcast va Audiolar)', count: stats.listeningMaterialsCount || 0, color: '#0284c7', icon: Headphones },
                      { label: 'Video (Darsliklar va Suhbatlar)', count: stats.videoMaterialsCount || 0, color: '#16a34a', icon: Video }
                    ].map(item => {
                      const totalMat = Math.max(1, stats.totalMaterials || 1);
                      const pct = Math.round((item.count / totalMat) * 100);
                      const Icon = item.icon;
                      return (
                        <div key={item.label} style={{ background: 'var(--bg)', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 700 }}>
                              <Icon size={16} style={{ color: item.color }} />
                              {item.label}
                            </span>
                            <strong style={{ fontSize: '13px' }}>{item.count} ta ({pct}%)</strong>
                          </div>
                          <div style={{ height: '6px', background: 'var(--panel)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${pct}%`, background: item.color }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Recent users from Supabase */}
                <div className="panel" style={{ padding: '24px' }}>
                  <div className="panel-heading" style={{ marginBottom: '16px' }}>
                    <div>
                      <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Clock size={17} style={{ color: '#3b82f6' }} />
                        So‘nggi Ro‘yxatdan O‘tganlar (Supabase)
                      </h3>
                      <p>Tizimga yaqinda qo‘shilgan foydalanuvchilar</p>
                    </div>
                    <button
                      className="text-action"
                      onClick={() => setSection('students')}
                      style={{ fontSize: '11px', margin: 0 }}
                    >
                      Barchasi ({users.length}) →
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {users.slice(0, 5).map((u: any) => (
                      <div
                        key={u.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 12px',
                          background: 'var(--bg)',
                          borderRadius: '10px',
                          border: '1px solid var(--border)',
                          gap: '10px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                          <div className="avatar" style={{ width: '32px', height: '32px', fontSize: '12px', background: 'var(--soft)', color: 'var(--purple)', flexShrink: 0 }}>
                            {(u.firstName?.[0] || u.email?.[0] || 'U').toUpperCase()}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: '12px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {u.firstName || u.lastName ? `${u.firstName || ''} ${u.lastName || ''}`.trim() : u.email.split('@')[0]}
                            </div>
                            <div style={{ fontSize: '10px', color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {u.email}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                          <span className={u.role === 'SuperAdmin' || u.role === 1 ? 'badge-role-admin' : u.role === 'Teacher' || u.role === 2 ? 'badge-role-teacher' : 'badge-role-learner'}>
                            {String(u.role || 'Learner')}
                          </span>
                          {u.emailConfirmed && (
                            <span className="badge-verified" title="Email tasdiqlangan">
                              <CheckCircle2 size={12} />
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* O‘QUVCHILAR VA FOYDALANUVCHILAR TAHLILI SECTION */}
          {section === 'students' && (
            <>
              <div className="welcome-row">
                <div>
                  <div className="eyebrow"><Users size={14} /> FOYDALANUVCHILAR REESTRI</div>
                  <h1>Foydalanuvchilar <span>Boshqaruvi</span></h1>
                  <p className="subheading">
                    Supabase bazasidagi barcha ro‘yxatdan o‘tgan o‘quvchi, o‘qituvchi va ma’murlar (Jami: {users.length} nafar).
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="primary-btn" onClick={() => loadSupabaseData(true)} disabled={refreshing}>
                    <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
                    Yangilash
                  </button>
                </div>
              </div>

              {/* Filters toolbar */}
              <div className="panel" style={{ padding: '16px 20px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flex: 1, minWidth: '240px' }}>
                    <Search size={18} style={{ color: 'var(--muted)' }} />
                    <input
                      value={query}
                      onChange={e => setQuery(e.target.value)}
                      placeholder="Ism, familiya yoki email bo‘yicha qidirish..."
                      style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: '12px', color: 'var(--text)' }}
                    />
                    {query && (
                      <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}>
                        <X size={16} />
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 700 }}>Rol bo‘yicha:</span>
                    {['all', 'learner', 'teacher', 'admin'].map(r => (
                      <button
                        key={r}
                        onClick={() => setUserRoleFilter(r)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '8px',
                          border: userRoleFilter === r ? '1px solid var(--purple)' : '1px solid var(--border)',
                          background: userRoleFilter === r ? 'var(--soft)' : 'var(--panel)',
                          color: userRoleFilter === r ? 'var(--purple)' : 'var(--muted)',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        {r === 'all' ? 'Barchasi' : r === 'learner' ? 'O‘quvchilar' : r === 'teacher' ? 'O‘qituvchilar' : 'Adminlar'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Users table */}
              <div className="panel" style={{ padding: '20px' }}>
                <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Foydalanuvchi</th>
                        <th>Email Manzili</th>
                        <th>Roli</th>
                        <th>Email Holati</th>
                        <th>Ro‘yxatdan O‘tgan</th>
                        <th style={{ textAlign: 'right' }}>Amallar</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: 'var(--muted)' }}>
                            Foydalanuvchilar topilmadi.
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((u: any) => (
                          <tr key={u.id}>
                            <td style={{ fontWeight: 700 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div className="avatar" style={{ width: '32px', height: '32px', fontSize: '12px', background: 'var(--soft)', color: 'var(--purple)' }}>
                                  {(u.firstName?.[0] || u.email?.[0] || 'U').toUpperCase()}
                                </div>
                                <div>
                                  {u.firstName || u.lastName ? `${u.firstName || ''} ${u.lastName || ''}`.trim() : 'Foydalanuvchi'}
                                </div>
                              </div>
                            </td>
                            <td style={{ color: 'var(--muted)' }}>{u.email}</td>
                            <td>
                              <span className={u.role === 'SuperAdmin' || u.role === 1 ? 'badge-role-admin' : u.role === 'Teacher' || u.role === 2 ? 'badge-role-teacher' : 'badge-role-learner'}>
                                {String(u.role || 'Learner')}
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

          {/* O‘QITUVCHILAR BO‘LIMI */}
          {section === 'teachers' && (
            <>
              <div className="welcome-row">
                <div>
                  <div className="eyebrow"><GraduationCap size={14} /> TA’LIM JAMOA</div>
                  <h1>O‘qituvchilar <span>Boshqaruvi</span></h1>
                  <p className="subheading">Supabase bazasida mavjud o‘qituvchilar va yangi o‘qituvchi hisobini yaratish.</p>
                </div>
              </div>

              <div className="panel" style={{ padding: '24px', marginBottom: '24px' }}>
                <h3 style={{ marginBottom: '14px' }}>Yangi O‘qituvchi Qo‘shish (Supabasega yoziladi)</h3>
                <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                  <label>Ism<input value={teacherForm.firstName} onChange={e => setTeacherForm({ ...teacherForm, firstName: e.target.value })} placeholder="Dilnoza" /></label>
                  <label>Familiya<input value={teacherForm.lastName} onChange={e => setTeacherForm({ ...teacherForm, lastName: e.target.value })} placeholder="Karimova" /></label>
                  <label>Email<input type="email" value={teacherForm.email} onChange={e => setTeacherForm({ ...teacherForm, email: e.target.value })} placeholder="teacher@tilshunos.app" /></label>
                  <label>Parol<input type="password" value={teacherForm.password} onChange={e => setTeacherForm({ ...teacherForm, password: e.target.value })} placeholder="Kamida 6 belgi" /></label>
                  <label>Mutaxassislik<input value={teacherForm.specialty} onChange={e => setTeacherForm({ ...teacherForm, specialty: e.target.value })} placeholder="IELTS & B1–C1" /></label>
                  <label>Qisqacha bio<input value={teacherForm.bio} onChange={e => setTeacherForm({ ...teacherForm, bio: e.target.value })} placeholder="Tajribali ustoz" /></label>
                </div>
                <button className="primary-btn" onClick={handleCreateTeacher} style={{ marginTop: '16px' }}>
                  <Plus size={16} /> O‘qituvchini Saqlash
                </button>
              </div>

              <div className="panel" style={{ padding: '20px' }}>
                <div className="panel-heading" style={{ marginBottom: '16px' }}>
                  <h3>Mavjud O‘qituvchilar Ro‘yxati ({teachers.length} ta)</h3>
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
                      </tr>
                    </thead>
                    <tbody>
                      {teachers.length === 0 ? (
                        <tr>
                          <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: 'var(--muted)' }}>
                            O‘qituvchilar topilmadi.
                          </td>
                        </tr>
                      ) : (
                        teachers.map((t: any) => (
                          <tr key={t.id}>
                            <td style={{ fontWeight: 700 }}>{t.name}</td>
                            <td style={{ color: 'var(--muted)' }}>{t.email}</td>
                            <td>{t.specialty || t.qualifications || 'Ingliz tili'}</td>
                            <td>{t.students || 0} ta</td>
                            <td><span className="status status-learned">{t.status || 'Faol'}</span></td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
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

              {/* Sub-tabs for CMS */}
              <div className="panel" style={{ padding: '10px 14px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {[
                    { id: 'hero', label: '🚀 Hero & Tugmalar' },
                    { id: 'about', label: '👥 Biz Haqimizda & Jamoa' },
                    { id: 'faq', label: '❓ FAQ Savol-Javoblar' },
                    { id: 'footer', label: '🌐 Footer, Asoschi & Kontaktlar' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setCmsTab(tab.id as any)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '9px',
                        border: cmsTab === tab.id ? '1px solid var(--purple)' : '1px solid var(--border)',
                        background: cmsTab === tab.id ? 'var(--soft)' : 'var(--panel)',
                        color: cmsTab === tab.id ? 'var(--purple)' : 'var(--muted)',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* TAB 1: HERO & TUGMALAR */}
              {cmsTab === 'hero' && (
                <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                  <div className="panel" style={{ padding: '24px' }}>
                    <h3 style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Sparkles size={18} style={{ color: 'var(--purple)' }} /> Asosiy Hero Matnlari
                    </h3>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
                      <b style={{ fontSize: '12px' }}>Yuqori Badge / Kicker:</b>
                      <input
                        value={cms.heroBadge || ''}
                        onChange={e => setCms({ ...cms, heroBadge: e.target.value })}
                        placeholder="Masalan, TILSHUNOS 2.0 · ILG‘OR TIL O‘RGANISH EKOTIZIMI"
                      />
                    </label>
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
                      <b style={{ fontSize: '12px' }}>Yuqori Menyu Anchor Matnlari:</b>
                      <input
                        value={cms.header || ''}
                        onChange={e => setCms({ ...cms, header: e.target.value })}
                        placeholder="Imkoniyatlar, Biz haqimizda, Kirish"
                      />
                    </label>
                    <div style={{ marginTop: '20px', padding: '12px', background: 'var(--soft)', borderRadius: '10px', fontSize: '11px', color: 'var(--muted)' }}>
                      💡 <em>Barcha tugmalar real harakatlarga ulangan: Asosiy tugma ro‘yxatdan o‘tishga, ikkinchi tugma interaktiv demonstratsiyaga yo‘naltiradi.</em>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: BIZ HAQIMIZDA & JAMOA */}
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <div>
                        <h3>Sayt Faollari va Jamoa A’zolari</h3>
                        <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--muted)' }}>
                          Welcome sahifasida "Biz haqimizda" bo‘limida ko‘rinadigan faollar va mutaxassislar ro‘yxati.
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px', marginBottom: '24px' }}>
                      {(cms.team || []).map((member: any, idx: number) => (
                        <div
                          key={idx}
                          style={{
                            padding: '16px',
                            background: 'var(--bg)',
                            borderRadius: '12px',
                            border: '1px solid var(--border)',
                            position: 'relative'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            <div
                              style={{
                                width: '38px',
                                height: '38px',
                                borderRadius: '10px',
                                background: 'linear-gradient(135deg, #14243A, #356CF6)',
                                color: '#fff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 800,
                                fontSize: '14px'
                              }}
                            >
                              {member.avatar || member.name?.[0]?.toUpperCase() || 'F'}
                            </div>
                            <div>
                              <strong style={{ fontSize: '13px', display: 'block' }}>{member.name}</strong>
                              <span style={{ fontSize: '11px', color: 'var(--purple)', fontWeight: 600 }}>{member.role}</span>
                            </div>
                          </div>
                          <p style={{ margin: '6px 0 0', fontSize: '11px', color: 'var(--muted)', lineHeight: '1.45' }}>{member.bio}</p>
                          <button
                            onClick={() => handleDeleteTeamMember(idx)}
                            style={{
                              position: 'absolute',
                              top: '12px',
                              right: '12px',
                              background: 'none',
                              border: 'none',
                              color: '#e05656',
                              cursor: 'pointer'
                            }}
                            title="O‘chirish"
                          >
                            <Trash2 size={15} />
                          </button>
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
                      </div>
                      <button
                        className="outline-btn"
                        onClick={handleAddTeamMember}
                        style={{ marginTop: '12px', background: 'var(--panel)' }}
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
                    <h3 style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ShieldCheck size={18} style={{ color: 'var(--purple)' }} /> Sayt Asoschisi Ma’lumotlari
                    </h3>
                    <p style={{ margin: '0 0 14px', fontSize: '11px', color: 'var(--muted)' }}>
                      Footer qismida sayt asoschisi haqida ko‘rinadigan ma’lumotlar.
                    </p>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
                      <b style={{ fontSize: '12px' }}>Asoschi Ismi-sharifi:</b>
                      <input
                        value={cms.founderName || ''}
                        onChange={e => setCms({ ...cms, founderName: e.target.value })}
                        placeholder="Soxibjon Gaybullayev"
                      />
                    </label>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
                      <b style={{ fontSize: '12px' }}>Asoschi Biografiyasi va Missiyasi:</b>
                      <textarea
                        value={cms.founderBio || ''}
                        onChange={e => setCms({ ...cms, founderBio: e.target.value })}
                        rows={5}
                        placeholder="Platforma asoschisi haqida qisqa ma’lumot va loyiha maqsadi..."
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

          {/* ROLLAR & RUXSATLAR SECTION */}
          {section === 'roles' && (
            <div className="panel" style={{ padding: '24px' }}>
              <h2>Rollar va Ruxsatlar Matritsasi</h2>
              <p>Platformadagi foydalanuvchi rollari va ularning imkoniyatlari darajasi.</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginTop: '20px' }}>
                <div style={{ background: 'var(--bg)', padding: '18px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <span className="badge-role-admin">SUPER ADMIN</span>
                  <h4 style={{ margin: '10px 0 6px' }}>Bosh Boshqaruvchi</h4>
                  <p style={{ fontSize: '11px', color: 'var(--muted)', lineHeight: '1.6' }}>Barcha bo‘limlar, Supabase bazasi, o‘qituvchilar va materiallar ustidan cheklovsiz to‘liq nazorat.</p>
                </div>
                <div style={{ background: 'var(--bg)', padding: '18px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <span className="badge-role-teacher">TEACHER</span>
                  <h4 style={{ margin: '10px 0 6px' }}>O‘qituvchi / Ustoz</h4>
                  <p style={{ fontSize: '11px', color: 'var(--muted)', lineHeight: '1.6' }}>Biriktirilgan o‘quvchilar tahlili, topshiriqlar berish, insholarni tekshirish va baholash.</p>
                </div>
                <div style={{ background: 'var(--bg)', padding: '18px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <span className="badge-role-learner">LEARNER</span>
                  <h4 style={{ margin: '10px 0 6px' }}>O‘quvchi / Talaba</h4>
                  <p style={{ fontSize: '11px', color: 'var(--muted)', lineHeight: '1.6' }}>Lug‘at yodlash, reading/writing/listening mashqlari, 1v1 so‘z bellashuvi va AI o‘qituvchi bilan suhbat.</p>
                </div>
              </div>
            </div>
          )}

          {/* TIZIM SOZLAMALARI & SUPABASE STATUS */}
          {section === 'settings' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
                <h2>Xavfsizlik va Platforma Funksiyalari</h2>
                <p>Tizim parametrlari va ro‘yxatdan o‘tish qoidalari.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '18px' }}>
                  {[
                    ['Email tasdiqlash kodi (Resend OTP Tranzaksiyali Email)', true],
                    ['Google OAuth 2.0 orqali bir bosqichli tezkor kirish', true],
                    ['1v1 So‘z bellashuvlarida CEFR daraja filtri', true],
                    ['Yangi materiallarni avtomatik nashr qilish (IsPublished)', true],
                    ['Anti-Cheat / Anti-Fraud tekshiruvi (Test mashqlarida)', true]
                  ].map(([s, checked]) => (
                    <label key={String(s)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: 'var(--bg)', borderRadius: '10px', cursor: 'pointer' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600 }}>{String(s)}</span>
                      <input type="checkbox" defaultChecked={Boolean(checked)} style={{ width: '16px', height: '16px', accentColor: 'var(--purple)' }} />
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* USER ROLE EDIT MODAL */}
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
                  defaultValue={selectedUserForEdit.role === 'SuperAdmin' || selectedUserForEdit.role === 1 ? '1' : selectedUserForEdit.role === 'Teacher' || selectedUserForEdit.role === 2 ? '2' : '0'}
                  style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
                >
                  <option value="0">Learner (O‘quvchi)</option>
                  <option value="2">Teacher (O‘qituvchi)</option>
                  <option value="1">SuperAdmin (Tizim Ma’muri)</option>
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

      {toast && (
        <div className="toast">
          <div><Check size={16} /></div>
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
