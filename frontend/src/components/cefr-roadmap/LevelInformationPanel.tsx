import React from 'react';
import {
  CheckCircle2, Clock, Award, ArrowRight, Lock, Sparkles,
  BookOpen, Mic, PenLine, Compass, Sprout, MessageCircle,
  GraduationCap, Target, Trophy, Check
} from 'lucide-react';
import { CEFRLevelDetail } from './cefrRoadmapData';

interface LevelInformationPanelProps {
  level: CEFRLevelDetail;
  onExplore: (levelCode: string) => void;
  dark?: boolean;
}

export const LevelInformationPanel: React.FC<LevelInformationPanelProps> = ({
  level,
  onExplore,
  dark
}) => {
  // Map level icon
  const renderLevelIcon = (size: number = 24) => {
    switch (level.iconType) {
      case 'sprout':
        return <Sprout size={size} />;
      case 'book':
        return <BookOpen size={size} />;
      case 'message':
        return <MessageCircle size={size} />;
      case 'grad-cap':
        return <GraduationCap size={size} />;
      case 'target':
        return <Target size={size} />;
      case 'trophy':
        return <Trophy size={size} />;
      default:
        return <Award size={size} />;
    }
  };

  // Category Icon helper
  const renderCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'sparkles':
        return <Sparkles size={16} />;
      case 'book':
        return <BookOpen size={16} />;
      case 'mic':
        return <Mic size={16} />;
      case 'pen':
        return <PenLine size={16} />;
      default:
        return <Check size={16} />;
    }
  };

  return (
    <div
      className="cefr-info-panel"
      style={{
        background: dark ? 'rgba(21, 21, 34, 0.88)' : 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: dark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.08)',
        borderRadius: '24px',
        padding: '28px',
        boxShadow: dark
          ? '0 20px 50px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)'
          : '0 20px 50px rgba(53, 108, 246, 0.08), 0 2px 10px rgba(0, 0, 0, 0.03)',
        display: 'flex',
        flexDirection: 'column',
        gap: '22px',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Top Ambient Glow matching level color */}
      <div
        style={{
          position: 'absolute',
          top: '-60px',
          right: '-60px',
          width: '180px',
          height: '180px',
          borderRadius: '50%',
          background: level.color,
          opacity: dark ? 0.18 : 0.12,
          filter: 'blur(45px)',
          pointerEvents: 'none'
        }}
      />

      {/* ======================================================== */}
      {/* A. LEVEL HEADER                                          */}
      {/* ======================================================== */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Large Level Icon Badge */}
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: level.gradient,
              color: '#ffffff',
              display: 'grid',
              placeItems: 'center',
              boxShadow: `0 8px 24px ${level.color}45`,
              flexShrink: 0
            }}
          >
            {renderLevelIcon(26)}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 900,
                  letterSpacing: '1px',
                  color: level.color,
                  textTransform: 'uppercase'
                }}
              >
                LEVEL {level.code}
              </span>
            </div>
            <h3
              style={{
                margin: '2px 0 0',
                fontSize: '24px',
                fontWeight: 850,
                letterSpacing: '-0.5px',
                color: 'var(--text)'
              }}
            >
              {level.name}
            </h3>
          </div>
        </div>

        {/* Status Badge */}
        <div>
          {level.status === 'completed' && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '100px',
                background: 'rgba(16, 185, 129, 0.14)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                color: '#10b981',
                fontSize: '12px',
                fontWeight: 750
              }}
            >
              <CheckCircle2 size={14} strokeWidth={2.5} />
              <span>Completed</span>
            </span>
          )}

          {level.status === 'current' && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '100px',
                background: 'rgba(59, 130, 246, 0.16)',
                border: '1px solid rgba(59, 130, 246, 0.4)',
                color: '#3b82f6',
                fontSize: '12px',
                fontWeight: 800,
                boxShadow: '0 0 14px rgba(59, 130, 246, 0.25)'
              }}
            >
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: '#3b82f6',
                  boxShadow: '0 0 8px #3b82f6'
                }}
              />
              <span>Current Level</span>
            </span>
          )}

          {level.status === 'locked' && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '100px',
                background: dark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)',
                border: dark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
                color: 'var(--muted)',
                fontSize: '12px',
                fontWeight: 650
              }}
            >
              <Lock size={13} />
              <span>Locked</span>
            </span>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* B. LEVEL DESCRIPTION                                     */}
      {/* ======================================================== */}
      <p
        style={{
          margin: 0,
          fontSize: '14px',
          lineHeight: '1.65',
          color: 'var(--muted)'
        }}
      >
        {level.description}
      </p>

      {/* ======================================================== */}
      {/* C. LEVEL STATISTICS (2 Compact Cards)                     */}
      {/* ======================================================== */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: '12px'
        }}
      >
        {/* Estimated Duration */}
        <div
          style={{
            padding: '12px 14px',
            borderRadius: '14px',
            background: dark ? 'rgba(255, 255, 255, 0.03)' : '#f8fafc',
            border: dark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(0, 0, 0, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--muted)', fontSize: '11px', fontWeight: 700 }}>
            <Clock size={13} style={{ color: level.color }} />
            <span>ESTIMATED TIME</span>
          </div>
          <strong style={{ fontSize: '15px', color: 'var(--text)', fontWeight: 800 }}>
            {level.estimatedDuration}
          </strong>
        </div>

        {/* Proficiency Level */}
        <div
          style={{
            padding: '12px 14px',
            borderRadius: '14px',
            background: dark ? 'rgba(255, 255, 255, 0.03)' : '#f8fafc',
            border: dark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(0, 0, 0, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--muted)', fontSize: '11px', fontWeight: 700 }}>
            <Compass size={13} style={{ color: level.color }} />
            <span>PROFICIENCY</span>
          </div>
          <strong style={{ fontSize: '15px', color: 'var(--text)', fontWeight: 800 }}>
            {level.proficiencyLevel}
          </strong>
        </div>
      </div>

      {/* ======================================================== */}
      {/* D. LEARNING OBJECTIVES                                    */}
      {/* ======================================================== */}
      <div>
        <span
          style={{
            display: 'block',
            fontSize: '11px',
            fontWeight: 800,
            color: 'var(--muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.6px',
            marginBottom: '10px'
          }}
        >
          Learning Objectives
        </span>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {level.learningObjectives.map((obj, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                fontSize: '13px',
                color: 'var(--text)',
                lineHeight: '1.45'
              }}
            >
              <div
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  background: `${level.color}18`,
                  color: level.color,
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0,
                  marginTop: '1px'
                }}
              >
                <Check size={11} strokeWidth={3} />
              </div>
              <span>{obj}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ======================================================== */}
      {/* E. WHAT YOU'LL LEARN (4 Category Cards)                  */}
      {/* ======================================================== */}
      <div>
        <span
          style={{
            display: 'block',
            fontSize: '11px',
            fontWeight: 800,
            color: 'var(--muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.6px',
            marginBottom: '10px'
          }}
        >
          What You'll Learn
        </span>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: '10px'
          }}
        >
          {level.whatYouLearn.map((item, idx) => (
            <div
              key={idx}
              style={{
                padding: '10px 12px',
                borderRadius: '12px',
                background: dark ? 'rgba(255, 255, 255, 0.025)' : 'rgba(0, 0, 0, 0.02)',
                border: dark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(0, 0, 0, 0.05)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '9px',
                  background: `${level.color}15`,
                  color: level.color,
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0
                }}
              >
                {renderCategoryIcon(item.iconName)}
              </div>
              <div style={{ minWidth: 0 }}>
                <span style={{ fontSize: '10px', color: 'var(--muted)', fontWeight: 700, display: 'block' }}>
                  {item.category}
                </span>
                <strong
                  style={{
                    fontSize: '12px',
                    color: 'var(--text)',
                    fontWeight: 750,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: 'block'
                  }}
                >
                  {item.title}
                </strong>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ======================================================== */}
      {/* F. EXPLORE LEVEL BUTTON                                  */}
      {/* ======================================================== */}
      <button
        type="button"
        onClick={() => onExplore(level.code)}
        style={{
          width: '100%',
          padding: '14px 20px',
          borderRadius: '14px',
          background: level.gradient,
          color: '#ffffff',
          fontSize: '14px',
          fontWeight: 800,
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          boxShadow: `0 8px 25px ${level.color}45`,
          transition: 'all 0.25s ease',
          marginTop: '6px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = `0 12px 30px ${level.color}60`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = `0 8px 25px ${level.color}45`;
        }}
      >
        <span>Explore {level.code} Level</span>
        <ArrowRight size={17} strokeWidth={2.5} />
      </button>
    </div>
  );
};
