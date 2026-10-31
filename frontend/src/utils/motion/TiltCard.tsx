import React, { useRef, useState, useEffect } from 'react';
import { motion, useSpring } from 'framer-motion';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  maxTilt?: number;
  glowColor?: string;
  borderRadius?: string | number;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export function TiltCard({
  children,
  className = '',
  style,
  maxTilt = 8,
  borderRadius,
  onClick
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch(
      window.matchMedia('(pointer: coarse)').matches ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }, []);

  const rotateX = useSpring(0, { stiffness: 260, damping: 22 });
  const rotateY = useSpring(0, { stiffness: 260, damping: 22 });

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
  };

  const handleMouseLeave = () => {
    if (isTouch) return;
    rotateX.set(0);
    rotateY.set(0);
  };

  if (isTouch) {
    return (
      <div
        className={`tilt-card-wrapper ${className}`}
        style={{
          background: 'transparent',
          boxShadow: 'none',
          border: 'none',
          borderRadius: borderRadius || 'inherit',
          ...style
        }}
        onClick={onClick}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      style={{
        perspective: 1200,
        display: 'flex',
        width: '100%',
        height: '100%',
        background: 'transparent',
        boxShadow: 'none',
        border: 'none'
      }}
    >
      <motion.div
        ref={cardRef}
        className={`tilt-card-wrapper ${className}`}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
          position: 'relative',
          width: '100%',
          background: 'transparent',
          boxShadow: 'none',
          border: 'none',
          borderRadius: borderRadius || 'inherit',
          ...style
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
