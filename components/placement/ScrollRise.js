'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { useReduce } from '@/components/placement/Motion';

// Wraps a whole block (used for the prototype embed) so it rises, zooms in and fades up as it
// scrolls into view — scrubbed to scroll position, like the section cards below it.
export default function ScrollRise({ children }) {
  const ref = useRef(null);
  const reduce = useReduce();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start 0.45'] });
  const y = useTransform(scrollYProgress, [0, 1], [80, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.94, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.75], [0, 1]);
  return (
    <motion.div ref={ref} style={reduce ? undefined : { y, scale, opacity, transformOrigin: '50% 0' }}>
      {children}
    </motion.div>
  );
}
