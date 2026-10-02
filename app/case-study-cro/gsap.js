'use client';

import { useEffect, useLayoutEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

export { gsap, ScrollTrigger, SplitText };

export const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

// The page's two curves: one for things arriving, one for things that travel and settle.
export const EASE_IN = 'power3.out';
export const EASE_MOVE = 'power3.inOut';

// True when the visitor has asked for less motion. Read once on mount (and kept in sync), so every
// effect can fall back to the finished state.
export function useStill() {
  const [still, setStill] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setStill(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return still;
}

export function prefersStill() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// A number as the page prints it: grouped thousands, fixed decimals, and a true minus sign.
export function formatNum(v, decimals = 0) {
  return v.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).replace('-', '−');
}

// Counts an element's text from `from` to `to`, keeping the decimals and any suffix.
export function countTo(el, { from = 0, to, decimals = 0, suffix = '', duration = 1.4, delay = 0 }) {
  const state = { v: from };
  const write = () => {
    el.textContent = formatNum(state.v, decimals) + suffix;
  };
  write();
  return gsap.to(state, { v: to, duration, delay, ease: 'power2.out', onUpdate: write });
}
