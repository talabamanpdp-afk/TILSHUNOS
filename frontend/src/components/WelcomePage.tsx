import React, { useState } from 'react';
import {
  Languages, ArrowRight, ChevronRight, Check, Sparkles, BookOpen, Headphones,
  PenLine, MessageCircle, Mic2, Gamepad2, Users, Trophy, ShieldCheck,
  ChevronDown, ChevronUp, Sun, Moon, Menu, X, Play, Volume2, Award,
  Clock, Flame, HelpCircle, Send, ExternalLink, Heart, Layers, Target, Compass,
  Search, Star, Smartphone
} from 'lucide-react';

export interface CmsConfig {
  hero?: string;
  heroBadge?: string;
  description?: string;
  cta?: string;
  secondaryCta?: string;
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
}

interface WelcomePageProps {
  cms: CmsConfig | null;
  onBegin: (intent: 'login' | 'register') => void;
  dark: boolean;
  setDark: (val: boolean) => void;
  onSelectLevel?: (lvl: string) => void;
}

export function WelcomePage({ cms, onBegin, dark, setDark, onSelectLevel }: WelcomePageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [previewTab, setPreviewTab] = useState<'vocab' | 'lesson' | 'progress'>('vocab');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [aboutModalOpen, setAboutModalOpen] = useState(false);

  // Audio pronunciation simulation
  const [audioPlaying, setAudioPlaying] = useState(false);
  const playSampleAudio = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setAudioPlaying(true);
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'en-US';
      utter.rate = 0.9;
      utter.onend = () => setAudioPlaying(false);
      utter.onerror = () => setAudioPlaying(false);
      window.speechSynthesis.speak(utter);
    }
  };

  // Safe defaults
  const heroBadge = cms?.heroBadge || 'TILSHUNOS 2.0 · ILG‘OR TIL O‘RGANISH EKOTIZIMI';
  const heroTitle = cms?.hero || 'Yangi til. Yangi imkoniyatlar.';
  const heroDesc = cms?.description || 'TILSHUNOS bilan har kuni tizimli o‘rganing, CEFR standartlarida bilimingizni mustahkamlang va erkin muloqotga chiqing.';
  const primaryCta = cms?.cta || 'Bepul boshlash';
  const secondaryCta = cms?.secondaryCta || 'Platformani o‘rganish';

  const aboutShort = cms?.about || 'TILSHUNOS til o‘rganishni tartibli, qiziqarli va shaxsiy maqsadlaringizga mos qilish uchun yaratilayotgan ilg‘or platforma.';
  const aboutDetailed = cms?.aboutDetailed || 'TILSHUNOS — xalqaro CEFR (A1–C2) standartlariga moslashtirilgan, sun’iy intellekt va professional ustozlar metodikasini o‘zida mujassam etgan zamonaviy ta’lim platformasi. Bizning asosiy maqsadimiz — har bir foydalanuvchiga murakkab grammatik qoidalarsiz, interaktiv so‘z o‘yinlari, amaliy audio-dialoglar, yozma tahlil va real muloqot orqali tilni tabiiy o‘zlashtirish imkoniyatini taqdim etishdir.';
  const aboutBtn = cms?.aboutButton || 'Batafsil ma’lumot';

  const teamMembers = cms?.team && cms.team.length > 0 ? cms.team : [
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
  const faqs = cms?.faqs && cms.faqs.length > 0 ? cms.faqs : defaultFaqs;

  return (
    <div className={`welcome-root ${dark ? 'dark' : ''}`}>
      {/* 1. TOP SPLIT HEADER & HERO WRAPPER */}
      <section className="holo-hero-wrapper">
        {/* Split Background Layers */}
        <div className="holo-bg-split">
          <div className="holo-bg-left" />
          <div className="holo-bg-right">
            <div className="holo-radial-mesh" />
          </div>
        </div>

        {/* Global Split Nav Header */}
        <header className="holo-nav">
          <div className="holo-nav-container">
            {/* Left Brand & Nav links (on blue side) */}
            <div className="holo-nav-left">
              <a href="#" className="holo-brand">
                <span className="holo-brand-icon">
                  <Languages size={24} />
                </span>
                <span className="holo-brand-name">TILSHUNOS</span>
              </a>

              <nav className="holo-nav-links">
                <a href="#teachers" className="holo-nav-link">
                  <Search size={15} />
                  <span>O‘qituvchi topish</span>
                </a>
                <a href="#skills" className="holo-nav-link">
                  <Users size={15} />
                  <span>Hamjamiyat</span>
                </a>
                <a href="#about" className="holo-nav-link">
                  <BookOpen size={15} />
                  <span>O‘qituvchi bo‘lish</span>
                </a>
              </nav>
            </div>

            {/* Right Nav Auth & Controls (on dark side) */}
            <div className="holo-nav-right">
              <button
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
                className="holo-mobile-hamburger"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Menyu"
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>

          {/* Mobile Drawer */}
          {mobileMenuOpen && (
            <div className="mobile-drawer animate-fade-in">
              <nav className="mobile-nav-links">
                <a href="#teachers" onClick={() => setMobileMenuOpen(false)}>O‘qituvchi topish</a>
                <a href="#skills" onClick={() => setMobileMenuOpen(false)}>Hamjamiyat</a>
                <a href="#about" onClick={() => setMobileMenuOpen(false)}>O‘qituvchi bo‘lish</a>
                <a href="#preview" onClick={() => setMobileMenuOpen(false)}>Interfeys ko‘rinishi</a>
                <a href="#cefr" onClick={() => setMobileMenuOpen(false)}>CEFR Xaritasi</a>
                <a href="#faq" onClick={() => setMobileMenuOpen(false)}>Ko‘p beriladigan savollar</a>
              </nav>
              <div className="mobile-drawer-footer">
                <button className="nav-btn-secondary" style={{ width: '100%' }} onClick={() => { setMobileMenuOpen(false); onBegin('login'); }}>
                  Kirish
                </button>
                <button className="holo-get-started" style={{ width: '100%', marginTop: '8px' }} onClick={() => { setMobileMenuOpen(false); onBegin('register'); }}>
                  Boshlash
                </button>
              </div>
            </div>
          )}
        </header>

        {/* Hero Content Section */}
        <div className="holo-hero-content">
          <div className="holo-hero-grid">
            {/* Left Hero Column */}
            <div className="holo-hero-copy animate-fade-in-up">
              <h1 className="holo-headline">
                Yangi tilni{' '}
                <span className="holo-pill-badge">{heroBadge?.includes('PERCENT') ? heroBadge : '99 PERCENT'}</span>
                <br />
                erkin gapiring
              </h1>

              <p className="holo-description">
                {heroDesc || 'Har kuni bor-yo‘g‘i 20–30 daqiqa vaqt ajrating, real kerakli so‘zlarni o‘rganing va so‘z boyligingizni oshiring.'}
              </p>

              {/* Action row with Green Button and Flags */}
              <div className="holo-cta-row">
                <button className="holo-start-btn" onClick={() => onBegin('register')}>
                  <span>{primaryCta || 'Start Learning'}</span>
                  <ChevronRight size={18} />
                </button>

                <div className="holo-flags-group">
                  <div className="holo-flags-stack">
                    <span className="holo-flag">🇬🇧</span>
                    <span className="holo-flag">🇪🇸</span>
                    <span className="holo-flag">🇩🇪</span>
                    <span className="holo-flag">🇺🇿</span>
                  </div>
                  <div className="holo-flags-text">
                    <strong>150+</strong>
                    <span>Tillarda</span>
                  </div>
                </div>
              </div>

              {/* Also Available at */}
              <div className="holo-available-block">
                <span className="holo-available-label">Also Available at</span>
                <div className="holo-app-badges">
                  <a href="#pwa" className="holo-store-badge" onClick={(e) => { e.preventDefault(); onBegin('register'); }}>
                    <svg className="badge-svg" viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.63-.77 1.06-1.84.94-2.91-.91.04-2.02.61-2.67 1.38-.58.67-1.09 1.76-.95 2.8.02 0 .04 0 .06 0 .96 0 1.99-.5 2.62-1.27z" />
                    </svg>
                    <div className="badge-text">
                      <small>Available on the</small>
                      <strong>App Store</strong>
                    </div>
                  </a>

                  <a href="#pwa" className="holo-store-badge" onClick={(e) => { e.preventDefault(); onBegin('register'); }}>
                    <svg className="badge-svg" viewBox="0 0 24 24" width="22" height="22">
                      <path d="M3.609 1.814L13.792 12 3.61 22.186c-.305-.286-.484-.71-.484-1.186V3c0-.476.179-.9.483-1.186zm11.238 11.24l2.128 2.128-11.83 6.83 9.702-8.958zm0-2.108L5.145 1.988l11.83 6.83-2.128 2.128zm1.094 1.054l2.84 1.64c.82.473.82 1.246 0 1.72l-2.84 1.64-1.66-1.66 1.66-1.66z" fill="#4285F4" />
                    </svg>
                    <div className="badge-text">
                      <small>GET IT ON</small>
                      <strong>Google Play</strong>
                    </div>
                  </a>
                </div>
              </div>

              {/* Bottom Metrics Bar */}
              <div className="holo-metrics-bar">
                <div className="holo-metric-item">
                  <span className="metric-val">6 M</span>
                  <span className="metric-lbl">App Downloads</span>
                </div>
                <div className="holo-metric-divider" />
                <div className="holo-metric-item">
                  <span className="metric-val">8.24 M</span>
                  <span className="metric-lbl">Learned monthly</span>
                </div>
                <div className="holo-metric-divider" />
                <div className="holo-metric-item">
                  <span className="metric-val">
                    4.8 <Star size={15} fill="#fbbf24" color="#fbbf24" style={{ display: 'inline', verticalAlign: 'middle', marginLeft: '2px', marginBottom: '3px' }} />
                  </span>
                  <span className="metric-lbl">177k Rating</span>
                </div>
              </div>
            </div>

            {/* Right Hero Column: Laptop & Floating UI Cards */}
            <div className="holo-hero-visual animate-fade-in-up delay-200">
              <div className="holo-laptop-scene">
                {/* Floating Card 1: Popular Course Card */}
                <div className="holo-floating-card card-course animate-float-slow">
                  <div className="card-popular-badge">POPULAR</div>
                  <div className="card-course-top">
                    <span className="course-label">COURSE</span>
                    <span className="course-badge">103 Lesson</span>
                  </div>
                  <div className="card-course-body">
                    <span className="course-flag">🇬🇧</span>
                    <div>
                      <strong>Basic English</strong>
                      <small>Conversation Practice</small>
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
                    <strong>9 <small>/ 12</small></strong>
                    <span>Quiz Joined</span>
                  </div>
                </div>

                {/* Laptop Hardware Frame */}
                <div className="holo-laptop-device">
                  <div className="laptop-screen">
                    <img
                      src="/hero-tutor.jpg"
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
            </div>
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE PRODUCT PREVIEW SECTION */}
      <section id="preview" className="welcome-preview-section">
        <div className="section-container">
          <div className="section-header animate-fade-in-up">
            <span className="section-kicker">AMALIY TAJRIBA</span>
            <h2>Platformaning haqiqiy imkoniyatlarini sinab ko‘ring</h2>
            <p>Ro‘yxatdan o‘tishdan avval asosiy 3 ta modulimiz qanday ishlashini amalda ko‘ring.</p>
          </div>

          {/* Interactive preview tabs */}
          <div className="preview-tabs">
            <button
              className={`preview-tab-btn ${previewTab === 'vocab' ? 'active' : ''}`}
              onClick={() => setPreviewTab('vocab')}
            >
              <BookOpen size={16} />
              <span>1. So‘z Daftari & Lug‘at</span>
            </button>
            <button
              className={`preview-tab-btn ${previewTab === 'lesson' ? 'active' : ''}`}
              onClick={() => setPreviewTab('lesson')}
            >
              <PenLine size={16} />
              <span>2. Namuna Dars & Reading</span>
            </button>
            <button
              className={`preview-tab-btn ${previewTab === 'progress' ? 'active' : ''}`}
              onClick={() => setPreviewTab('progress')}
            >
              <Trophy size={16} />
              <span>3. O‘sish Tahlili & CEFR</span>
            </button>
          </div>

          {/* Tab Content 1: Vocabulary */}
          {previewTab === 'vocab' && (
            <div className="preview-content-card animate-fade-in">
              <div className="vocab-demo-grid">
                {[
                  { word: 'Achieve', tr: 'Erishmoq, zabt etmoq', lvl: 'B1', ex: 'You can achieve any language goal with daily practice.', topic: 'Motivatsiya' },
                  { word: 'Curious', tr: 'Qiziquvchan, yangilikka intiluvchan', lvl: 'A2', ex: 'Children are naturally curious about the world.', topic: 'Xarakter' },
                  { word: 'Resilience', tr: 'Sabr-bardosh, chidamlilik', lvl: 'B2', ex: 'She showed great resilience in learning pronunciation.', topic: 'Psixologiya' }
                ].map(item => (
                  <div key={item.word} className="demo-word-card">
                    <div className="demo-word-top">
                      <span className="demo-level-pill">{item.lvl}</span>
                      <button className="demo-speak-btn" onClick={() => playSampleAudio(item.word)}>
                        <Volume2 size={16} />
                      </button>
                    </div>
                    <h3 className="demo-target-word">{item.word}</h3>
                    <p className="demo-trans">{item.tr}</p>
                    <p className="demo-example">“{item.ex}”</p>
                    <div className="demo-topic-tag">{item.topic}</div>
                  </div>
                ))}
              </div>
              <div className="preview-footer-note">
                <Sparkles size={16} style={{ color: '#356cf6' }} />
                <span>Har bir so‘z intervalli takrorlash va kontekstual misollar orqali xotirada mustahkamlanadi.</span>
              </div>
            </div>
          )}

          {/* Tab Content 2: Sample Lesson */}
          {previewTab === 'lesson' && (
            <div className="preview-content-card animate-fade-in">
              <div className="lesson-preview-container">
                <div className="lesson-text-block">
                  <div className="lesson-text-head">
                    <span className="demo-level-pill">CEFR B1 · READING</span>
                    <span className="lesson-time"><Clock size={14} /> 5 daqiqa</span>
                  </div>
                  <h3>The Power of Tiny Daily Habits</h3>
                  <p className="lesson-article">
                    Consistency is far more powerful than intensity. When learning a new language, practicing
                    for just <strong>15 minutes every single day</strong> wires the brain more effectively than studying
                    for 4 hours once a week. The secret lies in frequent retrieval: each time you actively recall a word,
                    the neural pathway strengthens.
                  </p>
                </div>
                <div className="lesson-interactive-box">
                  <span className="interactive-title">TUSHUNISHNI TEKSHIRISH TESTI</span>
                  <p>Matnga ko‘ra, til o‘rganishda eng muhim omil nima?</p>
                  <div className="lesson-choices">
                    <button className="choice-btn correct">
                      <Check size={16} /> A) Har kuni muntazam 15 daqiqa shug‘ullanish (To‘g‘ri ✓)
                    </button>
                    <button className="choice-btn">
                      B) Faqat haftada bir marta 4 soat o‘rganish
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab Content 3: Progress & CEFR */}
          {previewTab === 'progress' && (
            <div className="preview-content-card animate-fade-in">
              <div className="progress-preview-grid">
                <div className="progress-card-item">
                  <span className="progress-caption">HAFTALIK O‘RGANISH VAQTI</span>
                  <div className="progress-big-number">4 soat 25 min</div>
                  <div className="weekly-bars">
                    {['Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan', 'Yak'].map((day, idx) => (
                      <div key={day} className="bar-column">
                        <div className="bar-track">
                          <div className="bar-fill" style={{ height: [60, 85, 70, 95, 80, 50, 90][idx] + '%' }} />
                        </div>
                        <span className="bar-label">{day}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="progress-card-item">
                  <span className="progress-caption">CEFR DARAJASI PROGRESSI</span>
                  <div className="progress-big-number" style={{ color: '#356cf6' }}>B1 O‘rta Daraja</div>
                  <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '8px 0 16px' }}>
                    B2 darajasiga o‘tish uchun yana <strong>140 ta so‘z</strong> va 3 ta writing inshosi qoldi.
                  </p>
                  <div className="progress-meter-line">
                    <div className="meter-fill" style={{ width: '72%' }} />
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#356cf6' }}>72% Bajarildi</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 4. CEFR ROADMAP SECTION */}
      <section id="cefr" className="welcome-cefr-section">
        <div className="section-container">
          <div className="section-header animate-fade-in-up">
            <span className="section-kicker">XALQARO METODIKA</span>
            <h2>CEFR bo‘yicha aniq yo‘l xaritasi (A1–C2)</h2>
            <p>O‘zingizga mos boshlang‘ich nuqtani tanlang va bosqichma-bosqich yuksaling.</p>
          </div>

          <div className="cefr-cards-grid">
            {[
              { code: 'A1', name: 'Boshlang‘ich', desc: 'Oddiy so‘zlar, tanishuv va kundalik eng muhim iboralar.', color: '#3b82f6' },
              { code: 'A2', name: 'Elementar', desc: 'Xarid, transport va oddiy kundalik vaziyatlarda muloqot.', color: '#0ea5e9' },
              { code: 'B1', name: 'O‘rta daraja', desc: 'Sayohat, fikr bildirish va o‘z tajribasini erkin tushuntirish.', color: '#10b981' },
              { code: 'B2', name: 'Mustaqil', desc: 'Murakkab matnlar, insholar va mavzular bo‘yicha erkin bahslashish.', color: '#8b5cf6' },
              { code: 'C1', name: 'Ilg‘or', desc: 'Akademik va kasbiy darajada chuqur fikrlash hamda tahlil.', color: '#f59e0b' },
              { code: 'C2', name: 'Mukammal', desc: 'Ona tili darajasidagi ravonlik va nozik ma’nolarni anglash.', color: '#ec4899' }
            ].map(lvl => (
              <div key={lvl.code} className="cefr-card">
                <div className="cefr-badge" style={{ background: `${lvl.color}15`, color: lvl.color, borderColor: `${lvl.color}40` }}>
                  {lvl.code}
                </div>
                <h3 className="cefr-name">{lvl.name}</h3>
                <p className="cefr-desc">{lvl.desc}</p>
                <button
                  className="cefr-action-btn"
                  onClick={() => {
                    if (onSelectLevel) onSelectLevel(lvl.code);
                    onBegin('register');
                  }}
                >
                  <span>{lvl.code} dan boshlash</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. LEARNING SKILLS SECTION */}
      <section id="skills" className="welcome-skills-section">
        <div className="section-container">
          <div className="section-header animate-fade-in-up">
            <span className="section-kicker">MUVOZANATLI RIVOJLANISH</span>
            <h2>5 ta asosiy til ko‘nikmasini mustahkamlang</h2>
            <p>Faqat qoidalar yodlash emas — har tomonlama tabiiy o‘rganish uslubi.</p>
          </div>

          <div className="skills-grid">
            {[
              { icon: BookOpen, title: 'O‘qish (Reading)', desc: 'Darajangizga moslangan qiziqarli hikoyalar, badiiy parchalar va zamonaviy maqolalar.', color: '#356cf6' },
              { icon: PenLine, title: 'Yozish (Writing)', desc: 'Insho va xatlar yozish, grammatik xatolarni sun’iy intellekt orqali darhol tekshirish.', color: '#8b5cf6' },
              { icon: Headphones, title: 'Tinglash (Listening)', desc: 'Tabiiy tezlikdagi audio podkastlar, kundalik muloqot dialoglari va transkriptlar.', color: '#0ea5e9' },
              { icon: Mic2, title: 'Gapirish (Speaking)', desc: 'To‘g‘ri talaffuz va intonatsiya mashqlari bilan muloqotdagi to‘siqlarni yengish.', color: '#10b981' },
              { icon: Layers, title: 'Lug‘at (Vocabulary)', desc: 'Shaxsiy so‘z daftari, kontekstual misollar va intervalli takrorlash metodikasi.', color: '#f59e0b' }
            ].map(skill => {
              const Icon = skill.icon;
              return (
                <div key={skill.title} className="skill-card">
                  <div className="skill-icon-wrap" style={{ background: `${skill.color}15`, color: skill.color }}>
                    <Icon size={24} />
                  </div>
                  <h3>{skill.title}</h3>
                  <p>{skill.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. HOW IT WORKS SECTION */}
      <section id="how-it-works" className="welcome-steps-section">
        <div className="section-container">
          <div className="section-header animate-fade-in-up">
            <span className="section-kicker">ODDIY VA TUSHUNARLI</span>
            <h2>O‘rganish jarayoni qanday kechadi?</h2>
            <p>5 ta oson qadam orqali maqsadingiz sari ishonch bilan yo‘l oling.</p>
          </div>

          <div className="steps-flow-grid">
            {[
              { step: '01', title: 'Til va maqsadni tanlaysiz', desc: 'Ingliz, rus, nemis yoki boshqa tillar hamda kunlik shug‘ullanish vaqti.' },
              { step: '02', title: 'Boshlang‘ich daraja aniqlanadi', desc: 'CEFR A1 dan C2 gacha bo‘lgan aniq darajangiz belgilanadi.' },
              { step: '03', title: 'Shaxsiy reja tuziladi', desc: 'Dashboardda har kungi yangi so‘zlar va mashqlar tartibli aks etadi.' },
              { step: '04', title: 'Amaliyot va so‘z o‘yinlari', desc: 'Typing, so‘z zanjiri va 1v1 bellashuvlar orqali bilim mustahkamlanadi.' },
              { step: '05', title: 'Natijalar va o‘sish', desc: 'O‘zlashtirilgan so‘zlar va yuqori CEFR darajalariga o‘tish.' }
            ].map(item => (
              <div key={item.step} className="step-card">
                <div className="step-number">{item.step}</div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. FEATURES & INNOVATION */}
      <section id="features" className="welcome-features-section">
        <div className="section-container">
          <div className="section-header animate-fade-in-up">
            <span className="section-kicker">ILG‘OR IMKONIYATLAR</span>
            <h2>Zamonaviy texnologiyalar xizmatingizda</h2>
            <p>Biz til o‘rganishni nafaqat samarali, balki maroqli jarayonga aylantiramiz.</p>
          </div>

          <div className="features-grid">
            <div className="feature-box">
              <div className="feature-icon-box purple"><Sparkles size={22} /></div>
              <h3>24/7 AI Til Repetitori</h3>
              <p>Istalgan savolingizni bering, grammatik xatolaringizni aniqlang va muloyim tushuntirishlar oling.</p>
            </div>
            <div className="feature-box">
              <div className="feature-icon-box orange"><Gamepad2 size={22} /></div>
              <h3>1v1 So‘z Bellashuvi</h3>
              <p>Boshqa o‘quvchilar bilan real vaqtda so‘z boyligingizni sinang, XP to‘plang va yetakchilar safiga kiring.</p>
            </div>
            <div className="feature-box">
              <div className="feature-icon-box green"><ShieldCheck size={22} /></div>
              <h3>Anti-Cheat & Spaced Repetition</h3>
              <p>So‘zlar tasodifiy takrorlanmaydi — ilmiy tasdiqlangan intervallar bilan uzoq muddatli xotiraga ko‘chadi.</p>
            </div>
            <div className="feature-box">
              <div className="feature-icon-box blue"><Users size={22} /></div>
              <h3>Malakali Ustozlar Nazorati</h3>
              <p>Maxsus o‘qituvchilar tizimda sizning yozma insho va vazifalaringizni tekshirib, shaxsiy baho beradi.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. ABOUT US SECTION (With "Batafsil ma'lumot" modal/view) */}
      <section id="about" className="welcome-about-section">
        <div className="section-container">
          <div className="about-wrapper">
            <div className="about-left">
              <span className="section-kicker">BIZ HAQIMIZDA</span>
              <h2>{aboutShort}</h2>
              <p style={{ marginTop: '16px', lineHeight: '1.7', color: 'var(--muted)', fontSize: '15px' }}>
                TILSHUNOS har bir o‘quvchi o‘z sur’atida, aniq xalqaro standartlar asosida va zamonaviy sun’iy
                intellekt yordamida tilni erkin o‘zlashtirishi uchun ishlab chiqilgan.
              </p>

              <button className="about-readmore-btn" onClick={() => setAboutModalOpen(true)}>
                <span>{aboutBtn}</span>
                <ArrowRight size={16} />
              </button>
            </div>

            {/* Team / Leadership spotlight */}
            <div className="about-team-box">
              <h3 className="team-box-title">Loyiha Faollari va Yetakchilari</h3>
              <div className="team-cards-list">
                {teamMembers.map(member => (
                  <div key={member.name} className="team-member-item">
                    <div className="member-avatar">
                      {member.avatar || member.name[0]}
                    </div>
                    <div className="member-info">
                      <strong>{member.name}</strong>
                      <span className="member-role">{member.role}</span>
                      <p className="member-bio">{member.bio}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. FAQ SECTION */}
      <section id="faq" className="welcome-faq-section">
        <div className="section-container">
          <div className="section-header animate-fade-in-up">
            <span className="section-kicker">SAVOLLARGA JAVOBLAR</span>
            <h2>Ko‘p beriladigan savollar (FAQ)</h2>
            <p>Platformadan foydalanish, to‘lovlar va ta’lim jarayoni haqidagi eng muhim ma’lumotlar.</p>
          </div>

          <div className="faq-accordion-list">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div key={faq.q} className={`faq-item ${isOpen ? 'open' : ''}`}>
                  <button
                    className="faq-question-btn"
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    aria-expanded={isOpen}
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                  {isOpen && (
                    <div className="faq-answer-body animate-fade-in">
                      <p>{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 10. FINAL SIGNUP CALL-TO-ACTION */}
      <section className="welcome-final-cta">
        <div className="cta-container">
          <div className="cta-content">
            <span className="cta-kicker"><Sparkles size={14} /> HOZIROQ BOSHLANG</span>
            <h2>Yangi tilni erkin gapirish vaqti keldi</h2>
            <p>Bir necha soniyada bepul ro‘yxatdan o‘ting va birinchi darsingizni bugunoq boshlang.</p>
            <div className="cta-buttons-row">
              <button className="cta-main-btn" onClick={() => onBegin('register')}>
                <span>Bepul hisob yaratish</span>
                <ArrowRight size={18} />
              </button>
              <button className="cta-secondary-btn" onClick={() => onBegin('login')}>
                Tizimga kirish
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 11. DETAILED FOOTER (With Founder and Dynamic Contacts) */}
      <footer className="welcome-footer">
        <div className="footer-container">
          <div className="footer-grid">
            {/* Col 1: Brand & Founder */}
            <div className="footer-col brand-col">
              <div className="footer-brand">
                <span className="brand-icon-box small">
                  <Languages size={18} />
                </span>
                <span className="brand-main">TILSHUNOS<span>.</span></span>
              </div>
              <p className="footer-brand-desc">
                Har bir inson uchun til o‘rganishni qulay, tizimli va maroqli qilishga yo‘naltirilgan zamonaviy ta’lim ekotizimi.
              </p>

              {/* Founder Spotlight */}
              <div className="founder-card">
                <span className="founder-caption">LOYIHA ASOSCHISI</span>
                <strong className="founder-name">{founderName}</strong>
                <p className="founder-text">{founderBio}</p>
              </div>
            </div>

            {/* Col 2: Navigation Links */}
            <div className="footer-col">
              <h4>Platforma</h4>
              <ul className="footer-links-list">
                <li><a href="#preview">Interfeys ko‘rinishi</a></li>
                <li><a href="#cefr">CEFR Standartlari</a></li>
                <li><a href="#skills">5 ta Ko‘nikma</a></li>
                <li><a href="#how-it-works">Qanday ishlaydi?</a></li>
                <li><a href="#features">Imkoniyatlar</a></li>
              </ul>
            </div>

            {/* Col 3: About & Help */}
            <div className="footer-col">
              <h4>Ma’lumotlar</h4>
              <ul className="footer-links-list">
                <li><a href="#about" onClick={(e) => { e.preventDefault(); setAboutModalOpen(true); }}>Biz haqimizda (Batafsil)</a></li>
                <li><a href="#faq">Ko‘p beriladigan savollar</a></li>
                <li><a href="#features">O‘qituvchilar bilan ishlash</a></li>
                <li><button className="footer-text-btn" onClick={() => onBegin('login')}>Hisobga kirish</button></li>
                <li><button className="footer-text-btn" onClick={() => onBegin('register')}>Ro‘yxatdan o‘tish</button></li>
              </ul>
            </div>

            {/* Col 4: Dynamic Contacts (Only shows what Admin enters!) */}
            <div className="footer-col">
              <h4>Aloqa va Tarmoqlar</h4>
              <p className="contacts-intro">Taklif yoki savollaringiz bo‘lsa, biz bilan bog‘laning:</p>
              <div className="dynamic-contacts-list">
                {contacts.telegram && (
                  <a
                    href={contacts.telegram.startsWith('http') ? contacts.telegram : `https://t.me/${contacts.telegram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-pill-item telegram"
                  >
                    <Send size={15} />
                    <span>Telegram: {contacts.telegram}</span>
                  </a>
                )}

                {contacts.instagram && (
                  <a
                    href={contacts.instagram.startsWith('http') ? contacts.instagram : `https://instagram.com/${contacts.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-pill-item instagram"
                  >
                    <ExternalLink size={15} />
                    <span>Instagram: {contacts.instagram}</span>
                  </a>
                )}

                {contacts.email && (
                  <a href={`mailto:${contacts.email}`} className="contact-pill-item email">
                    <span>Email: {contacts.email}</span>
                  </a>
                )}

                {contacts.phone && (
                  <a href={`tel:${contacts.phone}`} className="contact-pill-item phone">
                    <span>Tel: {contacts.phone}</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="footer-bottom-bar">
            <span>{footerText}</span>
            <div className="footer-bottom-links">
              <a href="#about" onClick={(e) => { e.preventDefault(); setAboutModalOpen(true); }}>Maxfiylik siyosati</a>
              <span className="dot-sep">·</span>
              <a href="#about" onClick={(e) => { e.preventDefault(); setAboutModalOpen(true); }}>Foydalanish shartlari</a>
            </div>
          </div>
        </div>
      </footer>

      {/* DEDICATED ABOUT US MODAL / VIEW */}
      {aboutModalOpen && (
        <div className="modal-backdrop" onClick={() => setAboutModalOpen(false)}>
          <div className="modal about-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-heading">
              <div>
                <span className="section-kicker">TILSHUNOS HAQIDA</span>
                <h2>Platforma Missiyasi va Tarixi</h2>
              </div>
              <button className="icon-btn" onClick={() => setAboutModalOpen(false)} aria-label="Yopish">
                <X size={18} />
              </button>
            </div>

            <div className="about-modal-body">
              <div className="about-rich-article">
                <p>{aboutDetailed}</p>

                <h4 style={{ margin: '22px 0 10px', fontSize: '15px' }}>Bizning Asosiy Tamoyillarimiz:</h4>
                <ul style={{ paddingLeft: '20px', lineHeight: '1.8', color: 'var(--muted)', fontSize: '14px' }}>
                  <li><strong>Haqiqiy foyda:</strong> Grammatika quruq yodlanmaydi, kundalik muloqotda sinab ko‘riladi.</li>
                  <li><strong>O‘zbekona yondashuv:</strong> Izohlar va tarjimalar ona tilimizning nozik xususiyatlariga mos holda tayyorlangan.</li>
                  <li><strong>O‘yinlashtirish:</strong> Musobaqalar va yutuqlar o‘rganish ishtiyoqini so‘ndirmaydi.</li>
                </ul>

                <h4 style={{ margin: '26px 0 14px', fontSize: '15px' }}>Loyiha Rahbariyati va Faollari:</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                  {teamMembers.map(m => (
                    <div key={m.name} style={{ background: 'var(--bg)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                      <strong style={{ display: 'block', fontSize: '13px' }}>{m.name}</strong>
                      <span style={{ fontSize: '11px', color: 'var(--purple)', fontWeight: 700 }}>{m.role}</span>
                      <p style={{ margin: '6px 0 0', fontSize: '11px', color: 'var(--muted)', lineHeight: '1.5' }}>{m.bio}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ marginTop: '24px' }}>
              <button className="outline-btn" onClick={() => setAboutModalOpen(false)}>
                Yopish
              </button>
              <button className="primary-btn" onClick={() => { setAboutModalOpen(false); onBegin('register'); }}>
                Bizga qo‘shiling <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
