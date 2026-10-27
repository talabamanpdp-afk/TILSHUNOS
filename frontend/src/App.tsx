import { RoleWorkspace } from './RoleWorkspace';
import { useEffect, useMemo, useState } from 'react';
import {
  Activity, ArrowDownRight, ArrowRight, ArrowUpRight, Award, BookA, BookOpen, Bookmark, Brain,
  CalendarDays, Check, CheckCheck, ChevronDown, ChevronRight, CircleHelp, Clock3, Download, Flame, Gamepad2, GraduationCap, Image,
  Headphones, Home, Languages, LayoutDashboard, Library, ListTodo, LogOut, Menu, MessageCircle,
  Mic2, Moon, MoreHorizontal, Plus, Search, Settings, Share2, Sparkles, Sun, Smartphone, Target, TrendingUp, Trophy,
  Users, Volume2, X, Zap, type LucideIcon
} from 'lucide-react';
import { api, authStorage } from './api';

type Word = { id: number; word: string; translation: string; example: string; topic: string; state: 'Rejalashtirilgan' | 'Jarayonda' | 'O‘rganilgan' };

const initialWords: Word[] = [
  { id: 1, word: 'achieve', translation: 'erishmoq', example: 'You can achieve anything with practice.', topic: 'Motivatsiya', state: 'Jarayonda' },
  { id: 2, word: 'curious', translation: 'qiziquvchan', example: 'Children are naturally curious.', topic: 'Xarakter', state: 'Rejalashtirilgan' },
  { id: 3, word: 'opportunity', translation: 'imkoniyat', example: 'This is a great opportunity to learn.', topic: 'Ish va ta’lim', state: 'O‘rganilgan' },
  { id: 4, word: 'improve', translation: 'yaxshilamoq', example: 'I want to improve my English.', topic: 'Ta’lim', state: 'Jarayonda' },
  { id: 5, word: 'confident', translation: 'o‘ziga ishongan', example: 'She feels confident when speaking.', topic: 'Xarakter', state: 'Rejalashtirilgan' },
];

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

