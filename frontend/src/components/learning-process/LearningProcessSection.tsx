import React from 'react';
import {
  Sparkles, Check, ChevronRight, Play, Volume2, Award,
  Gamepad2, Crown, BookOpen, Headphones, GraduationCap, Briefcase, Users, Target
} from 'lucide-react';
import {
  LearningProcessConfig, LearningProcessStep, DEFAULT_LEARNING_PROCESS_CONFIG
} from '../../data/learningProcessData';

interface LearningProcessSectionProps {
  config?: LearningProcessConfig;
  dark?: boolean;
}

export function LearningProcessSection({ config, dark }: LearningProcessSectionProps) {
  const currentConfig: LearningProcessConfig = config?.steps && config.steps.length > 0
    ? { ...DEFAULT_LEARNING_PROCESS_CONFIG, ...config }
    : DEFAULT_LEARNING_PROCESS_CONFIG;

  const steps = currentConfig.steps;

  return (
    <section id="how-it-works" className="learning-process-section">
      {/* Scoped CSS Styles */}
      <style>{`
        .learning-process-section {
          background: linear-gradient(180deg, #060913 0%, #0a1022 50%, #060913 100%);
          color: #ffffff;
          padding: 80px 20px 100px;
          position: relative;
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }

        /* Ambient Glow Blobs */
        .lp-ambient-blob-1 {
          position: absolute;
          top: 10%;
          left: -100px;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, transparent 70%);
          filter: blur(60px);
          pointer-events: none;
        }
        .lp-ambient-blob-2 {
          position: absolute;
          top: 55%;
          right: -150px;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, transparent 70%);
          filter: blur(80px);
          pointer-events: none;
        }

        .lp-container {
          max-width: 1140px;
          margin: 0 auto;
          position: relative;
          z-index: 10;
        }

        /* Top Hero Header */
        .lp-hero-header {
          display: grid;
          grid-template-columns: 1fr 1.3fr;
          gap: 40px;
          align-items: center;
          margin-bottom: 70px;
        }

        .lp-hero-visual {
          position: relative;
          display: flex;
          justify-content: center;
        }
        .lp-student-img-wrap {
          position: relative;
          width: 280px;
          height: 280px;
          border-radius: 50%;
          padding: 8px;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.5) 0%, rgba(139, 92, 246, 0.3) 100%);
          box-shadow: 0 0 60px rgba(59, 130, 246, 0.25);
        }
        .lp-student-img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
          display: block;
        }

        /* Floating Country Flags */
        .lp-floating-flag {
          position: absolute;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: #1e293b;
          border: 2px solid rgba(255, 255, 255, 0.2);
          display: grid;
          place-items: center;
          font-size: 22px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
          animation: lpFloat 3.6s ease-in-out infinite alternate;
        }
        .lp-flag-1 { top: 10px; left: 15px; animation-delay: 0s; }
        .lp-flag-2 { top: 10px; right: 15px; animation-delay: 0.8s; }
        .lp-flag-3 { bottom: 25px; left: 10px; animation-delay: 1.4s; }
        .lp-flag-4 { bottom: 20px; right: 15px; animation-delay: 2.2s; }

        @keyframes lpFloat {
          0% { transform: translateY(0px) scale(1); }
          100% { transform: translateY(-8px) scale(1.05); }
        }

        .lp-hero-text {
          text-align: left;
        }
        .lp-hero-kicker {
          display: inline-block;
          font-size: 11.5px;
          font-weight: 800;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: #38bdf8;
          margin-bottom: 12px;
        }
        .lp-hero-title {
          font-size: clamp(30px, 4vw, 46px);
          font-weight: 900;
          line-height: 1.2;
          margin: 0 0 16px;
          letter-spacing: -0.8px;
        }
        .lp-hero-title span {
          background: linear-gradient(135deg, #38bdf8 0%, #818cf8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .lp-hero-desc {
          font-size: 16px;
          color: #94a3b8;
          line-height: 1.6;
          margin: 0;
          max-width: 520px;
        }

        /* Steps Container with Flowing Dotted Connector */
        .lp-steps-timeline {
          display: flex;
          flex-direction: column;
          gap: 60px;
          position: relative;
        }

        /* Center connecting dotted line */
        .lp-steps-timeline::before {
          content: "";
          position: absolute;
          top: 40px;
          bottom: 40px;
          left: 50%;
          transform: translateX(-50%);
          width: 2px;
          border-left: 2px dashed rgba(56, 189, 248, 0.35);
          z-index: 1;
        }

        /* Step Row (Desktop Alternating 2-Column) */
        .lp-step-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
          position: relative;
          z-index: 5;
        }

        /* Text Side */
        .lp-step-text-col {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .lp-step-row.reverse .lp-step-text-col {
          order: 2;
        }
        .lp-step-row.reverse .lp-step-card-col {
          order: 1;
        }

        .lp-step-badge-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .lp-step-num-badge {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: #ffffff;
          font-size: 17px;
          font-weight: 900;
          display: grid;
          place-items: center;
          box-shadow: 0 0 24px rgba(59, 130, 246, 0.6);
          border: 2px solid rgba(255, 255, 255, 0.2);
          flex-shrink: 0;
        }
        .lp-step-kicker {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          color: #38bdf8;
        }

        .lp-step-title {
          font-size: 22px;
          font-weight: 850;
          margin: 0;
          color: #ffffff;
          letter-spacing: -0.3px;
        }
        .lp-step-desc {
          font-size: 14.5px;
          color: #94a3b8;
          line-height: 1.65;
          margin: 0;
        }

        /* Screenshot / Mockup Card Side */
        .lp-step-card-col {
          display: flex;
          justify-content: center;
        }

        .lp-custom-img-wrap {
          width: 100%;
          max-width: 460px;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .lp-custom-img {
          width: 100%;
          height: auto;
          display: block;
          object-fit: cover;
        }

        /* Responsive image toggles */
        .lp-img-desktop {
          display: block;
        }
        .lp-img-mobile {
          display: none;
        }

        /* Native Mockup Glass Cards (Identical to Image 2) */
        .lp-mock-card {
          width: 100%;
          max-width: 440px;
          background: rgba(255, 255, 255, 0.96);
          color: #0f172a;
          border-radius: 22px;
          padding: 22px;
          box-shadow: 0 24px 48px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1);
          position: relative;
          overflow: hidden;
          transition: transform 0.3s ease;
        }
        .lp-mock-card:hover {
          transform: translateY(-4px);
        }

        /* Bottom handwritten signature */
        .lp-bottom-quote {
          margin-top: 60px;
          text-align: center;
          position: relative;
        }
        .lp-quote-text {
          font-family: "Segoe Script", "Brush Script MT", cursive, sans-serif;
          font-size: 26px;
          color: #38bdf8;
          text-shadow: 0 0 15px rgba(56, 189, 248, 0.4);
          transform: rotate(-3deg);
          display: inline-block;
        }

        /* Responsive Breakpoints */
        @media (max-width: 899px) {
          .lp-hero-header {
            grid-template-columns: 1fr;
            text-align: center;
            gap: 24px;
          }
          .lp-hero-text {
            text-align: center;
          }
          .lp-hero-desc {
            margin: 0 auto;
          }
          .lp-student-img-wrap {
            width: 200px;
            height: 200px;
          }
          .lp-floating-flag {
            width: 36px;
            height: 36px;
            font-size: 18px;
          }

          /* Single Column on Mobile */
          .lp-steps-timeline::before {
            left: 24px;
          }
          .lp-step-row {
            grid-template-columns: 1fr;
            gap: 20px;
            padding-left: 60px;
          }
          .lp-step-row.reverse .lp-step-text-col {
            order: 1;
          }
          .lp-step-row.reverse .lp-step-card-col {
            order: 2;
          }

          .lp-step-num-badge {
            position: absolute;
            left: 0;
            top: 0;
            width: 44px;
            height: 44px;
            font-size: 15px;
          }

          /* Mobile image shows on mobile screens */
          .lp-img-desktop {
            display: none !important;
          }
          .lp-img-mobile {
            display: block !important;
          }
        }
      `}</style>

      {/* Ambient background glows */}
      <div className="lp-ambient-blob-1" />
      <div className="lp-ambient-blob-2" />

      <div className="lp-container">
        {/* Top Hero Section */}
        <div className="lp-hero-header">
          {/* Left: Student Image with Floating Flags */}
          <div className="lp-hero-visual">
            <div className="lp-student-img-wrap">
              <img
                src={currentConfig.studentImage || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=700&q=80'}
                alt="Til o‘rganuvchi talaba"
                className="lp-student-img"
              />
              {/* Floating Flags */}
              <div className="lp-floating-flag lp-flag-1" title="United Kingdom">🇬🇧</div>
              <div className="lp-floating-flag lp-flag-2" title="France">🇫🇷</div>
              <div className="lp-floating-flag lp-flag-3" title="Germany">🇩🇪</div>
              <div className="lp-floating-flag lp-flag-4" title="Korea">🇰🇷</div>
            </div>
          </div>

          {/* Right: Section Header */}
          <div className="lp-hero-text">
            <span className="lp-hero-kicker">{currentConfig.kicker || 'ODDIY VA TUSHUNARLI'}</span>
            <h2 className="lp-hero-title">
              O‘rganish jarayoni <span>qanday kechadi?</span>
            </h2>
            <p className="lp-hero-desc">
              {currentConfig.subtitle || '7 ta oson qadam orqali maqsadingiz sari ishonch bilan yo‘l oling.'}
            </p>
          </div>
        </div>

        {/* 7 Connected Steps Timeline */}
        <div className="lp-steps-timeline">
          {steps.map((stepItem, idx) => {
            const isReverse = idx % 2 === 1; // Alternates left/right
            const hasCustomImage = Boolean(stepItem.imageDesktop || stepItem.imageMobile);

            return (
              <div
                key={stepItem.step || idx}
                className={`lp-step-row ${isReverse ? 'reverse' : ''}`}
              >
                {/* 1. Text Column */}
                <div className="lp-step-text-col">
                  <div className="lp-step-badge-row">
                    <div className="lp-step-num-badge">
                      {stepItem.step || `0${idx + 1}`}
                    </div>
                    {stepItem.badge && (
                      <span className="lp-step-kicker">{stepItem.badge}</span>
                    )}
                  </div>

                  <h3 className="lp-step-title">{stepItem.title}</h3>
                  <p className="lp-step-desc">{stepItem.desc}</p>
                </div>

                {/* 2. Card / Screenshot Column */}
                <div className="lp-step-card-col">
                  {hasCustomImage ? (
                    /* User-Uploaded Custom Screenshot (Dual format: Desktop & Mobile responsive) */
                    <div className="lp-custom-img-wrap">
                      {stepItem.imageDesktop && (
                        <img
                          src={stepItem.imageDesktop}
                          alt={stepItem.title}
                          className="lp-custom-img lp-img-desktop"
                        />
                      )}
                      {stepItem.imageMobile && (
                        <img
                          src={stepItem.imageMobile}
                          alt={stepItem.title}
                          className="lp-custom-img lp-img-mobile"
                        />
                      )}
                      {/* Fallback if only one of them is provided */}
                      {!stepItem.imageMobile && stepItem.imageDesktop && (
                        <img
                          src={stepItem.imageDesktop}
                          alt={stepItem.title}
                          className="lp-custom-img lp-img-mobile"
                        />
                      )}
                      {!stepItem.imageDesktop && stepItem.imageMobile && (
                        <img
                          src={stepItem.imageMobile}
                          alt={stepItem.title}
                          className="lp-custom-img lp-img-desktop"
                        />
                      )}
                    </div>
                  ) : (
                    /* Default Pixel-Perfect Interactive UI Mockup (Matches Image 2 exactly) */
                    <RenderStepMockup stepIndex={idx} />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Handwritten Signature Calligraphy */}
        <div className="lp-bottom-quote">
          <div className="lp-quote-text">
            ✍️ {currentConfig.bottomQuote || 'Katta imkoniyatlar sizni kutmoqda!'}
          </div>
        </div>
      </div>
    </section>
  );
}

/* =====================================================================
   PIXEL-PERFECT STEP MOCKUPS MATCHING IMAGE 2 EXACTLY
   ===================================================================== */
function RenderStepMockup({ stepIndex }: { stepIndex: number }) {
  switch (stepIndex) {
    case 0: // Step 01: Language Choice Card
      return (
        <div className="lp-mock-card" style={{ maxWidth: '380px' }}>
          <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#334155', marginBottom: '14px' }}>
            Qaysi tilda o‘qishni xohlaysiz?
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { flag: '🇬🇧', name: 'Ingliz tili', sub: '(English)' },
              { flag: '🇹🇷', name: 'Turk tili', sub: '(Turkish)' },
              { flag: '🇩🇪', name: 'Nemis tili', sub: '(German)' },
              { flag: '🇷🇺', name: 'Rus tili', sub: '(Russian)' }
            ].map((lang, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  fontSize: '13px',
                  fontWeight: 700
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '18px' }}>{lang.flag}</span>
                  <div>
                    <span style={{ color: '#0f172a' }}>{lang.name}</span>{' '}
                    <small style={{ color: '#64748b', fontSize: '11px' }}>{lang.sub}</small>
                  </div>
                </div>
                <ChevronRight size={15} color="#94a3b8" />
              </div>
            ))}
          </div>
        </div>
      );

    case 1: // Step 02: Study Plan & Video/Audio Lesson
      return (
        <div className="lp-mock-card" style={{ maxWidth: '420px', background: '#1e293b', color: '#ffffff' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#38bdf8', fontWeight: 700 }}>
              <Headphones size={13} /> Listening darsi
            </div>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>8 / 10</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px', alignItems: 'center' }}>
            <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', height: '110px' }}>
              <img
                src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80"
                alt="Lesson"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'grid', placeItems: 'center' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#3b82f6', display: 'grid', placeItems: 'center' }}>
                  <Play size={14} fill="#fff" />
                </div>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Amaliy bo‘lim:</div>
              <div style={{ height: '6px', background: 'rgba(255,255,255,0.15)', borderRadius: '6px', marginBottom: '8px', overflow: 'hidden' }}>
                <div style={{ width: '75%', height: '100%', background: '#38bdf8' }} />
              </div>
              <button style={{ width: '100%', padding: '6px 12px', borderRadius: '8px', background: '#3b82f6', color: '#fff', border: 'none', fontSize: '11.5px', fontWeight: 700, cursor: 'pointer' }}>
                Keyingi &gt;
              </button>
            </div>
          </div>
        </div>
      );

    case 2: // Step 03: Vocabulary Flashcard
      return (
        <div className="lp-mock-card" style={{ maxWidth: '400px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '14px', alignItems: 'center' }}>
            <div style={{ borderRadius: '12px', overflow: 'hidden', height: '120px' }}>
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=400&q=80"
                alt="Teacher"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            <div>
              <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>New words</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '4px 0' }}>
                <strong style={{ fontSize: '18px', color: '#0f172a' }}>hello</strong>
                <Volume2 size={16} color="#3b82f6" />
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>/həˈləʊ/</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#10b981', margin: '4px 0 10px' }}>( salom )</div>
              <button style={{ width: '100%', padding: '6px', borderRadius: '8px', background: '#3b82f6', color: '#fff', border: 'none', fontSize: '11px', fontWeight: 800 }}>
                Keyingi &gt;
              </button>
            </div>
          </div>
        </div>
      );

    case 3: // Step 04: Practice & Word Games
      return (
        <div className="lp-mock-card" style={{ maxWidth: '400px', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: '#ffffff', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#38bdf8' }}>Amaliyot va so‘z o‘yinlari</span>
            <Gamepad2 size={16} color="#38bdf8" />
          </div>

          <div style={{ fontSize: '13px', marginBottom: '12px', color: '#e2e8f0' }}>
            I <span style={{ textDecoration: 'underline', color: '#38bdf8' }}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span> to school every day.
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ padding: '8px 12px', borderRadius: '8px', background: '#10b981', color: '#ffffff', fontSize: '12.5px', fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>go</span>
              <Check size={14} />
            </div>
            <div style={{ padding: '7px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', color: '#94a3b8', fontSize: '12px' }}>
              going
            </div>
            <div style={{ padding: '7px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', color: '#94a3b8', fontSize: '12px' }}>
              gone
            </div>
          </div>
        </div>
      );

    case 4: // Step 05: Results & Growth Circular Gauge
      return (
        <div className="lp-mock-card" style={{ maxWidth: '400px' }}>
          <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
            Sizning natijalaringiz
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: '16px', alignItems: 'center' }}>
            {/* Circular Gauge */}
            <div style={{ position: 'relative', width: '100px', height: '100px', display: 'grid', placeItems: 'center' }}>
              <svg width="100" height="100" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="8"
                  strokeDasharray="251.2"
                  strokeDashoffset="55"
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                />
              </svg>
              <div style={{ position: 'absolute', textAlign: 'center' }}>
                <strong style={{ fontSize: '18px', color: '#0f172a', display: 'block' }}>78%</strong>
                <small style={{ fontSize: '9px', color: '#64748b' }}>Umumiy natija</small>
              </div>
            </div>

            {/* Breakdown List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11.5px', color: '#475569' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>📖 Vocabulary</span> <strong style={{ color: '#0f172a' }}>85%</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>✨ Grammar</span> <strong style={{ color: '#0f172a' }}>72%</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>🎧 Listening</span> <strong style={{ color: '#0f172a' }}>68%</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>🎙️ Speaking</span> <strong style={{ color: '#0f172a' }}>64%</strong>
              </div>
            </div>
          </div>
        </div>
      );

    case 5: // Step 06: Knowledge Consolidation Postcard (New Opportunities)
      return (
        <div className="lp-mock-card" style={{ maxWidth: '420px', padding: 0, overflow: 'hidden' }}>
          <div style={{ position: 'relative', height: '160px' }}>
            <img
              src="https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=600&q=80"
              alt="London Big Ben Opportunities"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.6) 100%)' }} />
            <div style={{ position: 'absolute', bottom: '12px', left: '16px', color: '#ffffff' }}>
              <div style={{ fontStyle: 'italic', fontFamily: 'serif', fontSize: '20px', fontWeight: 700, textShadow: '0 2px 4px rgba(0,0,0,0.6)' }}>
                New Opportunities
              </div>
              <div style={{ fontSize: '11px', color: '#e2e8f0' }}>London · Oxford · Global CEFR</div>
            </div>
          </div>
        </div>
      );

    case 6: // Step 07: Final Benefits Card (Crown & Checklist)
    default:
      return (
        <div className="lp-mock-card" style={{ maxWidth: '400px', background: '#1e293b', color: '#ffffff' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#38bdf8' }}>Ekotizim afzalliklari</span>
            <Crown size={18} color="#f59e0b" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12.5px' }}>
            {[
              { icon: GraduationCap, text: 'Chet elda ta’lim olish' },
              { icon: Briefcase, text: 'Yaxshiroq ish imkoniyatlari' },
              { icon: Users, text: 'Yangi do‘stlar va xalqaro muloqot' },
              { icon: Target, text: 'O‘z maqsadlaringizga erishish' }
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Icon size={14} color="#38bdf8" />
                    <span>{item.text}</span>
                  </div>
                  <Check size={14} color="#10b981" />
                </div>
              );
            })}
          </div>
        </div>
      );
  }
}
