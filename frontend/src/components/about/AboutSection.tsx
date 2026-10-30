import React from 'react';
import {
  Users, ArrowRight, Target, Cpu, Globe, BookOpen, Star, ChevronRight, Sparkles
} from 'lucide-react';

interface AboutSectionProps {
  cms: any;
  onOpenAbout: () => void;
  dark?: boolean;
}

export function AboutSection({ cms, onOpenAbout, dark }: AboutSectionProps) {
  const founderPhoto = cms?.founderPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
  const founderName = cms?.founderName || 'Soxibjon G‘aybullayev';
  const founderRole = cms?.founderRole || '.NET Developer';

  const aboutShort = cms?.about || 'TILSHUNOS til o‘rganishni tartibli, qiziqarli va shaxsiy maqsadlaringizga mos qilish uchun yaratilayotgan ilg‘or platforma.';
  const aboutDesc = cms?.aboutDetailed || 'TILSHUNOS har bir o‘quvchi o‘z sur’atida, aniq xalqaro standartlar asosida va zamonaviy sun’iy intellekt yordamida tilni erkin o‘zlashtirishi uchun ishlab chiqilgan.';
  const aboutBtn = cms?.aboutButton || 'Batafsil ma’lumot';

  // Desk scene background image (custom or default photorealistic city window desk)
  const deskImage = cms?.aboutDeskImage || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80';

  const valuesList = [
    {
      title: 'Aqlli yondashuv',
      desc: 'Sizning maqsadingiz, vaqtingiz va darajangiz asosida individual o‘quv reja yaratiladi.',
      icon: Target,
      iconColor: '#3b82f6',
      iconBg: 'rgba(59, 130, 246, 0.12)'
    },
    {
      title: 'Zamonaviy texnologiyalar',
      desc: 'Sun’iy intellekt yordamida til o‘rganish jarayoni yanada samarali va qiziqarli bo‘ladi.',
      icon: Cpu,
      iconColor: '#8b5cf6',
      iconBg: 'rgba(139, 92, 246, 0.12)'
    },
    {
      title: 'Xalqaro standartlar',
      desc: 'CEFR darajasidagi standartlar asosida bilimingiz mustahkamlanadi.',
      icon: Globe,
      iconColor: '#10b981',
      iconBg: 'rgba(16, 185, 129, 0.12)'
    },
    {
      title: 'Qulay va moslashuvchan',
      desc: 'Har qanday qurilmada, har qanday vaqtda o‘rganish imkoniyati.',
      icon: BookOpen,
      iconColor: '#f59e0b',
      iconBg: 'rgba(245, 158, 11, 0.12)'
    },
    {
      title: 'Natijaga yo‘naltirilgan',
      desc: 'Muntazam tahlil va progress kuzatuvi orqali real natijalarga erishasiz.',
      icon: Star,
      iconColor: '#ec4899',
      iconBg: 'rgba(236, 72, 153, 0.12)'
    }
  ];

  return (
    <section id="about" className={`about-showcase-section ${dark ? 'dark' : ''}`}>
      {/* Scoped CSS Styles matching the uploaded mockup */}
      <style>{`
        .about-showcase-section {
          background: #f8fafc;
          color: #0f172a;
          padding: 90px 20px 100px;
          position: relative;
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          transition: background-color 0.25s ease, color 0.25s ease;
        }
        .about-showcase-section.dark {
          background: #0b0f19;
          color: #f1f5f9;
        }

        /* Ambient subtle backdrop blobs */
        .as-blob-left {
          position: absolute;
          top: -60px;
          left: -80px;
          width: 440px;
          height: 440px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%);
          filter: blur(50px);
          pointer-events: none;
        }
        .as-blob-right {
          position: absolute;
          top: 40px;
          right: -80px;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.07) 0%, transparent 70%);
          filter: blur(60px);
          pointer-events: none;
        }

        .as-container {
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
          z-index: 10;
        }

        /* Top 2-Column Grid */
        .as-hero-grid {
          display: grid;
          grid-template-columns: 1.15fr 1fr;
          gap: 48px;
          align-items: center;
          margin-bottom: 64px;
        }

        /* Left Content Column */
        .as-left-col {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
        }
        .as-kicker {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 6px 14px;
          border-radius: 100px;
          background: rgba(37, 99, 235, 0.09);
          color: #2563eb;
          font-size: 11.5px;
          font-weight: 800;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          margin-bottom: 20px;
        }
        .about-showcase-section.dark .as-kicker {
          background: rgba(59, 130, 246, 0.15);
          color: #60a5fa;
        }

        .as-main-heading {
          font-size: clamp(26px, 3.2vw, 40px);
          font-weight: 900;
          line-height: 1.25;
          letter-spacing: -0.6px;
          margin: 0 0 18px;
          color: #0f172a;
        }
        .about-showcase-section.dark .as-main-heading {
          color: #ffffff;
        }
        .as-highlight-brand {
          color: #2563eb;
        }
        .about-showcase-section.dark .as-highlight-brand {
          color: #38bdf8;
        }

        .as-paragraph {
          font-size: 15.5px;
          line-height: 1.7;
          color: #475569;
          margin: 0 0 28px;
          max-width: 560px;
        }
        .about-showcase-section.dark .as-paragraph {
          color: #94a3b8;
        }

        .as-cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 13px 26px;
          border-radius: 12px;
          background: #2563eb;
          color: #ffffff;
          font-size: 14.5px;
          font-weight: 750;
          border: none;
          cursor: pointer;
          box-shadow: 0 8px 24px rgba(37, 99, 235, 0.35);
          transition: all 0.22s ease;
        }
        .as-cta-btn:hover {
          background: #1d4ed8;
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(37, 99, 235, 0.45);
        }

        /* Right Visual Column */
        .as-visual-col {
          position: relative;
        }

        /* Large Desk Photo Frame */
        .as-desk-frame {
          position: relative;
          width: 100%;
          height: 380px;
          border-radius: 28px;
          overflow: hidden;
          box-shadow: 0 24px 50px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.05);
        }
        .about-showcase-section.dark .as-desk-frame {
          box-shadow: 0 24px 50px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1);
        }
        .as-desk-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        /* Overlaid Vignette Gradient */
        .as-desk-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.25) 0%, rgba(15, 23, 42, 0.65) 100%);
        }

        /* Overlaid Calligraphy Slogan (Top Right) */
        .as-desk-calligraphy {
          position: absolute;
          top: 24px;
          right: 24px;
          text-align: right;
          color: #ffffff;
          font-family: "Segoe Script", "Brush Script MT", cursive, sans-serif;
          font-size: 19px;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.7);
          line-height: 1.35;
          transform: rotate(-2deg);
        }

        /* Book Stack on Desk (Bottom Left) */
        .as-book-stack {
          position: absolute;
          bottom: 22px;
          left: 24px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          z-index: 5;
        }
        .as-book-spine {
          display: inline-flex;
          align-items: center;
          justify-content: space-between;
          padding: 6px 14px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 800;
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
          letter-spacing: 0.3px;
        }
        .as-book-en { background: #1e3a8a; width: 130px; }
        .as-book-de { background: #1f2937; width: 125px; }
        .as-book-tr { background: #991b1b; width: 120px; }
        .as-book-uz { background: #065f46; width: 115px; }

        /* Laptop with TILSHUNOS Logo (Center Right) */
        .as-desk-laptop-mock {
          position: absolute;
          bottom: 22px;
          right: 30px;
          width: 140px;
          height: 95px;
          background: #334155;
          border-radius: 8px 8px 2px 2px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.2);
          display: grid;
          place-items: center;
        }
        .as-desk-laptop-mock img {
          width: 32px;
          height: 32px;
          object-fit: contain;
          opacity: 0.9;
        }

        /* Coffee Mug with Logo */
        .as-desk-mug {
          position: absolute;
          bottom: 20px;
          right: 185px;
          width: 36px;
          height: 40px;
          background: #1e293b;
          border-radius: 0 0 10px 10px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
          display: grid;
          place-items: center;
          border-top: 2px solid #64748b;
        }
        .as-desk-mug img {
          width: 16px;
          height: 16px;
          object-fit: contain;
        }

        /* Floating Frosted Glass Card: Loyiha Faollari va Yetakchilari */
        .as-floating-team-card {
          position: absolute;
          top: -24px;
          left: -32px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(16px);
          border: 1.5px solid rgba(255, 255, 255, 0.8);
          border-radius: 20px;
          padding: 16px 20px;
          box-shadow: 0 16px 36px rgba(0, 0, 0, 0.12);
          width: 290px;
          z-index: 20;
          cursor: pointer;
          transition: transform 0.25s ease;
        }
        .about-showcase-section.dark .as-floating-team-card {
          background: rgba(24, 28, 46, 0.95);
          border-color: rgba(255, 255, 255, 0.1);
          box-shadow: 0 16px 36px rgba(0, 0, 0, 0.45);
        }
        .as-floating-team-card:hover {
          transform: translateY(-3px);
        }

        .as-team-card-header {
          font-size: 11.5px;
          font-weight: 800;
          color: #64748b;
          margin-bottom: 10px;
          letter-spacing: -0.2px;
        }
        .about-showcase-section.dark .as-team-card-header {
          color: #94a3b8;
        }

        .as-team-member-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .as-member-avatar-wrap {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          overflow: hidden;
          background: #e2e8f0;
          border: 2px solid #2563eb;
          box-shadow: 0 4px 10px rgba(37, 99, 235, 0.25);
          flex-shrink: 0;
        }
        .as-member-avatar-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .as-member-text {
          flex: 1;
          margin-left: 12px;
          text-align: left;
        }
        .as-member-name {
          font-size: 13.5px;
          font-weight: 800;
          color: #0f172a;
          display: block;
        }
        .about-showcase-section.dark .as-member-name {
          color: #ffffff;
        }
        .as-member-badges {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 2px;
        }
        .as-role-badge {
          font-size: 9.5px;
          font-weight: 800;
          padding: 2px 6px;
          border-radius: 4px;
          background: rgba(37, 99, 235, 0.12);
          color: #2563eb;
        }
        .about-showcase-section.dark .as-role-badge {
          background: rgba(59, 130, 246, 0.2);
          color: #60a5fa;
        }
        .as-member-sub {
          font-size: 11px;
          color: #64748b;
        }
        .about-showcase-section.dark .as-member-sub {
          color: #94a3b8;
        }

        /* Bottom Row: 5 Connected Cards */
        .as-bottom-row-wrap {
          position: relative;
          margin-top: 20px;
        }

        /* Dotted horizontal track connecting the 5 cards */
        .as-bottom-row-wrap::before {
          content: "";
          position: absolute;
          top: 36px;
          left: 5%;
          right: 5%;
          height: 2px;
          border-top: 2px dashed rgba(37, 99, 235, 0.25);
          z-index: 1;
        }
        .about-showcase-section.dark .as-bottom-row-wrap::before {
          border-top-color: rgba(56, 189, 248, 0.2);
        }

        .as-cards-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 16px;
          position: relative;
          z-index: 5;
        }

        .as-value-card {
          background: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: 18px;
          padding: 22px 18px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.03);
          transition: all 0.25s ease;
        }
        .about-showcase-section.dark .as-value-card {
          background: #14192b;
          border-color: rgba(255, 255, 255, 0.08);
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.25);
        }
        .as-value-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 32px rgba(37, 99, 235, 0.12);
          border-color: #3b82f6;
        }

        .as-value-icon {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          display: grid;
          place-items: center;
          margin-bottom: 14px;
        }
        .as-value-title {
          font-size: 14.5px;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 6px;
          letter-spacing: -0.2px;
        }
        .about-showcase-section.dark .as-value-title {
          color: #ffffff;
        }
        .as-value-desc {
          font-size: 12.5px;
          line-height: 1.55;
          color: #64748b;
          margin: 0;
        }
        .about-showcase-section.dark .as-value-desc {
          color: #94a3b8;
        }

        /* Responsive Breakpoints */
        @media (max-width: 1024px) {
          .as-hero-grid {
            grid-template-columns: 1fr;
            gap: 50px;
          }
          .as-cards-grid {
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          }
          .as-bottom-row-wrap::before {
            display: none;
          }
        }

        @media (max-width: 640px) {
          .as-floating-team-card {
            position: relative;
            top: 0;
            left: 0;
            width: 100%;
            margin-bottom: 16px;
            box-sizing: border-box;
          }
          .as-desk-frame {
            height: 300px;
          }
          .as-cards-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* Subtle ambient lighting */}
      <div className="as-blob-left" />
      <div className="as-blob-right" />

      <div className="as-container">
        {/* Top 2-Column Hero Grid */}
        <div className="as-hero-grid">
          {/* Left Column: Heading, Paragraph, CTA */}
          <div className="as-left-col">
            <span className="as-kicker">
              <Users size={14} /> BIZ HAQIMIZDA
            </span>

            <h2 className="as-main-heading">
              <span className="as-highlight-brand">TILSHUNOS</span> til o‘rganishni tartibli, qiziqarli va shaxsiy maqsadlaringizga mos qilish uchun yaratilayotgan ilg‘or platforma.
            </h2>

            <p className="as-paragraph">
              {aboutDesc}
            </p>

            <button className="as-cta-btn" onClick={onOpenAbout}>
              <span>{aboutBtn}</span>
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Right Column: Desk Scene with Floating Card */}
          <div className="as-visual-col">
            {/* Floating Card: Loyiha Faollari va Yetakchilari */}
            <div className="as-floating-team-card" onClick={onOpenAbout} title="Batafsil ko‘rish">
              <div className="as-team-card-header">Loyiha Faollari va Yetakchilari</div>
              <div className="as-team-member-row">
                <div className="as-member-avatar-wrap">
                  <img
                    src={founderPhoto}
                    alt={founderName}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
                    }}
                  />
                </div>
                <div className="as-member-text">
                  <span className="as-member-name">{founderName}</span>
                  <div className="as-member-badges">
                    <span className="as-role-badge">CEO</span>
                    <span className="as-member-sub">{founderRole}</span>
                  </div>
                </div>
                <ChevronRight size={18} color="#94a3b8" />
              </div>
            </div>

            {/* Main Desk Frame */}
            <div className="as-desk-frame">
              <img
                src={deskImage}
                alt="TILSHUNOS Study Workspace"
                className="as-desk-img"
              />
              <div className="as-desk-overlay" />

              {/* Top Right Calligraphy Slogan */}
              <div className="as-desk-calligraphy">
                Yaxshiroq til — kengroq<br />imkoniyatlar! ✈️
              </div>

              {/* Book Spines on Desk */}
              <div className="as-book-stack">
                <div className="as-book-spine as-book-en">
                  <span>English</span> <span>🇬🇧</span>
                </div>
                <div className="as-book-spine as-book-de">
                  <span>Deutsch</span> <span>🇩🇪</span>
                </div>
                <div className="as-book-spine as-book-tr">
                  <span>Türkçe</span> <span>🇹🇷</span>
                </div>
                <div className="as-book-spine as-book-uz">
                  <span>O‘zbek tili</span> <span>🇺🇿</span>
                </div>
              </div>

              {/* Laptop with TILSHUNOS Logo */}
              <div className="as-desk-laptop-mock">
                <img
                  src="/brand_logo.png"
                  alt="TILSHUNOS Logo"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/favicon.ico'; }}
                />
              </div>

              {/* Coffee Mug with Logo */}
              <div className="as-desk-mug">
                <img
                  src="/brand_logo.png"
                  alt="TILSHUNOS Mug Logo"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/favicon.ico'; }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row: 5 Connected Value Cards */}
        <div className="as-bottom-row-wrap">
          <div className="as-cards-grid">
            {valuesList.map((val, idx) => {
              const Icon = val.icon;
              return (
                <div key={idx} className="as-value-card">
                  <div className="as-value-icon" style={{ background: val.iconBg, color: val.iconColor }}>
                    <Icon size={22} />
                  </div>
                  <h4 className="as-value-title">{val.title}</h4>
                  <p className="as-value-desc">{val.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

