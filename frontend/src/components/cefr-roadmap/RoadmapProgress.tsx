import React from 'react';
import { CheckCircle2, Flame, Sparkles } from 'lucide-react';
import { CEFR_ROADMAP_LEVELS, CEFRLevelCode } from './cefrRoadmapData';

interface RoadmapProgressProps {
  currentLevel: CEFRLevelCode;
  dark?: boolean;
}

export const RoadmapProgress: React.FC<RoadmapProgressProps> = ({ currentLevel, dark }) => {
  const completedCount = CEFR_ROADMAP_LEVELS.filter(l => l.status === 'completed').length;
  const totalLevels = CEFR_ROADMAP_LEVELS.length;
  const progressPercent = Math.round((completedCount / totalLevels) * 100);

  return (
    <div
      style={{
        background: dark ? 'rgba(21, 21, 34, 0.75)' : 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: dark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.06)',
        borderRadius: '18px',
        padding: '18px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        boxShadow: dark ? '0 10px 30px rgba(0,0,0,0.3)' : '0 10px 30px rgba(53, 108, 246, 0.05)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #10b981 100%)',
              color: '#ffffff',
              display: 'grid',
              placeItems: 'center'
            }}
          >
            <Flame size={16} />
          </div>
          <div>
            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              Your Progress
            </span>
            <div style={{ fontSize: '15px', fontWeight: 850, color: 'var(--text)' }}>
              {completedCount}/{totalLevels} levels completed ({progressPercent}%)
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 700, color: '#10b981' }}>
          <CheckCircle2 size={15} />
          <span>A1 Completed • A2 in progress</span>
        </div>
      </div>

      {/* Segmented Progress Bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${totalLevels}, 1fr)`,
          gap: '6px',
          width: '100%'
        }}
      >
        {CEFR_ROADMAP_LEVELS.map((lvl) => {
          let segmentBg = dark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';
          let segmentBorder = 'transparent';
          let segmentGlow = 'none';

          if (lvl.status === 'completed') {
            segmentBg = '#10b981';
          } else if (lvl.status === 'current') {
            segmentBg = 'linear-gradient(90deg, #3b82f6 0%, #10b981 100%)';
            segmentGlow = '0 0 10px rgba(59, 130, 246, 0.5)';
            segmentBorder = '1px solid #3b82f6';
          }

          return (
            <div
              key={lvl.code}
              style={{
                height: '8px',
                borderRadius: '6px',
                background: segmentBg,
                border: segmentBorder,
                boxShadow: segmentGlow,
                transition: 'all 0.3s ease'
              }}
              title={`${lvl.code} (${lvl.name}) - ${lvl.status}`}
            />
          );
        })}
      </div>
    </div>
  );
};
