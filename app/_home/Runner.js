'use client';

import { motion } from 'motion/react';
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
// runs steadily to the left, whatever the page's scroll is doing (a CSS animation, home.css: the line
// is there twice, so moving it by half its length loops without a seam). Still with reduced motion.
export default function Runner() {
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
      className="hx-i-runner"
      aria-hidden="true"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="hx-i-runner__track" style={{ fontFamily: FACE.family, fontWeight: 500 }}>
        {line}
        {line}
      </div>
    </motion.div>
  );
}
