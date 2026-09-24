'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import TextLoop from './TextLoop';
import useFullBleed from './useFullBleed';

// A ribbon of type between sections 01 and 02, running the full width of the window. The ribbon is
// drawn on a fixed 1200-wide canvas that scales with the screen, so on phones the type and ribbon
// are drawn about twice as large (and the wave gentler), or they would shrink to a few pixels.
// The green is the Leadership section's, deepened enough for white type to hold 3:1 on it.
const WIDE = { fontSize: 19, ribbonWidth: 54, curviness: 15, letterSpacing: 2 };
const NARROW = { fontSize: 48, ribbonWidth: 135, curviness: 13, letterSpacing: 2 };

// The height of the wave and ribbon on the 1200-wide canvas (the wave's peak-to-peak is 2.2 x
// curviness, and the ribbon is as thick as its width), plus a little air. The band takes this as its
// aspect ratio, so its height follows the width exactly and the ribbon can never be clipped.
const extent = ({ curviness, ribbonWidth }) => curviness * 2.2 + ribbonWidth + 24;

export default function LoopBand() {
  const band = useRef(null);
  const [narrow, setNarrow] = useState(false);
  useFullBleed(band, 0);

  useEffect(() => {
    const query = window.matchMedia('(max-width: 899px)');
    const update = () => setNarrow(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  const size = narrow ? NARROW : WIDE;

  return (
    <motion.div
      className="abt-loop"
      ref={band}
      style={{ aspectRatio: `1200 / ${extent(size)}` }}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
    >
      <TextLoop
        text="Design ✦ Systems ✦ Leadership"
        shape="wave"
        speed={65}
        direction="forward"
        separator="✦"
        fontWeight={800}
        uppercase
        color="#ffffff"
        ribbon
        ribbonColor="#259643"
        pauseOnHover={false}
        {...size}
      />
    </motion.div>
  );
}
