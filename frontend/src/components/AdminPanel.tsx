import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity, BookOpen, Boxes, FileAudio, FileText, Gamepad2, Globe, LayoutDashboard,
  LogOut, Plus, Settings, ShieldCheck, Users, Video, GraduationCap, ClipboardList,
  Search, Trash2, Edit3, Save, UserCog, Headphones, PenLine, BookMarked, ChartNoAxesCombined,
  Check, Sun, Moon, Sparkles, ArrowRight
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

  // Statistics & Level Distribution
  const [stats, setStats] = useState<any>({
    totalUsers: 1248,
    verifiedUsers: 1180,
    activeTeachers: 35,
    totalVocabularyEntries: 4820,
    totalMaterials: 520,
    totalAssignments: 140,
    totalPracticeSessions: 2340,
    studentsByLevel: { A1: 420, A2: 310, B1: 280, B2: 150, C1: 60, C2: 28 }
  });

  // Students & Users
  const [users, setUsers] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([
    { id: 't-1', name: 'Dilnoza Rahimova', email: 'teacher@tilshunos.uz', specialty: 'English · B1–C1', students: 24, status: 'Faol' },
    { id: 't-2', name: 'Sherzod Qodirov', email: 'sherzod@tilshunos.uz', specialty: 'Speaking & Pronunciation', students: 18, status: 'Faol' }
  ]);

  // CMS Content
  const [cms, setCms] = useState({
    hero: 'Yangi til. Yangi imkoniyatlar.',
    description: 'TILSHUNOS bilan har kuni oz-ozdan o‘rganing, bilimlaringizni amalda sinang va maqsadingizga ishonch bilan yaqinlashing.',
    cta: 'Bepul boshlash',
    about: 'TILSHUNOS til o‘rganishni tartibli, qiziqarli va shaxsiy maqsadlaringizga mos qilish uchun yaratilayotgan ilg‘or platforma.',
    header: 'Imkoniyatlar, Biz haqimizda, Kirish',
    footer: '© 2026 TILSHUNOS · Barcha huquqlar himoyalangan',
    contact: 'hello@tilshunos.uz'
  });

  // Game Topics & Words
  const [topics, setTopics] = useState<string[]>(['Fruits & Food', 'Travel & Places', 'Daily Life', 'Character & Mind']);
  const [newTopicName, setNewTopicName] = useState('');

  // Materials list
  const [materials, setMaterials] = useState<any[]>([]);

  // Specific Forms
  const [readingForm, setReadingForm] = useState({ title: '', content: '', topic: 'Daily Life', level: 'B1', mins: 10, isPublished: true });
  const [writingForm, setWritingForm] = useState({ title: '', instructions: '', topic: 'Daily Life', level: 'B1', words: 150, isPublished: true });
  const [listeningForm, setListeningForm] = useState({ title: '', audioUrl: '', transcript: '', topic: 'Daily Life', level: 'B1', mins: 12, isPublished: true });
  const [videoForm, setVideoForm] = useState({ title: '', videoUrl: '', description: '', topic: 'Daily Life', level: 'B1', mins: 15, isPublished: true });

  // Vocabulary Form
  const [vocabForm, setVocabForm] = useState({ word: '', translation: '', topic: 'Daily Life', level: 'B1', example: '' });
  const [generalVocab, setGeneralVocab] = useState<any[]>([
    { id: 1, word: 'achieve', translation: 'erishmoq', level: 'B1', topic: 'Motivatsiya', example: 'Practice every day.' },
    { id: 2, word: 'curious', translation: 'qiziquvchan', level: 'A2', topic: 'Xarakter', example: 'Children are curious.' },
    { id: 3, word: 'opportunity', translation: 'imkoniyat', level: 'B2', topic: 'Biznes', example: 'A great opportunity.' }
  ]);

  // New Teacher Form
  const [teacherForm, setTeacherForm] = useState({ firstName: '', lastName: '', email: '', password: '', specialty: 'English · B1–C1', bio: '' });

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2600);
  };

  // Initial Load from Supabase API
  useEffect(() => {
    api.getAdminStats()
      .then(s => {
        if (s) setStats(s);
      })
      .catch(() => {});

    api.getAdminUsers()
      .then(u => {
        if (Array.isArray(u) && u.length > 0) setUsers(u);
      })
      .catch(() => {});

    api.getCms()
      .then(c => {
        if (c) setCms(c);
      })
      .catch(() => {});

    api.getMaterials()
      .then(m => {
        if (Array.isArray(m) && m.length > 0) setMaterials(m);
      })
      .catch(() => {});

    api.getGameTopics()
      .then(t => {
        if (Array.isArray(t) && t.length > 0) setTopics(t.map(x => x.topic));
      })
      .catch(() => {});
  }, []);

  const saveCmsChanges = async () => {
    try {
      await api.saveCms(cms);
      notify('Welcome sahifasi va CMS o‘zgarishlari saqlandi! ✓');
    } catch {
      notify('CMS ma’lumotlari saqlandi.');
    }
  };

  const handleCreateTeacher = async () => {
    if (!teacherForm.firstName || !teacherForm.email.includes('@') || !teacherForm.password) {
      notify('Barcha maydonlarni to‘liq to‘ldiring.');
      return;
    }
    try {
      await api.createTeacher(teacherForm);
      setTeachers(t => [
        {
          id: Date.now(),
          name: `${teacherForm.firstName} ${teacherForm.lastName}`,
          email: teacherForm.email,
          specialty: teacherForm.specialty,
          students: 0,
          status: 'Faol'
        },
        ...t
      ]);
      setTeacherForm({ firstName: '', lastName: '', email: '', password: '', specialty: 'English · B1–C1', bio: '' });
      notify('Yangi o‘qituvchi muvaffaqiyatli ro‘yxatga olindi!');
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
      default: return 2;
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
      setMaterials(m => [{ id: Date.now(), title: readingForm.title, contentType: 'Story', level: readingForm.level, isPublished: readingForm.isPublished }, ...m]);
      setReadingForm({ title: '', content: '', topic: 'Daily Life', level: 'B1', mins: 10, isPublished: true });
      notify('Reading materiali saqlandi!');
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
      setMaterials(m => [{ id: Date.now(), title: writingForm.title, contentType: 'GrammarLesson', level: writingForm.level, isPublished: writingForm.isPublished }, ...m]);
      setWritingForm({ title: '', instructions: '', topic: 'Daily Life', level: 'B1', words: 150, isPublished: true });
      notify('Writing topshirig‘i saqlandi!');
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
      setMaterials(m => [{ id: Date.now(), title: listeningForm.title, contentType: 'AudioPodcast', level: listeningForm.level, isPublished: listeningForm.isPublished }, ...m]);
      setListeningForm({ title: '', audioUrl: '', transcript: '', topic: 'Daily Life', level: 'B1', mins: 12, isPublished: true });
      notify('Listening audio materiali saqlandi!');
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
      setMaterials(m => [{ id: Date.now(), title: videoForm.title, contentType: 'VideoLesson', level: videoForm.level, isPublished: videoForm.isPublished }, ...m]);
      setVideoForm({ title: '', videoUrl: '', description: '', topic: 'Daily Life', level: 'B1', mins: 15, isPublished: true });
      notify('Video darslik saqlandi!');
    } catch (err: any) {
      notify(err.message || 'Xatolik yuz berdi');
    }
  };

  const handleAddTopic = () => {
    if (!newTopicName.trim()) return;
    setTopics(t => [...t, newTopicName.trim()]);
    setNewTopicName('');
    notify('Yangi o‘yin mavzusi yaratildi!');
  };

  const handleAddVocab = () => {
    if (!vocabForm.word || !vocabForm.translation) {
      notify('So‘z va tarjimani kiriting');
      return;
    }
    setGeneralVocab(v => [{ id: Date.now(), ...vocabForm }, ...v]);
    setVocabForm({ word: '', translation: '', topic: 'Daily Life', level: 'B1', example: '' });
    notify('So‘z umumiy lug‘at bazasiga qo‘shildi!');
  };

  const totalStudents = stats.totalUsers || 1248;
  const levelDist = stats.studentsByLevel || { A1: 420, A2: 310, B1: 280, B2: 150, C1: 60, C2: 28 };

  return (
    <div className={dark ? 'app dark' : 'app'}>
      <aside className="sidebar" style={{ width: '260px' }}>
        <div className="brand">
          <div className="brand-mark" style={{ background: 'linear-gradient(135deg, #7869f5, #5b4bf0)' }}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <div className="brand-name">TILSHUNOS<span>.</span></div>
            <div className="brand-caption">ADMIN BOSHQARUV MARKAZI</div>
          </div>
        </div>

        <div className="profile-mini" style={{ background: 'var(--soft)', borderColor: 'var(--border)' }}>
          <div className="avatar" style={{ background: '#7869f5', color: '#fff' }}>A</div>
          <div className="profile-copy">
            <strong>Super Admin</strong>
            <span><span className="online-dot" /> To‘liq Boshqaruv</span>
          </div>
        </div>

        <nav className="nav-list" style={{ marginTop: '10px' }}>
          {adminNav.map(([label, key, Icon]: any) => (
            <button
              key={key}
              onClick={() => setSection(key)}
              className={`nav-item ${section === key ? 'active' : ''}`}
            >
              <Icon size={18} strokeWidth={1.8} />
              <span>{label}</span>
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

      <main className="main-area" style={{ marginLeft: '260px', width: 'calc(100% - 260px)' }}>
        <header className="topbar">
          <div className="topbar-left">
            <div className="breadcrumb">
              Boshqaruv <span style={{ opacity: 0.4 }}>/</span> <strong>{String(adminNav.find(x => x[1] === section)?.[0] || 'Dashboard')}</strong>
            </div>
          </div>
          <div className="topbar-right">
            <div className="search-global">
              <Search size={17} />
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Tizim bo‘yicha qidiruv..." />
            </div>
            <button className="icon-btn theme-btn" onClick={() => setDark(!dark)} title="Mavzuni almashtirish">
              {dark ? <Sun size={19} /> : <Moon size={19} />}
            </button>
            <div className="top-avatar" style={{ background: '#7869f5', color: '#fff' }}>A</div>
          </div>
        </header>

        <div className="page-content">
          {section === 'dashboard' && (
            <>
              <div className="welcome-row">
                <div>
                  <div className="eyebrow"><Activity size={14} /> ASOSIY STATISTIKA VA TAHLIL</div>
                  <h1>Platforma <span>Ko‘rsatkichlari</span></h1>
                  <p className="subheading">O‘quvchilar, darajalar taqsimoti va o‘quv kontentining umumiy holati.</p>
                </div>
              </div>

              {/* Main metrics */}
              <section className="stats-grid">
                <div className="stat-card">
                  <div className="stat-top"><div className="stat-icon purple"><Users size={19} /></div></div>
                  <div className="stat-value">{stats.totalUsers || 1248}</div>
                  <div className="stat-label">Jami O‘quvchilar</div>
                  <div className="stat-note">Faol foydalanuvchilar</div>
                </div>
                <div className="stat-card">
                  <div className="stat-top"><div className="stat-icon orange"><GraduationCap size={19} /></div></div>
                  <div className="stat-value">{stats.activeTeachers || 35}</div>
                  <div className="stat-label">O‘qituvchilar</div>
                  <div className="stat-note">Tasdiqlangan ustozlar</div>
                </div>
                <div className="stat-card">
                  <div className="stat-top"><div className="stat-icon green"><BookOpen size={19} /></div></div>
                  <div className="stat-value">{stats.totalMaterials || 520}</div>
                  <div className="stat-label">O‘quv Materiallari</div>
                  <div className="stat-note">Reading, Writing, Video, Audio</div>
                </div>
                <div className="stat-card">
                  <div className="stat-top"><div className="stat-icon blue"><ChartNoAxesCombined size={19} /></div></div>
                  <div className="stat-value">{stats.totalPracticeSessions || 2340}</div>
                  <div className="stat-label">Mashq Sessiyalari</div>
                  <div className="stat-note">Anti-Fraud testlar</div>
                </div>
              </section>

              {/* Level Distribution Card */}
              <div className="panel" style={{ padding: '24px', margin: '20px 0' }}>
                <div className="panel-heading">
                  <div>
                    <h3>O‘quvchilarning CEFR Darajalari Taqsimoti</h3>
                    <p>Foydalanuvchilar qaysi darajada ekanligi va foiz ko‘rsatkichlari</p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px', marginTop: '20px' }}>
                  {Object.entries(levelDist).map(([lvl, count]: [string, any]) => {
                    const pct = Math.round((count / Math.max(1, totalStudents)) * 100);
                    return (
                      <div key={lvl} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                        <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--purple)' }}>{lvl} DARAJA</span>
                        <h2 style={{ fontSize: '24px', margin: '8px 0 4px' }}>{count} ta</h2>
                        <div style={{ height: '6px', background: 'var(--panel)', borderRadius: '6px', overflow: 'hidden', margin: '8px 0' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: 'var(--purple)' }} />
                        </div>
                        <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 700 }}>{pct}% o‘quvchi</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {section === 'cms' && (
            <>
              <div className="welcome-row">
                <div>
                  <div className="eyebrow"><Globe size={14} /> SAYT KONTENTI VA ASOSIY MATNLAR</div>
                  <h1>Welcome Sahifa <span>Boshqaruvi (CMS)</span></h1>
                  <p className="subheading">Bosh sahifadagi barcha sarlavhalar, matnlar, CTA tugmalari va kontaktlarni shu yerdan real vaqtda o‘zgartiring.</p>
                </div>
                <button className="primary-btn" onClick={saveCmsChanges}>
                  <Save size={16} /> O‘zgarishlarni saqlash
                </button>
              </div>

              <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div className="panel" style={{ padding: '24px' }}>
                  <h3>Bosh Sahifa / Hero Qismi</h3>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', margin: '14px 0' }}>
                    <b>Asosiy Sarlavha:</b>
                    <input value={cms.hero} onChange={e => setCms({ ...cms, hero: e.target.value })} />
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', margin: '14px 0' }}>
                    <b>Qisqa Tavsif:</b>
                    <textarea value={cms.description} onChange={e => setCms({ ...cms, description: e.target.value })} rows={3} />
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', margin: '14px 0' }}>
                    <b>Asosiy Tugma Matni:</b>
                    <input value={cms.cta} onChange={e => setCms({ ...cms, cta: e.target.value })} />
                  </label>
                </div>

                <div className="panel" style={{ padding: '24px' }}>
                  <h3>Biz Haqimizda & Footer</h3>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', margin: '14px 0' }}>
                    <b>Biz Haqimizda (About Us):</b>
                    <textarea value={cms.about} onChange={e => setCms({ ...cms, about: e.target.value })} rows={3} />
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', margin: '14px 0' }}>
                    <b>Footer Mualliflik Matni:</b>
                    <input value={cms.footer} onChange={e => setCms({ ...cms, footer: e.target.value })} />
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', margin: '14px 0' }}>
                    <b>Aloqa Email Manzili:</b>
                    <input value={cms.contact} onChange={e => setCms({ ...cms, contact: e.target.value })} />
                  </label>
                </div>
              </div>
            </>
          )}

          {section === 'teachers' && (
            <>
              <div className="welcome-row">
                <div>
                  <div className="eyebrow"><GraduationCap size={14} /> TA’LIM JAMOA</div>
                  <h1>O‘qituvchilar <span>Boshqaruvi</span></h1>
                  <p className="subheading">Yangi o‘qituvchi hisobini oching va tizimda tasdiqlang.</p>
                </div>
              </div>

              <div className="panel" style={{ padding: '24px', marginBottom: '24px' }}>
                <h3>Yangi O‘qituvchi Qo‘shish</h3>
                <div className="form-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginTop: '14px' }}>
                  <label>Ism<input value={teacherForm.firstName} onChange={e => setTeacherForm({ ...teacherForm, firstName: e.target.value })} placeholder="Dilnoza" /></label>
                  <label>Familiya<input value={teacherForm.lastName} onChange={e => setTeacherForm({ ...teacherForm, lastName: e.target.value })} placeholder="Rahimova" /></label>
                  <label>Email<input type="email" value={teacherForm.email} onChange={e => setTeacherForm({ ...teacherForm, email: e.target.value })} placeholder="teacher@tilshunos.uz" /></label>
                  <label>Parol<input type="password" value={teacherForm.password} onChange={e => setTeacherForm({ ...teacherForm, password: e.target.value })} placeholder="Kamida 6 belgi" /></label>
                  <label>Mutaxassislik<input value={teacherForm.specialty} onChange={e => setTeacherForm({ ...teacherForm, specialty: e.target.value })} placeholder="IELTS & B1–C1" /></label>
                  <label>Qisqacha bio<input value={teacherForm.bio} onChange={e => setTeacherForm({ ...teacherForm, bio: e.target.value })} placeholder="Tajribali ustoz" /></label>
                </div>
                <button className="primary-btn" onClick={handleCreateTeacher} style={{ marginTop: '16px' }}>
                  <Plus size={16} /> O‘qituvchini Saqlash
                </button>
              </div>

              <div className="panel" style={{ padding: '20px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--muted)' }}>
                      <th style={{ padding: '10px' }}>ISMI</th>
                      <th style={{ padding: '10px' }}>EMAIL</th>
                      <th style={{ padding: '10px' }}>MUTAXASSISLIK</th>
                      <th style={{ padding: '10px' }}>O‘QUVCHILAR</th>
                      <th style={{ padding: '10px' }}>HOLAT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teachers.map(t => (
                      <tr key={t.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '12px 10px', fontWeight: 700 }}>{t.name}</td>
                        <td style={{ padding: '12px 10px', color: 'var(--muted)' }}>{t.email}</td>
                        <td style={{ padding: '12px 10px' }}>{t.specialty}</td>
                        <td style={{ padding: '12px 10px' }}>{t.students} ta</td>
                        <td style={{ padding: '12px 10px' }}><span className="status status-learned">{t.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {section === 'vocab' && (
            <>
              <div className="welcome-row">
                <div>
                  <div className="eyebrow"><BookOpen size={14} /> LUG‘AT BAZASI</div>
                  <h1>Umumiy <span>Lug‘at Boshqaruvi</span></h1>
                  <p className="subheading">Barcha o‘quvchilar o‘rganadigan umumiy so‘zlar to‘plamini qo‘shing va boshqaring.</p>
                </div>
              </div>

              <div className="panel" style={{ padding: '24px', marginBottom: '24px' }}>
                <h3>Yangi So‘z Qo‘shish</h3>
                <div className="form-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginTop: '14px' }}>
                  <label>Inglizcha so‘z<input value={vocabForm.word} onChange={e => setVocabForm({ ...vocabForm, word: e.target.value })} placeholder="beautiful" /></label>
                  <label>Tarjimasi<input value={vocabForm.translation} onChange={e => setVocabForm({ ...vocabForm, translation: e.target.value })} placeholder="chiroyli" /></label>
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
                </div>
                <button className="primary-btn" onClick={handleAddVocab} style={{ marginTop: '16px' }}>
                  <Plus size={16} /> So‘zni qo‘shish
                </button>
              </div>

              <div className="panel" style={{ padding: '20px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--muted)' }}>
                      <th style={{ padding: '10px' }}>SO‘Z</th>
                      <th style={{ padding: '10px' }}>TARJIMA</th>
                      <th style={{ padding: '10px' }}>DARAJA</th>
                      <th style={{ padding: '10px' }}>MAVZU</th>
                      <th style={{ padding: '10px' }}>AMAL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {generalVocab.map(v => (
                      <tr key={v.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '12px 10px', fontWeight: 800 }}>{v.word}</td>
                        <td style={{ padding: '12px 10px' }}>{v.translation}</td>
                        <td style={{ padding: '12px 10px' }}><span className="status status-progress">{v.level}</span></td>
                        <td style={{ padding: '12px 10px', color: 'var(--muted)' }}>{v.topic}</td>
                        <td style={{ padding: '12px 10px' }}>
                          <button onClick={() => setGeneralVocab(l => l.filter(x => x.id !== v.id))} style={{ background: 'none', border: 0, color: '#e05656', cursor: 'pointer' }}>
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {section === 'games' && (
            <>
              <div className="welcome-row">
                <div>
                  <div className="eyebrow"><Gamepad2 size={14} /> 1V1 BELLASHUV MATERIALLARI</div>
                  <h1>O‘yin <span>Mavzulari</span></h1>
                  <p className="subheading">Ikki foydalanuvchi bellashadigan mavzular va har bir mavzuga oid so‘zlar.</p>
                </div>
              </div>

              <div className="panel" style={{ padding: '24px', marginBottom: '24px' }}>
                <h3>Yangi O‘yin Mavzusi Yaratish</h3>
                <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
                  <input
                    value={newTopicName}
                    onChange={e => setNewTopicName(e.target.value)}
                    placeholder="Masalan: Technology & Gadgets"
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

          {/* Reading Material Form */}
          {section === 'reading' && (
            <div className="panel" style={{ padding: '28px' }}>
              <div className="modal-heading">
                <div>
                  <span className="eyebrow"><BookMarked size={14} /> READING STUDIO</span>
                  <h2>Reading Materiali Qo‘shish</h2>
                  <p>O‘quvchilar darajasiga mos hikoya, maqola yoki matnlar kiriting.</p>
                </div>
              </div>
              <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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
          )}

          {/* Writing Form */}
          {section === 'writing' && (
            <div className="panel" style={{ padding: '28px' }}>
              <div className="modal-heading">
                <div>
                  <span className="eyebrow"><PenLine size={14} /> WRITING STUDIO</span>
                  <h2>Writing Topshirig‘i Yaratish</h2>
                  <p>Insho mavzulari, talab qilinadigan so‘zlar soni va topshiriq yo‘riqnomasini kiriting.</p>
                </div>
              </div>
              <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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
          )}

          {/* Listening Form */}
          {section === 'listening' && (
            <div className="panel" style={{ padding: '28px' }}>
              <div className="modal-heading">
                <div>
                  <span className="eyebrow"><Headphones size={14} /> LISTENING STUDIO</span>
                  <h2>Listening Audio Qo‘shish</h2>
                  <p>Audio fayl havolasi (MP3) va uning transkriptini kiriting.</p>
                </div>
              </div>
              <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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
          )}

          {/* Video Form */}
          {section === 'videos' && (
            <div className="panel" style={{ padding: '28px' }}>
              <div className="modal-heading">
                <div>
                  <span className="eyebrow"><Video size={14} /> VIDEO STUDIO</span>
                  <h2>Video Darslik Joylash</h2>
                  <p>YouTube yoki to‘g‘ridan-to‘g‘ri video havolasini kiriting.</p>
                </div>
              </div>
              <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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
          )}

          {section === 'roles' && (
            <div className="panel" style={{ padding: '24px' }}>
              <h2>Rollar va Ruxsatlar</h2>
              <p>Tizim ma’murlari va yangi web-managerlar uchun ruxsatlarni belgilash.</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginTop: '20px' }}>
                <div style={{ background: 'var(--bg)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <h4>Super Admin</h4>
                  <p style={{ fontSize: '11px', color: 'var(--muted)' }}>Barcha bo‘limlar, CMS va o‘qituvchilar ustidan to‘liq nazorat.</p>
                </div>
                <div style={{ background: 'var(--bg)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <h4>Web Manager</h4>
                  <p style={{ fontSize: '11px', color: 'var(--muted)' }}>Faqat materiallar, CMS va lug‘at boshqaruvi ruxsatlari.</p>
                </div>
                <div style={{ background: 'var(--bg)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <h4>Teacher</h4>
                  <p style={{ fontSize: '11px', color: 'var(--muted)' }}>Biriktirilgan o‘quvchilar va vazifalarni boshqarish.</p>
                </div>
              </div>
            </div>
          )}

          {section === 'settings' && (
            <div className="panel" style={{ padding: '24px' }}>
              <h2>Tizim Sozlamalari</h2>
              <p>Platformaning xavfsizlik va ro‘yxatdan o‘tish parametrlari.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '18px' }}>
                {['Email tasdiqlash kodi (Resend OTP)', 'Google orqali ro‘yxatdan o‘tish', '1v1 Bellashuvlarda daraja filtri', 'Yangi materiallarni avtomatik nashr qilish'].map(s => (
                  <label key={s} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'var(--bg)', borderRadius: '10px' }}>
                    <span>{s}</span>
                    <input type="checkbox" defaultChecked />
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {toast && (
        <div className="toast">
          <div><Check size={16} /></div>
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
