import React from 'react';
import { Sparkles, Rocket, Play, ArrowRight } from 'lucide-react';

interface FinalCtaSectionProps {
  kicker?: string;
  title?: string;
  desc?: string;
  btnRegister?: string;
  btnLogin?: string;
  onRegister: () => void;
  onLogin: () => void;
  dark?: boolean;
}

export function FinalCtaSection({
  kicker = "BIZ BILAN ÖRGANING",
  title = "Yangi tilni erkin gapiriş vaqti keldi",
  desc = "Til örganiş — yangi imkoniyatlar eşiklarini oçadi. Biz siz bilan birga bu yölda!",
  btnRegister = "Bepul hisob yaratiş",
  btnLogin = "Tizimga kiriş",
  onRegister,
  onLogin,
  dark
}: FinalCtaSectionProps) {
  // Render title with gradient highlight on "erkin gapiriş" (or legacy "erkin gapirish")
  const renderTitle = (rawTitle: string) => {
    const targetWord = rawTitle.includes('erkin gapiriş')
      ? 'erkin gapiriş'
      : rawTitle.includes('erkin gapirish')
      ? 'erkin gapirish'
      : null;

    if (targetWord) {
      const parts = rawTitle.split(targetWord);
      return (
        <>
          {parts[0]}
          <span className="final-cta-gradient-word">{targetWord}</span>
          {parts[1]}
        </>
      );
    }
    return rawTitle;
  };

  return (
    <section className={`welcome-final-cta-section ${dark ? 'is-dark' : 'is-light'}`}>
      <style>{`
        /* ========================================================
           FINAL CALL-TO-ACTION SECTION (MATCHING REFERENCE MOCKUP)
           ======================================================== */
        .welcome-final-cta-section {
          padding: 80px 24px 100px;
          background: linear-gradient(180deg, #060913 0%, #0a1022 50%, #060913 100%);
          position: relative;
          overflow: hidden;
          transition: background 0.3s ease, color 0.3s ease;
        }

        /* 100% LIGHT MODE SUPPORT */
        .welcome-final-cta-section.is-light {
          background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 50%, #f8fafc 100%) !important;
          color: #0f172a !important;
        }
        .welcome-final-cta-section.is-light .final-cta-floating-card {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.98) 100%) !important;
          border: 1.5px solid rgba(226, 232, 240, 0.95) !important;
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.08), 0 0 45px rgba(37, 99, 235, 0.08) !important;
        }
        .welcome-final-cta-section.is-light .final-cta-kicker {
          background: rgba(37, 99, 235, 0.08) !important;
          border-color: rgba(37, 99, 235, 0.25) !important;
          color: #2563eb !important;
          box-shadow: 0 0 16px rgba(37, 99, 235, 0.1) !important;
        }
        .welcome-final-cta-section.is-light .final-cta-title {
          color: #0f172a !important;
        }
        .welcome-final-cta-section.is-light .final-cta-desc {
          color: #475569 !important;
        }
        .welcome-final-cta-section.is-light .final-cta-btn-secondary {
          background: #ffffff !important;
          border: 1.5px solid rgba(226, 232, 240, 0.95) !important;
          color: #0f172a !important;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.04) !important;
        }
        .welcome-final-cta-section.is-light .final-cta-btn-secondary:hover {
          background: #f8fafc !important;
          border-color: rgba(37, 99, 235, 0.4) !important;
          color: #2563eb !important;
        }
        .welcome-final-cta-section.is-light .btn-play-circle {
          background: rgba(37, 99, 235, 0.1) !important;
          color: #2563eb !important;
        }

        .final-cta-floating-card {
          max-width: 1200px;
          margin: 0 auto;
          border-radius: 32px;
          background: linear-gradient(135deg, rgba(14, 28, 64, 0.88) 0%, rgba(10, 20, 50, 0.92) 100%);
          border: 1.5px solid rgba(59, 130, 246, 0.35);
          box-shadow: 0 24px 70px rgba(0, 0, 0, 0.55), 0 0 50px rgba(37, 99, 235, 0.22);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          display: grid;
          grid-template-columns: minmax(220px, 280px) 1fr minmax(220px, 280px);
          align-items: center;
          padding: 44px 36px;
          position: relative;
          overflow: hidden;
        }

        /* Ambient Glow Layers */
        .final-cta-ambient-glow-left {
          position: absolute;
          left: -40px;
          top: 50%;
          transform: translateY(-50%);
          width: 260px;
          height: 260px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%);
          pointer-events: none;
        }
        .final-cta-ambient-glow-right {
          position: absolute;
          right: -40px;
          top: 50%;
          transform: translateY(-50%);
          width: 260px;
          height: 260px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(147, 51, 234, 0.3) 0%, transparent 70%);
          pointer-events: none;
        }

        /* Center Column */
        .final-cta-center-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 0 16px;
          z-index: 2;
        }

        .final-cta-kicker {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 6px 16px;
          border-radius: 9999px;
          background: rgba(59, 130, 246, 0.15);
          border: 1px solid rgba(96, 165, 250, 0.38);
          color: #93c5fd;
          font-size: 11.5px;
          font-weight: 850;
          letter-spacing: 0.9px;
          text-transform: uppercase;
          margin-bottom: 16px;
          box-shadow: 0 0 16px rgba(59, 130, 246, 0.2);
        }

        .final-cta-title {
          font-family: 'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: clamp(28px, 3.2vw, 42px);
          font-weight: 900;
          letter-spacing: -0.8px;
          line-height: 1.22;
          color: #ffffff;
          margin: 0 0 14px;
          max-width: 620px;
        }

        .final-cta-gradient-word {
          background: linear-gradient(135deg, #38bdf8 0%, #c084fc 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 0 14px rgba(192, 132, 252, 0.4));
        }

        .final-cta-desc {
          font-size: 15px;
          color: #cbd5e1;
          line-height: 1.65;
          max-width: 540px;
          margin: 0 0 28px;
        }

        .final-cta-actions-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          flex-wrap: wrap;
        }

        .final-cta-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 14px 30px;
          border-radius: 9999px;
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          color: #ffffff;
          font-size: 15px;
          font-weight: 850;
          border: none;
          cursor: pointer;
          box-shadow: 0 8px 26px rgba(99, 102, 241, 0.5), 0 0 20px rgba(124, 58, 237, 0.35);
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .final-cta-btn-primary:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 12px 32px rgba(99, 102, 241, 0.65), 0 0 28px rgba(124, 58, 237, 0.5);
        }

        .final-cta-btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 13px 26px;
          border-radius: 9999px;
          background: rgba(15, 23, 42, 0.65);
          border: 1.5px solid rgba(255, 255, 255, 0.18);
          color: #ffffff;
          font-size: 14.5px;
          font-weight: 800;
          cursor: pointer;
          backdrop-filter: blur(10px);
          transition: all 0.22s ease;
        }
        .final-cta-btn-secondary:hover {
          background: rgba(30, 41, 59, 0.85);
          border-color: rgba(99, 102, 241, 0.5);
          transform: translateY(-2px);
        }

        .btn-play-circle {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.18);
          display: grid;
          place-items: center;
        }

        /* Art Columns & Floating Animations */
        .final-cta-art-col {
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 1;
        }

        .final-cta-svg-left,
        .final-cta-svg-right {
          width: 100%;
          max-width: 280px;
          height: auto;
          filter: drop-shadow(0 12px 24px rgba(0, 0, 0, 0.35));
        }

        .final-cta-svg-left {
          animation: floatGlobe 5s ease-in-out infinite alternate;
        }
        .final-cta-svg-right {
          animation: floatLaptop 5s ease-in-out infinite 0.5s alternate;
        }

        @keyframes floatGlobe {
          0% { transform: translateY(0px) rotate(0deg); }
          100% { transform: translateY(-7px) rotate(1deg); }
        }
        @keyframes floatLaptop {
          0% { transform: translateY(0px) rotate(0deg); }
          100% { transform: translateY(-7px) rotate(-1deg); }
        }

        /* Responsive Breakpoints */
        @media (max-width: 1080px) {
          .final-cta-floating-card {
            grid-template-columns: 1fr;
            padding: 40px 24px;
            gap: 28px;
          }
          .final-cta-art-col {
            display: none;
          }
        }

        @media (max-width: 640px) {
          .welcome-final-cta-section {
            padding: 50px 16px 70px;
          }
          .final-cta-floating-card {
            padding: 32px 18px;
            border-radius: 24px;
          }
          .final-cta-actions-row {
            flex-direction: column;
            width: 100%;
            gap: 12px;
          }
          .final-cta-btn-primary,
          .final-cta-btn-secondary {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>

      <div className="final-cta-floating-card scroll-reveal-scale">
        <div className="final-cta-ambient-glow-left" />
        <div className="final-cta-ambient-glow-right" />

        {/* Left Column: 3D Globe with Speech Bubbles, Paper Airplane & Books */}
        <div className="final-cta-art-col">
          <svg className="final-cta-svg-left" viewBox="0 0 280 240" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Glow behind globe */}
            <circle cx="140" cy="120" r="80" fill="url(#globeGlow)" opacity="0.35" />

            {/* Stack of Books under the globe */}
            <g transform="translate(75, 170)">
              {/* Bottom Book */}
              <path d="M0 20L65 10L130 20L65 30Z" fill="#1e293b" />
              <path d="M0 20L0 27L65 37L65 30Z" fill="#334155" />
              <path d="M65 30L65 37L130 27L130 20Z" fill="#1e3a8a" />
              {/* White pages edge */}
              <path d="M5 22L65 13L125 22L125 25L65 34L5 25Z" fill="#e2e8f0" />
              
              {/* Top Book */}
              <g transform="translate(6, -14)">
                <path d="M0 16L55 8L115 16L55 24Z" fill="#2563eb" />
                <path d="M0 16L0 23L55 31L55 24Z" fill="#1d4ed8" />
                <path d="M55 24L55 31L115 23L115 16Z" fill="#1e40af" />
                {/* White pages */}
                <path d="M4 18L55 10L110 18L110 21L55 28L4 21Z" fill="#f8fafc" />
                {/* Bookmark ribbon */}
                <path d="M75 14L82 32L86 28L90 32L92 14Z" fill="#818cf8" />
              </g>
            </g>

            {/* 3D Globe Sphere */}
            <g filter="drop-shadow(0 14px 28px rgba(37,99,235,0.4))">
              <circle cx="140" cy="115" r="54" fill="url(#globeSphereGrad)" />
              {/* Atmosphere highlight */}
              <circle cx="140" cy="115" r="53" stroke="url(#globeAtmoGrad)" strokeWidth="2" opacity="0.8" />
              {/* Continents on Globe */}
              <path d="M120 85C135 88 145 95 140 105C135 115 125 110 115 120C110 125 112 135 125 140C120 145 110 148 105 140C95 125 100 100 120 85Z" fill="#60a5fa" opacity="0.65" />
              <path d="M150 90C165 92 175 105 170 120C165 135 155 140 145 148C140 140 142 125 150 115C155 108 145 98 150 90Z" fill="#60a5fa" opacity="0.6" />
              <path d="M130 140C140 142 155 155 145 162C135 160 125 152 130 140Z" fill="#38bdf8" opacity="0.5" />
              {/* Globe Grid Lines */}
              <ellipse cx="140" cy="115" rx="54" ry="22" stroke="#93c5fd" strokeWidth="1" strokeDasharray="3 3" opacity="0.35" />
              <ellipse cx="140" cy="115" rx="28" ry="54" stroke="#93c5fd" strokeWidth="1" strokeDasharray="3 3" opacity="0.35" />
            </g>

            {/* Dashed flight path of airplane */}
            <path d="M60 145C50 110 90 75 140 68C190 62 215 90 205 120C195 150 140 160 85 145" stroke="#93c5fd" strokeWidth="1.8" strokeDasharray="4 4" opacity="0.6" fill="none" />

            {/* Flying Paper Airplane */}
            <g transform="translate(195, 78) rotate(25)" filter="drop-shadow(0 4px 10px rgba(0,0,0,0.3))">
              <polygon points="0,0 24,-8 10,14" fill="#f8fafc" />
              <polygon points="0,0 24,-8 8,0" fill="#cbd5e1" />
              <polygon points="8,0 24,-8 10,14" fill="#94a3b8" />
            </g>

            {/* Speech Bubble 1: Hello (Top-Left, Purple) */}
            <g transform="translate(68, 52)" filter="drop-shadow(0 6px 14px rgba(139,92,246,0.4))">
              <rect x="0" y="0" width="58" height="30" rx="15" fill="url(#bubblePurpleGrad)" />
              <path d="M38 28L46 36L44 26Z" fill="#8b5cf6" />
              <text x="29" y="19" fill="#ffffff" fontSize="13" fontWeight="800" textAnchor="middle" fontFamily="sans-serif">Hello</text>
            </g>

            {/* Speech Bubble 2: Bonjour (Top-Right, Cyan) */}
            <g transform="translate(168, 48)" filter="drop-shadow(0 6px 14px rgba(14,165,233,0.4))">
              <rect x="0" y="0" width="66" height="30" rx="15" fill="url(#bubbleCyanGrad)" />
              <path d="M18 28L12 36L24 26Z" fill="#0284c7" />
              <text x="33" y="19" fill="#ffffff" fontSize="12" fontWeight="800" textAnchor="middle" fontFamily="sans-serif">Bonjour</text>
            </g>

            {/* Speech Bubble 3: Hola (Bottom-Left, Orange) */}
            <g transform="translate(56, 128)" filter="drop-shadow(0 6px 14px rgba(249,115,22,0.4))">
              <rect x="0" y="0" width="54" height="28" rx="14" fill="url(#bubbleOrangeGrad)" />
              <path d="M38 12L48 6L38 20Z" fill="#ea580c" />
              <text x="27" y="18" fill="#ffffff" fontSize="12.5" fontWeight="800" textAnchor="middle" fontFamily="sans-serif">Hola</text>
            </g>

            {/* Speech Bubble 4: 你好 (Bottom-Right, Blue) */}
            <g transform="translate(178, 126)" filter="drop-shadow(0 6px 14px rgba(59,130,246,0.4))">
              <rect x="0" y="0" width="50" height="28" rx="14" fill="url(#bubbleBlueGrad)" />
              <path d="M14 10L6 6L14 18Z" fill="#2563eb" />
              <text x="25" y="18" fill="#ffffff" fontSize="12" fontWeight="800" textAnchor="middle" fontFamily="sans-serif">你好</text>
            </g>

            {/* Sparkles around the globe */}
            <path d="M125 38L127 44L133 46L127 48L125 54L123 48L117 46L123 44Z" fill="#38bdf8" />
            <path d="M60 95L61 98L64 99L61 100L60 103L59 100L56 99L59 98Z" fill="#c084fc" />
            <path d="M228 110L230 114L234 116L230 118L228 122L226 118L222 116L226 114Z" fill="#fbbf24" />
            {/* Radiating light rays */}
            <line x1="168" y1="40" x2="176" y2="34" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" />
            <line x1="174" y1="46" x2="182" y2="44" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" />

            <defs>
              <radialGradient id="globeGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="globeSphereGrad" cx="35%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="35%" stopColor="#2563eb" />
                <stop offset="85%" stopColor="#1e3a8a" />
                <stop offset="100%" stopColor="#0f172a" />
              </radialGradient>
              <linearGradient id="globeAtmoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#67e8f9" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
              </linearGradient>
              <linearGradient id="bubblePurpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#7c3aed" />
              </linearGradient>
              <linearGradient id="bubbleCyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#0284c7" />
              </linearGradient>
              <linearGradient id="bubbleOrangeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fb923c" />
                <stop offset="100%" stopColor="#ea580c" />
              </linearGradient>
              <linearGradient id="bubbleBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#1d4ed8" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Center Column: Kicker, Heading, Subtitle & Action Buttons */}
        <div className="final-cta-center-col">
          <div className="final-cta-kicker">
            <Sparkles size={13} />
            <span>{kicker}</span>
          </div>

          <h2 className="final-cta-title">
            {renderTitle(title)}
          </h2>

          <p className="final-cta-desc">
            {desc}
          </p>

          <div className="final-cta-actions-row">
            <button className="final-cta-btn-primary" onClick={onRegister}>
              <Rocket size={17} />
              <span>{btnRegister}</span>
              <ArrowRight size={17} />
            </button>

            <button className="final-cta-btn-secondary" onClick={onLogin}>
              <span className="btn-play-circle">
                <Play size={12} fill="#ffffff" color="#ffffff" style={{ marginLeft: '2px' }} />
              </span>
              <span>{btnLogin}</span>
            </button>
          </div>
        </div>

        {/* Right Column: 3D Laptop with Flags, Heart, Lightbulb, Headphones & Plant */}
        <div className="final-cta-art-col">
          <svg className="final-cta-svg-right" viewBox="0 0 280 240" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Glow behind laptop */}
            <circle cx="150" cy="120" r="85" fill="url(#laptopBackGlow)" opacity="0.38" />

            {/* Potted Plant on the right */}
            <g transform="translate(218, 142)" filter="drop-shadow(0 6px 12px rgba(0,0,0,0.3))">
              <path d="M8 24L12 44L28 44L32 24Z" fill="#f1f5f9" />
              <ellipse cx="20" cy="24" rx="12" ry="4" fill="#e2e8f0" />
              <path d="M20 22C16 10 8 12 6 18C12 18 16 20 20 22Z" fill="#10b981" />
              <path d="M20 22C24 6 34 8 36 14C30 16 24 18 20 22Z" fill="#34d399" />
              <path d="M20 22C20 4 28 2 30 8C26 12 22 18 20 22Z" fill="#059669" />
            </g>

            {/* 3D Laptop */}
            <g transform="translate(68, 65)">
              {/* Laptop Base / Keyboard */}
              <path d="M25 88L130 88L148 108L5 108Z" fill="url(#finalLaptopBase)" filter="drop-shadow(0 12px 24px rgba(0,0,0,0.5))" />
              <rect x="65" y="91" width="28" height="3" rx="1.5" fill="#94a3b8" />
              
              {/* Laptop Screen */}
              <rect x="32" y="5" width="98" height="78" rx="8" transform="skewX(-5)" fill="#0f172a" stroke="#2563eb" strokeWidth="2.5" />
              {/* Screen Display */}
              <rect x="37" y="10" width="88" height="68" rx="5" transform="skewX(-5)" fill="url(#finalScreenBg)" />

              {/* Screen Content: "Aa" lettermark on left */}
              <g transform="translate(42, 16)">
                <rect x="2" y="4" width="34" height="42" rx="6" fill="rgba(59, 130, 246, 0.25)" />
                <text x="19" y="32" fill="#ffffff" fontSize="20" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">Aa</text>
              </g>

              {/* Screen Content: 3 Mini Flags on right */}
              <g transform="translate(82, 18)">
                {/* Flag 1: UK */}
                <g transform="translate(0, 0)">
                  <rect x="0" y="0" width="16" height="10" rx="2" fill="#1e3a8a" />
                  <path d="M0 0L16 10M16 0L0 10" stroke="#ef4444" strokeWidth="1.2" />
                  <path d="M8 0L8 10M0 5L16 5" stroke="#ffffff" strokeWidth="2" />
                  <path d="M8 0L8 10M0 5L16 5" stroke="#ef4444" strokeWidth="1" />
                  <rect x="20" y="3" width="18" height="3.5" rx="1.5" fill="#93c5fd" opacity="0.7" />
                </g>
                {/* Flag 2: Germany */}
                <g transform="translate(0, 14)">
                  <rect x="0" y="0" width="16" height="3.3" fill="#000000" />
                  <rect x="0" y="3.3" width="16" height="3.3" fill="#ef4444" />
                  <rect x="0" y="6.6" width="16" height="3.3" fill="#fbbf24" />
                  <rect x="20" y="3" width="16" height="3.5" rx="1.5" fill="#93c5fd" opacity="0.7" />
                </g>
                {/* Flag 3: France */}
                <g transform="translate(0, 28)">
                  <rect x="0" y="0" width="5.3" height="10" fill="#2563eb" />
                  <rect x="5.3" y="0" width="5.3" height="10" fill="#ffffff" />
                  <rect x="10.6" y="0" width="5.3" height="10" fill="#ef4444" />
                  <rect x="20" y="3" width="14" height="3.5" rx="1.5" fill="#93c5fd" opacity="0.7" />
                </g>
              </g>
            </g>

            {/* Floating Heart Bubble (Top-Left of laptop) */}
            <g transform="translate(48, 62)" filter="drop-shadow(0 6px 14px rgba(59,130,246,0.45))">
              <rect x="0" y="0" width="38" height="32" rx="10" fill="url(#heartBubbleGrad)" />
              <path d="M19 23L12 16C9 13 11 9 15 9C17 9 18 10.5 19 12C20 10.5 21 9 23 9C27 9 29 13 26 16L19 23Z" fill="#ffffff" />
            </g>

            {/* Floating Lightbulb Bubble (Top-Right of laptop) */}
            <g transform="translate(202, 54)" filter="drop-shadow(0 6px 14px rgba(168,85,247,0.45))">
              <rect x="0" y="0" width="38" height="32" rx="10" fill="url(#bulbBubbleGrad)" />
              <path d="M19 10C16 10 14 12 14 15C14 17 15.5 18.5 16.5 19.5L16.5 21.5L21.5 21.5L21.5 19.5C22.5 18.5 24 17 24 15C24 12 22 10 19 10Z" fill="#ffffff" />
              <line x1="17.5" y1="23" x2="20.5" y2="23" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
            </g>

            {/* 3D Blue Headphones resting beside the laptop */}
            <g transform="translate(36, 126)" filter="drop-shadow(0 8px 18px rgba(37,99,235,0.45))">
              <path d="M8 38C8 14 34 10 46 24" stroke="url(#headphoneArc)" strokeWidth="6" strokeLinecap="round" fill="none" />
              <ellipse cx="10" cy="40" rx="9" ry="14" fill="#1d4ed8" />
              <ellipse cx="10" cy="40" rx="6" ry="11" fill="#3b82f6" />
              <ellipse cx="10" cy="40" rx="3.5" ry="7" fill="#60a5fa" />
              <ellipse cx="44" cy="28" rx="7" ry="11" fill="#1e40af" />
            </g>

            {/* Sparkles and accent rays */}
            <path d="M215 32L217 37L222 39L217 41L215 46L213 41L208 39L213 37Z" fill="#38bdf8" />
            <path d="M42 42L43 45L46 46L43 47L42 50L41 47L38 46L41 45Z" fill="#c084fc" />
            <line x1="42" y1="88" x2="34" y2="92" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" />
            <line x1="44" y1="96" x2="38" y2="102" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" />

            <defs>
              <radialGradient id="laptopBackGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="finalLaptopBase" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="50%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#1e293b" />
              </linearGradient>
              <linearGradient id="finalScreenBg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0b132b" />
                <stop offset="100%" stopColor="#1e1b4b" />
              </linearGradient>
              <linearGradient id="heartBubbleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#60a5fa" />
                <stop offset="100%" stopColor="#2563eb" />
              </linearGradient>
              <linearGradient id="bulbBubbleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#c084fc" />
                <stop offset="100%" stopColor="#7c3aed" />
              </linearGradient>
              <linearGradient id="headphoneArc" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2563eb" />
                <stop offset="100%" stopColor="#60a5fa" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    </section>
  );
}

