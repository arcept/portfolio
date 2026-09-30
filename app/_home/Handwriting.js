'use client';

import { useId } from 'react';
import { motion } from 'motion/react';

const EASE = [0.65, 0, 0.35, 1];

// Handwriting that writes itself in: once `ready`, each of `words` is uncovered from left to right
// over its own box ([x, y, width, height] in the viewBox), starting `at` seconds in and taking `for`.
// With `sway` it then rocks gently, from `swayAt`. With reduced motion (`still`) it is simply there.
export default function Handwriting({ viewBox, words, ready, still, sway, swayAt = 0 }) {
  const id = useId().replace(/:/g, '');
  return (
    <motion.svg
      viewBox={viewBox}
      animate={sway ? { rotate: [0, 4, -3, 0] } : { rotate: 0 }}
      transition={sway ? { duration: 6, repeat: Infinity, ease: 'easeInOut', delay: swayAt } : { duration: 0.4 }}
    >
      <defs>
        {words.map((w, i) => (
          <clipPath key={i} id={`${id}-${i}`}>
            <motion.rect
              x={w.box[0]}
              y={w.box[1]}
              height={w.box[3]}
              // Always from 0, so the page the server sends (which can't know about reduced motion) matches
              // the browser's first render; with reduced motion it then shows at once.
              initial={{ width: 0 }}
              animate={{ width: ready || still ? w.box[2] : 0 }}
              transition={still ? { duration: 0 } : { delay: w.at, duration: w.for, ease: EASE }}
            />
          </clipPath>
        ))}
      </defs>
      {words.map((w, i) => (
        <path key={i} d={w.d} clipPath={`url(#${id}-${i})`} />
      ))}
    </motion.svg>
  );
}
