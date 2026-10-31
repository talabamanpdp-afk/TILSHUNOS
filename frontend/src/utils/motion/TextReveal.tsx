import React from 'react';
import { motion, Variants } from 'framer-motion';

interface TextRevealProps {
  text: string;
  className?: string;
  highlightWords?: string[];
  highlightClassName?: string;
  delay?: number;
  stagger?: number;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div';
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: (i: { delay: number; stagger: number }) => ({
    opacity: 1,
    transition: {
      delayChildren: i.delay,
      staggerChildren: i.stagger
    }
  })
};

const wordVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    filter: 'blur(4px)'
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.65,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

export function TextReveal({
  text,
  className = '',
  highlightWords = [],
  highlightClassName = 'text-gradient-flow',
  delay = 0.1,
  stagger = 0.045,
  as = 'div'
}: TextRevealProps) {
  const words = text.split(' ');

  const MotionComponent = motion[as] as any;

  return (
    <MotionComponent
      className={`text-reveal-container ${className}`}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      custom={{ delay, stagger }}
      style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '0.28em' }}
    >
      {words.map((word, idx) => {
        const isHighlight = highlightWords.some(h =>
          word.toLowerCase().includes(h.toLowerCase())
        );

        return (
          <motion.span
            key={idx}
            variants={wordVariants}
            className={`word-item ${isHighlight ? highlightClassName : ''}`}
            style={{ display: 'inline-block', willChange: 'transform, opacity, filter' }}
          >
            {word}
          </motion.span>
        );
      })}
    </MotionComponent>
  );
}

