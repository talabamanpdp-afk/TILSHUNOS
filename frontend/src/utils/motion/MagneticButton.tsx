import React, { useRef, useState, useEffect } from 'react';
import { motion, useSpring } from 'framer-motion';

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  style?: React.CSSProperties;
  strength?: number;
  activeGlow?: boolean;
}

export function MagneticButton({
  children,
  className = '',
  onClick,
  style,
  strength = 0.25,
  activeGlow = false
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    setIsTouchDevice(
      window.matchMedia('(pointer: coarse)').matches ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }, []);

  const x = useSpring(0, { stiffness: 220, damping: 18 });
  const y = useSpring(0, { stiffness: 220, damping: 18 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isTouchDevice || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distanceX = (e.clientX - centerX) * strength;
    const distanceY = (e.clientY - centerY) * strength;
    x.set(distanceX);
    y.set(distanceY);
  };

  const handleMouseLeave = () => {
    if (isTouchDevice) return;
    x.set(0);
    y.set(0);
  };

  if (isTouchDevice) {
    return (
      <div className={`magnetic-btn-wrapper ${className}`} onClick={onClick} style={style}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      style={{
        x,
        y,
        display: 'inline-flex',
        borderRadius: '9999px',
        position: 'relative',
        background: 'transparent',
        ...style
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      whileTap={{ scale: 0.96 }}
      whileHover={{ scale: 1.03 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`magnetic-btn-wrapper ${activeGlow ? 'has-magnetic-glow' : ''} ${className}`}
    >
      {children}
    </motion.div>
  );
}

