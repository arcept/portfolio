'use client';

import { motion, useReducedMotion } from 'motion/react';

export default function Card({ href, className = '', children }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.a
      href={href}
      className={`card ${className}`}
      whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.a>
  );
}
