import React, { useEffect } from 'react';
import {
  Languages, ArrowRight, ArrowLeft, Sun, Moon, Sparkles, ShieldCheck,
  Award, Target, Users, Heart, BookOpen, Send, Check
} from 'lucide-react';
import { CmsConfig } from './WelcomePage';

interface AboutPageProps {
  cms: CmsConfig | null;
  onBack: () => void;
  onBegin: (intent: 'login' | 'register') => void;
  dark: boolean;
  setDark: (val: boolean) => void;
}

export function AboutPage({ cms, onBack, onBegin, dark, setDark }: AboutPageProps) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const handleBack = () => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    onBack();
  };
  const aboutDetailed = cms?.aboutDetailed || `TILSHUNOS — xalqaro CEFR (A1–C2) standartlariga moslashtirilgan, sun’iy intellekt va professional ustozlar metodikasini o‘zida mujassam etgan zamonaviy ta’lim platformasi. Bizning asosiy maqsadimiz — har bir foydalanuvchiga murakkab grammatik qoidalarsiz, interaktiv so‘z o‘yinlari, amaliy audio-dialoglar, yozma tahlil va real muloqot orqali tilni tabiiy o‘zlashtirish imkoniyatini taqdim etishdir.`;

  const founderName = cms?.founderName || 'Soxibjon Gaybullayev';
  const founderBio = cms?.founderBio || `TILSHUNOS platformasi asoschisi. O‘zbekiston yoshlariga jahon tillarini eng samarali va qulay usulda o‘rganish uchun innovatsion ekotizim yaratish ustida ishlaydi.`;

  const teamMembers = Array.isArray(cms?.team) ? cms.team : [
    { name: 'Soxibjon Gaybullayev', role: 'Asoschi & Bosh Muhandis', bio: 'Til o‘rganish texnologiyalari va raqamli ta’lim bo‘yicha mutaxassis.', avatar: 'S' },
    { name: 'Dilnoza Karimova', role: 'Bosh O‘qituvchi & Metodist', bio: 'IELTS va CEFR standartlari bo‘yicha 8 yillik tajribaga ega ustoz.', avatar: 'D' },
    { name: 'Jasur Aliyev', role: 'Ta’lim Koordinatori', bio: 'Talabalar bilan ishlash va interaktiv mashqlar mutaxassisi.', avatar: 'J' }
  ];

  const contacts = cms?.contacts || {
    telegram: '@tilshunos',
    instagram: 'tilshunos_app',
    email: 'soxibgaybullayev439@gmail.com',
    phone: '+998 90 123 45 67'
  };

  const footerText = cms?.footer || '© 2026 TILSHUNOS · Barcha huquqlar himoyalangan';

  return (
    <div className={`about-page-root ${dark ? 'dark' : ''}`}>
      {/* Top Header */}
      <header className="about-page-nav">
        <div className="about-nav-container">
          <div className="about-nav-left">
            <button className="about-back-btn" onClick={handleBack} title="Bosh sahifaga qaytish">
              <ArrowLeft size={18} />
              <span>Bosh sahifa</span>
            </button>
            <div className="nav-divider-v" />
            <button className="about-nav-brand" onClick={handleBack}>
              <span className="brand-icon-box">
                <img src="/brand_logo.png" alt="TILSHUNOS" className="brand-logo-img" />
              </span>
              <span className="brand-main">TILSHUNOS<span className="brand-dot">.</span></span>
            </button>
          </div>

          <div className="about-nav-right">
            <button
              className="theme-toggle-btn"
              onClick={() => setDark(!dark)}
              title={dark ? 'Yorug‘ mavzuga o‘tish' : 'Tungi mavzuga o‘tish'}
              aria-label="Mavzuni almashtirish"
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button className="nav-btn-secondary" onClick={() => onBegin('login')}>
              Kirish
            </button>
            <button className="nav-btn-primary" onClick={() => onBegin('register')}>
              <span>Ro‘yxatdan o‘tish</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="about-hero-banner">
        <div className="about-hero-container animate-fade-in-up">
          <div className="about-hero-badge">
            <Sparkles size={14} />
            <span>TILSHUNOS TA’LIM EKOTIZIMI</span>
          </div>
          <h1>Bizning Tariximiz va <span>Oliy Missiyamiz</span></h1>
          <p>
            Har bir inson uchun til o‘rganishni erkin, tabiiy va yuqori natijali qilish yo‘lida birlashgan
            mutaxassislar hamda innovatsion sun’iy intellekt texnologiyalari.
          </p>
        </div>
      </section>

      {/* Main Article Section */}
      <main className="about-main-content">
        <div className="about-content-container">
          {/* Article Story */}
          <article className="about-story-card animate-fade-in-up">
            <div className="story-header">
              <span className="section-kicker">LOVIHA HAQIDA BATAFSIL</span>
              <h2>Til o‘rganish — imkoniyatlar eshigini ochadi</h2>
            </div>

            <div className="story-paragraphs">
              {aboutDetailed.split('\n').filter(p => p.trim()).map((paragraph, idx) => (
                <p key={idx} className="story-p">{paragraph}</p>
              ))}
            </div>

            {/* Core Values / Principles */}
            <div className="about-values-grid">
              <div className="value-card">
                <div className="value-icon purple"><Target size={22} /></div>
                <h3>Haqiqiy Foyda</h3>
                <p>Quruq grammatika emas, ilk kundan boshlab kundalik real muloqot va amaliyotga urg‘u beramiz.</p>
              </div>
              <div className="value-card">
                <div className="value-icon orange"><Heart size={22} /></div>
                <h3>O‘zbekona Yondashuv</h3>
                <p>Tushuntirishlar va taqqoslashlar ona tilimizning boy lug‘ati va nozik tomonlariga moslashtirilgan.</p>
              </div>
              <div className="value-card">
                <div className="value-icon green"><ShieldCheck size={22} /></div>
                <h3>CEFR Standartlari</h3>
                <p>A1 dan C2 gacha har bir bosqich xalqaro o‘quv mezonlariga to‘liq javob beradigan materiallar bilan boyitilgan.</p>
              </div>
            </div>
          </article>

          {/* Team / Contributors Section */}
          {teamMembers && teamMembers.length > 0 && (
            <section className="about-team-section animate-fade-in-up">
              <div className="section-heading-centered">
                <span className="section-kicker">BIZNING JAMOA</span>
                <h2>Loyiha Faollari va Mutaxassislari</h2>
                <p>Platforma ta’lim metodikasi, texnologik infratuzilmasi va sifatini ta’minlab kelayotgan yetakchilar.</p>
              </div>

              <div className="about-team-grid">
                {teamMembers.map(member => (
                  <div key={member.name} className="team-profile-card">
                    <div className="profile-card-top">
                      <div className="profile-avatar">
                        {member.avatar || member.name[0]?.toUpperCase() || 'F'}
                      </div>
                      <div className="profile-meta">
                        <strong className="profile-name">{member.name}</strong>
                        <span className="profile-role">{member.role}</span>
                      </div>
                    </div>
                    <p className="profile-bio">{member.bio}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Founder Section */}
          <section className="about-founder-spotlight animate-fade-in-up">
            <div className="founder-spotlight-card">
              <div className="founder-avatar-box">
                <span className="founder-letter">{founderName[0]?.toUpperCase() || 'S'}</span>
              </div>
              <div className="founder-details">
                <span className="founder-kicker">LOYIHA ASOSCHISI VA RAHBARI</span>
                <h2>{founderName}</h2>
                <p className="founder-bio-text">{founderBio}</p>
                <div className="founder-quote">
                  “Bizning niyatimiz — O‘zbekiston yoshlariga jahonning istalgan tili bo‘yicha eng sifatli ta’limni o‘z ona tilida va zamonaviy texnologiyalar bilan taqdim etish.”
                </div>
              </div>
            </div>
          </section>

          {/* CTA Row */}
          <section className="about-bottom-cta animate-fade-in-up">
            <h2>O‘rganish sayohatingizni bugun boshlang</h2>
            <p>Hech qanday murakkabliksiz, o‘zingizga mos sur’atda katta natijalarga erishing.</p>
            <div className="about-cta-buttons">
              <button className="primary-btn-large" onClick={() => onBegin('register')}>
                <span>Bepul boshlash</span>
                <ArrowRight size={18} />
              </button>
              <button className="outline-btn-large" onClick={handleBack}>
                <span>← Bosh sahifaga qaytish</span>
              </button>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="about-page-footer">
        <div className="about-footer-container">
          <div className="about-footer-top">
            <div>
              <strong style={{ fontSize: '18px', color: 'var(--text)' }}>TILSHUNOS<span style={{ color: 'var(--purple)' }}>.</span></strong>
              <p style={{ margin: '6px 0 0', fontSize: '13px', color: 'var(--muted)' }}>Ilg‘or til o‘rganish platformasi</p>
            </div>
            <div className="about-footer-contacts">
              {contacts.telegram && (
                <a
                  href={contacts.telegram.startsWith('http') ? contacts.telegram : `https://t.me/${contacts.telegram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-mini-btn"
                >
                  <Send size={14} /> {contacts.telegram}
                </a>
              )}
              {contacts.email && (
                <span className="contact-mini-info">{contacts.email}</span>
              )}
            </div>
          </div>
          <div className="about-footer-bottom">
            <span>{footerText}</span>
            <button className="footer-back-link" onClick={handleBack}>← Bosh sahifa</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
