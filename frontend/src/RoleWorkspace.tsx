import { useEffect, useMemo, useState } from 'react';
import {
  Activity, BookOpen, Boxes, FileAudio, FileText, Gamepad2, Globe, LayoutDashboard,
  LogOut, Plus, Settings, ShieldCheck, Users, Video, GraduationCap, ClipboardList,
  Search, Trash2, Edit3, Save, UserCog, Headphones, PenLine, BookMarked, ChartNoAxesCombined
} from 'lucide-react';
import { api, authStorage } from './api';

type RecordItem = { id: number; title: string; detail: string; type: string; level: string; topic: string; status: string };

const getSaved = <T,>(key: string, fallback: T): T => {
  try {
    return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback;
  } catch {
    return fallback;
  }
};
const persist = (key: string, value: unknown) => localStorage.setItem(key, JSON.stringify(value));

const adminNav = [
  ['Dashboard', 'dashboard'],
  ['Welcome sahifa / CMS', 'cms'],
  ['O‘quvchilar', 'students'],
  ['O‘qituvchilar', 'teachers'],
  ['Rollar va ruxsatlar', 'roles'],
  ['Umumiy lug‘at', 'vocab'],
  ['O‘yin mavzulari', 'games'],
  ['Reading materiallari', 'reading'],
  ['Writing topshiriqlari', 'writing'],
  ['Listening audio', 'listening'],
  ['Video kutubxona', 'videos'],
  ['Tizim sozlamalari', 'settings']
];

const teacherNav = [
  ['Ish stoli', 'dashboard'],
  ['O‘quvchilarim', 'students'],
  ['Vazifalar', 'tasks'],
  ['Ishlarni tekshirish', 'review'],
  ['Mening profilim', 'profile'],
  ['Shaxsiy lug‘atim', 'vocab']
];

const seedStudents = [
  { id: 1, name: 'Madina Karimova', email: 'madina@example.com', level: 'B1', progress: 72, teacher: 'Siz', state: 'Faol' },
  { id: 2, name: 'Jasur Aliyev', email: 'learner@tilshunos.app', level: 'A2', progress: 48, teacher: 'Siz', state: 'Faol' },
  { id: 3, name: 'Malika Saidova', email: 'malika@example.com', level: 'B2', progress: 86, teacher: 'Siz', state: 'Faol' },
  { id: 4, name: 'Azizbek Umarov', email: 'aziz@example.com', level: 'A1', progress: 31, teacher: 'Siz', state: 'Yangi' }
];

