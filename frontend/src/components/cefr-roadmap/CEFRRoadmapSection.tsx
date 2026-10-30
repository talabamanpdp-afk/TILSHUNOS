import React, { useState } from 'react';
import { ArrowRight, Sparkles, Compass } from 'lucide-react';
import { CEFR_ROADMAP_LEVELS, CEFRLevelCode } from './cefrRoadmapData';
import { RoadmapLandscapeCanvas } from './RoadmapLandscapeCanvas';
import { LevelInformationPanel } from './LevelInformationPanel';
import { RoadmapProgress } from './RoadmapProgress';
import { MotivationalCard } from './MotivationalCard';

interface CEFRRoadmapSectionProps {
  onBegin: (intent: 'login' | 'register') => void;
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
        {/* HERO / SECTION HEADER                                    */}
        {/* ======================================================== */}
        <div
          style={{
            textAlign: 'center',
            maxWidth: '780px',
            margin: '0 auto 48px',
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
            <span>CEFR LEARNING JOURNEY</span>
          </div>

          {/* Main Heading */}
          <h2
            style={{
              margin: '0 0 16px',
              fontSize: 'clamp(32px, 4.5vw, 48px)',
              fontWeight: 900,
              letterSpacing: '-1.5px',
              lineHeight: 1.15,
              color: 'var(--text)'
            }}
          >
            Your English Journey{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #10b981 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline-block'
              }}
            >
              Starts Here
            </span>
          </h2>

          {/* Subtitle */}
          <p
            style={{
              margin: '0 0 24px',
              fontSize: '16px',
              lineHeight: '1.7',
              color: 'var(--muted)',
              maxWidth: '560px'
            }}
          >
            Six levels. One clear path. Your future starts with a single step.
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
            <span>Start Your Journey</span>
            <ArrowRight size={17} strokeWidth={2.5} />
          </button>
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
          {/* Left Column: Illustrated Winding Landscape Roadmap */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
    </section>
  );
};
