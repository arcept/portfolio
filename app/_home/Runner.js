'use client';

import { useRef } from 'react';
import {
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  wrap,
} from 'motion/react';
import { FACE } from './fonts';

const WORDS = ['Design leadership', 'Systems', 'Prototypes you can click', 'Behavioural data', 'Teams from zero', 'Craft'];
const STICKERS = [
  { src: '/about/stickers/heart.png', w: 194, h: 154 },
  { src: '/about/stickers/craft.svg', w: 108, h: 51 },
  { src: '/about/stickers/who-am-i.svg', w: 359, h: 299 },
];

// The case studies' screens.
const SHOTS = [
  { src: '/case-studies/placement-hub/preview.png', w: 1280, h: 750 },
  { src: '/case-studies/oms/dashboard-preview.png', w: 1280, h: 750 },
  { src: '/case-studies/cro-cover.png', w: 1400, h: 788 },
];

// Between the words, a small picture: the case studies' screens and the stickers, taking turns.
const PICTURES = WORDS.map((_, i) => {
  if (i % 2 === 0) return { kind: 'shot', ...SHOTS[(i / 2) % SHOTS.length] };
  return { kind: 'sticker', ...STICKERS[((i - 1) / 2) % STICKERS.length] };
});

// A band of words running across the page, with pictures between them, in the statement's face. It
// drifts on its own and the scroll pushes it: faster and leaning when the page moves fast, reversing
// when it goes back.
export default function Runner() {
  const reduced = useReducedMotion();
  const box = useRef(null);
  const seen = useInView(box); // not moved while it is off screen
  const base = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smooth = useSpring(velocity, { damping: 50, stiffness: 400 });
  const factor = useTransform(smooth, [-2000, 0, 2000], [-5, 0, 5], { clamp: false });
  const skew = useTransform(smooth, [-3000, 0, 3000], [8, 0, -8]);
  const x = useTransform(base, (v) => `${wrap(-50, 0, v)}%`);
  const direction = useRef(-1);

  useAnimationFrame((_, delta) => {
    if (reduced || !seen) return;
    let move = direction.current * 1.2 * (delta / 1000);
    const f = factor.get();
    if (f < 0) direction.current = 1;
    else if (f > 0) direction.current = -1;
    move += direction.current * move * f;
    base.set(base.get() + move);
  });

  const line = WORDS.map((word, i) => {
    const pic = PICTURES[i];
    return (
      <span key={word} className="hx-i-runner__item">
        <span className={`hx-i-runner__word${i % 2 ? ' is-accent' : ''}`}>{word}</span>
        <span className={`hx-i-runner__pic hx-i-runner__pic--${pic.kind}`}>
          <img src={pic.src} alt="" width={pic.w} height={pic.h} loading="lazy" />
        </span>
      </span>
    );
  });

  return (
    <motion.div
      ref={box}
      className="hx-i-runner"
      aria-hidden="true"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        className="hx-i-runner__track"
        style={{ x, skewX: skew, fontFamily: FACE.family, fontWeight: 500 }}
      >
        {line}
        {line}
      </motion.div>
    </motion.div>
  );
}
