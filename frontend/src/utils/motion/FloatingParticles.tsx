import React, { useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

interface FloatingSymbol {
  id: number;
  label: string;
  x: number; // percentage
  y: number; // percentage
  size: number;
  color: string;
  glow: string;
  duration: number;
  delay: number;
  rotate: number;
}

const DEFAULT_SYMBOLS: FloatingSymbol[] = [
  { id: 1, label: 'A1', x: 8, y: 18, size: 28, color: '#38bdf8', glow: 'rgba(56, 189, 248, 0.4)', duration: 7, delay: 0, rotate: -8 },
  { id: 2, label: 'Aa', x: 88, y: 12, size: 32, color: '#818cf8', glow: 'rgba(129, 140, 248, 0.4)', duration: 8.5, delay: 1, rotate: 12 },
  { id: 3, label: 'B2', x: 92, y: 62, size: 26, color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.35)', duration: 6.8, delay: 0.5, rotate: -10 },
  { id: 4, label: 'C1', x: 4, y: 72, size: 26, color: '#ec4899', glow: 'rgba(236, 72, 153, 0.35)', duration: 9, delay: 1.5, rotate: 6 },
  { id: 5, label: 'AI', x: 46, y: 8, size: 24, color: '#a855f7', glow: 'rgba(168, 85, 247, 0.4)', duration: 7.4, delay: 2, rotate: -5 },
  { id: 6, label: 'Zz', x: 78, y: 82, size: 22, color: '#10b981', glow: 'rgba(16, 185, 129, 0.35)', duration: 8.2, delay: 0.8, rotate: 14 },
];

export function FloatingParticles() {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch(
      window.matchMedia('(pointer: coarse)').matches ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }, []);

  const mouseX = useSpring(0, { stiffness: 60, damping: 20 });
  const mouseY = useSpring(0, { stiffness: 60, damping: 20 });

  useEffect(() => {
    if (isTouch) return;
    const handleMove = (e: MouseEvent) => {
      const xRatio = (e.clientX / window.innerWidth) - 0.5;
      const yRatio = (e.clientY / window.innerHeight) - 0.5;
      mouseX.set(xRatio * 35);
      mouseY.set(yRatio * 35);
    };
    window.addEventListener('mousemove', handleMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMove);
  }, [isTouch, mouseX, mouseY]);

  if (isTouch) {
    return null; // Don't render floating particles on touch devices for max 60fps performance
  }

  return (
    <div
      className="floating-particles-canvas"
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 1
      }}
    >
      {DEFAULT_SYMBOLS.map((sym) => (
        <motion.div
          key={sym.id}
          style={{
            position: 'absolute',
            left: `${sym.x}%`,
            top: `${sym.y}%`,
            x: mouseX,
            y: mouseY,
            width: sym.size,
            height: sym.size,
            borderRadius: '8px',
            background: 'rgba(15, 23, 42, 0.65)',
            border: `1px solid ${sym.color}50`,
            boxShadow: `0 0 16px ${sym.glow}, inset 0 0 8px ${sym.glow}`,
            color: sym.color,
            fontSize: `${sym.size * 0.44}px`,
            fontWeight: 900,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(8px)',
            userSelect: 'none'
          }}
          animate={{
            y: [0, -18, 0],
            rotate: [sym.rotate, sym.rotate + 6, sym.rotate],
            opacity: [0.55, 0.85, 0.55]
          }}
          transition={{
            duration: sym.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: sym.delay
          }}
        >
          {sym.label}
        </motion.div>
      ))}
    </div>
  );
}
