'use client';

import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';

const variants = {
  hidden: { opacity: 0, y: 8 },
  visible: (delay) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1], delay },
  }),
};

export default function Reveal({ children, className, delay = 0 }) {
  const prefersReducedMotion = useReducedMotion();
  // Gate on mount: matchMedia isn't available during SSR, so the server
  // always renders the motion.div branch. Reading prefersReducedMotion
  // directly here would let the client's first render pick the plain-div
  // branch instead whenever OS reduced-motion is on, a tag-type mismatch
  // React can't reconcile — it leaves the SSR'd motion.div (and its
  // opacity: 0 starting style) permanently stuck, hiding the content.
  // Waiting a tick keeps the first client render identical to the server's.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const shouldReduceMotion = mounted && prefersReducedMotion;

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={variants}
      custom={delay}
    >
      {children}
    </motion.div>
  );
}
