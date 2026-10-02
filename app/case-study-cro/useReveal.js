'use client';

import { EASE_IN, SplitText, gsap, prefersStill, useIsoLayoutEffect } from './gsap';

// The page's scroll-in vocabulary, applied by data attribute inside `ref`, so each layout option only
// marks up what moves:
//   data-mask    a heading: its lines rise out of a mask as it arrives
//   data-fade    a block: rises and fades in as it arrives
//   data-stagger a group: its children arrive one after another
//   data-words   a statement: its words light from faint to full as it is scrolled through
//   data-ghost   a large numeral: drifts against the scroll
// With reduced motion, nothing moves and everything is simply there.
export default function useReveal(ref) {
  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el || prefersStill()) return undefined;
    const splits = [];
    const ctx = gsap.context(() => {
      const enter = (trigger) => ({ trigger, start: 'top 84%', once: true });

      el.querySelectorAll('[data-mask]').forEach((node) => {
        const split = SplitText.create(node, { type: 'lines', mask: 'lines', linesClass: 'cro-line' });
        splits.push(split);
        gsap.from(split.lines, { yPercent: 105, duration: 1.1, ease: 'expo.out', stagger: 0.1, scrollTrigger: enter(node) });
      });
      el.querySelectorAll('[data-fade]').forEach((node) => {
        gsap.from(node, { autoAlpha: 0, y: 28, duration: 0.95, ease: EASE_IN, scrollTrigger: enter(node) });
      });
      el.querySelectorAll('[data-stagger]').forEach((node) => {
        gsap.from(node.children, { autoAlpha: 0, y: 20, duration: 0.8, ease: EASE_IN, stagger: 0.09, scrollTrigger: enter(node) });
      });
      el.querySelectorAll('[data-words]').forEach((node) => {
        const split = SplitText.create(node, { type: 'words' });
        splits.push(split);
        gsap.fromTo(
          split.words,
          { opacity: 0.16 },
          { opacity: 1, ease: 'none', stagger: 0.08, scrollTrigger: { trigger: node, start: 'top 82%', end: 'bottom 52%', scrub: 0.5 } }
        );
      });
      el.querySelectorAll('[data-ghost]').forEach((node) => {
        gsap.fromTo(node, { y: 70 }, { y: -70, ease: 'none', scrollTrigger: { trigger: node, start: 'top bottom', end: 'bottom top', scrub: true } });
      });
    }, el);
    return () => {
      ctx.revert();
      splits.forEach((s) => s.revert());
    };
  }, []);
}