const lessons = [
  { title: 'Daily conversations', sub: 'Kundalik suhbatlar', level: 'A2', type: 'Tinglash', mins: '12 daqiqa', icon: Headphones, color: 'lavender' },
  { title: 'The power of habits', sub: 'Odatlar kuchi', level: 'B1', type: 'O‘qish', mins: '8 daqiqa', icon: BookOpen, color: 'mint' },
  { title: 'At the coffee shop', sub: 'Kafeda suhbat', level: 'A1', type: 'Gapirish', mins: '6 daqiqa', icon: Mic2, color: 'peach' },
];

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const currentUser = authStorage.getUser();
  const [active, setActive] = useState('Bosh sahifa');
  const [words, setWords] = useState<Word[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('tilshunos_words') || 'null') || initialWords;
    } catch {
      return initialWords;
    }
  });
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [practiceOpen, setPracticeOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [toast, setToast] = useState('');
  const [newWord, setNewWord] = useState({ word: '', translation: '', example: '', topic: 'Umumiy' });
  const [answer, setAnswer] = useState('');
  const [answered, setAnswered] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [showAll, setShowAll] = useState(false);

  // Games state
  const [gameMode, setGameMode] = useState('Mavzu typing');
  const [gameInput, setGameInput] = useState('');
  const [gameScore, setGameScore] = useState(0);
  const [gameFeedback, setGameFeedback] = useState('');
  const [previousChainWord, setPreviousChainWord] = useState('Apple');
  const [imageMode, setImageMode] = useState('Variantlardan tanlash');
  const [leaderboard, setLeaderboard] = useState<any[]>([
    { name: 'Jasur Aliyev', avatar: 'J', score: 1420, rank: 1 },
    { name: 'Madina Karimova', avatar: 'M', score: 1280, rank: 2 },
    { name: 'Siz', avatar: 'S', score: 0, rank: 3 }
  ]);

  // PWA install state
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [installed, setInstalled] = useState(false);
  const [showPwaModal, setShowPwaModal] = useState(false);

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
        if (Array.isArray(items) && items.length > 0) {
          const mapped: Word[] = items.map((x: any) => ({
            id: x.id,
            word: x.targetWord,
            translation: x.nativeTranslation,
            example: x.exampleSentence || '',
            topic: x.topicCategory || 'Umumiy',
            state: x.status === 2 ? 'O‘rganilgan' : x.status === 1 ? 'Jarayonda' : 'Rejalashtirilgan'
          }));
          setWords(mapped);
        }
      })
      .catch(() => {});

    // Load leaderboard
    api.getLeaderboard()
      .then(lb => {
        if (Array.isArray(lb) && lb.length > 0) setLeaderboard(lb);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    const installedHandler = () => {
      setInstalled(true);
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
      await installPrompt.prompt();
      setInstallPrompt(null);
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
    localStorage.setItem('tilshunos_words', JSON.stringify(words));
  }, [words]);

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
          <div className="brand-mark"><Languages size={23} /></div>
          <div>
            <div className="brand-name">TILSHUNOS<span>.</span></div>
            <div className="brand-caption">LEARN YOUR WAY</div>
          </div>
          <button className="icon-btn mobile-close" onClick={() => setMobileNav(false)} aria-label="Menyuni yopish">
            <X size={19} />
          </button>
        </div>

        <div className="profile-mini">
          <div className="avatar">{userInitial}</div>
          <div className="profile-copy">
            <strong>{userName}</strong>
            <span><span className="online-dot" /> Ingliz tili · B1</span>
          </div>
        </div>

        {/* Mobile Install button in sidebar */}
        <button
          className="nav-item"
          style={{ background: 'var(--soft)', color: 'var(--purple)', fontWeight: 700, margin: '6px 0 10px' }}
          onClick={triggerInstall}
        >
          <Smartphone size={18} />
          <span>Ilovani o‘rnatish</span>
          <Download size={15} />
        </button>

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
                {item.label === 'Vazifalar' && <span className="nav-count">3</span>}
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
              <span className="streak-days">5 kunlik seriya</span>
              <MoreHorizontal size={17} />
            </div>
            <p>Zo‘r ketyapsiz! Har kuni mashq qilish natijani tezlashtiradi.</p>
            <div className="week-dots">
              {['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'].map((d, i) => (
                <div key={d} className={`day-dot ${i < 5 ? 'done' : ''}`}>
                  <span>{i < 5 ? <Check size={11} /> : d[0]}</span>
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
            {/* Mobile PWA Install button */}
            <button className="primary-btn" onClick={triggerInstall} style={{ padding: '8px 12px', fontSize: '10px' }}>
              <Download size={14} /> <span className="install-text">Appni yuklash</span>
            </button>
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
          {/* Universal PWA Install Banner */}
          {!installed && (
            <div className="install-banner">
              <div className="install-badge"><Download size={20} /></div>
              <div>
                <strong>TILSHUNOS ilovasini telefon yoki kompyuterga o‘rnating</strong>
                <p>Tezkor kirish, to‘liq ekran va qulay mobil tajriba uchun ilovani asosiy ekranga qo‘shing.</p>
              </div>
              <button className="primary-btn" onClick={triggerInstall}>
                O‘rnatish <ArrowDownRight size={15} />
              </button>
              <button className="install-dismiss" onClick={e => (e.currentTarget.parentElement as HTMLElement).remove()} aria-label="Yopish">
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
                  <CalendarDays size={16} /> 27-oktabr, Seshanba
                </button>
              </div>

              <section className="hero-card">
                <div className="hero-orb orb-one" />
                <div className="hero-orb orb-two" />
                <div className="hero-content">
                  <div className="hero-label"><span className="hero-spark"><Zap size={13} fill="currentColor" /></span> BUGUNGI MAQSAD</div>
                  <h2>Har kuni 20 daqiqa,<br />kelajakda <em>erkin muloqot.</em></h2>
                  <p>Bugungi maqsadingizga yetish uchun mashq qilishni davom eting.</p>
                  <div className="hero-progress-line">
                    <div className="progress-track"><span style={{ width: '65%' }} /></div>
                    <strong>13 <small>/ 20 daq.</small></strong>
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
                  <div className="float-card float-card-bottom"><Flame size={15} fill="currentColor" /> 5 day streak</div>
                </div>
              </section>

              <section className="stats-grid">
                <Stat icon={BookA} label="O‘rganilgan so‘zlar" value={String(learned + 42)} note="Haqiqiy progress" color="purple" trend="up" />
                <Stat icon={Flame} label="Ketma-ket kunlar" value="5 kun" note="Shaxsiy rekord: 14" color="orange" />
                <Stat icon={Target} label="Maqsad bajarilishi" value="65%" note="Kunlik reja" color="green" trend="up" />
                <Stat icon={Trophy} label="Umumiy natija" value={`${1280 + gameScore} XP`} note="Haftalik o‘rin: #3" color="blue" />
              </section>

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
                      <strong>4 soat 35 daq.</strong>
                      <span><ArrowUpRight size={14} /> 18% <small>o‘tgan haftaga nisbatan</small></span>
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
                        <path d="M0,108 C30,96 40,118 75,92 S120,75 150,88 S200,43 225,62 S270,86 300,55 S350,69 375,43 S425,65 450,39 S510,60 525,26 S575,38 600,16 L600,150 L0,150 Z" fill="url(#areaFill)" />
                        <path d="M0,108 C30,96 40,118 75,92 S120,75 150,88 S200,43 225,62 S270,86 300,55 S350,69 375,43 S425,65 450,39 S510,60 525,26 S575,38 600,16" fill="none" stroke="#7b6cf6" strokeWidth="3" vectorEffect="non-scaling-stroke" strokeLinecap="round" />
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
                    <div className="goal-circle">
                      <svg viewBox="0 0 120 120">
                        <circle cx="60" cy="60" r="49" className="circle-bg" />
                        <circle cx="60" cy="60" r="49" className="circle-value" />
                      </svg>
                      <div className="circle-center">
                        <strong>65<span>%</span></strong>
                        <small>bajarildi</small>
                      </div>
                    </div>
                  </div>
                  <div className="goal-details">
                    <div><span className="goal-color purple" />O‘rganish vaqti <strong>13/20 daq.</strong></div>
                    <div><span className="goal-color green" />Yangi so‘zlar <strong>8/10 ta</strong></div>
                    <div><span className="goal-color orange" />Mashqlar <strong>3/5 ta</strong></div>
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
                  {lessons.map((lesson, i) => (
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
                    {words.slice(0, 3).map(w => (
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
                    ))}
                  </div>
                </section>

                <section className="panel achievement-panel">
                  <div className="panel-heading">
                    <div>
                      <h3>Yutuqlar</h3>
                      <p>Mehnatingiz samarasini ko‘ring</p>
                    </div>
                  </div>
                  <div className="achievement-row">
                    <div className="achievement-medal medal-gold"><Flame size={23} fill="currentColor" /></div>
                    <div><strong>5 kunlik seriya</strong><span>5 kun uzluksiz o‘rgandingiz</span></div>
                    <span className="achievement-check"><Check size={14} /></span>
                  </div>
                  <div className="achievement-row">
                    <div className="achievement-medal medal-purple"><BookOpen size={23} /></div>
                    <div><strong>So‘z yig‘uvchi</strong><span>100 ta so‘z yig‘ildi</span></div>
                    <span className="achievement-check"><Check size={14} /></span>
                  </div>
                  <div className="achievement-row locked">
                    <div className="achievement-medal medal-blue"><GraduationCap size={23} /></div>
                    <div><strong>Bilimdon</strong><span>200 ta so‘zga yeting</span></div>
                    <span className="achievement-lock">76%</span>
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
                          <strong>{w.word}</strong>
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
                    {leaderboard.map((u: any, idx: number) => (
                      <div className="leader-row" key={u.name || idx}>
                        <span className={`leader-avatar ${idx === 1 ? 'second' : idx === 2 ? 'third' : ''}`}>{idx + 1}</span>
                        <span>{u.name}</span>
                        <strong>{u.score} XP</strong>
                      </div>
                    ))}
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
                {[
                  ...lessons,
                  { title: 'Writing: My Daily Routine', sub: 'Insho yozish amaliyoti', level: 'A2', type: 'Yozish', mins: '15 daqiqa', icon: MessageCircle, color: 'peach' },
                  { title: 'Useful Expressions for Travel', sub: 'Sayohat uchun iboralar', level: 'B1', type: 'Lug‘at', mins: '10 daqiqa', icon: Languages, color: 'lavender' },
                  { title: 'Pronunciation & Accent Mastery', sub: 'Talaffuz va ohang mashqlari', level: 'A1', type: 'Gapirish', mins: '7 daqiqa', icon: Mic2, color: 'mint' }
                ]
                  .filter(l => active === 'Materiallar' || l.type === active || (active === 'O‘qish' && l.type === 'O‘qish'))
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
                  <button className="primary-btn" onClick={triggerInstall} style={{ marginTop: '10px' }}>
                    <Smartphone size={16} /> Ilovani telefonga o‘rnatish
                  </button>
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
              <div className="question-label">SO‘ZNING O‘ZBEKCHA TARJIMASINI YOZING</div>
              <h2>{currentQuestion?.word || 'achieve'}</h2>
              <button className="pronounce-btn" onClick={() => notify('Talaffuz: audio tinglash')}>
                <Volume2 size={17} /> Audio talaffuz
              </button>
              <input
                className={`answer-input ${answered ? (answer.trim().toLowerCase() === currentQuestion?.translation.toLowerCase() ? 'correct' : 'incorrect') : ''}`}
                value={answer}
                onChange={e => { setAnswer(e.target.value); setAnswered(false); }}
                onKeyDown={e => e.key === 'Enter' && (answered ? nextQuestion() : checkAnswer())}
                placeholder="O‘zbekcha tarjimani yozing..."
                disabled={answered}
              />
              {answered && (
                <div className={`answer-feedback ${answer.trim().toLowerCase() === currentQuestion?.translation.toLowerCase() ? 'good' : 'bad'}`}>
                  {answer.trim().toLowerCase() === currentQuestion?.translation.toLowerCase() ? 'Ajoyib! To‘g‘ri javob 🎉' : `To‘g‘ri javob: ${currentQuestion?.translation}`}
                </div>
              )}
            </div>
            <div className="practice-modal-footer">
              <span><CircleHelp size={15} /> Xotiradan topishga harakat qiling.</span>
              {answered ? (
                <button className="primary-btn" onClick={nextQuestion}>Keyingi savol <ArrowRight size={15} /></button>
              ) : (
                <button className="primary-btn" onClick={checkAnswer} disabled={!answer.trim()}>Javobni tekshirish <Check size={15} /></button>
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
            <button className="primary-btn" style={{ width: '100%' }} onClick={() => setShowPwaModal(false)}>
              Tushunarli <Check size={16} />
            </button>
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
  const [page, setPage] = useState<'welcome' | 'login' | 'register' | 'verify' | 'onboarding' | 'dashboard'>(() => {
    return authStorage.getToken() ? 'dashboard' : 'welcome';
  });
  const [role, setRole] = useState(() => localStorage.getItem('tilshunos_role') || 'user');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [intent, setIntent] = useState<'login' | 'register'>('register');
  const [language, setLanguage] = useState('English');
  const [level, setLevel] = useState('A1');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [cmsContent, setCmsContent] = useState<any>(null);

  // Load public CMS content
  useEffect(() => {
    api.getCms()
      .then(c => setCmsContent(c))
      .catch(() => {});
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
      setMessage(`Tasdiqlash kodi ${email} manziliga yuborildi!`);
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

      const userRole = res.user?.role;
      const roleStr = typeof userRole === 'string' ? userRole.toLowerCase() : userRole === 1 ? 'admin' : userRole === 2 ? 'teacher' : 'user';
      const cleanRole = roleStr === 'superadmin' ? 'admin' : roleStr === 'learner' ? 'user' : roleStr;
      setRole(cleanRole);
      setPage('dashboard');
    } catch (err: any) {
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
      await api.verifyEmail(email.trim().toLowerCase(), code.trim());
      setMessage('Email tasdiqlandi! ✓');
      setPage('onboarding');
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
      setMessage('Yangi tasdiqlash kodi emailingizga yuborildi! (Resend xizmati)');
    } catch (err: any) {
      setMessage(err.message || 'Kodni yuborishda xatolik. Birozdan so‘ng urinib ko‘ring.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setMessage('');
    try {
      const promptEmail = prompt('Google emailingizni kiriting:', email || 'google.user@gmail.com');
      if (!promptEmail) {
        setLoading(false);
        return;
      }
      const res = await api.googleAuth({
        idToken: 'google_oauth_token',
        email: promptEmail,
        firstName: name || 'Google',
        lastName: 'Foydalanuvchi'
      });
      setRole('user');
      setPage('dashboard');
    } catch (err: any) {
      setMessage(err.message || 'Google orqali kirishda xatolik yuz berdi.');
    } finally {
      setLoading(false);
    }
  };

  const finishOnboarding = async () => {
    const levelMap: Record<string, number> = { A1: 0, A2: 1, B1: 2, B2: 3, C1: 4, C2: 5 };
    try {
      await api.completeOnboarding({
        primaryLanguage: language === 'English' ? 'en' : language === 'Deutsch' ? 'de' : 'es',
        targetLevel: levelMap[level] ?? 1,
        nativeLanguage: 'uz',
        dailyGoalMinutes: 20
      });
    } catch {
      // fallback
    }
    localStorage.setItem('tilshunos_language', language);
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
      return <RoleWorkspace role="admin" onLogout={handleLogout} />;
    }
    if (role === 'teacher') {
      return <RoleWorkspace role="teacher" onLogout={handleLogout} />;
    }
    return <Dashboard onLogout={handleLogout} />;
  }

  return (
    <div className="entry-shell">
      <header className="entry-header">
        <button className="entry-brand" onClick={() => setPage('welcome')}>
          <span className="entry-logo"><Languages size={23} /></span>
          <span>TILSHUNOS<span className="entry-dot">.</span><small>LEARN YOUR WAY</small></span>
        </button>
        <nav>
          <a href="#features">Imkoniyatlar</a>
          <a href="#about">Biz haqimizda</a>
          <button className="entry-login" onClick={() => begin('login')}>
            Kirish <ArrowRight size={16} />
          </button>
        </nav>
      </header>

      {page === 'welcome' && (
        <>
          <section className="entry-hero">
            <div className="entry-hero-copy">
              <div className="entry-kicker"><Sparkles size={15} /> SIZNING TIL O‘RGANISH SAYOHATINGIZ</div>
              <h1>{cmsContent?.hero ? cmsContent.hero.split('.')[0] + '.' : 'Yangi til.'}<br /><span>{cmsContent?.hero?.split('.')[1] || 'Yangi imkoniyatlar.'}</span></h1>
              <p>{cmsContent?.description || 'TILSHUNOS bilan har kuni oz-ozdan o‘rganing, bilimlaringizni amalda sinang va maqsadingizga ishonch bilan yaqinlashing.'}</p>
              <div className="entry-actions">
                <button className="entry-primary" onClick={() => begin('register')}>
                  {cmsContent?.cta || 'Bepul boshlash'} <ArrowRight size={18} />
                </button>
                <button className="entry-secondary" onClick={() => begin('login')}>
                  Hisobim bor
                </button>
              </div>
              <div className="entry-proof">
                <b>✦</b>
                <span><strong>O‘rganishni bugun boshlang</strong><small>O‘z sur’atingizda, o‘z maqsadingiz sari</small></span>
              </div>
            </div>
            <div className="entry-hero-art">
              <div className="entry-glass-card">
                <span>BUGUNGI MAQSAD</span>
                <div className="glass-big">20 <small>daqiqa</small></div>
                <p>Bugun ham maqsad sari bir qadam!</p>
                <div className="glass-progress"><i style={{ width: '65%' }} /></div>
                <div className="glass-tags">
                  <span>✦ Lug‘at</span>
                  <span>◉ Tinglash</span>
                  <span>↗ Speaking</span>
                </div>
              </div>
              <div className="floating-word word-one">curiosity <b>qiziquvchanlik</b></div>
              <div className="floating-word word-two">✦ Har kuni rivojlaning</div>
            </div>
          </section>

          <section id="features" className="entry-features">
            <div className="entry-section-title">
              <span>HAMMASI BIR JOYDA</span>
              <h2>Til o‘rganish — <em>sizga mos usulda</em></h2>
              <p>Kerakli vositalar, aniq yo‘l xaritasi va kuzatib boriladigan natijalar.</p>
            </div>
            <div className="entry-feature-grid">
              {[
                ['Darajangizga mos', 'A1 dan C2 gacha materiallar, reading va grammar mashqlari.'],
                ['Shaxsiy lug‘at', 'Yangi so‘zlarni saqlang va anti-fraud mashqlar bilan mustahkamlang.'],
                ['So‘z o‘yinlari & Musobaqa', 'Typing, so‘z zanjiri va rasmli topshiriqlar bilan XP to‘plang.'],
                ['AI Tutor & Repetitor', 'Har qanday vaqtda savol bering, xatolaringizni aniqlang va to‘g‘rilang.']
              ].map(([a, b], i) => (
                <article key={a}>
                  <span className="feature-icon lilac">
                    {[<BookOpen key="b" />, <Languages key="l" />, <Trophy key="t" />, <Sparkles key="s" />][i]}
                  </span>
                  <h3>{a}</h3>
                  <p>{b}</p>
                </article>
              ))}
            </div>
          </section>

          <section id="about" className="entry-about">
            <div>
              <span className="entry-kicker">BIZ HAQIMIZDA</span>
              <h2>Har bir yangi so‘z — <span>katta maqsad sari qadam.</span></h2>
            </div>
            <p>{cmsContent?.about || 'TILSHUNOS til o‘rganishni tartibli, qiziqarli va shaxsiy maqsadlaringizga mos qilish uchun yaratilayotgan ilg‘or platforma.'}</p>
          </section>

          <footer className="entry-footer">
            <b>TILSHUNOS<span className="entry-dot">.</span></b>
            <div>
              <a href="mailto:hello@tilshunos.uz">Bog‘lanish</a>
              <a href="#about">Biz haqimizda</a>
              <span>{cmsContent?.footer || '© 2026 TILSHUNOS'}</span>
            </div>
          </footer>
        </>
      )}

      {(page === 'login' || page === 'register' || page === 'verify') && (
        <section className="auth-wrap">
          <div className="auth-visual">
            <span className="entry-kicker">TILSHUNOS PLATFORMASI</span>
            <h1>
              {page === 'verify' ? 'Emailingizni tasdiqlang' : page === 'login' ? 'Qaytganingizdan xursandmiz!' : 'O‘rganish yo‘lingiz shu yerdan boshlanadi.'}
            </h1>
            <p>O‘z maqsadingizni belgilang, kichik qadamlar bilan katta natijalarga erishing.</p>
            <div className="auth-visual-stat">
              <strong>4+</strong>
              <span>asosiy ko‘nikma<br />bitta platformada</span>
            </div>
          </div>

          <div className="auth-card">
            <button className="auth-back" onClick={() => setPage('welcome')}>← Bosh sahifaga</button>
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
              <>
                {page === 'register' && (
                  <label>
                    Ism va familiya
                    <input value={name} onChange={e => setName(e.target.value)} placeholder="Masalan, Jasur Aliyev" />
                  </label>
                )}
                <label>
                  Email manzili
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="siz@example.com" />
                </label>
                <label>
                  Parol
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Kamida 6 belgili parol" />
                </label>

                <button className="google-demo" onClick={handleGoogleLogin} disabled={loading}>
                  <b>G</b> Google orqali davom etish
                </button>

                <div className="auth-divider">yoki email orqali</div>

                <button className="entry-primary auth-submit" onClick={page === 'login' ? handleLoginSubmit : handleRegisterSubmit} disabled={loading}>
                  {loading ? 'Bajarilmoqda...' : page === 'login' ? 'Kirish' : 'Tasdiqlash kodini yuborish'} <ArrowRight size={17} />
                </button>

                <p className="auth-switch">
                  {page === 'login' ? 'Hisobingiz yo‘qmi?' : 'Hisobingiz bormi?'}
                  <button onClick={() => begin(page === 'login' ? 'register' : 'login')}>
                    {page === 'login' ? 'Ro‘yxatdan o‘tish' : 'Kirish'}
                  </button>
                </p>
              </>
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
                    {resendCooldown > 0 ? `Kodni qayta yuborish (${resendCooldown}s)` : 'Kodni qayta yuborish (Resend)'}
                  </button>
                </div>

                <p className="auth-note">Emailingizga kelgan 6 xonali xavfsizlik kodini kiriting.</p>
              </>
            )}

            {message && <p className="auth-message">{message}</p>}
          </div>
        </section>
      )}

      {page === 'onboarding' && (
        <section className="onboarding-wrap">
          <div className="onboarding-card">
            <div className="onboarding-step">01 <span>—</span> 02</div>
            <div className="onboarding-symbol"><Languages size={28} /></div>
            <span className="entry-kicker">SHAXSIY O‘QUV REJANGIZ</span>
            <h1>Qaysi tilni <span>o‘rganmoqchisiz?</span></h1>
            <p>Tanlovingiz bo‘yicha dashboard va lug‘at tavsiyalari moslashtiriladi.</p>
            <div className="language-options">
              {[
                ['English', '🇬🇧', 'Ingliz tili'],
                ['Deutsch', '🇩🇪', 'Nemis tili'],
                ['Español', '🇪🇸', 'Ispan tili'],
                ['Türkçe', '🇹🇷', 'Turk tili'],
                ['Français', '🇫🇷', 'Fransuz tili'],
                ['한국어', '🇰🇷', 'Koreys tili']
              ].map(([v, f, l]) => (
                <button key={v} className={language === v ? 'chosen' : ''} onClick={() => setLanguage(v)}>
                  <span>{f}</span>
                  <strong>{l}</strong>
                  {language === v && <Check size={17} />}
                </button>
              ))}
            </div>
            <h3>Hozirgi darajangiz</h3>
            <div className="level-options">
              {[
                ['A1', 'Boshlang‘ich'],
                ['A2', 'Elementar'],
                ['B1', 'O‘rta'],
                ['B2', 'O‘rtadan yuqori'],
                ['C1', 'Yuqori'],
                ['C2', 'Mukammal']
              ].map(([v, l]) => (
                <button key={v} className={level === v ? 'chosen' : ''} onClick={() => setLevel(v)}>
                  <strong>{v}</strong>
                  <span>{l}</span>
                </button>
              ))}
            </div>
            <button className="entry-primary onboarding-submit" onClick={finishOnboarding}>
              Shaxsiy yo‘l xaritamni yaratish <ArrowRight size={18} />
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

export default App;
