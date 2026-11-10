'use client';

// The hero options' shared motion, on the CRO case study's GSAP setup (its gsap.js registers the plugins and
// holds the helpers).
import { gsap, SplitText } from '../../case-study-cro/gsap';

export { gsap, countTo, prefersStill, useIsoLayoutEffect, useStill } from '../../case-study-cro/gsap';

const FINE = '(min-width: 900px) and (hover: hover) and (pointer: fine)';

// The words' entrance on `tl`: the back link, the title line by line out of its mask, then everything marked
// data-rise. Returns the split, for the caller to revert.
export function playWords(tl, el, at = 0) {
  const split = SplitText.create(el.querySelector('[data-title]'), {
    type: 'lines',
    mask: 'lines',
    linesClass: 'phx-line',
    reduceWhiteSpace: false,
  });
  tl.from(el.querySelectorAll('[data-eyebrow]'), { autoAlpha: 0, y: 10, duration: 0.6, ease: 'power3.out' }, at)
    .from(split.lines, { yPercent: 108, duration: 1.15, ease: 'expo.out', stagger: 0.1 }, at + 0.08)
    .from(el.querySelectorAll('[data-rise]'), { autoAlpha: 0, y: 24, duration: 0.9, ease: 'power3.out', stagger: 0.08 }, at + 0.5);
  return split;
}

// Depth: each [data-depth] piece drifts with the scroll and, with a mouse on a wide screen, against the pointer,
// nearer pieces further. Call inside a gsap.context; returns the matchMedia to revert.
export function addDepth(el, { x = 34, y = 24, scroll = 20 } = {}) {
  const layers = gsap.utils.toArray(el.querySelectorAll('[data-depth]'));
  gsap
    .timeline({ scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: 0.6 } })
    .to(layers, { yPercent: (i, layer) => -Number(layer.dataset.depth) * scroll, ease: 'none' }, 0);
  const mm = gsap.matchMedia();
  mm.add(FINE, () => {
    const movers = layers.map((layer) => ({
      depth: Number(layer.dataset.depth),
      x: gsap.quickTo(layer, 'x', { duration: 0.9, ease: 'power3.out' }),
      y: gsap.quickTo(layer, 'y', { duration: 0.9, ease: 'power3.out' }),
    }));
    const move = (e) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      movers.forEach((m) => {
        m.x(-nx * m.depth * x);
        m.y(-ny * m.depth * y);
      });
    };
    const rest = () => movers.forEach((m) => (m.x(0), m.y(0)));
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', rest);
    return () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', rest);
    };
  });
  return mm;
}
