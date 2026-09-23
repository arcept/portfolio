'use client';

import { motion } from 'motion/react';

// A reserved place for an icon or illustration that does not exist yet: a dashed frame at the size
// the artwork will take, labelled with what goes there. Decorative, so hidden from assistive tech.
// `still` skips the slot's own entrance when a parent is already animating it.
export default function IconSlot({ label, size = 'md', still = false, className = '' }) {
  const motionProps = still
    ? {}
    : {
        initial: { opacity: 0, scale: 0.86, rotate: -4 },
        whileInView: { opacity: 1, scale: 1, rotate: 0 },
        viewport: { once: true, amount: 0.5 },
        transition: { type: 'spring', stiffness: 220, damping: 18 },
      };

  return (
    <motion.span className={`abt-slot abt-slot--${size} ${className}`} aria-hidden="true" {...motionProps}>
      <span className="abt-slot__label">
        {size === 'sm' ? 'Icon' : <>{size === 'lg' ? 'Illustration' : 'Spot illustration'}<br />{label}</>}
      </span>
    </motion.span>
  );
}