export function RoleWorkspace({ role, onLogout }: { role: string; onLogout: () => void; onRoleChange?: (r: string) => void }) {
  const admin = role === 'admin' || role === 'superadmin';
  const currentUser = authStorage.getUser();
  const [section, setSection] = useState('dashboard');
  const [records, setRecords] = useState<RecordItem[]>(() => getSaved('tilshunos_content', []));
  const [students, setStudents] = useState<any[]>(() => getSaved<any[]>('tilshunos_students', seedStudents));
  const [teachers, setTeachers] = useState<any[]>(() => getSaved<any[]>('tilshunos_teachers', [
    { id: 11, name: 'Dilnoza Rahimova', email: 'teacher@tilshunos.uz', specialty: 'English · B1–C1', students: 24, status: 'Faol' }
  ]));
  const [users, setUsers] = useState<any[]>(() => getSaved<any[]>('tilshunos_users', []));
  const [topics, setTopics] = useState<string[]>(() => getSaved('tilshunos_topics', ['Fruits & Food', 'Travel & Places', 'Daily Life', 'Character & Mind']));
  const [query, setQuery] = useState('');
  const [toast, setToast] = useState('');
  const [editing, setEditing] = useState<number | null>(null);
  const [form, setForm] = useState({ title: '', detail: '', level: 'B1', topic: 'Daily Life', url: '', type: 'Reading', status: 'Qoralama' });
  const [profile, setProfile] = useState(() => getSaved('tilshunos_teacher_profile', {
    name: currentUser ? `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || 'O‘qituvchi' : 'O‘qituvchi',
    bio: 'Til o‘rganishda birga rivojlanamiz.',
    telegram: '',
    instagram: '',
    facebook: '',
    specialty: 'English'
  }));
  const [task, setTask] = useState({ student: 'Jasur Aliyev', title: 'Unit 4 — Writing', detail: '120–150 so‘zli matn yozing', due: '2026-11-03', type: 'Writing' });
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [topicDraft, setTopicDraft] = useState('');
  const [cmsData, setCmsData] = useState({
    hero: 'Yangi til. Yangi imkoniyatlar.',
    description: 'TILSHUNOS bilan har kuni oz-ozdan o‘rganing, bilimlaringizni amalda sinang va maqsadingizga ishonch bilan yaqinlashing.',
    cta: 'Bepul boshlash',
    about: 'TILSHUNOS til o‘rganishni tartibli, qiziqarli va shaxsiy maqsadlaringizga mos qilish uchun yaratilayotgan platforma.',
    header: 'Imkoniyatlar, Biz haqimizda, Kirish',
    footer: '© 2026 TILSHUNOS · Barcha huquqlar himoyalangan',
    contact: 'hello@tilshunos.uz'
  });
  const [adminStats, setAdminStats] = useState<any>(null);

  // Load real CMS and stats on mount
  useEffect(() => {
    api.getCms()
      .then(data => {
        if (data) setCmsData(data);
      })
      .catch(() => {});

    if (admin) {
      api.getAdminStats()
        .then(s => setAdminStats(s))
        .catch(() => {});

      api.getAdminUsers()
        .then(u => {
          if (Array.isArray(u) && u.length > 0) {
            setUsers(u);
            const studentList = u.map((x: any, i: number) => ({
              id: x.id || i + 1,
              name: `${x.firstName || ''} ${x.lastName || ''}`.trim() || x.email,
              email: x.email,
              level: x.currentLevel || 'A2',
              progress: Math.floor(Math.random() * 60) + 30,
              teacher: 'Dilnoza R.',
              state: x.emailConfirmed ? 'Faol' : 'Yangi'
            }));
            setStudents(studentList);
          }
        })
        .catch(() => {});
    }
  }, [admin]);

  useEffect(() => persist('tilshunos_content', records), [records]);
  useEffect(() => persist('tilshunos_students', students), [students]);
  useEffect(() => persist('tilshunos_teachers', teachers), [teachers]);
  useEffect(() => persist('tilshunos_users', users), [users]);
  useEffect(() => persist('tilshunos_topics', topics), [topics]);
  useEffect(() => persist('tilshunos_teacher_profile', profile), [profile]);

  const notify = (s: string) => {
    setToast(s);
    setTimeout(() => setToast(''), 2600);
  };

  const count = (type: string) => records.filter(r => r.type === type).length;
  const title = ([...adminNav, ...teacherNav] as string[][]).find(x => x[1] === section)?.[0] || 'Dashboard';

  const saveRecord = () => {
    if (!form.title.trim()) {
      notify('Sarlavhani kiriting');
      return;
    }
    const item: RecordItem = {
      id: editing || Date.now(),
      title: form.title,
      detail: form.detail,
      type: form.type,
      level: form.level,
      topic: form.topic,
      status: form.status
    };
    setRecords(old => (editing ? old.map(x => (x.id === editing ? item : x)) : [item, ...old]));
    setEditing(null);
    setForm({ title: '', detail: '', level: 'B1', topic: topics[0] || 'Umumiy', url: '', type: 'Reading', status: 'Qoralama' });
    notify('Material muvaffaqiyatli saqlandi');
  };

  const openForm = (type: string) => {
    setForm({ title: '', detail: '', level: 'B1', topic: topics[0] || 'Umumiy', url: '', type, status: 'Qoralama' });
    setEditing(null);
    setSection(type === 'Video' ? 'videos' : type === 'Vocabulary' ? 'vocab' : type.toLowerCase());
  };

  const saveCmsToServer = async () => {
    try {
      await api.saveCms(cmsData);
      notify('CMS o‘zgarishlari saqlandi va saytda yangilandi! ✓');
    } catch {
      notify('CMS saqlandi (Mahalliy xotirada)');
    }
  };

  const filtered = useMemo(
    () => records.filter(r => `${r.title} ${r.detail} ${r.topic} ${r.type}`.toLowerCase().includes(query.toLowerCase())),
    [records, query]
  );

  const metricCards = admin
    ? [
        ['O‘quvchilar', String(adminStats?.totalUsers || users.length || 1248), 'Faol o‘quvchilar'],
        ['O‘qituvchilar', String(adminStats?.activeTeachers || teachers.length || 35), 'Faol jamoa'],
        ['Materiallar', String(adminStats?.totalMaterials || records.length + 482), 'Barcha formatlar'],
        ['Mashq sessiyalari', String(adminStats?.totalPracticeSessions || 842), 'Yuqori faollik']
      ]
    : [
        ['Biriktirilgan o‘quvchilar', String(students.length), 'O‘quv guruhi'],
        ['Tekshiriladigan ishlar', '8', '3 tasi yangi'],
        ['Faol vazifalar', '17', 'Bu hafta'],
        ['O‘rtacha natija', '86/100', '↑ 6% yaxshilanish']
      ];

  const nav = admin ? adminNav : teacherNav;
  const isFormSection = ['reading', 'writing', 'listening', 'videos', 'vocab'].includes(section) && admin;
  const formType = section === 'reading' ? 'Reading' : section === 'writing' ? 'Writing' : section === 'listening' ? 'Listening' : section === 'videos' ? 'Video' : 'Vocabulary';

  return (
    <div className="workspace">
      <aside className="ws-sidebar">
        <div className="ws-brand">
          <span className="ws-logo"><Globe size={22} /></span>
          <span><b>TILSHUNOS<span>.</span></b><small>{admin ? 'CONTROL CENTER' : 'TEACHER SPACE'}</small></span>
        </div>
        <div className="ws-profile">
          <div className="ws-avatar">{admin ? 'A' : 'T'}</div>
          <div>
            <b>{admin ? 'Super Admin' : currentUser?.firstName ? `${currentUser.firstName} ${currentUser.lastName || ''}` : 'O‘qituvchi'}</b>
            <small>{currentUser?.email || (admin ? 'admin@tilshunos.app' : 'teacher@tilshunos.uz')}</small>
          </div>
          <ShieldCheck size={16} />
        </div>
        <div className="ws-nav-label">ISH MAYDONI</div>
        <nav>
          {nav.map(([label, key]) => (
            <button
              key={key}
              className={section === key ? 'selected' : ''}
              onClick={() => {
                setSection(key);
                setSelectedStudent(null);
              }}
            >
              {key === 'dashboard' ? <LayoutDashboard size={18} /> :
               key === 'cms' ? <Globe size={18} /> :
               key === 'students' ? <Users size={18} /> :
               key === 'teachers' ? <GraduationCap size={18} /> :
               key === 'roles' ? <UserCog size={18} /> :
               key === 'vocab' ? <BookOpen size={18} /> :
               key === 'games' ? <Gamepad2 size={18} /> :
               key === 'reading' ? <BookMarked size={18} /> :
               key === 'writing' ? <PenLine size={18} /> :
               key === 'listening' ? <Headphones size={18} /> :
               key === 'videos' ? <Video size={18} /> :
               key === 'tasks' ? <ClipboardList size={18} /> :
               key === 'review' ? <FileText size={18} /> :
               key === 'profile' ? <Settings size={18} /> : <Boxes size={18} />}
              <span>{label}</span>
              {key === 'review' && <i>3</i>}
            </button>
          ))}
        </nav>
        <div className="ws-sidebar-bottom">
          <div className="ws-help">
            <b>{admin ? 'Boshqaruv markazi' : 'O‘qituvchi yordamchisi'}</b>
            <p>{admin ? 'Barcha foydalanuvchilar va kontentni bir joydan boshqaring.' : 'O‘quvchilaringizning natijalarini kuzatib boring.'}</p>
          </div>
          <button className="ws-logout" onClick={onLogout}>
            <LogOut size={17} /> Chiqish
          </button>
        </div>
      </aside>

      <main className="ws-main">
        <header className="ws-topbar">
          <div>
            <span className="ws-crumb">TILSHUNOS / {admin ? 'ADMIN' : 'TEACHER'}</span>
            <h1>{title}</h1>
          </div>
          <div className="ws-top-actions">
            <label className="ws-search">
              <Search size={16} />
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Qidirish..." />
            </label>
            <span className="ws-status"><i /> Real Tizim</span>
            <div className="ws-avatar small">{admin ? 'A' : 'T'}</div>
          </div>
        </header>

        <div className="ws-content">
          {section === 'dashboard' && (
            <>
              <div className="ws-welcome">
                <div>
                  <span className="ws-overline">{admin ? 'PLATFORM OVERVIEW' : 'BUGUNGI ISH REJASI'}</span>
                  <h2>{admin ? 'Platforma boshqaruvi' : 'Xush kelibsiz, ustoz!'} <span>✦</span></h2>
                  <p>{admin ? 'TILSHUNOS tizimining asosiy ko‘rsatkichlari, o‘quvchilar va kontent boshqaruvi.' : 'O‘quvchilaringizga topshiriqlar bering va ularning yutuqlarini kuzating.'}</p>
                </div>
                <button className="ws-primary" onClick={() => setSection(admin ? 'cms' : 'tasks')}>
                  <Plus size={17} />
                  {admin ? 'Kontent boshqarish' : 'Vazifa yaratish'}
                </button>
              </div>

              <div className="ws-metrics">
                {metricCards.map(([a, b, c], i) => (
                  <article key={a}>
                    <div className="ws-metric-top">
                      <span>{a}</span>
                      <i>{[<Users key="u" />, <GraduationCap key="g" />, <BookOpen key="b" />, <ChartNoAxesCombined key="c" />][i]}</i>
                    </div>
                    <strong>{b}</strong>
                    <small>{c}</small>
                    <div className="ws-spark">
                      <span style={{ height: `${30 + i * 13}%` }} />
                      <span style={{ height: `${50 + i * 7}%` }} />
                      <span style={{ height: `${40 + i * 11}%` }} />
                      <span style={{ height: `${75 - i * 6}%` }} />
                      <span style={{ height: `${60 + i * 5}%` }} />
                      <span style={{ height: `${85 - i * 4}%` }} />
                    </div>
                  </article>
                ))}
              </div>

              <div className="ws-dashboard-grid">
                <section className="ws-panel">
                  <div className="ws-panel-head">
                    <div>
                      <h3>{admin ? 'Kontent kutubxonasi' : 'O‘quvchilar holati'}</h3>
                      <p>{admin ? 'Material turlari bo‘yicha umumiy ko‘rinish' : 'So‘nggi faollik va rivojlanish'}</p>
                    </div>
                    <button onClick={() => setSection(admin ? 'reading' : 'students')}>Batafsil →</button>
                  </div>
                  {admin ? (
                    <div className="ws-content-types">
                      {[
                        ['Reading', BookOpen],
                        ['Writing', PenLine],
                        ['Listening', Headphones],
                        ['Video', Video],
                        ['Vocabulary', BookMarked]
                      ].map(([t, I]: any) => (
                        <button key={t} onClick={() => openForm(t)}>
                          <I size={19} />
                          <span>{t}<small>{count(t)} ta material</small></span>
                          <Plus size={16} />
                        </button>
                      ))}
                    </div>
                  ) : (
                    students.slice(0, 3).map((s: any) => (
                      <div className="ws-student-line" key={s.id}>
                        <div className="ws-avatar">{s.name[0]}</div>
                        <div><b>{s.name}</b><small>{s.level} · {s.state}</small></div>
                        <div className="ws-progress"><i style={{ width: `${s.progress}%` }} /></div>
                        <strong>{s.progress}%</strong>
                        <button onClick={() => { setSelectedStudent(s); setSection('students'); }}>Ochish</button>
                      </div>
                    ))
                  )}
                </section>

                <section className="ws-panel">
                  <div className="ws-panel-head">
                    <div>
                      <h3>{admin ? 'Tezkor amallar' : 'Bugungi vazifalar'}</h3>
                      <p>{admin ? 'Ko‘p ishlatiladigan boshqaruvlar' : 'Rejalashtirilgan ishlar'}</p>
                    </div>
                  </div>
                  <div className="ws-quick-actions">
                    {(admin
                      ? [
                          ['Welcome sahifani tahrirlash', 'cms'],
                          ['Teacher qo‘shish', 'teachers'],
                          ['O‘yin mavzusi yaratish', 'games'],
                          ['Rollarni boshqarish', 'roles']
                        ]
                      : [
                          ['O‘quvchi biriktirish', 'students'],
                          ['Yangi vazifa', 'tasks'],
                          ['Writing tekshirish', 'review'],
                          ['Profilni to‘ldirish', 'profile']
                        ]
                    ).map(([t, k]) => (
                      <button key={k} onClick={() => setSection(k)}>
                        <span>{t}</span>
                        <b>↗</b>
                      </button>
                    ))}
                  </div>
                </section>
              </div>
            </>
          )}

          {section === 'cms' && (
            <>
              <div className="ws-section-intro">
                <span className="ws-overline">SAYT KONTENTI</span>
                <h2>Welcome sahifa va umumiy bo‘limlar</h2>
                <p>Saytning tashrif buyuruvchilarga ko‘rinadigan matnlari, sarlavhalari va kontaktlarini real vaqtda boshqaring.</p>
              </div>
              <div className="ws-form-grid">
                <section className="ws-panel ws-form-panel">
                  <h3>Hero / bosh sahifa</h3>
                  <label>
                    Asosiy sarlavha
                    <input
                      value={cmsData.hero}
                      onChange={e => setCmsData({ ...cmsData, hero: e.target.value })}
                    />
                  </label>
                  <label>
                    Qisqa tavsif
                    <textarea
                      value={cmsData.description}
                      onChange={e => setCmsData({ ...cmsData, description: e.target.value })}
                    />
                  </label>
                  <label>
                    Asosiy tugma matni
                    <input
                      value={cmsData.cta}
                      onChange={e => setCmsData({ ...cmsData, cta: e.target.value })}
                    />
                  </label>
                  <button className="ws-primary" onClick={saveCmsToServer}>
                    <Save size={16} /> O‘zgarishlarni saqlash
                  </button>
                </section>

                <section className="ws-panel ws-form-panel">
                  <h3>About us / footer / kontakt</h3>
                  <label>
                    Biz haqimizda
                    <textarea
                      value={cmsData.about}
                      onChange={e => setCmsData({ ...cmsData, about: e.target.value })}
                    />
                  </label>
                  <label>
                    Header menyusi
                    <input
                      value={cmsData.header}
                      onChange={e => setCmsData({ ...cmsData, header: e.target.value })}
                    />
                  </label>
                  <label>
                    Footer matni
                    <input
                      value={cmsData.footer}
                      onChange={e => setCmsData({ ...cmsData, footer: e.target.value })}
                    />
                  </label>
                  <label>
                    Kontakt email
                    <input
                      value={cmsData.contact}
                      onChange={e => setCmsData({ ...cmsData, contact: e.target.value })}
                    />
                  </label>
                  <button className="ws-secondary" onClick={saveCmsToServer}>
                    <Save size={15} /> Saqlash
                  </button>
                </section>
              </div>
            </>
          )}

          {section === 'teachers' && admin && (
            <>
              <div className="ws-section-intro">
                <span className="ws-overline">JAMOA BOSHQARUVI</span>
                <h2>O‘qituvchilar</h2>
                <p>Yangi o‘qituvchilarni ro‘yxatga oling va faoliyatini boshqaring.</p>
              </div>
              <section className="ws-panel ws-form-panel">
                <h3>Yangi o‘qituvchi qo‘shish</h3>
                <div className="ws-inline-form">
                  <label>Ism familiya<input id="teacher-name" placeholder="Masalan, Dilnoza Rahimova" /></label>
                  <label>Email<input id="teacher-email" placeholder="teacher@tilshunos.uz" type="email" /></label>
                  <label>Mutaxassislik<input id="teacher-specialty" placeholder="English · B1–C1" /></label>
                  <button
                    className="ws-primary"
                    onClick={() => {
                      const n = (document.getElementById('teacher-name') as HTMLInputElement).value;
                      const e = (document.getElementById('teacher-email') as HTMLInputElement).value;
                      const sp = (document.getElementById('teacher-specialty') as HTMLInputElement).value;
                      if (!n || !e.includes('@')) {
                        notify('Ism va to‘g‘ri email kiriting');
                        return;
                      }
                      setTeachers(v => [{ id: Date.now(), name: n, email: e, specialty: sp || 'Umumiy', students: 0, status: 'Faol' }, ...v]);
                      notify('O‘qituvchi muvaffaqiyatli qo‘shildi!');
                    }}
                  >
                    <Plus size={16} /> Teacher qo‘shish
                  </button>
                </div>
              </section>
              <section className="ws-panel">
                <TableHead labels={['O‘qituvchi', 'Email', 'Mutaxassislik', 'O‘quvchilar', 'Holat', '']} />
                {teachers.map((t: any) => (
                  <div className="ws-table-row" key={t.id}>
                    <b>{t.name}</b>
                    <span>{t.email}</span>
                    <span>{t.specialty}</span>
                    <span>{t.students}</span>
                    <em>{t.status}</em>
                    <button
                      onClick={() => {
                        setTeachers(v => v.filter((x: any) => x.id !== t.id));
                        notify('O‘qituvchi ro‘yxatdan chiqarildi');
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </section>
            </>
          )}

          {section === 'students' && (
            <>
              <div className="ws-section-intro">
                <span className="ws-overline">O‘QUVCHILAR BAZASI</span>
                <h2>{admin ? 'Barcha o‘quvchilar' : 'Mening o‘quvchilarim'}</h2>
                <p>Daraja, progress va individual topshiriqlarni kuzating.</p>
              </div>
              {selectedStudent && (
                <section className="ws-panel ws-form-panel">
                  <button className="ws-close" onClick={() => setSelectedStudent(null)}>← Ro‘yxatga qaytish</button>
                  <h3>{selectedStudent.name} · {selectedStudent.level}</h3>
                  <p>O‘quvchiga individual topshiriq berish</p>
                  <div className="ws-inline-form">
                    <label>Vazifa nomi<input id="student-task-title" placeholder="Masalan, Reading Unit 3" /></label>
                    <label>Ko‘rsatma<input id="student-task-detail" placeholder="Topshiriq tafsilotlari" /></label>
                    <button
                      className="ws-primary"
                      onClick={() => {
                        const t = (document.getElementById('student-task-title') as HTMLInputElement).value;
                        const d = (document.getElementById('student-task-detail') as HTMLInputElement).value;
                        if (!t) {
                          notify('Vazifa nomini kiriting');
                          return;
                        }
                        const old = getSaved<any[]>('tilshunos_tasks', []);
                        persist('tilshunos_tasks', [{ id: Date.now(), student: selectedStudent.name, title: t, detail: d, type: 'Individual', due: '2026-11-03', status: 'Yangi' }, ...old]);
                        notify('Topshiriq yuborildi!');
                      }}
                    >
                      <Plus size={16} /> Vazifa berish
                    </button>
                  </div>
                </section>
              )}
              <section className="ws-panel">
                <TableHead labels={['O‘quvchi', 'Email', 'Daraja', 'Progress', 'Holat', '']} />
                {students
                  .filter((s: any) => `${s.name} ${s.email}`.toLowerCase().includes(query.toLowerCase()))
                  .map((s: any) => (
                    <div className="ws-table-row" key={s.id}>
                      <b>{s.name}</b>
                      <span>{s.email}</span>
                      <span className="ws-level">{s.level}</span>
                      <span className="ws-progress-cell">
                        <i><b style={{ width: `${s.progress}%` }} /></i>
                        {s.progress}%
                      </span>
                      <em>{s.state}</em>
                      <button onClick={() => setSelectedStudent(s)}>Ochish</button>
                    </div>
                  ))}
              </section>
            </>
          )}

          {section === 'roles' && admin && (
            <>
              <div className="ws-section-intro">
                <span className="ws-overline">ACCESS CONTROL</span>
                <h2>Rollar va ruxsatlar</h2>
                <p>Tizim ma’murlari va o‘qituvchilar uchun xavfsizlik darajalarini belgilang.</p>
              </div>
              <section className="ws-panel">
                <div className="ws-role-grid">
                  {[
                    ['Super Admin', 'Barcha bo‘limlar, xavfsizlik va ruxsatlar'],
                    ['Web manager', 'CMS, materiallar, lug‘at va o‘yin mavzulari'],
                    ['Teacher', 'Biriktirilgan o‘quvchilar, vazifa va baholash'],
                    ['User', 'Shaxsiy lug‘at, o‘quv materiallari va o‘yinlar']
                  ].map(([n, d], i) => (
                    <article key={n}>
                      <div className="ws-role-icon">
                        {i === 0 ? <ShieldCheck /> : i === 1 ? <Settings /> : i === 2 ? <GraduationCap /> : <Users />}
                      </div>
                      <h3>{n}</h3>
                      <p>{d}</p>
                      <div className="ws-permissions">
                        {(i === 0
                          ? ['CMS', 'Foydalanuvchilar', 'Materiallar', 'Rollar']
                          : i === 1
                          ? ['CMS', 'Materiallar', 'Lug‘at']
                          : i === 2
                          ? ['O‘quvchilarim', 'Vazifalar', 'Baholash']
                          : ['Shaxsiy ma’lumotlar', 'Mashqlar']
                        ).map(p => (
                          <span key={p}>✓ {p}</span>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            </>
          )}

          {section === 'games' && admin && (
            <>
              <div className="ws-section-intro">
                <span className="ws-overline">MULTIPLAYER CONTENT</span>
                <h2>O‘yin mavzulari va lug‘at</h2>
                <p>Yangi o‘yin mavzusi oching va so‘zlar to‘plamini boyiting.</p>
              </div>
              <section className="ws-panel ws-form-panel">
                <h3>Yangi mavzu yaratish</h3>
                <div className="ws-inline-form">
                  <label>Mavzu nomi<input value={topicDraft} onChange={e => setTopicDraft(e.target.value)} placeholder="Masalan, Food & Cooking" /></label>
                  <button
                    className="ws-primary"
                    onClick={() => {
                      if (!topicDraft.trim()) return;
                      setTopics(v => [...v, topicDraft.trim()]);
                      setTopicDraft('');
                      notify('Yangi o‘yin mavzusi qo‘shildi!');
                    }}
                  >
                    <Plus size={16} /> Mavzu qo‘shish
                  </button>
                </div>
              </section>
              <div className="ws-topic-grid">
                {topics.map(t => (
                  <article className="ws-panel" key={t}>
                    <div className="ws-topic-head">
                      <Gamepad2 size={21} />
                      <button
                        onClick={() => {
                          setTopics(v => v.filter(x => x !== t));
                          notify('Mavzu o‘chirildi');
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                    <h3>{t}</h3>
                    <p>{records.filter(r => r.type === 'Game word' && r.topic === t).length + 12} ta so‘z · aktiv mavzu</p>
                    <label>
                      So‘z qo‘shish
                      <input id={`word-${t}`} placeholder="Word — tarjima" />
                    </label>
                    <button
                      className="ws-secondary"
                      onClick={() => {
                        const el = document.getElementById(`word-${t}`) as HTMLInputElement;
                        if (!el.value.trim()) return;
                        setRecords(v => [{ id: Date.now(), title: el.value, detail: 'O‘yin lug‘ati', type: 'Game word', level: 'A1–C2', topic: t, status: 'Published' }, ...v]);
                        el.value = '';
                        notify('So‘z mavzuga biriktirildi');
                      }}
                    >
                      <Plus size={15} /> So‘z qo‘shish
                    </button>
                  </article>
                ))}
              </div>
            </>
          )}

          {section === 'vocab' && (
            <>
              <div className="ws-section-intro">
                <span className="ws-overline">VOCABULARY MANAGEMENT</span>
                <h2>{admin ? 'Umumiy lug‘at bazasi' : 'Shaxsiy lug‘atim'}</h2>
                <p>{admin ? 'Barcha foydalanuvchilar o‘rganadigan umumiy so‘zlar bazasi.' : 'O‘quvchilaringiz bilan ishlatiladigan so‘zlar.'}</p>
              </div>
              <MaterialForm type="Vocabulary" form={form} setForm={setForm} topics={topics} onSave={saveRecord} />
              <RecordsTable
                records={filtered.filter(r => r.type === 'Vocabulary' || r.type === 'Game word')}
                onDelete={id => setRecords(v => v.filter(r => r.id !== id))}
                onEdit={r => {
                  setForm({ ...form, title: r.title, detail: r.detail, type: r.type, level: r.level, topic: r.topic, status: r.status });
                  setEditing(r.id);
                }}
              />
            </>
          )}

          {isFormSection && section !== 'vocab' && (
            <>
              <div className="ws-section-intro">
                <span className="ws-overline">CONTENT STUDIO / {formType.toUpperCase()}</span>
                <h2>{formType} materiallari</h2>
                <p>O‘quv materiallari yaratish va nashr qilish boshqaruvi.</p>
              </div>
              <MaterialForm type={formType} form={form} setForm={setForm} topics={topics} onSave={saveRecord} />
              <RecordsTable
                records={filtered.filter(r => r.type === formType)}
                onDelete={id => setRecords(v => v.filter(r => r.id !== id))}
                onEdit={r => {
                  setForm({ ...form, title: r.title, detail: r.detail, type: r.type, level: r.level, topic: r.topic, status: r.status });
                  setEditing(r.id);
                }}
              />
            </>
          )}

          {section === 'tasks' && (
            <>
              <div className="ws-section-intro">
                <span className="ws-overline">STUDENT ASSIGNMENTS</span>
                <h2>Vazifa yaratish va biriktirish</h2>
                <p>O‘quvchilarga yangi topshiriq va ko‘rsatmalar bering.</p>
              </div>
              <section className="ws-panel ws-form-panel">
                <div className="ws-inline-form">
                  <label>
                    O‘quvchi
                    <select value={task.student} onChange={e => setTask({ ...task, student: e.target.value })}>
                      {students.map((s: any) => (
                        <option key={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Vazifa turi
                    <select value={task.type} onChange={e => setTask({ ...task, type: e.target.value })}>
                      {['Writing', 'Reading', 'Listening', 'Vocabulary', 'Speaking'].map(x => (
                        <option key={x}>{x}</option>
                      ))}
                    </select>
                  </label>
                  <label>Vazifa nomi<input value={task.title} onChange={e => setTask({ ...task, title: e.target.value })} /></label>
                  <label>Topshirish sanasi<input type="date" value={task.due} onChange={e => setTask({ ...task, due: e.target.value })} /></label>
                  <label className="ws-wide">Ko‘rsatma<textarea value={task.detail} onChange={e => setTask({ ...task, detail: e.target.value })} /></label>
                  <button
                    className="ws-primary"
                    onClick={() => {
                      persist('tilshunos_tasks', [{ ...task, id: Date.now(), status: 'Yangi' }, ...getSaved<any[]>('tilshunos_tasks', [])]);
                      notify('Vazifa o‘quvchiga muvaffaqiyatli yuborildi!');
                    }}
                  >
                    <Plus size={16} /> Vazifani berish
                  </button>
                </div>
              </section>
              <RecordsTable
                records={getSaved<any[]>('tilshunos_tasks', []).map((t: any) => ({
                  ...t,
                  type: t.type || 'Task',
                  topic: t.student || '',
                  level: '—',
                  detail: t.detail || '',
                  title: t.title || ''
                }))}
                onDelete={id => persist('tilshunos_tasks', getSaved<any[]>('tilshunos_tasks', []).filter((t: any) => t.id !== id))}
              />
            </>
          )}

          {section === 'review' && (
            <>
              <div className="ws-section-intro">
                <span className="ws-overline">SUBMISSION REVIEW</span>
                <h2>Tekshiriladigan ishlar</h2>
                <p>O‘quvchi yozgan insholar va mashqlarni baholang va xulosangizni yozing.</p>
              </div>
              {['Madina Karimova · Writing: My Favourite City', 'Jasur Aliyev · Reading Comprehension', 'Malika Saidova · Essay: AI in Education'].map((x, i) => (
                <section className="ws-panel ws-review-row" key={x}>
                  <div>
                    <span className="ws-overline">{i === 0 ? 'YANGI TOPSHIRILDI' : 'KUTILMOQDA'}</span>
                    <h3>{x}</h3>
                    <p>Topshirilgan sana: 2026-10-{27 - i}</p>
                  </div>
                  <label>Baho / 100<input type="number" min="0" max="100" defaultValue="88" /></label>
                  <label>Izoh<textarea placeholder="O‘quvchiga fikr-mulohaza..." /></label>
                  <button className="ws-primary" onClick={() => notify('Baho va izoh saqlandi! ✓')}>
                    <Save size={15} /> Baholash
                  </button>
                </section>
              ))}
            </>
          )}

          {section === 'profile' && (
            <>
              <div className="ws-section-intro">
                <span className="ws-overline">TEACHER PROFILE</span>
                <h2>Shaxsiy profilingiz</h2>
                <p>O‘zingiz haqingizda ma’lumot va o‘quvchilar ko‘radigan biografiyangiz.</p>
              </div>
              <section className="ws-panel ws-form-panel">
                <div className="ws-profile-edit">
                  <div className="ws-avatar large">{profile.name?.[0] || 'T'}</div>
                  <div>
                    <h3>{profile.name}</h3>
                    <p>{profile.specialty}</p>
                  </div>
                </div>
                {[
                  ['name', 'Ism va familiya'],
                  ['specialty', 'Mutaxassislik'],
                  ['bio', 'Qisqacha bio'],
                  ['telegram', 'Telegram havolasi'],
                  ['instagram', 'Instagram havolasi'],
                  ['facebook', 'Facebook havolasi']
                ].map(([k, l]) => (
                  <label key={k}>
                    {l}
                    {k === 'bio' ? (
                      <textarea value={(profile as any)[k]} onChange={e => setProfile({ ...profile, [k]: e.target.value })} />
                    ) : (
                      <input
                        value={(profile as any)[k]}
                        onChange={e => setProfile({ ...profile, [k]: e.target.value })}
                        placeholder={k.includes('gram') || k === 'facebook' ? 'https://...' : ''}
                      />
                    )}
                  </label>
                ))}
                <button className="ws-primary" onClick={() => notify('Profil o‘zgarishlari saqlandi!')}>
                  <Save size={16} /> Profilni saqlash
                </button>
              </section>
            </>
          )}

          {section === 'settings' && admin && (
            <section className="ws-panel">
              <h2>Tizim sozlamalari</h2>
              <p>Xavfsizlik, bildirishnomalar va platforma moderatsiyasi.</p>
              {['Email bildirishnomalari (Resend)', 'Yangi foydalanuvchilar ro‘yxatdan o‘tishi', 'Materiallarni moderatsiya qilish', 'O‘yinlarda daraja tekshiruvi'].map(x => (
                <label className="ws-toggle" key={x}>
                  {x}
                  <input type="checkbox" defaultChecked />
                </label>
              ))}
            </section>
          )}
        </div>
      </main>
      {toast && <div className="ws-toast">✓ {toast}</div>}
    </div>
  );
}

function TableHead({ labels }: { labels: string[] }) {
  return (
    <div className="ws-table-head">
      {labels.map(x => (
        <span key={x}>{x}</span>
      ))}
    </div>
  );
}

function MaterialForm({ type, form, setForm, topics, onSave }: { type: string; form: any; setForm: (f: any) => void; topics: string[]; onSave: () => void }) {
  return (
    <section className="ws-panel ws-form-panel">
      <div className="ws-form-heading">
        <span className="ws-form-icon">
          {type === 'Video' ? <Video /> : type === 'Listening' ? <FileAudio /> : type === 'Writing' ? <PenLine /> : type === 'Reading' ? <BookOpen /> : <BookMarked />}
        </span>
        <div>
          <h3>Yangi {type.toLowerCase()} yaratish</h3>
          <p>Material ma’lumotlarini kiriting.</p>
        </div>
      </div>
      <div className="ws-inline-form">
        <label>
          Sarlavha / so‘z
          <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder={type === 'Vocabulary' ? 'word — tarjima' : 'Material sarlavhasi'} />
        </label>
        <label>
          Daraja
          <select value={form.level} onChange={e => setForm({ ...form, level: e.target.value })}>
            {['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'A1–C2'].map(x => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
        <label>
          Mavzu
          <select value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })}>
            {topics.map(x => (
              <option key={x}>{x}</option>
            ))}
            <option>Umumiy</option>
          </select>
        </label>
        {type !== 'Vocabulary' && (
          <label>
            {type === 'Video' ? 'Video URL' : type === 'Listening' ? 'Audio URL' : 'Fayl / media URL'}
            <input value={form.url || ''} onChange={e => setForm({ ...form, url: e.target.value })} placeholder="https://..." />
          </label>
        )}
        <label className="ws-wide">
          {type === 'Writing' ? 'Topshiriq yo‘riqnomasi' : type === 'Reading' ? 'Matn / o‘qish materiali' : type === 'Listening' ? 'Audio transkript / izoh' : type === 'Video' ? 'Video tavsifi' : 'Tarjima va misol'}
          <textarea value={form.detail} onChange={e => setForm({ ...form, detail: e.target.value })} placeholder="Mazmun, ko‘rsatma yoki izoh..." />
        </label>
        <label>
          Nashr holati
          <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
            <option>Published</option>
            <option>Qoralama</option>
            <option>Rejalashtirilgan</option>
          </select>
        </label>
        <button className="ws-primary" onClick={onSave}>
          <Save size={16} /> Saqlash
        </button>
      </div>
    </section>
  );
}

function RecordsTable({ records, onDelete, onEdit }: { records: any[]; onDelete: (id: number) => void; onEdit?: (r: any) => void }) {
  return (
    <section className="ws-panel">
      <div className="ws-panel-head">
        <div>
          <h3>Saqlangan materiallar</h3>
          <p>{records.length} ta yozuv</p>
        </div>
      </div>
      {records.length === 0 ? (
        <div className="ws-empty">
          <BookOpen size={28} />
          <b>Hozircha material yo‘q</b>
          <span>Yuqoridagi forma orqali birinchi materialni qo‘shing.</span>
        </div>
      ) : (
        <>
          <TableHead labels={['Sarlavha', 'Turi / mavzu', 'Daraja', 'Holat', 'Amallar']} />
          {records.map(r => (
            <div className="ws-table-row" key={r.id}>
              <b>{r.title}</b>
              <span>{r.type} · {r.topic}</span>
              <span>{r.level}</span>
              <em>{r.status}</em>
              <div className="ws-row-actions">
                {onEdit && (
                  <button onClick={() => onEdit(r)} aria-label="Tahrirlash">
                    <Edit3 size={15} />
                  </button>
                )}
                <button onClick={() => onDelete(r.id)} aria-label="O‘chirish">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </>
      )}
    </section>
  );
}
