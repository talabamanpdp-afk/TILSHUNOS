import React, { useRef, useState, useEffect } from 'react';
import { motion, useSpring } from 'framer-motion';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  maxTilt?: number;
  glowColor?: string;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export function TiltCard({
  children,
  className = '',
  style,
  maxTilt = 8,
  glowColor = 'rgba(120, 105, 245, 0.25)',
  onClick
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isTouch, setIsTouch] = useState(false);
  const [spotlight, setSpotlight] = useState({ x: 50, y: 50, opacity: 0 });

  useEffect(() => {
    setIsTouch(
      window.matchMedia('(pointer: coarse)').matches ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }, []);

  const rotateX = useSpring(0, { stiffness: 260, damping: 22 });
  const rotateY = useSpring(0, { stiffness: 260, damping: 22 });
  const scale = useSpring(1, { stiffness: 300, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isTouch || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const xPos = e.clientX - rect.left;
    const yPos = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = -((yPos - centerY) / centerY) * maxTilt;
    const rotY = ((xPos - centerX) / centerX) * maxTilt;

    rotateX.set(rotX);
    rotateY.set(rotY);

    setSpotlight({
      x: (xPos / rect.width) * 100,
      y: (yPos / rect.height) * 100,
      opacity: 1
    });
  };

  const handleMouseEnter = () => {
    if (isTouch) return;
    scale.set(1.02);
  };

  const handleMouseLeave = () => {
    if (isTouch) return;
    rotateX.set(0);
    rotateY.set(0);
    scale.set(1);
    setSpotlight(prev => ({ ...prev, opacity: 0 }));
  };

  if (isTouch) {
    return (
      <div className={`tilt-card-wrapper ${className}`} style={style} onClick={onClick}>
        {children}
      </div>
    );
  }

  return (
    <div style={{ perspective: 1200, display: 'flex', width: '100%', height: '100%' }}>
      <motion.div
        ref={cardRef}
        className={`tilt-card-wrapper ${className}`}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
        style={{
          rotateX,
          rotateY,
          scale,
          transformStyle: 'preserve-3d',
          position: 'relative',
          width: '100%',
          ...style
        }}
      >
        {/* Dynamic Spotlight Light Overlay */}
        <div
          className="tilt-card-spotlight"
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 'inherit',
            pointerEvents: 'none',
            zIndex: 3,
            opacity: spotlight.opacity,
            transition: 'opacity 0.3s ease',
            background: `radial-gradient(circle 260px at ${spotlight.x}% ${spotlight.y}%, ${glowColor}, transparent 70%)`
          }}
        />
        {children}
      </motion.div>
    </div>
  );
}
