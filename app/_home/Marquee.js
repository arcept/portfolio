'use client';

import { useEffect, useRef } from 'react';
import { motion, useAnimationFrame, useInView, useMotionValue, useReducedMotion } from 'motion/react';
import { FACE } from './fonts';

const PARTS = ['Manik Madaan', 'Product Design Leader'];
const PASS_SECONDS = 14; // one full "Manik Madaan ✦ Product Design Leader ✦" goes by in this long
const COPIES = 3; // enough that the band is always full, however wide the poster
const HOVER_PACE = 0.12; // share of full speed while the pointer is over the band

// The name as a band of very large type running behind the hero, right to left, in an endless loop.
// It sits under everything else, so the pointer never lands on it: instead it watches where the
// pointer is and, over the band's strip, eases almost to a stop, picking up again when it leaves.
export default function Marquee({ ready }) {
  const band = useRef(null);
  const track = useRef(null);
  const x = useMotionValue(0);
  const pace = useRef(1);
  const over = useRef(false);
  const still = useReducedMotion();
  const seen = useInView(band); // not moved while it is off screen

  useEffect(() => {
    const move = (e) => {
      const box = band.current?.getBoundingClientRect();
      over.current = !!box && e.clientY >= box.top && e.clientY <= box.bottom && e.clientX >= box.left && e.clientX <= box.right;
    };
    const leave = () => (over.current = false);
    window.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerleave', leave);
    return () => {
      window.removeEventListener('pointermove', move);
      document.removeEventListener('pointerleave', leave);
    };
  }, []);

  useAnimationFrame((_, delta) => {
    if (still || !seen || !track.current) return;
    const copy = track.current.scrollWidth / COPIES;
    if (!copy) return;
    pace.current += ((over.current ? HOVER_PACE : 1) - pace.current) * Math.min(1, delta / 250);
    let next = x.get() - (copy / PASS_SECONDS) * (delta / 1000) * pace.current;
    if (next <= -copy) next += copy;
    x.set(next);
  });

  return (
    <motion.div
      ref={band}
      className="hx-i-mq"
      style={{ fontFamily: FACE.family }}
      aria-hidden="true"
      initial={{ opacity: 0, y: 40 }}
      animate={ready ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
    >
      <motion.div ref={track} className="hx-i-mq__track" style={{ x }}>
        {Array.from({ length: COPIES }, (_, c) => (
          <span className="hx-i-mq__copy" key={c}>
            {PARTS.map((part) => (
              <span className="hx-i-mq__part" key={part}>
                {part}
                <span className="hx-i-mq__star" />
              </span>
            ))}
          </span>
        ))}
      </motion.div>
    </motion.div>
  );
}
