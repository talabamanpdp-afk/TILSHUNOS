import React, { useState } from 'react';
import {
  ArrowRight, Sparkles, Compass, Check, Lock,
  Sprout, BookOpen, MessageCircle, GraduationCap, Target, Trophy
} from 'lucide-react';
import { CEFR_ROADMAP_LEVELS, CEFRLevelCode } from './cefrRoadmapData';
import { RoadmapLandscapeCanvas } from './RoadmapLandscapeCanvas';
import { LevelInformationPanel } from './LevelInformationPanel';
import { RoadmapProgress } from './RoadmapProgress';
import { MotivationalCard } from './MotivationalCard';

interface CEFRRoadmapSectionProps {
  onBegin: (intent: 'login' | 'register' | 'trial') => void;
  onSelectLevel?: (level: string) => void;
  dark?: boolean;
}

export const CEFRRoadmapSection: React.FC<CEFRRoadmapSectionProps> = ({
  onBegin,
  onSelectLevel,
  dark
}) => {
  // Default selected level is A2 (active level in initial demo)
  const [selectedLevelCode, setSelectedLevelCode] = useState<CEFRLevelCode>('A2');

  const selectedLevelDetail =
    CEFR_ROADMAP_LEVELS.find((lvl) => lvl.code === selectedLevelCode) ||
    CEFR_ROADMAP_LEVELS[1];

  const handleExploreLevel = (levelCode: string) => {
    if (onSelectLevel) {
      onSelectLevel(levelCode);
    }
    onBegin('register');
  };

  const renderMilestoneIcon = (iconType: string, size: number = 16) => {
    switch (iconType) {
      case 'sprout':
        return <Sprout size={size} strokeWidth={2.4} />;
      case 'book':
        return <BookOpen size={size} strokeWidth={2.4} />;
      case 'message':
        return <MessageCircle size={size} strokeWidth={2.4} />;
      case 'grad-cap':
        return <GraduationCap size={size} strokeWidth={2.4} />;
      case 'target':
        return <Target size={size} strokeWidth={2.4} />;
      case 'trophy':
        return <Trophy size={size} strokeWidth={2.4} />;
      default:
        return <Sparkles size={size} />;
    }
  };

  return (
    <section
      id="cefr"
      className="welcome-cefr-section"
      style={{
        padding: '80px 20px',
        position: 'relative',
        background: dark ? 'transparent' : 'rgba(240, 246, 255, 0.4)'
      }}
    >
      <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
        {/* ======================================================== */}
        {/* HERO / SECTION HEADER (O'zbek tilida)                    */}
        {/* ======================================================== */}
        <div
          style={{
            textAlign: 'center',
            maxWidth: '780px',
            margin: '0 auto 44px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          {/* Eyebrow */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '100px',
              background: 'rgba(59, 130, 246, 0.12)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              color: '#3b82f6',
              fontSize: '11px',
              fontWeight: 850,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              marginBottom: '14px'
            }}
          >
            <Compass size={14} />
            <span>CEFR DARAJALARI BO‘YICHA REJA</span>
          </div>

          {/* Main Heading */}
          <h2
            style={{
              margin: '0 0 16px',
              fontSize: 'clamp(30px, 4.2vw, 46px)',
              fontWeight: 900,
              letterSpacing: '-1.5px',
              lineHeight: 1.15,
              color: 'var(--text)'
            }}
          >
            Ingliz tili sayohatingiz{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #10b981 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline-block'
              }}
            >
              shu yerdan boshlanadi
            </span>
          </h2>

          {/* Subtitle */}
          <p
            style={{
              margin: '0 0 24px',
              fontSize: '15.5px',
              lineHeight: '1.7',
              color: 'var(--muted)',
              maxWidth: '580px'
            }}
          >
            6 ta xalqaro CEFR darajasi. Aniq tizimli yo‘l. Har bir darajani bosqichma-bosqich o‘rganing.
          </p>

          {/* Primary Hero Button */}
          <button
            type="button"
            onClick={() => handleExploreLevel(selectedLevelCode)}
            className="primary-btn"
            style={{
              padding: '13px 28px',
              borderRadius: '14px',
              fontSize: '15px',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              color: '#ffffff',
              boxShadow: '0 8px 25px rgba(59, 130, 246, 0.35)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.25s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 12px 30px rgba(59, 130, 246, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.35)';
            }}
          >
            <span>Sayohatingizni boshlang</span>
            <ArrowRight size={17} strokeWidth={2.5} />
          </button>
        </div>

        {/* ======================================================== */}
        {/* MOBILE ONLY: GORIZONTAL YO'LAKCHA (LEVEL SELECTION TRACK) */}
        {/* ======================================================== */}
        <div className="cefr-mobile-track-wrapper">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', padding: '0 4px' }}>
            <span style={{ fontSize: '11.5px', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Compass size={13} style={{ color: selectedLevelDetail.color }} />
              <span>Bosqichni tanlang:</span>
            </span>
            <span style={{
              fontSize: '11.5px',
              fontWeight: 800,
              color: selectedLevelDetail.color,
              background: `${selectedLevelDetail.color}15`,
              padding: '3px 10px',
              borderRadius: '100px',
              border: `1px solid ${selectedLevelDetail.color}35`
            }}>
              {selectedLevelDetail.code} faol
            </span>
          </div>

          <div className="cefr-horizontal-road">
            {/* Background connecting road track line */}
            <div className="cefr-road-line" />

            <div className="cefr-road-scroll">
              {CEFR_ROADMAP_LEVELS.map((lvl) => {
                const isSelected = selectedLevelCode === lvl.code;
                return (
                  <button
                    key={lvl.code}
                    type="button"
                    onClick={() => setSelectedLevelCode(lvl.code)}
                    className={`cefr-level-step-btn ${isSelected ? 'active' : ''}`}
                    style={{
                      ['--step-color' as any]: lvl.color,
                      ['--step-grad' as any]: lvl.gradient
                    }}
                  >
                    {/* Circle icon node */}
                    <div className="step-node-circle">
                      {renderMilestoneIcon(lvl.iconType, 16)}
                      {lvl.status === 'completed' && (
                        <span className="step-status-badge completed" title="O‘zlashtirilgan">
                          <Check size={8} strokeWidth={3.5} />
                        </span>
                      )}
                      {lvl.status === 'locked' && (
                        <span className="step-status-badge locked" title="Bloklangan">
                          <Lock size={8} strokeWidth={3} />
                        </span>
                      )}
                    </div>

                    <div className="step-text-meta">
                      <strong className="step-code">{lvl.code}</strong>
                      <span className="step-name">{lvl.name.split(' ')[0]}</span>
                    </div>

                    {isSelected && <div className="step-active-arrow" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* MAIN TWO-COLUMN ROADMAP & INFORMATION PANEL LAYOUT       */}
        {/* ======================================================== */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '36px',
            alignItems: 'start'
          }}
        >
          {/* Left Column: Illustrated Winding Landscape Roadmap (DESKTOP ONLY) */}
          <div className="cefr-desktop-canvas">
            <RoadmapLandscapeCanvas
              selectedLevel={selectedLevelCode}
              onSelectLevel={(code) => setSelectedLevelCode(code)}
              dark={dark}
            />
          </div>

          {/* Right Column: Dynamic Level Information Panel + Motivational Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <LevelInformationPanel
              level={selectedLevelDetail}
              onExplore={handleExploreLevel}
              dark={dark}
            />

            <MotivationalCard dark={dark} />
          </div>
        </div>

        {/* ======================================================== */}
        {/* BOTTOM SECTION: PROGRESS INDICATOR                       */}
        {/* ======================================================== */}
        <div style={{ marginTop: '36px' }}>
          <RoadmapProgress currentLevel={selectedLevelCode} dark={dark} />
        </div>
      </div>

      {/* Responsive Styles for Desktop vs Mobile Stepper Track */}
      <style>{`
        .cefr-desktop-canvas {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .cefr-mobile-track-wrapper {
          display: none;
        }

        @media (max-width: 900px) {
          .cefr-desktop-canvas {
            display: none !important;
          }
          .cefr-mobile-track-wrapper {
            display: flex;
            flex-direction: column;
            margin-bottom: 22px;
            width: 100%;
          }
          .cefr-horizontal-road {
            position: relative;
            width: 100%;
            overflow: hidden;
            padding: 8px 0 14px;
          }
          .cefr-road-line {
            position: absolute;
            top: 30px;
            left: 20px;
            right: 20px;
            height: 3px;
            background: linear-gradient(90deg, #3b82f6 0%, #10b981 25%, #8b5cf6 50%, #f97316 75%, #ec4899 90%, #eab308 100%);
            border-radius: 4px;
            opacity: 0.35;
            z-index: 0;
          }
          .cefr-road-scroll {
            display: flex;
            gap: 10px;
            overflow-x: auto;
            scrollbar-width: none;
            -webkit-overflow-scrolling: touch;
            padding: 4px 6px;
            position: relative;
            z-index: 1;
          }
          .cefr-road-scroll::-webkit-scrollbar {
            display: none;
          }
          .cefr-level-step-btn {
            flex: 0 0 auto;
            display: flex;
            align-items: center;
            gap: 9px;
            padding: 8px 14px 8px 8px;
            border-radius: 100px;
            background: ${dark ? 'rgba(21, 21, 34, 0.88)' : '#ffffff'};
            border: 1.5px solid ${dark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)'};
            color: var(--text);
            cursor: pointer;
            position: relative;
            transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
            box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06);
          }
          .cefr-level-step-btn.active {
            background: var(--step-grad);
            border-color: transparent;
            color: #ffffff !important;
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3), 0 0 16px var(--step-color);
            transform: translateY(-2px);
          }
          .step-node-circle {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: var(--step-color);
            color: #ffffff;
            display: grid;
            place-items: center;
            position: relative;
            flex-shrink: 0;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          }
          .step-status-badge {
            position: absolute;
            bottom: -2px;
            right: -2px;
            width: 14px;
            height: 14px;
            border-radius: 50%;
            display: grid;
            place-items: center;
            border: 1.5px solid #ffffff;
          }
          .step-status-badge.completed {
            background: #10b981;
            color: #ffffff;
          }
          .step-status-badge.locked {
            background: #64748b;
            color: #ffffff;
          }
          .step-text-meta {
            display: flex;
            flex-direction: column;
            text-align: left;
          }
          .step-code {
            font-size: 13px;
            font-weight: 850;
            line-height: 1.1;
          }
          .step-name {
            font-size: 10px;
            font-weight: 700;
            opacity: 0.85;
            white-space: nowrap;
          }
          .cefr-level-step-btn.active .step-name {
            opacity: 0.95;
            color: #ffffff;
          }
          .step-active-arrow {
            position: absolute;
            bottom: -8px;
            left: 50%;
            transform: translateX(-50%);
            width: 0;
            height: 0;
            border-left: 6px solid transparent;
            border-right: 6px solid transparent;
            border-top: 6px solid var(--step-color);
          }
        }
      `}</style>
    </section>
  );
};
