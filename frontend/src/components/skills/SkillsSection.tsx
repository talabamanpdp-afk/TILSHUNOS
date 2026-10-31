import React, { useState } from 'react';
import {
  Sparkles, BookOpen, PenLine, Headphones, Mic, Layers, ArrowRight, ChevronDown, ChevronUp
} from 'lucide-react';
import { motion } from 'framer-motion';
import { TiltCard } from '../../utils/motion/TiltCard';

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
  const currentKicker = kicker || 'MUVOZANATLI RIVOJLANIŞ';
  const currentTitle = title || '5 ta asosiy til könikmasini mustahkamlang';
  const currentSubtitle = subtitle || 'Faqat qoidalar yodlaş emas — har tomonlama tabiiy örganiş uslubi.';

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

  // Track expanded item on mobile
  const [expandedMobileIdx, setExpandedMobileIdx] = useState<number | null>(null);

  // Configuration for each skill matching Image 2 exactly
  const skillMeta: Record<string, {
    icon: any;
    accent: string;
    borderGlow: string;
    iconGrad: string;
    shadowColor: string;
    watermarkType: 'book' | 'pen' | 'headphones' | 'mic' | 'aa';
  }> = {
    reading: {
      icon: BookOpen,
      accent: '#8b5cf6',
      borderGlow: 'rgba(139, 92, 246, 0.45)',
      iconGrad: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)',
      shadowColor: 'rgba(139, 92, 246, 0.35)',
      watermarkType: 'book'
    },
    writing: {
      icon: PenLine,
      accent: '#06b6d4',
      borderGlow: 'rgba(6, 182, 212, 0.45)',
      iconGrad: 'linear-gradient(135deg, #22d3ee 0%, #0891b2 100%)',
      shadowColor: 'rgba(6, 182, 212, 0.35)',
      watermarkType: 'pen'
    },
    listening: {
      icon: Headphones,
      accent: '#f97316',
      borderGlow: 'rgba(249, 115, 22, 0.45)',
      iconGrad: 'linear-gradient(135deg, #fb923c 0%, #ea580c 100%)',
      shadowColor: 'rgba(249, 115, 22, 0.35)',
      watermarkType: 'headphones'
    },
    speaking: {
      icon: Mic,
      accent: '#3b82f6',
      borderGlow: 'rgba(59, 130, 246, 0.45)',
      iconGrad: 'linear-gradient(135deg, #60a5fa 0%, #2563eb 100%)',
      shadowColor: 'rgba(59, 130, 246, 0.35)',
      watermarkType: 'mic'
    },
    vocab: {
      icon: Layers,
      accent: '#d946ef',
      borderGlow: 'rgba(217, 70, 239, 0.45)',
      iconGrad: 'linear-gradient(135deg, #f472b6 0%, #c026d3 100%)',
      shadowColor: 'rgba(217, 70, 239, 0.35)',
      watermarkType: 'aa'
    }
  };

  const getMeta = (skill: SkillItem, idx: number) => {
    const keys = ['reading', 'writing', 'listening', 'speaking', 'vocab'];
    const key = skill.key && skillMeta[skill.key] ? skill.key : keys[idx % 5];
    return skillMeta[key];
  };

  // Render watermarks in the corner of cards matching Image 2
  const renderWatermark = (type: 'book' | 'pen' | 'headphones' | 'mic' | 'aa', color: string) => {
    switch (type) {
      case 'book':
        return (
          <svg className="skills-card-watermark" viewBox="0 0 120 100" fill="none">
            <path d="M 20 80 Q 60 70 60 25 Q 60 70 100 80 L 100 35 Q 60 25 60 25 Q 60 25 20 35 Z" stroke={color} strokeWidth="3" opacity="0.25" fill={color} fillOpacity="0.08" />
            <path d="M 60 25 L 60 75" stroke={color} strokeWidth="2.5" opacity="0.3" />
          </svg>
        );
      case 'pen':
        return (
          <svg className="skills-card-watermark" viewBox="0 0 120 100" fill="none">
            <rect x="50" y="20" width="55" height="70" rx="8" stroke={color} strokeWidth="2.5" opacity="0.2" fill={color} fillOpacity="0.06" />
            <line x1="62" y1="38" x2="93" y2="38" stroke={color} strokeWidth="2.5" opacity="0.25" strokeLinecap="round" />
            <line x1="62" y1="52" x2="93" y2="52" stroke={color} strokeWidth="2.5" opacity="0.25" strokeLinecap="round" />
            <line x1="62" y1="66" x2="80" y2="66" stroke={color} strokeWidth="2.5" opacity="0.25" strokeLinecap="round" />
            <path d="M 35 75 L 48 35 L 56 43 L 43 83 Z" fill={color} opacity="0.35" />
          </svg>
        );
      case 'headphones':
        return (
          <svg className="skills-card-watermark" viewBox="0 0 120 100" fill="none">
            <path d="M 35 65 C 35 30 85 30 85 65" stroke={color} strokeWidth="3.5" opacity="0.25" fill="none" strokeLinecap="round" />
            <rect x="28" y="55" width="14" height="26" rx="7" fill={color} opacity="0.35" />
            <rect x="78" y="55" width="14" height="26" rx="7" fill={color} opacity="0.35" />
            <circle cx="16" cy="68" r="2" fill={color} opacity="0.4" />
            <circle cx="104" cy="68" r="2" fill={color} opacity="0.4" />
          </svg>
        );
      case 'mic':
        return (
          <svg className="skills-card-watermark" viewBox="0 0 120 100" fill="none">
            <rect x="48" y="24" width="24" height="42" rx="12" fill={color} opacity="0.28" stroke={color} strokeWidth="2" strokeOpacity="0.4" />
            <path d="M 38 48 C 38 68 82 68 82 48" stroke={color} strokeWidth="2.5" opacity="0.3" strokeLinecap="round" />
            <line x1="60" y1="68" x2="60" y2="82" stroke={color} strokeWidth="2.5" opacity="0.3" />
            <line x1="48" y1="82" x2="72" y2="82" stroke={color} strokeWidth="2.5" opacity="0.3" strokeLinecap="round" />
          </svg>
        );
      case 'aa':
      default:
        return (
          <div className="skills-card-watermark-text" style={{ color }}>
            Aa
          </div>
        );
    }
  };

  return (
    <section id="skills" className={`skills-modern-section ${dark ? 'is-dark' : 'is-light'}`}>
      {/* Scoped CSS Styles strictly mirroring Image 2 */}
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

        /* 100% LIGHT MODE SUPPORT */
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
        .skills-modern-section.is-light .skills-card:hover {
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08), 0 0 22px var(--skill-shadow) !important;
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
        .skills-modern-section.is-light .skills-mobile-acc-btn {
          background: #ffffff !important;
          border-color: rgba(226, 232, 240, 0.95) !important;
          color: #0f172a !important;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.04) !important;
        }
        .skills-modern-section.is-light .skills-mobile-acc-title {
          color: #0f172a !important;
        }
        .skills-modern-section.is-light .skills-mobile-acc-desc {
          color: #475569 !important;
        }
        .skills-modern-section.is-light .skills-calligraphy-note {
          color: #2563eb !important;
        }

        /* Ambient glowing backdrop spots */
        .skills-glow-top-left {
          position: absolute;
          top: 10%;
          left: -120px;
          width: 520px;
          height: 520px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(56, 189, 248, 0.12) 0%, transparent 70%);
          filter: blur(75px);
          pointer-events: none;
        }
        .skills-glow-top-right {
          position: absolute;
          top: 12%;
          right: -100px;
          width: 540px;
          height: 540px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.14) 0%, transparent 70%);
          filter: blur(80px);
          pointer-events: none;
        }

        .skills-container {
          max-width: 1240px;
          margin: 0 auto;
          position: relative;
          z-index: 10;
        }

        /* Top Header Grid with Left/Center Text and Right 3D Books & Headphones Artwork */
        .skills-header-grid {
          display: grid;
          grid-template-columns: 1fr 340px;
          align-items: center;
          gap: 30px;
          margin-bottom: 54px;
          position: relative;
        }

        /* Left Header Column */
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
          font-size: 14.5px;
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

        /* Desktop Staggered Cards Grid (Matching Image 2 exactly) */
        .skills-desktop-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 22px;
        }
        .skills-card-reading { grid-row: 1; grid-column: 1 / span 2; }
        .skills-card-writing { grid-row: 1; grid-column: 3 / span 2; }
        .skills-card-vocab   { grid-row: 1; grid-column: 5 / span 2; }
        .skills-card-listening { grid-row: 2; grid-column: 2 / span 2; }
        .skills-card-speaking  { grid-row: 2; grid-column: 4 / span 2; }

        .skills-grid-item-0 { grid-row: 1; grid-column: 1 / span 2; }
        .skills-grid-item-1 { grid-row: 1; grid-column: 3 / span 2; }
        .skills-grid-item-4 { grid-row: 1; grid-column: 5 / span 2; }
        .skills-grid-item-2 { grid-row: 2; grid-column: 2 / span 2; }
        .skills-grid-item-3 { grid-row: 2; grid-column: 4 / span 2; }

        /* Individual Desktop Glassmorphism Card */
        .skills-card {
          background: rgba(15, 23, 42, 0.72);
          backdrop-filter: blur(18px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 22px;
          padding: 24px 22px 20px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
          position: relative;
          overflow: hidden;
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease, border-color 0.3s ease;
          box-shadow: 0 10px 28px rgba(0, 0, 0, 0.35);
          cursor: pointer;
          min-height: 195px;
        }
        .skills-card:hover {
          transform: translateY(-6px);
          border-color: var(--skill-border-glow);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5), 0 0 22px var(--skill-shadow);
        }

        /* Card Glowing Icon Badge */
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
          transform: scale(1.08);
        }

        .skills-card-title {
          font-size: 16px;
          font-weight: 800;
          color: #ffffff;
          line-height: 1.35;
          margin: 0 0 8px;
          position: relative;
          z-index: 2;
        }

        .skills-card-desc {
          font-size: 12.8px;
          line-height: 1.55;
          color: #94a3b8;
          margin: 0 0 20px;
          flex: 1;
          position: relative;
          z-index: 2;
        }

        /* Bottom Action Button */
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
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
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

        /* Bottom Corner Watermark / Illustration Silhouette */
        .skills-card-watermark {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 105px;
          height: 85px;
          pointer-events: none;
          z-index: 1;
          transition: transform 0.3s ease, opacity 0.3s ease;
        }
        .skills-card:hover .skills-card-watermark {
          transform: scale(1.1) rotate(2deg);
          opacity: 0.28;
        }
        .skills-card-watermark-text {
          position: absolute;
          bottom: 12px;
          right: 18px;
          font-size: 44px;
          font-weight: 900;
          opacity: 0.18;
          font-family: -apple-system, sans-serif;
          pointer-events: none;
          z-index: 1;
          transition: transform 0.3s ease, opacity 0.3s ease;
        }
        .skills-card:hover .skills-card-watermark-text {
          opacity: 0.3;
          transform: scale(1.08);
        }

        /* ========================================================= */
        /* MOBILE PILL LIST (Mirroring the phone mockup in Image 2!) */
        /* ========================================================= */
        .skills-mobile-pill-list {
          display: none;
          flex-direction: column;
          gap: 12px;
          width: 100%;
        }

        .skills-mobile-pill-card {
          background: rgba(15, 23, 42, 0.72);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 18px;
          padding: 12px 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          transition: all 0.22s ease;
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25);
        }
        .skills-mobile-pill-card:active {
          transform: scale(0.98);
        }

        .skills-pill-left {
          display: flex;
          align-items: center;
          gap: 14px;
          flex: 1;
        }

        .skills-pill-icon {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          display: grid;
          place-items: center;
          color: #ffffff;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .skills-pill-title {
          font-size: 14.5px;
          font-weight: 750;
          color: #ffffff;
          letter-spacing: -0.2px;
        }

        .skills-pill-arrow {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          color: #ffffff;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
        }

        .skills-pill-expand-desc {
          margin: 10px 0 2px 54px;
          font-size: 12.5px;
          line-height: 1.5;
          color: #94a3b8;
          animation: skillsFadeIn 0.2s ease;
        }
        @keyframes skillsFadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Responsive Breakpoints */
        @media (max-width: 1024px) {
          .skills-header-grid {
            grid-template-columns: 1fr;
            text-align: center;
            gap: 20px;
            margin-bottom: 36px;
          }
          .skills-header-left {
            align-items: center;
            text-align: center;
          }
          .skills-dot-matrix-left {
            display: none;
          }
          .skills-header-right {
            display: none;
          }
          /* Switch to 2 columns on tablet */
          .skills-desktop-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 16px;
          }
          .skills-card-reading,
          .skills-card-writing,
          .skills-card-listening,
          .skills-card-speaking,
          .skills-grid-item-0,
          .skills-grid-item-1,
          .skills-grid-item-2,
          .skills-grid-item-3 {
            grid-row: auto !important;
            grid-column: span 1 !important;
          }
          .skills-card-vocab,
          .skills-grid-item-4 {
            grid-row: auto !important;
            grid-column: span 2 !important;
          }
        }

        @media (max-width: 768px) {
          .skills-modern-section {
            padding: 55px 16px 70px;
          }
          /* On mobile: Hide desktop grid and reveal the phone-mockup pill list from Image 2! */
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
        {/* Top Header Grid */}
        <div className="skills-header-grid">
          {/* Left Column: Kicker, Title, Subtitle */}
          <div className="skills-header-left">
            {/* Dot Matrix Pattern */}
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
          <div className="skills-header-right" aria-hidden="true">
            <svg
              className="skills-3d-art-wrap"
              viewBox="0 0 220 165"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* Book gradients */}
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
                {/* Headband arch */}
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
          </div>
        </div>

        {/* 1. Desktop Staggered Floating Cards Grid with 3D Tilt & Unique Micro-Animations */}
        <div className="skills-desktop-grid">
          {currentSkills.map((skill, idx) => {
            const meta = getMeta(skill, idx);
            const Icon = meta.icon;
            const cardKeyClass = skill.key ? `skills-card-${skill.key}` : `skills-grid-item-${idx % 5}`;

            return (
              <motion.div
                key={skill.key || idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.65, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                style={{ width: '100%', height: '100%', display: 'flex' }}
              >
                <TiltCard maxTilt={7} glowColor={meta.shadowColor}>
                  <div
                    className={`skills-card ${cardKeyClass}`}
                    onClick={() => onSelectSkill && skill.key && onSelectSkill(skill.key)}
                    style={{
                      ['--skill-accent' as any]: meta.accent,
                      ['--skill-border-glow' as any]: meta.borderGlow,
                      ['--skill-shadow' as any]: meta.shadowColor
                    }}
                  >
                    {/* Glowing Colored Icon Badge with Skill-Specific Micro-Animation */}
                    <div style={{ position: 'relative', display: 'inline-block', marginBottom: '14px' }}>
                      <motion.div
                        className="skills-card-icon"
                        style={{ background: meta.iconGrad, margin: 0 }}
                        whileHover={{ scale: 1.15, rotate: 5 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                      >
                        <Icon size={22} />
                      </motion.div>
                      {/* Speaking radar ring */}
                      {skill.key === 'speaking' && (
                        <span className="radar-pulse-ring" style={{ borderColor: meta.accent }} />
                      )}
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
                        whileHover={{ x: 4, scale: 1.08 }}
                      >
                        <ArrowRight size={15} strokeWidth={2.4} />
                      </motion.div>
                    </div>

                    {/* Corner Watermark Graphic */}
                    {renderWatermark(meta.watermarkType, meta.accent)}
                  </div>
                </TiltCard>
              </motion.div>
            );
          })}
        </div>

        {/* 2. Mobile Sleek Horizontal Pill Cards (Matching Phone Mockup in Image 2!) */}
        <div className="skills-mobile-pill-list">
          {currentSkills.map((skill, idx) => {
            const meta = getMeta(skill, idx);
            const Icon = meta.icon;
            const isExpanded = expandedMobileIdx === idx;

            return (
              <div
                key={skill.key || idx}
                style={{
                  background: 'rgba(15, 23, 42, 0.75)',
                  backdropFilter: 'blur(16px)',
                  border: `1.5px solid ${isExpanded ? meta.borderGlow : 'rgba(255, 255, 255, 0.08)'}`,
                  borderRadius: '18px',
                  padding: '12px 14px',
                  boxShadow: isExpanded ? `0 8px 24px ${meta.shadowColor}` : '0 4px 14px rgba(0, 0, 0, 0.25)',
                  transition: 'all 0.25s ease'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    setExpandedMobileIdx(isExpanded ? null : idx);
                    if (onSelectSkill && skill.key) onSelectSkill(skill.key);
                  }}
                >
                  <div className="skills-pill-left">
                    {/* Glowing Colored Icon Badge */}
                    <div
                      className="skills-pill-icon"
                      style={{ background: meta.iconGrad }}
                    >
                      <Icon size={20} />
                    </div>

                    <span className="skills-pill-title">{skill.title}</span>
                  </div>

                  {/* Right Glowing Action Circle Button */}
                  <div
                    className="skills-pill-arrow"
                    style={{ background: meta.accent }}
                  >
                    {isExpanded ? <ChevronUp size={16} /> : <ArrowRight size={16} strokeWidth={2.4} />}
                  </div>
                </div>

                {/* Expandable Description upon tap on mobile */}
                {isExpanded && (
                  <p className="skills-pill-expand-desc">
                    {skill.desc}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
