import React from 'react';
import {
  Sparkles, BookOpen, PenLine, Headphones, Mic, Layers, ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { TiltCard } from '../../utils/motion/TiltCard';
import { convertUzbekText } from '../../utils/textTransform';

interface SkillItem {
  key?: string;
  title: string;
  desc: string;
  color?: string;
}

interface SkillsSectionProps {
  kicker?: string;
  title?: string;
  subtitle?: string;
  skills?: SkillItem[];
  dark?: boolean;
  onSelectSkill?: (key: string) => void;
}

export function SkillsSection({
  kicker,
  title,
  subtitle,
  skills,
  dark,
  onSelectSkill
}: SkillsSectionProps) {
  const currentKicker = convertUzbekText(kicker) || 'MUVOZANATLI RIVOJLANIŞ';
  const currentTitle = convertUzbekText(title) || '5 ta asosiy til könikmasini mustahkamlang';
  const currentSubtitle = convertUzbekText(subtitle) || 'Faqat qoidalar yodlaş emas — har tomonlama tabiiy örganiş uslubi.';

  const defaultSkills: SkillItem[] = [
    {
      key: 'reading',
      title: 'Öqiş (Reading)',
      desc: 'Darajangizga moslangan qiziqarli hikoyalar, badiiy parçalar va zamonaviy maqolalar.',
      color: '#8b5cf6'
    },
    {
      key: 'writing',
      title: 'Yoziş (Writing)',
      desc: 'Inşo va xatlar yoziş, grammatik qoidalarni amaliyotda qöllaş orqali darhol tekşiriş.',
      color: '#06b6d4'
    },
    {
      key: 'listening',
      title: 'Tinglaş (Listening)',
      desc: 'Tabiiy tezlikdagi audio podkastlar, kundalik muloqot dialoglari va transkriptlar.',
      color: '#f97316'
    },
    {
      key: 'speaking',
      title: 'Gapiriş (Speaking)',
      desc: 'Töğri talaffuz va intonatsiya maşqlari bilan muloqotdagi tösiqlarni yengiş.',
      color: '#3b82f6'
    },
    {
      key: 'vocab',
      title: 'Luğat (Vocabulary)',
      desc: 'Şaxsiy söz daftari, kontekstual misollar va intervalli takrorlaş metodikasi.',
      color: '#d946ef'
    }
  ];

  const currentSkills = Array.isArray(skills) && skills.length > 0 ? skills : defaultSkills;

  // Metadata matching the exact colors, glows, tilts and themes from reference mockup
  const skillMeta: Record<string, {
    icon: any;
    accent: string;
    borderGlow: string;
    iconGrad: string;
    shadowColor: string;
    cardBg: string;
    pillBg: string;
    tilt: number;
    watermarkType: 'book' | 'pen' | 'headphones' | 'mic' | 'aa';
  }> = {
    reading: {
      icon: BookOpen,
      accent: '#8b5cf6',
      borderGlow: 'rgba(168, 85, 247, 0.48)',
      iconGrad: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)',
      shadowColor: 'rgba(139, 92, 246, 0.32)',
      cardBg: 'linear-gradient(145deg, rgba(34, 18, 72, 0.92) 0%, rgba(15, 23, 42, 0.96) 100%)',
      pillBg: 'linear-gradient(90deg, rgba(88, 28, 135, 0.45) 0%, rgba(30, 27, 75, 0.75) 100%)',
      tilt: -1.8,
      watermarkType: 'book'
    },
    writing: {
      icon: PenLine,
      accent: '#06b6d4',
      borderGlow: 'rgba(6, 182, 212, 0.48)',
      iconGrad: 'linear-gradient(135deg, #22d3ee 0%, #0891b2 100%)',
      shadowColor: 'rgba(6, 182, 212, 0.32)',
      cardBg: 'linear-gradient(145deg, rgba(8, 44, 66, 0.92) 0%, rgba(15, 23, 42, 0.96) 100%)',
      pillBg: 'linear-gradient(90deg, rgba(6, 95, 110, 0.45) 0%, rgba(8, 51, 68, 0.75) 100%)',
      tilt: 1.5,
      watermarkType: 'pen'
    },
    listening: {
      icon: Headphones,
      accent: '#f97316',
      borderGlow: 'rgba(249, 115, 22, 0.48)',
      iconGrad: 'linear-gradient(135deg, #fb923c 0%, #ea580c 100%)',
      shadowColor: 'rgba(249, 115, 22, 0.32)',
      cardBg: 'linear-gradient(145deg, rgba(58, 28, 14, 0.92) 0%, rgba(15, 23, 42, 0.96) 100%)',
      pillBg: 'linear-gradient(90deg, rgba(124, 45, 18, 0.45) 0%, rgba(67, 20, 7, 0.75) 100%)',
      tilt: 1.2,
      watermarkType: 'headphones'
    },
    speaking: {
      icon: Mic,
      accent: '#3b82f6',
      borderGlow: 'rgba(59, 130, 246, 0.48)',
      iconGrad: 'linear-gradient(135deg, #60a5fa 0%, #2563eb 100%)',
      shadowColor: 'rgba(59, 130, 246, 0.32)',
      cardBg: 'linear-gradient(145deg, rgba(18, 36, 88, 0.92) 0%, rgba(15, 23, 42, 0.96) 100%)',
      pillBg: 'linear-gradient(90deg, rgba(30, 64, 175, 0.45) 0%, rgba(23, 37, 84, 0.75) 100%)',
      tilt: -1.5,
      watermarkType: 'mic'
    },
    vocab: {
      icon: Layers,
      accent: '#d946ef',
      borderGlow: 'rgba(217, 70, 239, 0.48)',
      iconGrad: 'linear-gradient(135deg, #f472b6 0%, #c026d3 100%)',
      shadowColor: 'rgba(217, 70, 239, 0.32)',
      cardBg: 'linear-gradient(145deg, rgba(62, 18, 68, 0.92) 0%, rgba(15, 23, 42, 0.96) 100%)',
      pillBg: 'linear-gradient(90deg, rgba(112, 26, 117, 0.45) 0%, rgba(74, 4, 78, 0.75) 100%)',
      tilt: 2.2,
      watermarkType: 'aa'
    }
  };

  const getMeta = (skill: SkillItem, idx: number) => {
    const keys = ['reading', 'writing', 'listening', 'speaking', 'vocab'];
    const key = skill.key && skillMeta[skill.key] ? skill.key : keys[idx % 5];
    return skillMeta[key];
  };

  // Render 3D isometric watermarks matching the exact illustration style in mockup
  const renderWatermark = (type: 'book' | 'pen' | 'headphones' | 'mic' | 'aa', color: string) => {
    switch (type) {
      case 'book':
        return (
          <svg className="skills-card-watermark" viewBox="0 0 170 145" fill="none">
            <defs>
              <linearGradient id="wmBookCover" x1="10" y1="40" x2="150" y2="120" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor={color} stopOpacity="0.35" />
                <stop offset="100%" stopColor={color} stopOpacity="0.12" />
              </linearGradient>
            </defs>
            <g opacity="0.38" transform="translate(10, 8)">
              {/* Back cover base */}
              <path d="M 12 95 L 75 118 L 145 92 L 145 42 L 75 68 L 12 45 Z" fill={color} fillOpacity="0.08" />
              {/* Left page block */}
              <path d="M 75 75 C 50 64 25 68 14 85 L 14 36 C 25 18 50 14 75 25 Z" fill="url(#wmBookCover)" stroke={color} strokeWidth="2.5" />
              {/* Right page block */}
              <path d="M 75 75 C 100 64 125 68 136 85 L 136 36 C 125 18 100 14 75 25 Z" fill="url(#wmBookCover)" stroke={color} strokeWidth="2.5" />
              {/* Center spine seam */}
              <line x1="75" y1="25" x2="75" y2="75" stroke={color} strokeWidth="3" />
              {/* Page layering lines */}
              <path d="M 18 86 C 30 74 52 70 75 78" stroke={color} strokeWidth="2" opacity="0.5" />
              <path d="M 132 86 C 120 74 98 70 75 78" stroke={color} strokeWidth="2" opacity="0.5" />
            </g>
          </svg>
        );
      case 'pen':
        return (
          <svg className="skills-card-watermark" viewBox="0 0 170 145" fill="none">
            <defs>
              <linearGradient id="wmDocGrad" x1="50" y1="20" x2="130" y2="120" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor={color} stopOpacity="0.32" />
                <stop offset="100%" stopColor={color} stopOpacity="0.10" />
              </linearGradient>
            </defs>
            <g opacity="0.38" transform="translate(18, 8)">
              {/* Document sheet with folded top-right corner */}
              <path d="M 45 16 L 98 16 L 122 40 L 122 122 L 45 122 Z" fill="url(#wmDocGrad)" stroke={color} strokeWidth="2.5" rx="5" />
              <path d="M 98 16 L 98 40 L 122 40 Z" fill={color} fillOpacity="0.4" stroke={color} strokeWidth="2" />
              {/* Writing content lines */}
              <line x1="58" y1="50" x2="94" y2="50" stroke={color} strokeWidth="3" strokeLinecap="round" opacity="0.8" />
              <line x1="58" y1="66" x2="110" y2="66" stroke={color} strokeWidth="3" strokeLinecap="round" opacity="0.8" />
              <line x1="58" y1="82" x2="102" y2="82" stroke={color} strokeWidth="3" strokeLinecap="round" opacity="0.8" />
              <line x1="58" y1="98" x2="84" y2="98" stroke={color} strokeWidth="3" strokeLinecap="round" opacity="0.8" />
              {/* Leaning 3D pen */}
              <g transform="translate(16, 36) rotate(-34)">
                <rect x="0" y="0" width="13" height="66" rx="3" fill={color} fillOpacity="0.6" stroke={color} strokeWidth="2" />
                <path d="M 0 66 L 6.5 78 L 13 66 Z" fill={color} />
              </g>
            </g>
          </svg>
        );
      case 'headphones':
        return (
          <svg className="skills-card-watermark" viewBox="0 0 170 145" fill="none">
            <g opacity="0.38" transform="translate(12, 10)">
              {/* Robust headband */}
              <path d="M 36 78 C 36 26 122 26 122 78" stroke={color} strokeWidth="9" strokeLinecap="round" fill="none" />
              {/* Left ear cushion */}
              <rect x="22" y="66" width="24" height="42" rx="12" fill={color} fillOpacity="0.45" stroke={color} strokeWidth="2.5" />
              {/* Right ear cushion */}
              <rect x="112" y="66" width="24" height="42" rx="12" fill={color} fillOpacity="0.45" stroke={color} strokeWidth="2.5" />
              {/* Soundwaves ripples */}
              <path d="M 12 76 C 8 82 8 92 12 98" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 146 76 C 150 82 150 92 146 98" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
            </g>
          </svg>
        );
      case 'mic':
        return (
          <svg className="skills-card-watermark" viewBox="0 0 170 145" fill="none">
            <g opacity="0.38" transform="translate(24, 10)">
              {/* Mic mesh capsule */}
              <rect x="46" y="16" width="32" height="54" rx="16" fill={color} fillOpacity="0.35" stroke={color} strokeWidth="2.5" />
              <line x1="46" y1="36" x2="78" y2="36" stroke={color} strokeWidth="2" opacity="0.7" />
              <line x1="46" y1="48" x2="78" y2="48" stroke={color} strokeWidth="2" opacity="0.7" />
              {/* Mic U-mount */}
              <path d="M 35 46 C 35 76 89 76 89 46" stroke={color} strokeWidth="3.5" strokeLinecap="round" fill="none" />
              {/* Stand and base */}
              <line x1="62" y1="76" x2="62" y2="104" stroke={color} strokeWidth="4.5" />
              <path d="M 42 104 L 82 104" stroke={color} strokeWidth="4.5" strokeLinecap="round" />
              {/* Voice waves */}
              <line x1="22" y1="44" x2="22" y2="58" stroke={color} strokeWidth="3" strokeLinecap="round" />
              <line x1="14" y1="48" x2="14" y2="54" stroke={color} strokeWidth="3" strokeLinecap="round" />
              <line x1="102" y1="44" x2="102" y2="58" stroke={color} strokeWidth="3" strokeLinecap="round" />
              <line x1="110" y1="48" x2="110" y2="54" stroke={color} strokeWidth="3" strokeLinecap="round" />
            </g>
          </svg>
        );
      case 'aa':
      default:
        return (
          <svg className="skills-card-watermark" viewBox="0 0 170 145" fill="none">
            <g opacity="0.42" transform="translate(18, 14)">
              {/* Isometric 3D box */}
              <path d="M 44 48 L 92 26 L 134 48 L 86 70 Z" fill={color} fillOpacity="0.28" stroke={color} strokeWidth="2.5" />
              <path d="M 44 48 L 86 70 L 86 102 L 44 80 Z" fill={color} fillOpacity="0.45" stroke={color} strokeWidth="2.5" />
              <path d="M 86 70 L 134 48 L 134 80 L 86 102 Z" fill={color} fillOpacity="0.18" stroke={color} strokeWidth="2.5" />
              {/* Extruded text "Aa" */}
              <text x="88" y="106" fill={color} fontSize="46" fontWeight="900" fontFamily="sans-serif" textAnchor="middle" opacity="0.95">Aa</text>
            </g>
          </svg>
        );
    }
  };

  return (
    <section id="skills" className={`skills-modern-section ${dark ? 'is-dark' : 'is-light'}`}>
      <style>{`
        .skills-modern-section {
          background: linear-gradient(180deg, #060913 0%, #0a1022 50%, #060913 100%);
          color: #ffffff;
          padding: 85px 20px 105px;
          position: relative;
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          transition: background 0.3s ease, color 0.3s ease;
        }

        /* LIGHT MODE SUPPORT */
        .skills-modern-section.is-light {
          background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 50%, #f8fafc 100%) !important;
          color: #0f172a !important;
        }
        .skills-modern-section.is-light .skills-kicker-badge {
          background: rgba(37, 99, 235, 0.08) !important;
          border-color: rgba(37, 99, 235, 0.25) !important;
          color: #2563eb !important;
        }
        .skills-modern-section.is-light .skills-main-title {
          color: #0f172a !important;
        }
        .skills-modern-section.is-light .skills-subtitle {
          color: #475569 !important;
        }
        .skills-modern-section.is-light .skills-card {
          background: rgba(255, 255, 255, 0.96) !important;
          border: 1.5px solid rgba(226, 232, 240, 0.95) !important;
          box-shadow: 0 14px 34px rgba(0, 0, 0, 0.05) !important;
        }
        .skills-modern-section.is-light .skills-card-title {
          color: #0f172a !important;
        }
        .skills-modern-section.is-light .skills-card-desc {
          color: #475569 !important;
        }
        .skills-modern-section.is-light .skills-mobile-pill-item {
          background: rgba(255, 255, 255, 0.95) !important;
          border-color: rgba(226, 232, 240, 0.95) !important;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.05) !important;
        }
        .skills-modern-section.is-light .skills-mobile-pill-title {
          color: #0f172a !important;
        }
        .skills-modern-section.is-light .skills-calligraphy-note {
          color: #2563eb !important;
        }

        /* Ambient background glow spots */
        .skills-glow-top-left {
          position: absolute;
          top: 8%;
          left: -120px;
          width: 540px;
          height: 540px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(56, 189, 248, 0.12) 0%, transparent 70%);
          filter: blur(80px);
          pointer-events: none;
        }
        .skills-glow-top-right {
          position: absolute;
          top: 10%;
          right: -100px;
          width: 560px;
          height: 560px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.14) 0%, transparent 70%);
          filter: blur(85px);
          pointer-events: none;
        }

        .skills-container {
          max-width: 1240px;
          margin: 0 auto;
          position: relative;
          z-index: 10;
        }

        /* Header Grid with Left Text and Right 3D Books Artwork */
        .skills-header-grid {
          display: grid;
          grid-template-columns: 1fr 340px;
          align-items: center;
          gap: 30px;
          margin-bottom: 52px;
          position: relative;
        }

        .skills-header-left {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
          position: relative;
        }

        /* Dot Matrix Pattern on Left */
        .skills-dot-matrix-left {
          position: absolute;
          left: -32px;
          top: 60px;
          display: grid;
          grid-template-columns: repeat(4, 5px);
          gap: 9px;
          opacity: 0.25;
          pointer-events: none;
        }
        .skills-dot-matrix-left span {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #38bdf8;
        }

        /* Kicker Badge */
        .skills-kicker-badge {
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
        .skills-main-title {
          font-size: clamp(28px, 3.8vw, 44px);
          font-weight: 900;
          line-height: 1.22;
          margin: 0 0 14px;
          letter-spacing: -0.6px;
          color: #ffffff;
        }
        .skills-gradient-text {
          background: linear-gradient(135deg, #38bdf8 0%, #818cf8 50%, #c084fc 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .skills-subtitle {
          font-size: 15.5px;
          line-height: 1.6;
          color: #94a3b8;
          max-width: 580px;
          margin: 0;
        }

        /* Right Column: 3D Books Stack with Headphones & Slogan */
        .skills-header-right {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .skills-3d-art-wrap {
          width: 235px;
          height: 175px;
          filter: drop-shadow(0 16px 36px rgba(37, 99, 235, 0.38));
          animation: skillsArtFloat 4.2s ease-in-out infinite alternate;
        }
        @keyframes skillsArtFloat {
          0% { transform: translateY(0px) rotate(0deg); }
          100% { transform: translateY(-7px) rotate(-1.5deg); }
        }

        .skills-calligraphy-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 8px;
          position: relative;
        }

        .skills-calligraphy-note {
          font-family: "Segoe Script", "Brush Script MT", cursive, sans-serif;
          font-size: 14.5px;
          line-height: 1.35;
          color: #7dd3fc;
          text-shadow: 0 0 14px rgba(56, 189, 248, 0.45);
          transform: rotate(-3deg);
          text-align: center;
          position: relative;
        }

        .skills-curved-arrow {
          filter: drop-shadow(0 0 8px rgba(56, 189, 248, 0.55));
          animation: arrowWiggle 2.5s ease-in-out infinite alternate;
        }
        @keyframes arrowWiggle {
          0% { transform: translateY(0) rotate(0deg); }
          100% { transform: translateY(-3px) rotate(4deg); }
        }

        /* ========================================================
           DESKTOP ASYMMETRIC STAGGERED 3-COLUMN / 2-ROW GRID
           EXACT MATCH WITH REFERENCE IMAGE 1
           ======================================================== */
        .skills-desktop-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          grid-template-rows: auto auto;
          gap: 30px 24px;
          align-items: center;
          position: relative;
          max-width: 1240px;
          margin: 0 auto;
        }

        .skills-grid-cell {
          width: 100%;
          display: flex;
          transition: z-index 0.35s ease;
        }

        /* 1. O'qish (Reading) - Row 1, Col 1 */
        .skills-grid-reading {
          grid-column: 1;
          grid-row: 1;
        }

        /* 2. Yozish (Writing) - Row 1, Col 2 */
        .skills-grid-writing {
          grid-column: 2;
          grid-row: 1;
        }

        /* 3. Tinglash (Listening) - Row 2, Col 1 */
        .skills-grid-listening {
          grid-column: 1;
          grid-row: 2;
        }

        /* 4. Gapirish (Speaking) - Row 2, Col 2 */
        .skills-grid-speaking {
          grid-column: 2;
          grid-row: 2;
        }

        /* 5. Lug'at (Vocabulary) - Col 3, centered vertically spanning both rows! */
        .skills-grid-vocab {
          grid-column: 3;
          grid-row: 1 / span 2;
          align-self: center;
        }

        /* Individual Card Component */
        .skills-card {
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1.5px solid var(--skill-border-glow);
          border-radius: 24px;
          padding: 28px 26px 24px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
          position: relative;
          overflow: hidden;
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.45), 0 0 24px var(--skill-shadow);
          cursor: pointer;
          min-height: 220px;
          width: 100%;
        }
        .skills-card:hover {
          box-shadow: 0 22px 52px rgba(0, 0, 0, 0.6), 0 0 32px var(--skill-shadow);
          border-color: var(--skill-accent);
        }

        /* Card Icon Box */
        .skills-card-icon {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          display: grid;
          place-items: center;
          color: #ffffff;
          box-shadow: 0 6px 18px var(--skill-shadow);
          margin-bottom: 16px;
          position: relative;
          z-index: 2;
          transition: transform 0.25s ease;
        }
        .skills-card:hover .skills-card-icon {
          transform: scale(1.12) rotate(4deg);
        }

        .skills-card-title {
          font-size: 17.5px;
          font-weight: 800;
          color: #ffffff;
          line-height: 1.35;
          margin: 0 0 10px;
          position: relative;
          z-index: 2;
        }

        .skills-card-desc {
          font-size: 13.2px;
          line-height: 1.6;
          color: #94a3b8;
          margin: 0 0 22px;
          flex: 1;
          position: relative;
          z-index: 2;
        }

        /* Bottom Row with Themed Circular Arrow Button matching reference mockup */
        .skills-card-bottom {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          position: relative;
          z-index: 2;
        }
        .skills-arrow-btn {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: var(--skill-accent);
          display: grid;
          place-items: center;
          color: #ffffff;
          box-shadow: 0 4px 16px var(--skill-shadow);
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .skills-card:hover .skills-arrow-btn {
          transform: translateX(5px) scale(1.08);
          box-shadow: 0 6px 20px var(--skill-shadow);
        }

        /* Corner 3D Graphic Watermark */
        .skills-card-watermark {
          position: absolute;
          bottom: -4px;
          right: -4px;
          width: 135px;
          height: 115px;
          pointer-events: none;
          z-index: 1;
          transition: transform 0.35s ease, opacity 0.35s ease;
        }
        .skills-card:hover .skills-card-watermark {
          transform: scale(1.1) rotate(2deg);
          opacity: 0.55;
        }

        /* ========================================================
           MOBILE PILL CARDS LIST (MATCHING PHONE SCREEN IN MOCKUP)
           ======================================================== */
        .skills-mobile-pill-list {
          display: none;
          flex-direction: column;
          gap: 13px;
          width: 100%;
          max-width: 440px;
          margin: 0 auto;
        }

        .skills-mobile-pill-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          border-radius: 20px;
          border: 1.5px solid var(--pill-border);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.32), 0 0 18px var(--pill-shadow);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .skills-mobile-pill-item:active {
          transform: scale(0.98);
        }

        .skills-mobile-pill-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .skills-mobile-pill-icon {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          display: grid;
          place-items: center;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          flex-shrink: 0;
        }

        .skills-mobile-pill-title {
          font-size: 15px;
          font-weight: 750;
          color: #ffffff;
          letter-spacing: -0.2px;
        }

        /* Themed solid circle arrow button on the right matching mockup */
        .skills-mobile-pill-arrow {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--pill-accent);
          display: grid;
          place-items: center;
          color: #ffffff;
          box-shadow: 0 4px 12px var(--pill-shadow);
          flex-shrink: 0;
          transition: transform 0.2s ease;
        }
        .skills-mobile-pill-item:hover .skills-mobile-pill-arrow {
          transform: translateX(3px);
        }

        /* RESPONSIVE MEDIA QUERIES */
        @media (max-width: 900px) {
          .skills-modern-section {
            padding: 55px 16px 70px;
          }
          .skills-header-grid {
            grid-template-columns: 1fr;
            text-align: center;
            gap: 16px;
            margin-bottom: 24px;
          }
          .skills-header-left {
            align-items: center;
            text-align: center;
          }
          .skills-dot-matrix-left {
            display: none;
          }
          .skills-header-right {
            display: flex !important;
            margin: 10px auto 14px;
          }
          .skills-3d-art-wrap {
            width: 190px;
            height: 145px;
          }
          .skills-calligraphy-wrap {
            display: none !important;
          }
          .skills-desktop-grid {
            display: none !important;
          }
          .skills-mobile-pill-list {
            display: flex !important;
          }
        }
      `}</style>

      {/* Ambient background glows */}
      <div className="skills-glow-top-left" />
      <div className="skills-glow-top-right" />

      <div className="skills-container">
        {/* Header Grid */}
        <div className="skills-header-grid">
          {/* Left Column: Kicker, Title, Subtitle */}
          <div className="skills-header-left">
            <div className="skills-dot-matrix-left" aria-hidden="true">
              {Array.from({ length: 16 }).map((_, i) => (
                <span key={i} />
              ))}
            </div>

            <span className="skills-kicker-badge">
              <Sparkles size={14} color="#60a5fa" />
              {currentKicker}
            </span>

            <h2 className="skills-main-title">
              5 ta asosiy til könikmasini <br />
              <span className="skills-gradient-text">mustahkamlang</span>
            </h2>

            <p className="skills-subtitle">
              {currentSubtitle}
            </p>
          </div>

          {/* Right Column: 3D Books Stack with Headphones & Slogan */}
          <div className="skills-header-right">
            <svg
              className="skills-3d-art-wrap"
              viewBox="0 0 240 180"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="bookBlueGrad" x1="50" y1="90" x2="180" y2="135" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#0284c7" />
                </linearGradient>
                <linearGradient id="bookTealGrad" x1="45" y1="105" x2="175" y2="145" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#2dd4bf" />
                  <stop offset="100%" stopColor="#0f766e" />
                </linearGradient>
                <linearGradient id="bookPurpleGrad" x1="40" y1="120" x2="170" y2="160" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#c084fc" />
                  <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>
                <linearGradient id="headphonesGrad" x1="75" y1="20" x2="165" y2="95" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#60a5fa" />
                  <stop offset="50%" stopColor="#2563eb" />
                  <stop offset="100%" stopColor="#1e3a8a" />
                </linearGradient>
                <filter id="artShadow" x="-10" y="-10" width="260" height="200" filterUnits="userSpaceOnUse">
                  <feDropShadow dx="0" dy="12" stdDeviation="7" floodColor="#1e3a8a" floodOpacity="0.4" />
                </filter>
              </defs>

              {/* Stack of 3 3D Books matching mockup */}
              <g filter="url(#artShadow)">
                {/* 1. Bottom Purple Book */}
                <path d="M 40 135 L 145 116 L 185 130 L 80 152 Z" fill="url(#bookPurpleGrad)" />
                <path d="M 40 135 L 80 152 L 80 162 L 40 145 Z" fill="#6b21a8" />
                <path d="M 80 152 L 185 130 L 185 139 L 80 162 Z" fill="#ffffff" opacity="0.9" />

                {/* 2. Middle Cyan/Teal Book */}
                <path d="M 48 116 L 152 98 L 190 112 L 86 132 Z" fill="url(#bookTealGrad)" />
                <path d="M 48 116 L 86 132 L 86 141 L 48 125 Z" fill="#115e59" />
                <path d="M 86 132 L 190 112 L 190 120 L 86 141 Z" fill="#ffffff" opacity="0.9" />

                {/* 3. Top Blue Book */}
                <path d="M 56 96 L 160 78 L 196 92 L 92 112 Z" fill="url(#bookBlueGrad)" />
                <path d="M 56 96 L 92 112 L 92 120 L 56 104 Z" fill="#0369a1" />
                <path d="M 92 112 L 196 92 L 196 100 L 92 120 Z" fill="#ffffff" opacity="0.9" />

                {/* 3D Over-ear Headphones resting on top */}
                <path
                  d="M 74 84 C 74 24, 154 24, 154 84"
                  stroke="url(#headphonesGrad)"
                  strokeWidth="9"
                  strokeLinecap="round"
                />
                {/* Left Ear Cushion */}
                <ellipse cx="72" cy="84" rx="12" ry="17" fill="#1d4ed8" transform="rotate(-10 72 84)" />
                <ellipse cx="72" cy="84" rx="8" ry="13" fill="#38bdf8" transform="rotate(-10 72 84)" />

                {/* Right Ear Cushion */}
                <ellipse cx="156" cy="84" rx="12" ry="17" fill="#1d4ed8" transform="rotate(10 156 84)" />
                <ellipse cx="156" cy="84" rx="8" ry="13" fill="#38bdf8" transform="rotate(10 156 84)" />

                {/* Floating 3D Speech Bubble with Dots */}
                <rect x="146" y="52" width="38" height="30" rx="11" fill="#60a5fa" />
                <circle cx="156" cy="67" r="2.4" fill="#ffffff" />
                <circle cx="165" cy="67" r="2.4" fill="#ffffff" />
                <circle cx="174" cy="67" r="2.4" fill="#ffffff" />

                {/* Floating 'A' Blue Badge */}
                <rect x="38" y="44" width="24" height="24" rx="7" fill="#2563eb" />
                <text x="50" y="61" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="900">A</text>

                {/* Floating '文' Purple Badge */}
                <rect x="176" y="94" width="24" height="24" rx="7" fill="#8b5cf6" />
                <text x="188" y="111" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="800">文</text>
              </g>

              {/* Radiant speed marks */}
              <path d="M 170 32 C 174 27 178 29 181 25" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 28 88 C 24 93 22 97 20 103" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
            </svg>

            <div className="skills-calligraphy-wrap">
              <span className="skills-calligraphy-note">
                Til örganiş — yangi imkoniyatlar dunyosi! ✨
              </span>
              <svg className="skills-curved-arrow" width="36" height="36" viewBox="0 0 40 40" fill="none">
                <path d="M 32 6 C 34 20 20 30 10 32" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="3 3" />
                <path d="M 14 27 L 10 32 L 16 36" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>

        {/* ========================================================
            1. DESKTOP ASYMMETRIC STAGGERED CARDS GRID
            Row 1: Reading, Writing
            Row 2: Listening, Speaking
            Right Column: Lug'at (Vocabulary) spanning both rows
            ======================================================== */}
        <div className="skills-desktop-grid">
          {currentSkills.map((skill, idx) => {
            const meta = getMeta(skill, idx);
            const Icon = meta.icon;
            const skillKey = skill.key || (idx === 0 ? 'reading' : idx === 1 ? 'writing' : idx === 2 ? 'listening' : idx === 3 ? 'speaking' : 'vocab');
            const gridCellClass = `skills-grid-${skillKey}`;

            return (
              <motion.div
                key={skill.key || idx}
                className={`skills-grid-cell ${gridCellClass}`}
                initial={{ opacity: 0, y: 35, rotate: 0 }}
                whileInView={{ opacity: 1, y: 0, rotate: meta.tilt }}
                whileHover={{ rotate: 0, y: -8, scale: 1.03 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.65, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
              >
                <TiltCard maxTilt={5} glowColor={meta.shadowColor}>
                  <div
                    className={`skills-card skills-card-${skillKey}`}
                    onClick={() => onSelectSkill && skill.key && onSelectSkill(skill.key)}
                    style={{
                      background: meta.cardBg,
                      ['--skill-accent' as any]: meta.accent,
                      ['--skill-border-glow' as any]: meta.borderGlow,
                      ['--skill-shadow' as any]: meta.shadowColor
                    }}
                  >
                    {/* Glowing Colored Icon Badge */}
                    <div style={{ position: 'relative', display: 'inline-block', marginBottom: '14px' }}>
                      <motion.div
                        className="skills-card-icon"
                        style={{ background: meta.iconGrad, margin: 0 }}
                        whileHover={{ scale: 1.15, rotate: 5 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                      >
                        <Icon size={24} />
                      </motion.div>
                    </div>

                    {/* Title */}
                    <div style={{ marginBottom: '8px' }}>
                      <h3 className="skills-card-title" style={{ margin: 0 }}>{skill.title}</h3>
                    </div>

                    {/* Description */}
                    <p className="skills-card-desc">{skill.desc}</p>

                    {/* Bottom Row with Themed Circular Arrow Button */}
                    <div className="skills-card-bottom">
                      <motion.div
                        className="skills-arrow-btn"
                        whileHover={{ x: 4, scale: 1.1 }}
                      >
                        <ArrowRight size={16} strokeWidth={2.5} />
                      </motion.div>
                    </div>

                    {/* Corner 3D Graphic Watermark */}
                    {renderWatermark(meta.watermarkType, meta.accent)}
                  </div>
                </TiltCard>
              </motion.div>
            );
          })}
        </div>

        {/* ========================================================
            2. MOBILE SLEEK HORIZONTAL PILL CARDS (PHONE MOCKUP)
            ======================================================== */}
        <div className="skills-mobile-pill-list">
          {currentSkills.map((skill, idx) => {
            const meta = getMeta(skill, idx);
            const Icon = meta.icon;
            const skillKey = skill.key || (idx === 0 ? 'reading' : idx === 1 ? 'writing' : idx === 2 ? 'listening' : idx === 3 ? 'speaking' : 'vocab');

            return (
              <motion.div
                key={skill.key || idx}
                className="skills-mobile-pill-item"
                onClick={() => onSelectSkill && skill.key && onSelectSkill(skill.key)}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: idx * 0.08 }}
                style={{
                  background: meta.pillBg,
                  ['--pill-accent' as any]: meta.accent,
                  ['--pill-border' as any]: meta.borderGlow,
                  ['--pill-shadow' as any]: meta.shadowColor
                }}
              >
                <div className="skills-mobile-pill-left">
                  <div className="skills-mobile-pill-icon" style={{ background: meta.accent }}>
                    <Icon size={20} color="#ffffff" strokeWidth={2.4} />
                  </div>
                  <span className="skills-mobile-pill-title">{skill.title}</span>
                </div>

                <div className="skills-mobile-pill-arrow">
                  <ArrowRight size={16} strokeWidth={2.5} />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
