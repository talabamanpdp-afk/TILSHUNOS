import React from 'react';
import { Target, Sparkles } from 'lucide-react';
import { MOTIVATIONAL_HEADING, MOTIVATIONAL_DESC } from './cefrRoadmapData';

interface MotivationalCardProps {
  dark?: boolean;
}

export const MotivationalCard: React.FC<MotivationalCardProps> = ({ dark }) => {
  return (
    <div
      style={{
        background: dark
          ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%)'
          : 'linear-gradient(135deg, rgba(240, 249, 255, 0.95) 0%, rgba(230, 245, 255, 0.95) 100%)',
        backdropFilter: 'blur(12px)',
        border: dark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(59, 130, 246, 0.15)',
        borderRadius: '20px',
        padding: '20px 24px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: dark ? '0 12px 30px rgba(0,0,0,0.3)' : '0 12px 30px rgba(59, 130, 246, 0.06)',
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
      }}
    >
      {/* Background Mountain Silhouette SVG */}
      <svg
        style={{
          position: 'absolute',
          right: '-10px',
          bottom: '-10px',
          width: '180px',
          height: '100px',
          opacity: dark ? 0.08 : 0.06,
          pointerEvents: 'none'
        }}
        viewBox="0 0 180 100"
        fill="currentColor"
      >
        <polygon points="0,100 45,30 90,100" />
        <polygon points="60,100 110,15 160,100" />
        <polygon points="120,100 150,45 180,100" />
      </svg>

      {/* Target Icon with glowing gradient */}
      <div
        style={{
          width: '46px',
          height: '46px',
          borderRadius: '14px',
          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          color: '#ffffff',
          display: 'grid',
          placeItems: 'center',
          flexShrink: 0,
          boxShadow: '0 6px 18px rgba(37, 99, 235, 0.35)'
        }}
      >
        <Target size={22} strokeWidth={2.4} />
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <h4
          style={{
            margin: '0 0 4px',
            fontSize: '15px',
            fontWeight: 850,
            letterSpacing: '-0.2px',
            color: 'var(--text)'
          }}
        >
          {MOTIVATIONAL_HEADING}
        </h4>
        <p
          style={{
            margin: 0,
            fontSize: '12.5px',
            lineHeight: '1.5',
            color: 'var(--muted)'
          }}
        >
          {MOTIVATIONAL_DESC}
        </p>
      </div>
    </div>
  );
};

