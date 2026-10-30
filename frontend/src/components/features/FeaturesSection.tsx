import React from 'react';
import {
  Sparkles, Gamepad2, ShieldCheck, Users, ArrowRight
} from 'lucide-react';

interface FeatureItem {
  key?: string;
  color?: string;
  title: string;
  desc: string;
}

interface FeaturesSectionProps {
  kicker?: string;
  title?: string;
  subtitle?: string;
  features?: FeatureItem[];
  dark?: boolean;
  onExploreFeature?: (key: string) => void;
}

export function FeaturesSection({
  kicker,
  title,
  subtitle,
  features,
  dark,
  onExploreFeature
}: FeaturesSectionProps) {
  const currentKicker = kicker || 'ILG‘OR IMKONIYATLAR';
  const currentTitle = title || 'Zamonaviy texnologiyalar xizmatingizda';
  const currentSubtitle = subtitle || 'Biz til o‘rganishni nafaqat samarali, balki maroqli jarayonga aylantiramiz.';

  const defaultFeatures: FeatureItem[] = [
    {
      key: 'ai',
      color: 'purple',
      title: '24/7 AI Til Repetitori',
      desc: 'Istalgan savolingizni bering, grammatik xatolaringizni aniqlang va muloyim tushuntirishlar oling.'
    },
    {
      key: 'pvp',
      color: 'orange',
      title: '1v1 So‘z Bellashuvi',
      desc: 'Boshqa o‘quvchilar bilan real vaqtda so‘z boyligingizni sinang, XP to‘plang va yetakchilar safiga kiring.'
    },
    {
      key: 'anticheat',
      color: 'green',
      title: 'Anti-Cheat & Spaced Repetition',
      desc: 'So‘zlar tasodifiy takrorlanmaydi — ilmiy tasdiqlangan intervallar bilan uzoq muddatli xotiraga ko‘chadi.'
    },
    {
      key: 'teachers',
      color: 'blue',
      title: 'Malakali Ustozlar Nazorati',
      desc: 'Maxsus o‘qituvchilar tizimda sizning yozma insho va vazifalaringizni tekshirib, shaxsiy baho beradi.'
    }
  ];

  const currentList = Array.isArray(features) && features.length > 0 ? features : defaultFeatures;

  // Visual configuration for each feature color
  const colorConfigs: Record<string, {
    icon: any;
    accent: string;
    borderGlow: string;
    iconGrad: string;
    waveGrad: string;
    shadowColor: string;
  }> = {
    purple: {
      icon: Sparkles,
      accent: '#a855f7',
      borderGlow: 'rgba(168, 85, 247, 0.45)',
      iconGrad: 'linear-gradient(135deg, #c084fc 0%, #9333ea 50%, #6b21a8 100%)',
      waveGrad: 'radial-gradient(circle at bottom right, rgba(168, 85, 247, 0.7) 0%, rgba(147, 51, 234, 0.3) 50%, transparent 75%)',
      shadowColor: 'rgba(168, 85, 247, 0.35)'
    },
    orange: {
      icon: Gamepad2,
      accent: '#f97316',
      borderGlow: 'rgba(249, 115, 22, 0.45)',
      iconGrad: 'linear-gradient(135deg, #fb923c 0%, #ea580c 50%, #9a3412 100%)',
      waveGrad: 'radial-gradient(circle at bottom right, rgba(249, 115, 22, 0.7) 0%, rgba(234, 88, 12, 0.3) 50%, transparent 75%)',
      shadowColor: 'rgba(249, 115, 22, 0.35)'
    },
    green: {
      icon: ShieldCheck,
      accent: '#10b981',
      borderGlow: 'rgba(16, 185, 129, 0.45)',
      iconGrad: 'linear-gradient(135deg, #34d399 0%, #059669 50%, #064e3b 100%)',
      waveGrad: 'radial-gradient(circle at bottom right, rgba(16, 185, 129, 0.7) 0%, rgba(5, 150, 105, 0.3) 50%, transparent 75%)',
      shadowColor: 'rgba(16, 185, 129, 0.35)'
    },
    blue: {
      icon: Users,
      accent: '#3b82f6',
      borderGlow: 'rgba(59, 130, 246, 0.45)',
      iconGrad: 'linear-gradient(135deg, #60a5fa 0%, #2563eb 50%, #1e3a8a 100%)',
      waveGrad: 'radial-gradient(circle at bottom right, rgba(59, 130, 246, 0.7) 0%, rgba(37, 99, 235, 0.3) 50%, transparent 75%)',
      shadowColor: 'rgba(59, 130, 246, 0.35)'
    }
  };

  return (
    <section id="features" className={`feat-modern-section ${dark ? 'is-dark' : 'is-light'}`}>
      {/* Scoped CSS strictly matching reference image 2 */}
      <style>{`
        .feat-modern-section {
          background: linear-gradient(180deg, #060913 0%, #0a1022 50%, #060913 100%);
          color: #ffffff;
          padding: 85px 20px 105px;
          position: relative;
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          transition: background 0.3s ease, color 0.3s ease;
        }

        /* 100% LIGHT MODE SUPPORT */
        .feat-modern-section.is-light {
          background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 50%, #f8fafc 100%) !important;
          color: #0f172a !important;
        }
        .feat-modern-section.is-light .feat-kicker-badge {
          background: rgba(37, 99, 235, 0.08) !important;
          border-color: rgba(37, 99, 235, 0.25) !important;
          color: #2563eb !important;
        }
        .feat-modern-section.is-light .feat-main-title {
          color: #0f172a !important;
        }
        .feat-modern-section.is-light .feat-subtitle {
          color: #475569 !important;
        }
        .feat-modern-section.is-light .feat-card-item {
          background: rgba(255, 255, 255, 0.96) !important;
          border: 1.5px solid rgba(226, 232, 240, 0.95) !important;
          box-shadow: 0 14px 34px rgba(0, 0, 0, 0.05) !important;
        }
        .feat-modern-section.is-light .feat-card-item:hover {
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08), 0 0 22px var(--feat-shadow) !important;
        }
        .feat-modern-section.is-light .feat-card-title {
          color: #0f172a !important;
        }
        .feat-modern-section.is-light .feat-card-desc {
          color: #475569 !important;
        }
        .feat-modern-section.is-light .feat-arrow-circle-btn {
          background: rgba(241, 245, 249, 0.9) !important;
          border-color: rgba(226, 232, 240, 0.95) !important;
          color: #2563eb !important;
        }
        .feat-modern-section.is-light .feat-calligraphy-text {
          color: #2563eb !important;
        }

        /* Ambient glowing backdrop spots */
        .feat-glow-top {
          position: absolute;
          top: 5%;
          left: 50%;
          transform: translateX(-50%);
          width: 650px;
          height: 380px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, transparent 70%);
          filter: blur(75px);
          pointer-events: none;
        }
        .feat-glow-bottom-right {
          position: absolute;
          bottom: 10%;
          right: -100px;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%);
          filter: blur(80px);
          pointer-events: none;
        }

        .feat-container {
          max-width: 1220px;
          margin: 0 auto;
          position: relative;
          z-index: 10;
        }

        /* Top Header Grid with Left 3D Laptop Art, Center Info, Right Calligraphy & Dots */
        .feat-header-grid {
          display: grid;
          grid-template-columns: 210px 1fr 210px;
          align-items: center;
          gap: 24px;
          margin-bottom: 56px;
          position: relative;
        }

        /* Left: 3D Floating Laptop Artwork */
        .feat-left-art {
          display: flex;
          justify-content: flex-start;
          align-items: center;
        }
        .feat-laptop-svg-wrap {
          width: 175px;
          height: 140px;
          filter: drop-shadow(0 16px 32px rgba(37, 99, 235, 0.35));
          animation: featFloat 4s ease-in-out infinite alternate;
        }
        @keyframes featFloat {
          0% { transform: translateY(0px) rotate(0deg); }
          100% { transform: translateY(-7px) rotate(-1.5deg); }
        }

        /* Center Column */
        .feat-center-col {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        /* Kicker Badge */
        .feat-kicker-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 6px 16px;
          border-radius: 100px;
          background: rgba(30, 58, 138, 0.35);
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
        .feat-main-title {
          font-size: clamp(28px, 3.8vw, 44px);
          font-weight: 900;
          line-height: 1.22;
          margin: 0 0 14px;
          letter-spacing: -0.6px;
          color: #ffffff;
        }
        .feat-gradient-text {
          background: linear-gradient(135deg, #a855f7 0%, #ec4899 50%, #f472b6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .feat-subtitle {
          font-size: 15.5px;
          line-height: 1.6;
          color: #94a3b8;
          max-width: 620px;
          margin: 0;
        }

        /* Right Handwritten Calligraphy Note & Curved Arrow & Dot Matrix */
        .feat-right-art {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          justify-content: center;
          text-align: right;
          position: relative;
        }
        .feat-calligraphy-text {
          font-family: "Segoe Script", "Brush Script MT", cursive, sans-serif;
          font-size: 15.5px;
          line-height: 1.35;
          color: #7dd3fc;
          text-shadow: 0 0 12px rgba(56, 189, 248, 0.4);
          transform: rotate(-4deg);
          white-space: nowrap;
        }
        .feat-calligraphy-arrow {
          width: 50px;
          height: 44px;
          margin-top: 4px;
          margin-right: 20px;
          filter: drop-shadow(0 2px 8px rgba(56, 189, 248, 0.4));
        }

        /* Dot Matrix Pattern in Far Right */
        .feat-dot-matrix {
          position: absolute;
          top: 10px;
          right: -20px;
          display: grid;
          grid-template-columns: repeat(4, 6px);
          gap: 9px;
          opacity: 0.28;
          pointer-events: none;
        }
        .feat-dot-matrix span {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #38bdf8;
        }

        /* The 4 Feature Cards Grid */
        .feat-cards-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 18px;
        }

        /* Individual Feature Card */
        .feat-card-item {
          background: rgba(15, 23, 42, 0.7);
          backdrop-filter: blur(18px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 22px;
          padding: 26px 22px 22px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
          position: relative;
          overflow: hidden;
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease, border-color 0.3s ease;
          box-shadow: 0 10px 28px rgba(0, 0, 0, 0.3);
          cursor: pointer;
        }
        .feat-card-item:hover {
          transform: translateY(-6px);
          border-color: var(--card-border-glow);
          box-shadow: 0 18px 40px rgba(0, 0, 0, 0.45), 0 0 20px var(--card-shadow);
        }

        /* Glowing Icon Box */
        .feat-icon-box {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          display: grid;
          place-items: center;
          color: #ffffff;
          box-shadow: 0 8px 20px var(--card-shadow);
          margin-bottom: 20px;
          position: relative;
          z-index: 2;
          transition: transform 0.25s ease;
        }
        .feat-card-item:hover .feat-icon-box {
          transform: scale(1.08);
        }

        /* Title */
        .feat-card-title {
          font-size: 16px;
          font-weight: 800;
          color: #ffffff;
          line-height: 1.35;
          letter-spacing: -0.2px;
          margin: 0 0 10px;
          position: relative;
          z-index: 2;
        }

        /* Description */
        .feat-card-desc {
          font-size: 13px;
          line-height: 1.6;
          color: #94a3b8;
          margin: 0 0 24px;
          flex: 1;
          position: relative;
          z-index: 2;
        }

        /* Bottom Row with Action Arrow Button */
        .feat-card-bottom {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          position: relative;
          z-index: 2;
        }

        .feat-arrow-circle-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
          display: grid;
          place-items: center;
          color: #ffffff;
          transition: all 0.25s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }
        .feat-card-item:hover .feat-arrow-circle-btn {
          background: var(--card-accent);
          border-color: transparent;
          box-shadow: 0 6px 18px var(--card-shadow);
          transform: translateX(3px);
        }

        /* Luminous Fluid Wave in Bottom Right Corner */
        .feat-corner-wave {
          position: absolute;
          bottom: -15px;
          right: -15px;
          width: 120px;
          height: 95px;
          border-radius: 70% 0 0 0;
          background: var(--card-wave);
          filter: blur(14px);
          opacity: 0.55;
          pointer-events: none;
          z-index: 1;
          transition: opacity 0.3s ease, transform 0.3s ease;
        }
        .feat-card-item:hover .feat-corner-wave {
          opacity: 0.85;
          transform: scale(1.18);
        }

        /* Decorative Vector Wave Arc */
        .feat-corner-svg-arc {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 80px;
          height: 65px;
          pointer-events: none;
          z-index: 1;
          opacity: 0.35;
          transition: opacity 0.3s ease;
        }
        .feat-card-item:hover .feat-corner-svg-arc {
          opacity: 0.6;
        }

        /* Responsive Breakpoints */
        @media (max-width: 1024px) {
          .feat-header-grid {
            grid-template-columns: 1fr;
            text-align: center;
            gap: 24px;
            margin-bottom: 40px;
          }
          .feat-left-art, .feat-right-art {
            display: none;
          }
          .feat-cards-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
          }
        }

        @media (max-width: 640px) {
          .feat-modern-section {
            padding: 55px 16px 70px;
          }
          .feat-cards-grid {
            grid-template-columns: 1fr;
            gap: 14px;
          }
          .feat-card-item {
            padding: 22px 18px 18px;
            border-radius: 20px;
          }
          .feat-card-desc {
            margin-bottom: 18px;
          }
        }
      `}</style>

      {/* Ambient background glows */}
      <div className="feat-glow-top" />
      <div className="feat-glow-bottom-right" />

      <div className="feat-container">
        {/* Top Header Grid */}
        <div className="feat-header-grid">
          {/* Left: 3D Isometric Floating Laptop Artwork */}
          <div className="feat-left-art" aria-hidden="true">
            <svg
              className="feat-laptop-svg-wrap"
              viewBox="0 0 175 140"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* Blue Laptop Base Gradient */}
                <linearGradient id="laptopBaseGrad" x1="20" y1="90" x2="140" y2="125" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="60%" stopColor="#2563eb" />
                  <stop offset="100%" stopColor="#1d4ed8" />
                </linearGradient>
                {/* Laptop Screen Gradient */}
                <linearGradient id="laptopScreenGrad" x1="40" y1="20" x2="120" y2="85" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#60a5fa" />
                  <stop offset="50%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#1e40af" />
                </linearGradient>
                {/* Purple Badge Gradient */}
                <linearGradient id="purpleBadgeGrad" x1="15" y1="12" x2="48" y2="45" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#c084fc" />
                  <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>
                {/* Teal Badge Gradient */}
                <linearGradient id="tealBadgeGrad" x1="120" y1="40" x2="152" y2="72" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#34d399" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
                {/* Drop shadow */}
                <filter id="featShadow" x="-10" y="-10" width="195" height="160" filterUnits="userSpaceOnUse">
                  <feDropShadow dx="0" dy="10" stdDeviation="6" floodColor="#1e3a8a" floodOpacity="0.4" />
                </filter>
              </defs>

              {/* 1. Laptop Base / Keyboard Base */}
              <g filter="url(#featShadow)">
                {/* Bottom chassis */}
                <path
                  d="M 28 100 L 132 100 C 138 100, 144 105, 140 112 L 132 124 C 129 128, 123 130, 116 130 L 40 130 C 33 130, 27 127, 24 122 L 20 110 C 18 104, 22 100, 28 100 Z"
                  fill="url(#laptopBaseGrad)"
                />
                {/* Front trackpad bevel highlight */}
                <rect x="62" y="118" width="34" height="8" rx="3" fill="#60a5fa" opacity="0.4" />

                {/* 2. Laptop Upright Screen */}
                <rect
                  x="36"
                  y="26"
                  width="88"
                  height="72"
                  rx="14"
                  fill="url(#laptopScreenGrad)"
                  stroke="rgba(255,255,255,0.4)"
                  strokeWidth="2.5"
                />

                {/* Glowing Screen Interior Display */}
                <rect
                  x="42"
                  y="32"
                  width="76"
                  height="58"
                  rx="10"
                  fill="#0f172a"
                  opacity="0.9"
                />

                {/* Code Symbol </> on Screen */}
                <text
                  x="80"
                  y="68"
                  textAnchor="middle"
                  fill="#60a5fa"
                  fontSize="24"
                  fontWeight="900"
                  fontFamily="monospace"
                  style={{ filter: 'drop-shadow(0 0 6px rgba(96,165,250,0.7))' }}
                >
                  &lt;/&gt;
                </text>
              </g>

              {/* 3. Floating Purple Cube Badge on Top-Left with Sparkle */}
              <g filter="url(#featShadow)">
                <rect x="18" y="14" width="32" height="32" rx="10" fill="url(#purpleBadgeGrad)" />
                {/* Small Sparkle inside badge */}
                <path
                  d="M 34 22 C 34 26, 38 29, 41 30 C 38 31, 34 34, 34 38 C 34 34, 30 31, 27 30 C 30 29, 34 26, 34 22 Z"
                  fill="#ffffff"
                />
              </g>

              {/* 4. Floating Teal Language/Translation Badge on Right */}
              <g filter="url(#featShadow)">
                <rect x="122" y="44" width="30" height="30" rx="9" fill="url(#tealBadgeGrad)" />
                {/* Mini A symbol inside */}
                <text
                  x="137"
                  y="65"
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="15"
                  fontWeight="850"
                  fontFamily="-apple-system, sans-serif"
                >
                  A
                </text>
              </g>

              {/* 5. Speed / Radiant Dash Marks */}
              <rect x="10" y="48" width="3.5" height="10" rx="1.75" transform="rotate(-65 10 48)" fill="#38bdf8" opacity="0.8" />
              <rect x="12" y="62" width="3.5" height="9" rx="1.75" transform="rotate(-40 12 62)" fill="#60a5fa" opacity="0.7" />
              <rect x="130" y="24" width="3.5" height="9" rx="1.75" transform="rotate(35 130 24)" fill="#38bdf8" opacity="0.8" />
              <rect x="144" y="34" width="3.5" height="8" rx="1.75" transform="rotate(60 144 34)" fill="#60a5fa" opacity="0.7" />
            </svg>
          </div>

          {/* Center Column: Kicker, Title, Subtitle */}
          <div className="feat-center-col">
            <span className="feat-kicker-badge">
              <Sparkles size={14} color="#60a5fa" />
              {currentKicker}
            </span>

            <h2 className="feat-main-title">
              Zamonaviy texnologiyalar <br />
              <span className="feat-gradient-text">xizmatimizda</span>
            </h2>

            <p className="feat-subtitle">
              {currentSubtitle}
            </p>
          </div>

          {/* Right: Handwritten Script Slogan with Curved Arrow & Dot Matrix */}
          <div className="feat-right-art" aria-hidden="true">
            {/* Dot Matrix Pattern */}
            <div className="feat-dot-matrix">
              {Array.from({ length: 16 }).map((_, i) => (
                <span key={i} />
              ))}
            </div>

            <div className="feat-calligraphy-text">
              Zamonaviy texnologiyalar<br />
              bilan cheksiz imkoniyatlar!
            </div>

            <svg
              className="feat-calligraphy-arrow"
              viewBox="0 0 50 45"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
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

        {/* The 4 Feature Cards */}
        <div className="feat-cards-grid">
          {currentList.map((item, idx) => {
            const colorKey = item.color || (idx === 0 ? 'purple' : idx === 1 ? 'orange' : idx === 2 ? 'green' : 'blue');
            const conf = colorConfigs[colorKey] || colorConfigs.blue;
            const Icon = conf.icon;

            return (
              <div
                key={item.key || idx}
                className="feat-card-item"
                onClick={() => onExploreFeature && item.key && onExploreFeature(item.key)}
                style={{
                  ['--card-accent' as any]: conf.accent,
                  ['--card-border-glow' as any]: conf.borderGlow,
                  ['--card-shadow' as any]: conf.shadowColor,
                  ['--card-wave' as any]: conf.waveGrad
                }}
              >
                {/* Glowing Icon Badge */}
                <div
                  className="feat-icon-box"
                  style={{ background: conf.iconGrad }}
                >
                  <Icon size={24} />
                </div>

                {/* Title */}
                <h3 className="feat-card-title">{item.title}</h3>

                {/* Description */}
                <p className="feat-card-desc">{item.desc}</p>

                {/* Bottom Row with Action Arrow Button */}
                <div className="feat-card-bottom">
                  <div className="feat-arrow-circle-btn" title="Batafsil">
                    <ArrowRight size={16} strokeWidth={2.4} />
                  </div>
                </div>

                {/* Corner Fluid Wave Glow */}
                <div className="feat-corner-wave" />

                {/* Corner SVG Wave Arc */}
                <svg
                  className="feat-corner-svg-arc"
                  viewBox="0 0 100 80"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M 15 80 Q 55 45 100 25 L 100 80 Z"
                    fill={conf.accent}
                  />
                </svg>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

