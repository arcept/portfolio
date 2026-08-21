'use client';

import { useEffect, useRef } from 'react';
import { animate, useInView, useReducedMotion } from 'motion/react';

export default function StatCounter({ value, suffix = '%', label }) {
  const containerRef = useRef(null);
  const numberRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.4 });
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (!isInView || !numberRef.current) return undefined;

    if (shouldReduceMotion) {
      numberRef.current.textContent = `${value}${suffix}`;
      return undefined;
    }

    const controls = animate(0, value, {
      duration: 1.2,
      ease: [0.22, 1, 0.36, 1],
      onUpdate(latest) {
        if (numberRef.current) {
          numberRef.current.textContent = `${Math.round(latest)}${suffix}`;
        }
      },
    });

    return () => controls.stop();
  }, [isInView, shouldReduceMotion, value, suffix]);

  return (
    <div ref={containerRef} className="card__stat">
      <span ref={numberRef} className="card__stat-value">{`0${suffix}`}</span>
      <span className="card__stat-label">{label}</span>
    </div>
  );
}
