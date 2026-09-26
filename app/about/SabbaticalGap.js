'use client';

import { animate, motion } from 'motion/react';
import { SABBATICAL_DATES } from './sabbatical-content';

const EASE = [0.16, 1, 0.3, 1];
const MONTHS = 17; // Aug 2024 – Dec 2025

// Glides down to Section 06, as the index does: eased, longer the further it goes, and any wheel, touch
// or key press takes over.
function goToSabbatical(event) {
  const node = document.getElementById('sabbatical');
  if (!node) return;
  event.preventDefault();
  const top = Math.max(0, node.getBoundingClientRect().top + window.scrollY);
  history.replaceState(null, '', '#sabbatical');
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.scrollTo(0, top);
    return;
  }
  const from = window.scrollY;
  const controls = animate(from, top, {
    duration: Math.min(1.8, 0.8 + Math.abs(top - from) / 2600),
    ease: [0.65, 0, 0.35, 1],
    onUpdate: (y) => window.scrollTo(0, y),
  });
  const stop = () => {
    controls.stop();
    ['wheel', 'touchstart', 'keydown'].forEach((t) => window.removeEventListener(t, stop));
  };
  ['wheel', 'touchstart', 'keydown'].forEach((t) => window.addEventListener(t, stop, { passive: true }));
  controls.then(stop);
}

// The gap between Independent (now) and Novatr. At rest, a strip of tape in the page's opposite colour
// runs the words past, with a paused pill in the middle. On hover or focus it opens into a band of the
// sabbatical's illustration: the pause turns to play, and the ends read "Inside Sabbatical" and "Read
// about the break". It leads down to Section 06.
export default function SabbaticalGap() {
  const run = Array.from({ length: 6 }, (_, i) => (
    <span key={i} className="xp-gap__tapeitem">
      Sabbatical <i>✳</i> {SABBATICAL_DATES} <i>✳</i> {MONTHS} months off <i>✳</i>
    </span>
  ));

  return (
    <motion.li
      className="xp-gap"
      initial={{ opacity: 0, scaleX: 0.6 }}
      whileInView={{ opacity: 1, scaleX: 1 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.9, ease: EASE }}
    >
      <a href="#sabbatical" className="xp-gap__bar" onClick={goToSabbatical} aria-label={`Sabbatical, ${SABBATICAL_DATES}. Read about the break`}>
        <span className="xp-gap__view" aria-hidden="true" />
        <span className="xp-gap__tape" aria-hidden="true">
          <span className="xp-gap__tapetrack">
            {run}
            {run}
          </span>
        </span>
        <span className="xp-gap__end xp-gap__end--start" aria-hidden="true">
          Inside Sabbatical
        </span>
        <span className="xp-gap__pill" aria-hidden="true">
          <span className="xp-gap__icon">
            <span className="xp-gap__pause" />
            <span className="xp-gap__play" />
          </span>
          <span className="xp-gap__word">Sabbatical</span>
        </span>
        <span className="xp-gap__end xp-gap__end--end" aria-hidden="true">
          Read about the break <span className="xp-gap__arrow">↓</span>
        </span>
      </a>
    </motion.li>
  );
}
