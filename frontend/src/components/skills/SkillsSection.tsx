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

  // Metadata matching the exact colors and themes from reference mockup
  const skillMeta: Record<string, {
    icon: any;
    accent: string;
    borderGlow: string;
    iconGrad: string;
    shadowColor: string;
    cardBg: string;
    pillBg: string;
    watermarkType: 'book' | 'pen' | 'headphones' | 'mic' | 'aa';
  }> = {
    reading: {
      icon: BookOpen,
      accent: '#8b5cf6',
      borderGlow: 'rgba(139, 92, 246, 0.45)',
      iconGrad: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)',
      shadowColor: 'rgba(139, 92, 246, 0.35)',
      cardBg: 'linear-gradient(145deg, rgba(30, 16, 68, 0.88) 0%, rgba(15, 23, 42, 0.92) 100%)',
      pillBg: 'linear-gradient(135deg, rgba(88, 28, 135, 0.45) 0%, rgba(30, 27, 75, 0.7) 100%)',
      watermarkType: 'book'
    },
    writing: {
      icon: PenLine,
      accent: '#06b6d4',
      borderGlow: 'rgba(6, 182, 212, 0.45)',
      iconGrad: 'linear-gradient(135deg, #22d3ee 0%, #0891b2 100%)',
      shadowColor: 'rgba(6, 182, 212, 0.35)',
      cardBg: 'linear-gradient(145deg, rgba(8, 40, 60, 0.88) 0%, rgba(15, 23, 42, 0.92) 100%)',
      pillBg: 'linear-gradient(135deg, rgba(6, 182, 212, 0.25) 0%, rgba(8, 51, 68, 0.7) 100%)',
      watermarkType: 'pen'
    },
    listening: {
      icon: Headphones,
      accent: '#f97316',
      borderGlow: 'rgba(249, 115, 22, 0.45)',
      iconGrad: 'linear-gradient(135deg, #fb923c 0%, #ea580c 100%)',
      shadowColor: 'rgba(249, 115, 22, 0.35)',
      cardBg: 'linear-gradient(145deg, rgba(50, 24, 14, 0.88) 0%, rgba(15, 23, 42, 0.92) 100%)',
      pillBg: 'linear-gradient(135deg, rgba(234, 88, 12, 0.25) 0%, rgba(67, 20, 7, 0.7) 100%)',
      watermarkType: 'headphones'
    },
    speaking: {
      icon: Mic,
      accent: '#3b82f6',
      borderGlow: 'rgba(59, 130, 246, 0.45)',
      iconGrad: 'linear-gradient(135deg, #60a5fa 0%, #2563eb 100%)',
      shadowColor: 'rgba(59, 130, 246, 0.35)',
      cardBg: 'linear-gradient(145deg, rgba(16, 32, 75, 0.88) 0%, rgba(15, 23, 42, 0.92) 100%)',
      pillBg: 'linear-gradient(135deg, rgba(37, 99, 235, 0.25) 0%, rgba(23, 37, 84, 0.7) 100%)',
      watermarkType: 'mic'
    },
    vocab: {
      icon: Layers,
      accent: '#d946ef',
      borderGlow: 'rgba(217, 70, 239, 0.45)',
      iconGrad: 'linear-gradient(135deg, #f472b6 0%, #c026d3 100%)',
      shadowColor: 'rgba(217, 70, 239, 0.35)',
      cardBg: 'linear-gradient(145deg, rgba(52, 14, 56, 0.88) 0%, rgba(15, 23, 42, 0.92) 100%)',
      pillBg: 'linear-gradient(135deg, rgba(192, 38, 211, 0.25) 0%, rgba(74, 4, 78, 0.7) 100%)',
      watermarkType: 'aa'
    }
  };

  const getMeta = (skill: SkillItem, idx: number) => {
    const keys = ['reading', 'writing', 'listening', 'speaking', 'vocab'];
    const key = skill.key && skillMeta[skill.key] ? skill.key : keys[idx % 5];
    return skillMeta[key];
  };

  // Render 3D watermarks matching the exact illustration style in mockup
  const renderWatermark = (type: 'book' | 'pen' | 'headphones' | 'mic' | 'aa', color: string) => {
    switch (type) {
      case 'book':
        return (
          <svg className="skills-card-watermark" viewBox="0 0 160 140" fill="none">
            <g opacity="0.32" transform="translate(10, 10)">
              {/* Left Page block */}
              <path d="M 70 85 C 45 75 20 80 10 95 L 10 35 C 20 20 45 15 70 25 Z" fill={color} fillOpacity="0.18" stroke={color} strokeWidth="3" />
              {/* Right Page block */}
              <path d="M 70 85 C 95 75 120 80 130 95 L 130 35 C 120 20 95 15 70 25 Z" fill={color} fillOpacity="0.25" stroke={color} strokeWidth="3" />
              {/* Spine */}
              <path d="M 70 25 L 70 85" stroke={color} strokeWidth="3.5" />
              {/* Page layers effect */}
              <path d="M 12 96 C 22 82 45 77 70 87" stroke={color} strokeWidth="2.5" opacity="0.6" />
              <path d="M 128 96 C 118 82 95 77 70 87" stroke={color} strokeWidth="2.5" opacity="0.6" />
            </g>
          </svg>
        );
      case 'pen':
        return (
          <svg className="skills-card-watermark" viewBox="0 0 160 140" fill="none">
            <g opacity="0.32" transform="translate(15, 10)">
              {/* Document with folded top-right corner */}
              <path d="M 45 15 L 95 15 L 115 35 L 115 115 L 45 115 Z" fill={color} fillOpacity="0.18" stroke={color} strokeWidth="3" rx="4" />
              <path d="M 95 15 L 95 35 L 115 35 Z" fill={color} fillOpacity="0.4" stroke={color} strokeWidth="2.5" />
              {/* Writing lines on document */}
              <line x1="58" y1="45" x2="88" y2="45" stroke={color} strokeWidth="3" strokeLinecap="round" />
              <line x1="58" y1="60" x2="102" y2="60" stroke={color} strokeWidth="3" strokeLinecap="round" />
              <line x1="58" y1="75" x2="95" y2="75" stroke={color} strokeWidth="3" strokeLinecap="round" />
              <line x1="58" y1="90" x2="78" y2="90" stroke={color} strokeWidth="3" strokeLinecap="round" />
              {/* 3D Pen leaning at angle */}
              <g transform="translate(18, 40) rotate(-35)">
                <rect x="0" y="0" width="12" height="60" rx="3" fill={color} fillOpacity="0.5" stroke={color} strokeWidth="2.5" />
                <path d="M 0 60 L 6 72 L 12 60 Z" fill={color} />
              </g>
            </g>
          </svg>
        );
      case 'headphones':
        return (
          <svg className="skills-card-watermark" viewBox="0 0 160 140" fill="none">
            <g opacity="0.32" transform="translate(10, 10)">
              {/* Headband arch */}
              <path d="M 35 75 C 35 25 115 25 115 75" stroke={color} strokeWidth="8" strokeLinecap="round" fill="none" />
              {/* Left ear cushion */}
              <rect x="22" y="65" width="22" height="38" rx="11" fill={color} fillOpacity="0.45" stroke={color} strokeWidth="3" />
              {/* Right ear cushion */}
              <rect x="106" y="65" width="22" height="38" rx="11" fill={color} fillOpacity="0.45" stroke={color} strokeWidth="3" />
              {/* Sound waves on side */}
              <path d="M 12 75 C 8 80 8 88 12 93" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 138 75 C 142 80 142 88 138 93" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
            </g>
          </svg>
        );
      case 'mic':
        return (
          <svg className="skills-card-watermark" viewBox="0 0 160 140" fill="none">
            <g opacity="0.32" transform="translate(20, 10)">
              {/* Mic Capsule */}
              <rect x="45" y="15" width="30" height="52" rx="15" fill={color} fillOpacity="0.3" stroke={color} strokeWidth="3" />
              <line x1="45" y1="35" x2="75" y2="35" stroke={color} strokeWidth="2" opacity="0.7" />
              <line x1="45" y1="47" x2="75" y2="47" stroke={color} strokeWidth="2" opacity="0.7" />
              {/* Mic Holder / U-shape */}
              <path d="M 35 45 C 35 72 85 72 85 45" stroke={color} strokeWidth="3.5" strokeLinecap="round" fill="none" />
              {/* Stand pole & base */}
              <line x1="60" y1="72" x2="60" y2="98" stroke={color} strokeWidth="4" />
              <path d="M 42 98 L 78 98" stroke={color} strokeWidth="4" strokeLinecap="round" />
              {/* Sound wave bars */}
              <line x1="24" y1="42" x2="24" y2="56" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
              <line x1="16" y1="46" x2="16" y2="52" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
              <line x1="96" y1="42" x2="96" y2="56" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
              <line x1="104" y1="46" x2="104" y2="52" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
            </g>
          </svg>
        );
      case 'aa':
      default:
        return (
          <svg className="skills-card-watermark" viewBox="0 0 160 140" fill="none">
            <g opacity="0.35" transform="translate(15, 15)">
              {/* 3D letter block */}
              <path d="M 40 45 L 85 25 L 125 45 L 80 65 Z" fill={color} fillOpacity="0.25" stroke={color} strokeWidth="2.5" />
              <path d="M 40 45 L 80 65 L 80 95 L 40 75 Z" fill={color} fillOpacity="0.4" stroke={color} strokeWidth="2.5" />
              <path d="M 80 65 L 125 45 L 125 75 L 80 95 Z" fill={color} fillOpacity="0.15" stroke={color} strokeWidth="2.5" />
              {/* Text "Aa" */}
              <text x="82" y="102" fill={color} fontSize="44" fontWeight="900" fontFamily="sans-serif" textAnchor="middle" opacity="0.9">Aa</text>
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
        .skills-modern-section.is-light .skills-arrow-btn {
          background: rgba(241, 245, 249, 0.9) !important;
          border-color: rgba(226, 232, 240, 0.95) !important;
          color: #2563eb !important;
        }
        .skills-modern-section.is-light .skills-mobile-pill-item {
          background: rgba(255, 255, 255, 0.95) !important;
          border-color: rgba(226, 232, 240, 0.95) !important;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.05) !important;
        }
        .skills-modern-section.is-light .skills-mobile-pill-title {
          color: #0f172a !important;
        }
        .skills-modern-section.is-light .skills-mobile-pill-arrow {
          background: rgba(37, 99, 235, 0.1) !important;
          color: #2563eb !important;
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

        /* Header Grid with Left/Center Text and Right 3D Books Artwork */
        .skills-header-grid {
          display: grid;
          grid-template-columns: 1fr 340px;
          align-items: center;
          gap: 30px;
          margin-bottom: 50px;
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
          width: 220px;
          height: 165px;
          filter: drop-shadow(0 16px 36px rgba(37, 99, 235, 0.35));
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
          margin-top: 6px;
          position: relative;
        }

        .skills-calligraphy-note {
          font-family: "Segoe Script", "Brush Script MT", cursive, sans-serif;
          font-size: 14px;
          line-height: 1.35;
          color: #7dd3fc;
          text-shadow: 0 0 12px rgba(56, 189, 248, 0.4);
          transform: rotate(-3deg);
          text-align: center;
          position: relative;
        }

        .skills-curved-arrow {
          filter: drop-shadow(0 0 6px rgba(56, 189, 248, 0.5));
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
          gap: 28px 24px;
          align-items: center;
          position: relative;
          max-width: 1240px;
          margin: 0 auto;
        }

        .skills-grid-cell {
          width: 100%;
          display: flex;
          will-change: transform, opacity;
          position: relative;
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

        .skills-grid-cell:hover {
          z-index: 20;
        }

        /* Individual Card Component */
        .skills-card {
          background: rgba(14, 25, 55, 0.78);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border: 1.5px solid var(--skill-border-glow);
          border-radius: 22px;
          padding: 26px 24px 22px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
          position: relative;
          overflow: hidden;
          transition: box-shadow 0.25s ease, border-color 0.25s ease;
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.45), 0 0 20px var(--skill-shadow);
          cursor: pointer;
          min-height: 205px;
          width: 100%;
        }
        .skills-card:hover {
          box-shadow: 0 20px 48px rgba(0, 0, 0, 0.55), 0 0 28px var(--skill-shadow);
          border-color: var(--skill-accent);
        }

        /* Card Icon Box */
        .skills-card-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: grid;
          place-items: center;
          color: #ffffff;
          box-shadow: 0 6px 16px var(--skill-shadow);
          margin-bottom: 16px;
          position: relative;
          z-index: 2;
          transition: transform 0.25s ease;
        }
        .skills-card:hover .skills-card-icon {
          transform: scale(1.1) rotate(4deg);
        }

        .skills-card-title {
          font-size: 16.5px;
          font-weight: 800;
          color: #ffffff;
          line-height: 1.35;
          margin: 0 0 8px;
          position: relative;
          z-index: 2;
        }

        .skills-card-desc {
          font-size: 12.8px;
          line-height: 1.58;
          color: #94a3b8;
          margin: 0 0 20px;
          flex: 1;
          position: relative;
          z-index: 2;
        }

        /* Bottom Row with Arrow Button */
        .skills-card-bottom {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          position: relative;
          z-index: 2;
        }
        .skills-arrow-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.12);
          border: 1px solid rgba(255, 255, 255, 0.18);
          display: grid;
          place-items: center;
          color: #ffffff;
          transition: all 0.25s ease;
        }
        .skills-card:hover .skills-arrow-btn {
          background: var(--skill-accent);
          border-color: transparent;
          box-shadow: 0 4px 14px var(--skill-shadow);
          transform: translateX(5px);
        }

        /* Corner 3D Illustration Silhouette */
        .skills-card-watermark {
          position: absolute;
          bottom: -5px;
          right: -5px;
          width: 125px;
          height: 105px;
          pointer-events: none;
          z-index: 1;
          transition: transform 0.35s ease, opacity 0.35s ease;
        }
        .skills-card:hover .skills-card-watermark {
          transform: scale(1.1) rotate(2deg);
          opacity: 0.45;
        }

        /* ========================================================
           MOBILE PILL CARDS LIST (MATCHING PHONE SCREEN IN MOCKUP)
           ======================================================== */
        .skills-mobile-pill-list {
          display: none;
          flex-direction: column;
          gap: 12px;
          width: 100%;
          max-width: 440px;
          margin: 0 auto;
        }

        .skills-mobile-pill-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
          border-radius: 16px;
          border: 1.5px solid var(--pill-border);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3), 0 0 16px var(--pill-shadow);
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
          gap: 12px;
        }

        .skills-mobile-pill-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: grid;
          place-items: center;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          flex-shrink: 0;
        }

        .skills-mobile-pill-title {
          font-size: 14.5px;
          font-weight: 750;
          color: #ffffff;
          letter-spacing: -0.2px;
        }

        .skills-mobile-pill-arrow {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.16);
          display: grid;
          place-items: center;
          color: #ffffff;
          flex-shrink: 0;
          transition: transform 0.2s ease;
        }
        .skills-mobile-pill-item:hover .skills-mobile-pill-arrow {
          transform: translateX(3px);
          background: rgba(255, 255, 255, 0.25);
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
            width: 180px;
            height: 135px;
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
          {/* Left Column: Kicker, Title, Subtitle with Bidirectional Reveal */}
          <motion.div
            className="skills-header-left"
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.25, margin: '0px 0px -80px 0px' }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          >
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
          </motion.div>

          {/* Right Column: 3D Books Stack with Headphones & Slogan */}
          <motion.div
            className="skills-header-right"
            initial={{ opacity: 0, y: 35, scale: 0.92 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: false, amount: 0.25, margin: '0px 0px -80px 0px' }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <svg
              className="skills-3d-art-wrap"
              viewBox="0 0 220 165"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="bookBlueGrad" x1="50" y1="90" x2="160" y2="135" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#0284c7" />
                </linearGradient>
                <linearGradient id="bookPurpleGrad" x1="40" y1="110" x2="150" y2="150" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#c084fc" />
                  <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>
                <linearGradient id="headphonesGrad" x1="70" y1="15" x2="150" y2="90" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#60a5fa" />
                  <stop offset="50%" stopColor="#2563eb" />
                  <stop offset="100%" stopColor="#1e3a8a" />
                </linearGradient>
                <filter id="artShadow" x="-10" y="-10" width="240" height="185" filterUnits="userSpaceOnUse">
                  <feDropShadow dx="0" dy="10" stdDeviation="6" floodColor="#1e3a8a" floodOpacity="0.38" />
                </filter>
              </defs>

              {/* Stack of 3D Books */}
              <g filter="url(#artShadow)">
                {/* Bottom Purple Book */}
                <path d="M 40 120 L 140 102 L 175 116 L 75 136 Z" fill="#9333ea" />
                <path d="M 40 120 L 75 136 L 75 146 L 40 130 Z" fill="#7e22ce" />
                <path d="M 75 136 L 175 116 L 175 125 L 75 146 Z" fill="#ffffff" opacity="0.9" />

                {/* Top Blue Book */}
                <path d="M 50 100 L 150 82 L 182 95 L 82 114 Z" fill="url(#bookBlueGrad)" />
                <path d="M 50 100 L 82 114 L 82 122 L 50 108 Z" fill="#0369a1" />
                <path d="M 82 114 L 182 95 L 182 103 L 82 122 Z" fill="#ffffff" opacity="0.9" />

                {/* 3D Over-ear Headphones resting on top */}
                <path
                  d="M 68 85 C 68 28, 142 28, 142 85"
                  stroke="url(#headphonesGrad)"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                {/* Left Ear Cushion */}
                <ellipse cx="66" cy="85" rx="11" ry="16" fill="#1d4ed8" transform="rotate(-10 66 85)" />
                <ellipse cx="66" cy="85" rx="7" ry="12" fill="#3b82f6" transform="rotate(-10 66 85)" />

                {/* Right Ear Cushion */}
                <ellipse cx="144" cy="85" rx="11" ry="16" fill="#1d4ed8" transform="rotate(10 144 85)" />
                <ellipse cx="144" cy="85" rx="7" ry="12" fill="#3b82f6" transform="rotate(10 144 85)" />

                {/* Floating 3D Speech Bubble with Dots */}
                <rect x="135" y="55" width="36" height="28" rx="10" fill="#60a5fa" />
                <circle cx="145" cy="69" r="2.2" fill="#ffffff" />
                <circle cx="153" cy="69" r="2.2" fill="#ffffff" />
                <circle cx="161" cy="69" r="2.2" fill="#ffffff" />

                {/* Floating 'A' Blue Badge */}
                <rect x="36" y="45" width="22" height="22" rx="7" fill="#2563eb" />
                <text x="47" y="61" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="900">A</text>

                {/* Floating '文' Purple Badge */}
                <rect x="165" y="95" width="22" height="22" rx="7" fill="#8b5cf6" />
                <text x="176" y="111" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="800">文</text>
              </g>

              {/* Radiant speed marks */}
              <path d="M 158 35 C 162 30 166 32 168 28" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 28 88 C 24 92 22 96 20 102" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
            </svg>

            <div className="skills-calligraphy-wrap">
              <span className="skills-calligraphy-note">
                Til örganiş — yangi imkoniyatlar dunyosi! ✨
              </span>
              <svg className="skills-curved-arrow" width="34" height="34" viewBox="0 0 40 40" fill="none">
                <path d="M 32 6 C 34 20 20 30 10 32" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="3 3" />
                <path d="M 14 27 L 10 32 L 16 36" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </motion.div>
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
            const rotations = [-1.6, 1.2, 0.8, -1.2, -1.8];
            const defaultRotate = rotations[idx % 5];

            return (
              <motion.div
                key={skill.key || idx}
                className={`skills-grid-cell ${gridCellClass}`}
                initial={{ opacity: 0, y: 38, scale: 0.96, rotate: defaultRotate }}
                whileInView={{ opacity: 1, y: 0, scale: 1, rotate: defaultRotate }}
                whileHover={{ y: -8, scale: 1.025, rotate: 0 }}
                viewport={{ once: false, amount: 0.2, margin: '0px 0px -80px 0px' }}
                transition={{
                  opacity: { duration: 0.48, delay: idx * 0.04, ease: [0.22, 1, 0.36, 1] },
                  y: { duration: 0.52, delay: idx * 0.04, ease: [0.22, 1, 0.36, 1] },
                  scale: { duration: 0.52, delay: idx * 0.04, ease: [0.22, 1, 0.36, 1] },
                  rotate: { duration: 0.3, ease: 'easeOut' }
                }}
                style={{ transform: 'translateZ(0)' }}
              >
                <TiltCard maxTilt={5} borderRadius="24px">
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
                        <Icon size={22} />
                      </motion.div>
                    </div>

                    {/* Title */}
                    <div style={{ marginBottom: '8px' }}>
                      <h3 className="skills-card-title" style={{ margin: 0 }}>{skill.title}</h3>
                    </div>

                    {/* Description */}
                    <p className="skills-card-desc">{skill.desc}</p>

                    {/* Bottom Row with Arrow Button */}
                    <div className="skills-card-bottom">
                      <motion.div
                        className="skills-arrow-btn"
                        whileHover={{ x: 5, scale: 1.1 }}
                      >
                        <ArrowRight size={15} strokeWidth={2.4} />
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
                initial={{ opacity: 0, y: 24, scale: 0.97 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: false, amount: 0.15, margin: '0px 0px -60px 0px' }}
                transition={{ duration: 0.44, delay: idx * 0.035, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  background: meta.pillBg,
                  ['--pill-accent' as any]: meta.accent,
                  ['--pill-border' as any]: meta.borderGlow,
                  ['--pill-shadow' as any]: meta.shadowColor
                }}
              >
                <div className="skills-mobile-pill-left">
                  <div className="skills-mobile-pill-icon" style={{ background: meta.accent }}>
                    <Icon size={18} color="#ffffff" strokeWidth={2.3} />
                  </div>
                  <span className="skills-mobile-pill-title">{skill.title}</span>
                </div>

                <div className="skills-mobile-pill-arrow">
                  <ArrowRight size={15} strokeWidth={2.5} />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
