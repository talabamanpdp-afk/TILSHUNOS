import React, { useEffect, useState, useRef } from 'react';

interface AnimatedCounterProps {
  value: string | number;
  duration?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function AnimatedCounter({
  value,
  duration = 1800,
  className = '',
  style
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState<string>(typeof value === 'string' ? value : String(value));
  const [hasAnimated, setHasAnimated] = useState(false);
  const elementRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // Parse numeric part and suffix/prefix (e.g., "8+", "103 Lesson", "99 PERCENT")
    const strVal = String(value).trim();
    const match = strVal.match(/^([^\d]*)([\d,.]+)(.*)$/);

    if (!match) {
      setDisplayValue(strVal);
      return;
    }

    const prefix = match[1];
    const rawNumberStr = match[2].replace(/,/g, '');
    const suffix = match[3];
    const targetNumber = parseFloat(rawNumberStr);

    if (isNaN(targetNumber)) {
      setDisplayValue(strVal);
      return;
    }

    // Check prefers-reduced-motion
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplayValue(strVal);
      return;
    }

    const element = elementRef.current;
    if (!element || hasAnimated) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true);
            observer.disconnect();

            const startTime = performance.now();
            const isDecimal = rawNumberStr.includes('.');
            const decimalPlaces = isDecimal ? rawNumberStr.split('.')[1].length : 0;

            const update = (now: number) => {
              const elapsed = now - startTime;
              const progress = Math.min(elapsed / duration, 1);
              // Ease-out expo curve for satisfying deceleration
              const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
              const currentVal = targetNumber * easeProgress;

              const formattedVal = isDecimal
                ? currentVal.toFixed(decimalPlaces)
                : Math.floor(currentVal).toString();

              setDisplayValue(`${prefix}${formattedVal}${suffix}`);

              if (progress < 1) {
                requestAnimationFrame(update);
              } else {
                setDisplayValue(strVal);
              }
            };

            requestAnimationFrame(update);
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [value, duration, hasAnimated]);

  return (
    <span ref={elementRef} className={`counter-number ${className}`} style={style}>
      {displayValue}
    </span>
  );
}
