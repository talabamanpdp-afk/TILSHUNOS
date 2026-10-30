import React, { useState } from 'react';
import {
  CheckCircle2, Lock, Sprout, BookOpen, MessageCircle,
  GraduationCap, Target, Trophy, Sparkles, Flag
} from 'lucide-react';
import { CEFR_ROADMAP_LEVELS, CEFRLevelCode, CEFRLevelDetail, ROADMAP_QUOTE } from './cefrRoadmapData';

interface RoadmapLandscapeCanvasProps {
  selectedLevel: CEFRLevelCode;
  onSelectLevel: (levelCode: CEFRLevelCode) => void;
  dark?: boolean;
}

export const RoadmapLandscapeCanvas: React.FC<RoadmapLandscapeCanvasProps> = ({
  selectedLevel,
  onSelectLevel,
  dark
}) => {
  const [hoveredLevel, setHoveredLevel] = useState<CEFRLevelCode | null>(null);

  // Road SVG Path definition
  const roadPathD = `
    M 290 820
    C 250 760, 160 740, 135 690
    C 110 635, 360 630, 430 575
    C 500 520, 210 500, 145 450
    C 90 395, 360 380, 420 330
    C 480 280, 220 260, 165 215
    C 120 170, 290 135, 345 95
  `;

  // Milestone icon helper
  const renderMilestoneIcon = (iconType: string, size: number = 20) => {
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
    <div
      className="cefr-roadmap-container"
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '580px',
        margin: '0 auto',
        borderRadius: '28px',
        overflow: 'hidden',
        boxShadow: dark
          ? '0 24px 60px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.08)'
          : '0 24px 60px rgba(53, 108, 246, 0.12), 0 2px 12px rgba(0, 0, 0, 0.04)',
        background: dark
          ? 'linear-gradient(180deg, #090e1a 0%, #10172a 40%, #0c1222 100%)'
          : 'linear-gradient(180deg, #e0f2fe 0%, #bae6fd 30%, #f0fdf4 70%, #dcfce7 100%)',
        userSelect: 'none'
      }}
    >
      {/* SVG Canvas for Mountains, Hills, Lake, Winding Road */}
      <svg
        viewBox="0 0 580 820"
        style={{ width: '100%', height: 'auto', display: 'block' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Sky Gradient */}
          <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={dark ? '#070b14' : '#bae6fd'} />
            <stop offset="100%" stopColor={dark ? '#0f172a' : '#e0f2fe'} />
          </linearGradient>

          {/* Distant Mountain Peak Gradient */}
          <linearGradient id="mountainPeakGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={dark ? '#1e293b' : '#94a3b8'} />
            <stop offset="100%" stopColor={dark ? '#0f172a' : '#64748b'} />
          </linearGradient>

          {/* Snow Cap Gradient */}
          <linearGradient id="snowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>

          {/* High Green Hills */}
          <linearGradient id="hillUpperGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={dark ? '#064e3b' : '#86efac'} />
            <stop offset="100%" stopColor={dark ? '#022c22' : '#4ade80'} />
          </linearGradient>

          {/* Middle Green Hills */}
          <linearGradient id="hillMidGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={dark ? '#065f46' : '#a7f3d0'} />
            <stop offset="100%" stopColor={dark ? '#042f2e' : '#34d399'} />
          </linearGradient>

          {/* Valley Lake Gradient */}
          <linearGradient id="lakeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={dark ? '#1e3a8a' : '#38bdf8'} />
            <stop offset="100%" stopColor={dark ? '#0f172a' : '#0284c7'} />
          </linearGradient>

          {/* Road Asphalt Gradient */}
          <linearGradient id="roadAsphaltGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={dark ? '#1e293b' : '#334155'} />
            <stop offset="50%" stopColor={dark ? '#0f172a' : '#1e293b'} />
            <stop offset="100%" stopColor={dark ? '#1e293b' : '#334155'} />
          </linearGradient>

          {/* Road Outer Border / Kerb */}
          <linearGradient id="roadKerbGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={dark ? '#334155' : '#cbd5e1'} />
            <stop offset="100%" stopColor={dark ? '#1e293b' : '#94a3b8'} />
          </linearGradient>

          {/* Road Glow in Dark Mode */}
          <filter id="roadGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 1. SKY BACKGROUND */}
        <rect width="580" height="820" fill="url(#skyGrad)" />

        {/* Clouds in Sky */}
        <g opacity={dark ? '0.2' : '0.65'}>
          <path d="M 60 70 Q 80 50, 110 65 Q 140 45, 170 65 Q 190 75, 175 90 Q 150 100, 75 95 Z" fill="#ffffff" />
          <path d="M 410 50 Q 430 35, 460 45 Q 490 30, 520 45 Q 540 55, 525 70 Q 500 80, 420 75 Z" fill="#ffffff" />
        </g>

        {/* 2. DISTANT MAJESTIC MOUNTAINS */}
        {/* Mountain Left */}
        <polygon points="40,240 180,60 300,240" fill="url(#mountainPeakGrad)" opacity={dark ? '0.6' : '0.8'} />
        {/* Snow Cap Left */}
        <polygon points="150,96 180,60 210,96 195,108 180,100 165,108" fill="url(#snowGrad)" />

        {/* High Summit Mountain (C2 Destination) */}
        <polygon points="210,260 350,55 490,260" fill="url(#mountainPeakGrad)" />
        {/* Snow Cap Summit */}
        <polygon points="315,105 350,55 385,105 368,118 350,110 332,118" fill="url(#snowGrad)" />

        {/* Mountain Right */}
        <polygon points="380,250 490,110 580,250" fill="url(#mountainPeakGrad)" opacity={dark ? '0.5' : '0.75'} />

        {/* 3. ROLLING GREEN HILLS (Layered Depth) */}
        {/* Upper Hill */}
        <path d="M -20 320 Q 140 210, 310 270 Q 460 320, 600 240 L 600 500 L -20 500 Z" fill="url(#hillUpperGrad)" />

        {/* Beautiful Alpine Lake in the Valley */}
        <path
          d="M 120 370 Q 240 330, 360 360 Q 460 390, 480 430 Q 370 470, 220 450 Q 110 430, 120 370 Z"
          fill="url(#lakeGrad)"
          opacity={dark ? '0.55' : '0.85'}
        />
        {/* Lake Waves / Ripples */}
        <g stroke={dark ? '#60a5fa' : '#ffffff'} strokeWidth="1.5" strokeLinecap="round" opacity="0.5">
          <line x1="210" y1="380" x2="270" y2="380" />
          <line x1="260" y1="405" x2="330" y2="405" />
          <line x1="170" y1="415" x2="225" y2="415" />
        </g>

        {/* Mid Hill */}
        <path d="M -20 480 Q 180 380, 380 440 Q 510 480, 600 420 L 600 700 L -20 700 Z" fill="url(#hillMidGrad)" opacity={dark ? '0.8' : '0.9'} />

        {/* Lower Lush Hill (Foreground) */}
        <path d="M -20 660 Q 220 540, 420 620 Q 540 670, 600 620 L 600 840 L -20 840 Z" fill="url(#hillUpperGrad)" />

        {/* Pine Trees scattered on Hills */}
        <g fill={dark ? '#064e3b' : '#15803d'} opacity={dark ? '0.75' : '0.9'}>
          {/* Tree cluster near A1 */}
          <polygon points="50,710 60,685 70,710" />
          <polygon points="45,725 60,695 75,725" />
          <polygon points="75,700 85,680 95,700" />

          {/* Tree cluster near lake */}
          <polygon points="495,390 505,370 515,390" />
          <polygon points="510,405 520,380 530,405" />
          <polygon points="100,470 110,450 120,470" />

          {/* Trees on high ridges */}
          <polygon points="160,260 170,240 180,260" />
          <polygon points="440,280 450,260 460,280" />
          <polygon points="260,230 268,215 276,230" />
        </g>

        {/* 4. WINDING MOUNTAIN ASPHALT ROAD */}
        {/* Road Base Outer Casing / Kerb */}
        <path
          d={roadPathD}
          fill="none"
          stroke="url(#roadKerbGrad)"
          strokeWidth="52"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Road Asphalt Surface */}
        <path
          d={roadPathD}
          fill="none"
          stroke="url(#roadAsphaltGrad)"
          strokeWidth="42"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Road Center Divider Dashes (Animated feeling) */}
        <path
          d={roadPathD}
          fill="none"
          stroke={dark ? '#fde047' : '#ffffff'}
          strokeWidth="3.5"
          strokeDasharray="14 12"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.9"
        />

        {/* START LINE AT BOTTOM */}
        <g transform="translate(262, 804)">
          <rect x="0" y="0" width="56" height="10" rx="3" fill="#ffffff" />
          <rect x="0" y="0" width="14" height="5" fill="#0f172a" />
          <rect x="28" y="0" width="14" height="5" fill="#0f172a" />
          <rect x="14" y="5" width="14" height="5" fill="#0f172a" />
          <rect x="42" y="5" width="14" height="5" fill="#0f172a" />
          <text x="28" y="-4" textAnchor="middle" fill={dark ? '#38bdf8' : '#0369a1'} fontSize="9" fontWeight="900" letterSpacing="1">
            START
          </text>
        </g>

        {/* FINISH SUMMIT FLAG AT TOP NEAR C2 */}
        <g transform="translate(345, 48)">
          <line x1="0" y1="0" x2="0" y2="35" stroke="#cbd5e1" strokeWidth="2.5" />
          <path d="M 0 0 L 22 8 L 0 16 Z" fill="#ef4444" />
          <circle cx="0" cy="0" r="3" fill="#eab308" />
        </g>
      </svg>

      {/* ======================================================== */}
      {/* 5. INTERACTIVE MILESTONES (HTML Elements over Canvas)     */}
      {/* ======================================================== */}
      {CEFR_ROADMAP_LEVELS.map((lvl) => {
        const isSelected = selectedLevel === lvl.code;
        const isHovered = hoveredLevel === lvl.code;
        const isCurrent = lvl.status === 'current';
        const isCompleted = lvl.status === 'completed';

        // Calculate percentage coordinates from 580x820 SVG space
        const leftPercent = (lvl.mapX / 580) * 100;
        const topPercent = (lvl.mapY / 820) * 100;

        return (
          <div
            key={lvl.code}
            style={{
              position: 'absolute',
              left: `${leftPercent}%`,
              top: `${topPercent}%`,
              transform: 'translate(-50%, -50%)',
              zIndex: isSelected ? 30 : 20,
              cursor: 'pointer'
            }}
            onClick={() => onSelectLevel(lvl.code)}
            onMouseEnter={() => setHoveredLevel(lvl.code)}
            onMouseLeave={() => setHoveredLevel(null)}
            tabIndex={0}
            role="button"
            aria-label={`CEFR Level ${lvl.code} ${lvl.name}`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectLevel(lvl.code);
              }
            }}
          >
            {/* Glowing Pulse Animation for CURRENT or SELECTED level */}
            {(isCurrent || isSelected) && (
              <div
                style={{
                  position: 'absolute',
                  inset: '-12px',
                  borderRadius: '50%',
                  background: lvl.color,
                  opacity: isSelected ? 0.45 : 0.25,
                  filter: 'blur(8px)',
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                  pointerEvents: 'none'
                }}
              />
            )}

            {/* Circular Marker Button */}
            <div
              style={{
                width: isSelected ? '56px' : '48px',
                height: isSelected ? '56px' : '48px',
                borderRadius: '50%',
                background: lvl.gradient,
                border: isSelected
                  ? '3.5px solid #ffffff'
                  : `3px solid ${dark ? 'rgba(255,255,255,0.85)' : '#ffffff'}`,
                color: '#ffffff',
                display: 'grid',
                placeItems: 'center',
                boxShadow: isSelected
                  ? `0 0 25px ${lvl.color}, 0 8px 20px rgba(0,0,0,0.35)`
                  : `0 6px 16px rgba(0,0,0,0.25), 0 0 10px ${lvl.color}60`,
                transform: isHovered || isSelected ? 'scale(1.12)' : 'scale(1)',
                transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                position: 'relative'
              }}
            >
              {renderMilestoneIcon(lvl.iconType, isSelected ? 24 : 20)}

              {/* Status Badge in corner of marker */}
              <div
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  background: isCompleted ? '#10b981' : isCurrent ? '#3b82f6' : '#64748b',
                  color: '#ffffff',
                  border: '2px solid #ffffff',
                  display: 'grid',
                  placeItems: 'center',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                }}
              >
                {isCompleted ? (
                  <CheckCircle2 size={11} strokeWidth={3} />
                ) : isCurrent ? (
                  <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#ffffff' }} />
                ) : (
                  <Lock size={9} strokeWidth={3} />
                )}
              </div>
            </div>

            {/* Level Information Label Pill beside Milestone */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                transform: 'translateY(-50%)',
                left: lvl.labelPosition === 'right' ? 'calc(100% + 10px)' : 'auto',
                right: lvl.labelPosition === 'left' ? 'calc(100% + 10px)' : 'auto',
                whiteSpace: 'nowrap',
                pointerEvents: 'none'
              }}
            >
              <div
                style={{
                  padding: '5px 12px',
                  borderRadius: '100px',
                  background: isSelected
                    ? lvl.color
                    : dark
                    ? 'rgba(15, 23, 42, 0.88)'
                    : 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(8px)',
                  border: isSelected
                    ? '1.5px solid #ffffff'
                    : dark
                    ? '1px solid rgba(255,255,255,0.12)'
                    : '1px solid rgba(0,0,0,0.08)',
                  boxShadow: isSelected
                    ? `0 4px 14px ${lvl.color}60`
                    : '0 4px 12px rgba(0,0,0,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease'
                }}
              >
                <strong
                  style={{
                    fontSize: '12px',
                    fontWeight: 900,
                    color: isSelected ? '#ffffff' : lvl.color
                  }}
                >
                  {lvl.code}
                </strong>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: isSelected ? '#ffffff' : 'var(--text)'
                  }}
                >
                  {lvl.name}
                </span>
              </div>
            </div>
          </div>
        );
      })}

      {/* ======================================================== */}
      {/* 6. MOTIVATIONAL HANDWRITTEN QUOTE                        */}
      {/* ======================================================== */}
      <div
        style={{
          position: 'absolute',
          bottom: '24px',
          left: '20px',
          padding: '8px 14px',
          borderRadius: '12px',
          background: dark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(10px)',
          border: dark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(59, 130, 246, 0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          pointerEvents: 'none'
        }}
      >
        <Sparkles size={14} style={{ color: '#f59e0b' }} />
        <span
          style={{
            fontFamily: "'Segoe Print', 'Caveat', 'Comic Sans MS', cursive",
            fontSize: '12.5px',
            fontWeight: 700,
            color: dark ? '#93c5fd' : '#1e40af'
          }}
        >
          “{ROADMAP_QUOTE}”
        </span>
      </div>
    </div>
  );
};
