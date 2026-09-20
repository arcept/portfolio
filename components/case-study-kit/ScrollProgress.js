'use client';

import { motion, useScroll, useSpring } from 'motion/react';
import { useReduce } from './Motion';

// A thin line along the top of the window that fills as you scroll down the page.
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });
  const reduce = useReduce();
  return <motion.div className="ph-progress" style={{ scaleX: reduce ? scrollYProgress : progress }} aria-hidden="true" />;
}
