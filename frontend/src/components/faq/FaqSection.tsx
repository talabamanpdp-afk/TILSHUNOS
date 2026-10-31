import React, { useState } from 'react';
import {
  HelpCircle, ChevronUp, ChevronDown, GraduationCap,
  CreditCard, Smartphone, BookOpen, Sparkles, Target, Award, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FaqItem {
  q: string;
  a: string;
}

interface FaqSectionProps {
  faqs?: FaqItem[];
  dark?: boolean;
}

export function FaqSection({ faqs, dark }: FaqSectionProps) {
  // First item open by default (matching the reference image)
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const defaultFaqs: FaqItem[] = [
    {
      q: 'TILŞUNOS platformasidan foydalaniş bepulmi?',
      a: 'Ha, asosiy funksiyalar — söz yodlaş, maşqlar, CEFR reading va listening materiallari barça uçun bepul.'
    },
    {
      q: 'CEFR darajalarini qanday aniqlayman?',
      a: 'Röyxatdan ötiş çoğida darajangizni (A1–C2) özingiz belgilaşingiz yoki diagnostik test orqali aniqlab olişingiz mumkin.'
    },
    {
      q: 'Mobil qurilmalarda işlaydimi?',
      a: 'Ha, TILŞUNOS responsive veb-ilova va PWA (Progressive Web App) sifatida smartfon va planşetlarda qulay işlaydi.'
    },
    {
      q: 'Öqituvçi bilan qanday boğlanaman?',
      a: 'Platformadagi Öqituvçilar bölimi orqali tasdiqlangan ustozlar bilan boğlanib, şaxsiy topşiriqlar olişingiz mumkin.'
    }
  ];

  const currentFaqs = Array.isArray(faqs) && faqs.length > 0 ? faqs : defaultFaqs;

  // Thematic circular badge icons matching reference image
  const getFaqBadge = (index: number, questionText: string, isOpen: boolean) => {
    const qLower = questionText.toLowerCase();

    if (qLower.includes('bepul') || qLower.includes('ta’lim') || index === 0) {
      return {
        icon: GraduationCap,
        bg: isOpen ? '#2563eb' : 'rgba(37, 99, 235, 0.25)',
        color: '#ffffff',
        border: 'rgba(96, 165, 250, 0.4)'
      };
    }
    if (qLower.includes('daraja') || qLower.includes('cefr') || qLower.includes('to‘lov') || index === 1) {
      return {
        icon: CreditCard,
        bg: isOpen ? '#2563eb' : 'rgba(37, 99, 235, 0.35)',
        color: '#ffffff',
        border: 'rgba(96, 165, 250, 0.3)'
      };
    }
    if (qLower.includes('mobil') || qLower.includes('ilova') || qLower.includes('qurilma') || index === 2) {
      return {
        icon: Smartphone,
        bg: isOpen ? '#059669' : 'rgba(5, 150, 105, 0.35)',
        color: '#ffffff',
        border: 'rgba(52, 211, 153, 0.3)'
      };
    }
    if (qLower.includes('o‘qituvchi') || qLower.includes('ustoz') || qLower.includes('bog‘lan') || index === 3) {
      return {
        icon: BookOpen,
        bg: isOpen ? '#7c3aed' : 'rgba(124, 58, 237, 0.35)',
        color: '#ffffff',
        border: 'rgba(192, 132, 252, 0.3)'
      };
    }

    // Dynamic cycling for any additional questions added by Admin
    const cycle = [
      { icon: Sparkles, bg: isOpen ? '#d97706' : 'rgba(217, 119, 6, 0.35)', color: '#ffffff', border: 'rgba(251, 191, 36, 0.3)' },
      { icon: Target, bg: isOpen ? '#db2777' : 'rgba(219, 39, 119, 0.35)', color: '#ffffff', border: 'rgba(244, 114, 182, 0.3)' },
      { icon: Award, bg: isOpen ? '#0284c7' : 'rgba(2, 132, 199, 0.35)', color: '#ffffff', border: 'rgba(56, 189, 248, 0.3)' },
      { icon: Zap, bg: isOpen ? '#4f46e5' : 'rgba(79, 70, 229, 0.35)', color: '#ffffff', border: 'rgba(129, 140, 248, 0.3)' }
    ];
    return cycle[index % cycle.length];
  };

  return (
    <section id="faq" className={`faq-modern-section ${dark ? 'is-dark' : 'is-light'}`}>
      {/* Scoped CSS Styles strictly mirroring reference image */}
      <style>{`
        .faq-modern-section {
          background: linear-gradient(180deg, #060913 0%, #0a1022 50%, #060913 100%);
          color: #ffffff;
          padding: 85px 20px 105px;
          position: relative;
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          transition: background 0.3s ease, color 0.3s ease;
        }

        /* 100% LIGHT MODE SUPPORT */
        .faq-modern-section.is-light {
          background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 50%, #f8fafc 100%) !important;
          color: #0f172a !important;
        }
        .faq-modern-section.is-light .faq-kicker-badge {
          background: rgba(37, 99, 235, 0.08) !important;
          border-color: rgba(37, 99, 235, 0.25) !important;
          color: #2563eb !important;
        }
        .faq-modern-section.is-light .faq-main-title {
          color: #0f172a !important;
        }
        .faq-modern-section.is-light .faq-subtitle {
          color: #475569 !important;
        }
        .faq-modern-section.is-light .faq-calligraphy-text {
          color: #2563eb !important;
        }
        .faq-modern-section.is-light .faq-card-item {
          background: rgba(255, 255, 255, 0.96) !important;
          border: 1.5px solid rgba(226, 232, 240, 0.95) !important;
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.04) !important;
        }
        .faq-modern-section.is-light .faq-card-item.open {
          border-color: rgba(37, 99, 235, 0.4) !important;
          box-shadow: 0 14px 35px rgba(37, 99, 235, 0.1) !important;
        }
        .faq-modern-section.is-light .faq-question-title {
          color: #0f172a !important;
        }
        .faq-modern-section.is-light .faq-chevron-icon {
          color: #2563eb !important;
        }
        .faq-modern-section.is-light .faq-card-item:not(.open) .faq-chevron-icon {
          color: #64748b !important;
        }
        .faq-modern-section.is-light .faq-answer-panel p {
          color: #475569 !important;
        }

        /* Ambient glowing backdrop spots */
        .faq-glow-left {
          position: absolute;
          top: 8%;
          left: -120px;
          width: 520px;
          height: 520px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(37, 99, 235, 0.16) 0%, transparent 70%);
          filter: blur(70px);
          pointer-events: none;
        }
        .faq-glow-right {
          position: absolute;
          top: 15%;
          right: -100px;
          width: 480px;
          height: 480px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.14) 0%, transparent 70%);
          filter: blur(80px);
          pointer-events: none;
        }

        .faq-container {
          max-width: 1100px;
          margin: 0 auto;
          position: relative;
          z-index: 10;
        }

        /* Top Header Grid with Left 3D Art, Center Info, Right Calligraphy */
        .faq-header-grid {
          display: grid;
          grid-template-columns: 180px 1fr 180px;
          align-items: center;
          gap: 20px;
          margin-bottom: 50px;
          position: relative;
        }

        /* Left 3D Floating Speech Bubble Graphic */
        .faq-left-art {
          display: flex;
          justify-content: flex-start;
          align-items: center;
        }
        .faq-bubble-svg-wrap {
          width: 145px;
          height: 125px;
          filter: drop-shadow(0 14px 28px rgba(37, 99, 235, 0.35));
          animation: faqFloat 3.8s ease-in-out infinite alternate;
        }
        @keyframes faqFloat {
          0% { transform: translateY(0px) rotate(0deg); }
          100% { transform: translateY(-7px) rotate(-1.5deg); }
        }

        /* Center Content Column */
        .faq-center-col {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        /* Kicker Badge */
        .faq-kicker-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 6px 16px;
          border-radius: 100px;
          background: rgba(30, 58, 138, 0.4);
          border: 1px solid rgba(96, 165, 250, 0.3);
          color: #93c5fd;
          font-size: 11.5px;
          font-weight: 800;
          letter-spacing: 0.9px;
          text-transform: uppercase;
          margin-bottom: 16px;
          backdrop-filter: blur(8px);
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.2);
        }

        /* Main Heading */
        .faq-main-title {
          font-size: clamp(28px, 3.8vw, 44px);
          font-weight: 900;
          line-height: 1.22;
          margin: 0 0 14px;
          letter-spacing: -0.6px;
          color: #ffffff;
        }
        .faq-main-title .faq-gradient-text {
          background: linear-gradient(135deg, #38bdf8 0%, #a855f7 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .faq-subtitle {
          font-size: 15.5px;
          line-height: 1.6;
          color: #94a3b8;
          max-width: 620px;
          margin: 0;
        }

        /* Right Handwritten Calligraphy Note & Curved Arrow */
        .faq-right-art {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          justify-content: center;
          text-align: right;
          position: relative;
        }
        .faq-calligraphy-text {
          font-family: "Segoe Script", "Brush Script MT", cursive, sans-serif;
          font-size: 16px;
          line-height: 1.35;
          color: #7dd3fc;
          text-shadow: 0 0 12px rgba(56, 189, 248, 0.4);
          transform: rotate(-3deg);
          white-space: nowrap;
        }
        .faq-calligraphy-arrow {
          width: 50px;
          height: 44px;
          margin-top: 4px;
          margin-right: 25px;
          filter: drop-shadow(0 2px 8px rgba(56, 189, 248, 0.4));
        }

        /* FAQ Accordion List Container */
        .faq-accordion-container {
          max-width: 860px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        /* Individual FAQ Card */
        .faq-card-item {
          background: rgba(15, 23, 42, 0.65);
          backdrop-filter: blur(14px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          overflow: hidden;
          transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
        }
        .faq-card-item:hover {
          background: rgba(30, 41, 59, 0.75);
          border-color: rgba(96, 165, 250, 0.3);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
        }

        /* Open / Active FAQ Card (Signature Vibrant Blue Glass) */
        .faq-card-item.open {
          background: linear-gradient(135deg, rgba(30, 64, 175, 0.6) 0%, rgba(37, 99, 235, 0.4) 50%, rgba(29, 78, 216, 0.5) 100%);
          backdrop-filter: blur(18px);
          border: 1.5px solid rgba(96, 165, 250, 0.45);
          box-shadow: 0 16px 36px rgba(37, 99, 235, 0.28), 0 0 25px rgba(59, 130, 246, 0.18), inset 0 1px 1px rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
        }

        /* Clickable Question Header */
        .faq-header-btn {
          width: 100%;
          padding: 18px 22px;
          background: transparent;
          border: none;
          display: flex;
          align-items: center;
          justify-content: space-between;
          text-align: left;
          cursor: pointer;
          gap: 16px;
        }

        .faq-btn-left {
          display: flex;
          align-items: center;
          gap: 16px;
          flex: 1;
        }

        /* Circular Icon Badge */
        .faq-icon-badge {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
          transition: transform 0.25s ease;
        }
        .faq-card-item:hover .faq-icon-badge {
          transform: scale(1.05);
        }

        .faq-question-title {
          font-size: 15.5px;
          font-weight: 750;
          color: #ffffff;
          line-height: 1.4;
          letter-spacing: -0.2px;
          margin: 0;
        }

        .faq-chevron-icon {
          color: #ffffff;
          flex-shrink: 0;
          transition: transform 0.25s ease;
        }
        .faq-card-item:not(.open) .faq-chevron-icon {
          color: #94a3b8;
        }

        /* Answer Content Body */
        .faq-answer-panel {
          padding: 0 24px 20px 80px;
          font-size: 14.5px;
          line-height: 1.68;
          color: #e2e8f0;
          animation: faqFadeSlide 0.25s ease;
        }
        .faq-answer-panel p {
          margin: 0;
        }
        @keyframes faqFadeSlide {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Responsive Breakpoints */
        @media (max-width: 900px) {
          .faq-header-grid {
            grid-template-columns: 1fr;
            text-align: center;
            gap: 24px;
            margin-bottom: 40px;
          }
          .faq-left-art, .faq-right-art {
            display: none;
          }
          .faq-center-col {
            padding: 0 10px;
          }
        }

        @media (max-width: 640px) {
          .faq-modern-section {
            padding: 55px 16px 70px;
          }
          .faq-header-btn {
            padding: 14px 16px;
            gap: 12px;
          }
          .faq-btn-left {
            gap: 12px;
          }
          .faq-icon-badge {
            width: 36px;
            height: 36px;
          }
          .faq-question-title {
            font-size: 14px;
          }
          .faq-answer-panel {
            padding: 0 16px 16px 64px;
            font-size: 13.5px;
            line-height: 1.6;
          }
        }
      `}</style>

      {/* Ambient background glows */}
      <div className="faq-glow-left" />
      <div className="faq-glow-right" />

      <div className="faq-container">
        {/* Top Header Grid */}
        <div className="faq-header-grid">
          {/* Left: 3D Floating Speech Bubbles Graphic */}
          <div className="faq-left-art" aria-hidden="true">
            <svg
              className="faq-bubble-svg-wrap"
              viewBox="0 0 150 130"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* Blue Front Bubble Gradient */}
                <linearGradient id="blueFrontGrad" x1="15" y1="10" x2="105" y2="100" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#60a5fa" />
                  <stop offset="45%" stopColor="#2563eb" />
                  <stop offset="100%" stopColor="#1d4ed8" />
                </linearGradient>
                {/* Purple Back Bubble Gradient */}
                <linearGradient id="purpleBackGrad" x1="75" y1="40" x2="140" y2="105" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#c084fc" />
                  <stop offset="50%" stopColor="#9333ea" />
                  <stop offset="100%" stopColor="#6b21a8" />
                </linearGradient>
                {/* Question mark bevel gradient */}
                <linearGradient id="qMarkGrad" x1="55" y1="28" x2="55" y2="68" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="100%" stopColor="#dbeafe" />
                </linearGradient>
                {/* Soft drop shadows */}
                <filter id="softShadow" x="-10" y="-10" width="170" height="150" filterUnits="userSpaceOnUse">
                  <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#1e3a8a" floodOpacity="0.4" />
                </filter>
              </defs>

              {/* 1. Purple Background Bubble with Chat Dots */}
              <g filter="url(#softShadow)">
                <rect x="72" y="44" width="62" height="48" rx="18" fill="url(#purpleBackGrad)" />
                {/* Tail pointing down-right */}
                <path d="M 116 88 C 122 96, 128 102, 134 104 C 129 99, 125 93, 122 88 Z" fill="#7e22ce" />
                {/* 3 Chat Dots */}
                <circle cx="91" cy="68" r="3.2" fill="#ffffff" opacity="0.9" />
                <circle cx="103" cy="68" r="3.2" fill="#ffffff" opacity="0.9" />
                <circle cx="115" cy="68" r="3.2" fill="#ffffff" opacity="0.9" />
              </g>

              {/* 2. Main Blue 3D Bubble */}
              <g filter="url(#softShadow)">
                <rect x="18" y="16" width="82" height="74" rx="24" fill="url(#blueFrontGrad)" />
                {/* Subtle top-left gloss curve */}
                <path d="M 28 22 C 38 18, 70 18, 86 24" stroke="rgba(255,255,255,0.4)" strokeWidth="3" strokeLinecap="round" />
                {/* Tail pointing down-left */}
                <path d="M 30 86 C 22 96, 12 102, 8 104 C 16 99, 22 92, 28 86 Z" fill="#1d4ed8" />

                {/* 3D Bold Question Mark '?' */}
                <text
                  x="59"
                  y="66"
                  textAnchor="middle"
                  fill="url(#qMarkGrad)"
                  fontSize="44"
                  fontWeight="900"
                  fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                  style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.25))' }}
                >
                  ?
                </text>
              </g>

              {/* 3. Small Radiant Particles / Rays */}
              <rect x="88" y="8" width="4.5" height="12" rx="2" transform="rotate(38 88 8)" fill="#93c5fd" opacity="0.9" />
              <rect x="100" y="20" width="4" height="10" rx="2" transform="rotate(70 100 20)" fill="#60a5fa" opacity="0.8" />
              <rect x="6" y="55" width="4" height="11" rx="2" transform="rotate(-40 6 55)" fill="#60a5fa" opacity="0.8" />
              <rect x="10" y="70" width="3.5" height="9" rx="1.75" transform="rotate(-65 10 70)" fill="#93c5fd" opacity="0.7" />
            </svg>
          </div>

          {/* Center: Section Kicker, Main Heading, Subtitle */}
          <div className="faq-center-col">
            <span className="faq-kicker-badge">
              <HelpCircle size={14} color="#60a5fa" />
              SAVOLLARGA JAVOBLAR
            </span>

            <h2 className="faq-main-title">
              Köp beriladigan <br />
              savollar <span className="faq-gradient-text">(FAQ)</span>
            </h2>

            <p className="faq-subtitle">
              Platformadan foydalaniş, tölovlar va ta’lim jarayoni haqidagi eng muhim ma’lumotlar şu yerda jamlangan.
            </p>
          </div>

          {/* Right: Handwritten Script Slogan with Curved Arrow */}
          <div className="faq-right-art" aria-hidden="true">
            <div className="faq-calligraphy-text">
              Savolingiz bormi?<br />
              Javobini shu yerda topasiz!
            </div>

            <svg
              className="faq-calligraphy-arrow"
              viewBox="0 0 50 45"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Curved dotted hand-drawn arrow pointing down-left */}
              <path
                d="M 36 6 C 35 22, 22 28, 8 32"
                stroke="#38bdf8"
                strokeWidth="2.2"
                strokeDasharray="4 3"
                strokeLinecap="round"
              />
              <path
                d="M 16 26 L 6 33 L 13 39"
                stroke="#38bdf8"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* FAQ Accordion List Cards with Staggered Entrance & Smooth Height Springs */}
        <div className="faq-accordion-container">
          {currentFaqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            const badge = getFaqBadge(idx, faq.q, isOpen);
            const Icon = badge.icon;

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 24, scale: 0.985 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: false, amount: 0.2, margin: '0px 0px -80px 0px' }}
                transition={{ duration: 0.46, delay: idx * 0.035, ease: [0.22, 1, 0.36, 1] }}
                className={`faq-card-item ${isOpen ? 'open' : ''}`}
                style={{
                  transform: 'translateZ(0)',
                  willChange: 'transform, opacity',
                  boxShadow: isOpen
                    ? '0 16px 36px rgba(37, 99, 235, 0.28), 0 0 25px rgba(59, 130, 246, 0.25)'
                    : undefined
                }}
              >
                <button
                  type="button"
                  className="faq-header-btn"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  aria-expanded={isOpen}
                >
                  <div className="faq-btn-left">
                    <motion.div
                      className="faq-icon-badge"
                      style={{
                        background: badge.bg,
                        color: badge.color,
                        border: `1.5px solid ${badge.border}`
                      }}
                      whileHover={{ scale: 1.12, rotate: 6 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                    >
                      <Icon size={20} />
                    </motion.div>

                    <h3 className="faq-question-title">
                      {faq.q}
                    </h3>
                  </div>

                  <motion.div
                    className="faq-chevron-icon"
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  >
                    <ChevronDown size={22} />
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="answer"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div className="faq-answer-panel">
                        <motion.p
                          initial={{ y: 8, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ duration: 0.3, delay: 0.05 }}
                        >
                          {faq.a}
                        </motion.p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

